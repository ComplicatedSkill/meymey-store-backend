import * as path from 'path';
import * as QRCode from 'qrcode';
import sharp from 'sharp';
import { ReceiptPayload } from './telegram-orders.service';

const STORE_NAME = 'Shumeii Store';
const STORE_ADDRESS = 'St 590, Phnom Penh';
const STORE_PHONE = '070 913 092';
const STORE_TAGLINE = 'Thank you for shopping with us!';
const STORE_LOCATION = 'https://maps.app.goo.gl/Mm2vS4WXTdNugKwS8';

const LOGO_PATH = path.join(__dirname, 'assets', 'logo.png');

// ---- Canvas: a white invoice "card" floating on a soft warm backdrop ----
const WIDTH = 720;
const OUTER = 26; // margin between the canvas edge and the card
const CARD_PAD = 46; // padding between the card edge and its content
const CONTENT_LEFT = OUTER + CARD_PAD;
const CONTENT_RIGHT = WIDTH - OUTER - CARD_PAD;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = 'Helvetica, Arial, sans-serif';

// Column x-positions for the item table (right-aligned, measured from the content's right edge).
const COL_QTY_END = CONTENT_RIGHT - 140;
const COL_PRICE_END = CONTENT_RIGHT - 72;
const COL_AMOUNT_END = CONTENT_RIGHT;

const COLORS = {
  backdrop: '#efe8d8',
  card: '#fffdf9',
  ink: '#241f19',
  text2: '#7a7267',
  text3: '#a89f92',
  border: '#ece3d2',
  gold: '#a9782f',
  goldSoft: '#f6ecd9',
  sage: { bg: '#eaf0e6', fg: '#3f6b4a' },
  amber: { bg: '#f6ecd9', fg: '#92722f' },
  grey: { bg: '#f1ede6', fg: '#6b6259' },
};

/** Escapes text for safe embedding inside SVG markup. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

/** Truncates a name so it doesn't collide with the qty/price/amount columns. */
function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Initials fallback for the logo circle (e.g. "Shumeii Store" -> "SS"). */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || 'S';
}

function text(
  x: number,
  y: number,
  content: string,
  opts: {
    size?: number;
    weight?: number | string;
    color?: string;
    anchor?: 'start' | 'middle' | 'end';
    spacing?: number;
    font?: string;
    italic?: boolean;
  } = {},
): string {
  const {
    size = 14,
    weight = 400,
    color = COLORS.ink,
    anchor = 'start',
    spacing,
    font = SANS,
    italic = false,
  } = opts;
  const ls = spacing != null ? ` letter-spacing="${spacing}"` : '';
  const style = italic ? ` font-style="italic"` : '';
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${color}" font-family="${font}"${ls}${style}>${esc(content)}</text>`;
}

/** An outlined (not solid) pill — reads as more refined than a filled badge. */
function pill(rightX: number, y: number, label: string, tone: { bg: string; fg: string }): string {
  const w = label.length * 6.6 + 34;
  const x = rightX - w;
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="28" rx="14" fill="${tone.bg}" stroke="${tone.fg}" stroke-width="1" stroke-opacity="0.25" />`,
    text(rightX - w / 2, y + 19, label, { size: 11, weight: 700, color: tone.fg, anchor: 'middle', spacing: 0.6 }),
  ].join('\n');
}

function hairline(y: number, color: string = COLORS.border, w = 1): string {
  return `<line x1="${CONTENT_LEFT}" y1="${y}" x2="${CONTENT_RIGHT}" y2="${y}" stroke="${color}" stroke-width="${w}" />`;
}

/**
 * Reads the store logo and re-encodes it as PNG regardless of its actual
 * source format (the file may be a JPEG saved with a .png extension —
 * librsvg won't decode it if the data URI's declared mime type doesn't
 * match the real bytes, so we normalize through sharp instead of trusting
 * the file extension).
 */
async function readLogoDataUri(): Promise<string | null> {
  try {
    const buf = await sharp(LOGO_PATH).resize(200, 200, { fit: 'cover' }).png().toBuffer();
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Renders the header monogram: the real logo (gold-ringed) if present, else initials. */
async function renderLogo(cx: number, cy: number, r: number): Promise<string> {
  const dataUri = await readLogoDataUri();
  if (dataUri) {
    const clipId = 'logoClip';
    return [
      `<clipPath id="${clipId}"><circle cx="${cx}" cy="${cy}" r="${r}" /></clipPath>`,
      `<image x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" href="${dataUri}" xlink:href="${dataUri}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid slice" />`,
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${COLORS.gold}" stroke-width="1.5" />`,
    ].join('\n');
  }
  return [
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${COLORS.ink}" />`,
    text(cx, cy + 6, initials(STORE_NAME), { size: 16, weight: 700, color: '#fff', anchor: 'middle', font: SERIF }),
  ].join('\n');
}

/** Renders a premium, boutique-invoice-style PNG receipt for a completed/AR/draft sale. */
export async function renderReceiptImage(payload: ReceiptPayload): Promise<Buffer> {
  const {
    order_number,
    customer_name,
    items,
    subtotal,
    discount,
    tax,
    additional_charges,
    total,
    payment_type,
    status,
  } = payload;

  const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const isAr = (payment_type ?? '').toUpperCase() === 'AR';
  const isDraft = (status ?? '').toUpperCase() === 'DRAFT';

  // Sale status — shown prominently in the header.
  const docType = isAr
    ? { label: 'AR', tone: COLORS.amber }
    : isDraft
      ? { label: 'QUOTATION', tone: COLORS.grey }
      : { label: 'COMPLETED', tone: COLORS.sage };

  const summaryRows: { label: string; value: string; muted?: boolean }[] = [
    { label: 'Subtotal', value: money(subtotal) },
  ];
  if (discount) summaryRows.push({ label: 'Discount', value: `-${money(discount)}`, muted: true });
  for (const c of additional_charges ?? []) {
    summaryRows.push({ label: c.label, value: `+${money(c.amount)}` });
  }
  if (tax) summaryRows.push({ label: 'Tax', value: `+${money(tax)}` });

  // Content is laid out with y starting at the card's top inset; the card
  // rect itself is drawn afterwards once we know the total height.
  let y = OUTER + CARD_PAD;
  const parts: string[] = [];

  // ---- Header: logo + serif store name/address (left), order-type pill (right) ----
  parts.push(await renderLogo(CONTENT_LEFT + 26, y + 18, 26));
  parts.push(text(CONTENT_LEFT + 66, y + 14, STORE_NAME, { size: 26, weight: 700, font: SERIF }));
  parts.push(text(CONTENT_LEFT + 66, y + 36, STORE_ADDRESS, { size: 12, color: COLORS.text3, spacing: 0.2 }));
  parts.push(pill(CONTENT_RIGHT, y + 4, docType.label, docType.tone));
  y += 58;

  parts.push(hairline(y, COLORS.gold, 1.5));
  y += 34;

  // ---- Meta: order # / date (left) · customer (right) ----
  parts.push(text(CONTENT_LEFT, y, 'ORDER #', { size: 10, color: COLORS.gold, spacing: 1, weight: 700 }));
  parts.push(text(CONTENT_RIGHT, y, 'BILLED TO', { size: 10, color: COLORS.gold, spacing: 1, weight: 700, anchor: 'end' }));
  y += 20;
  parts.push(text(CONTENT_LEFT, y, order_number || '—', { size: 16, weight: 700 }));
  parts.push(text(CONTENT_RIGHT, y, customer_name || 'Walk-in customer', { size: 16, weight: 700, anchor: 'end' }));
  y += 22;
  parts.push(text(CONTENT_LEFT, y, now, { size: 12, color: COLORS.text3 }));
  y += 34;

  parts.push(hairline(y));
  y += 30;

  // ---- Items ----
  parts.push(text(CONTENT_LEFT, y, 'ITEM', { size: 10, color: COLORS.text3, spacing: 1 }));
  parts.push(text(COL_QTY_END, y, 'QTY', { size: 10, color: COLORS.text3, anchor: 'end', spacing: 1 }));
  parts.push(text(COL_PRICE_END, y, 'PRICE', { size: 10, color: COLORS.text3, anchor: 'end', spacing: 1 }));
  parts.push(text(COL_AMOUNT_END, y, 'AMOUNT', { size: 10, color: COLORS.text3, anchor: 'end', spacing: 1 }));
  y += 14;
  parts.push(hairline(y));
  y += 26;

  items.forEach((item, i) => {
    const itemDiscount = Number(item.discount ?? 0);
    const lineTotal = item.total ?? item.qty * item.unit_price;

    parts.push(text(CONTENT_LEFT, y, truncate(item.name, 32), { size: 14.5, weight: 600 }));
    parts.push(text(COL_QTY_END, y, String(item.qty), { size: 13, color: COLORS.text2, anchor: 'end' }));
    parts.push(text(COL_PRICE_END, y, money(item.unit_price), { size: 13, color: COLORS.text2, anchor: 'end' }));
    parts.push(text(COL_AMOUNT_END, y, money(lineTotal), { size: 14.5, weight: 700, anchor: 'end' }));

    if (itemDiscount > 0) {
      y += 18;
      parts.push(text(CONTENT_LEFT, y, `Item discount −${money(itemDiscount)}`, { size: 11, weight: 700, color: COLORS.gold }));
    }

    const isLast = i === items.length - 1;
    y += 20;
    if (!isLast) {
      parts.push(hairline(y - 8, '#f3ede0'));
      y += 8;
    }
  });

  y += 8;
  parts.push(hairline(y, COLORS.gold, 1.5));
  y += 28;

  // ---- Summary ----
  for (const row of summaryRows) {
    parts.push(text(CONTENT_LEFT, y, row.label, { size: 13, color: COLORS.text2 }));
    parts.push(
      text(COL_AMOUNT_END, y, row.value, {
        size: 13,
        weight: 600,
        color: row.muted ? COLORS.gold : COLORS.ink,
        anchor: 'end',
      }),
    );
    y += 24;
  }

  y += 12;

  // ---- Total ----
  const totalBarH = 58;
  parts.push(`<rect x="${CONTENT_LEFT}" y="${y}" width="${CONTENT_RIGHT - CONTENT_LEFT}" height="${totalBarH}" rx="12" fill="${COLORS.ink}" />`);
  parts.push(text(CONTENT_LEFT + 22, y + 36, 'TOTAL', { size: 13, weight: 700, color: COLORS.goldSoft, spacing: 1 }));
  parts.push(text(CONTENT_RIGHT - 22, y + 38, money(total), { size: 24, weight: 700, color: '#fff', anchor: 'end', font: SERIF }));
  y += totalBarH + 38;

  // ---- Footer: tagline + QR + address/phone ----
  parts.push(text(WIDTH / 2, y, STORE_TAGLINE, { size: 14, color: COLORS.text2, anchor: 'middle', font: SERIF, italic: true }));
  y += 34;

  const qrSize = 104;
  const qrDataUrl = await QRCode.toDataURL(STORE_LOCATION, {
    margin: 0,
    width: qrSize,
    color: { dark: COLORS.ink, light: '#ffffff' },
  });
  const qrBoxPad = 12;
  const qrX = (WIDTH - qrSize) / 2;
  parts.push(
    `<rect x="${qrX - qrBoxPad}" y="${y - qrBoxPad}" width="${qrSize + qrBoxPad * 2}" height="${qrSize + qrBoxPad * 2}" rx="14" fill="#ffffff" stroke="${COLORS.gold}" stroke-width="1.25" />`,
  );
  parts.push(`<image x="${qrX}" y="${y}" width="${qrSize}" height="${qrSize}" href="${qrDataUrl}" xlink:href="${qrDataUrl}" />`);
  y += qrSize + qrBoxPad * 2 + 20;

  parts.push(text(WIDTH / 2, y, 'SCAN FOR LOCATION', { size: 10, color: COLORS.gold, anchor: 'middle', spacing: 1, weight: 700 }));
  y += 22;
  parts.push(text(WIDTH / 2, y, `${STORE_ADDRESS}   ·   ${STORE_PHONE}`, { size: 12, color: COLORS.text2, anchor: 'middle' }));
  y += OUTER + CARD_PAD;

  const cardTop = OUTER;
  const cardBottom = y;
  const cardHeight = cardBottom - cardTop;
  const height = cardBottom + OUTER;

  const svg = `
    <svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <rect width="${WIDTH}" height="${height}" fill="${COLORS.backdrop}" />
      <rect x="${OUTER + 3}" y="${cardTop + 5}" width="${WIDTH - OUTER * 2}" height="${cardHeight}" rx="20" fill="#00000012" />
      <rect x="${OUTER}" y="${cardTop}" width="${WIDTH - OUTER * 2}" height="${cardHeight}" rx="20" fill="${COLORS.card}" stroke="${COLORS.border}" stroke-width="1" />
      ${parts.join('\n')}
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
