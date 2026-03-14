import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InvoicesService } from '../invoices/invoices.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private supabaseService: SupabaseService,
    private invoicesService: InvoicesService,
    private configService: ConfigService,
  ) {}

  private getAbaConfig(): {
    merchantId: string;
    apiKey: string;
    baseUrl: string;
  } {
    const merchantId = this.configService.get<string>('ABA_MERCHANT_ID');
    const apiKey = this.configService.get<string>('ABA_API_KEY');
    const baseUrl = this.configService.get<string>('ABA_BASE_URL');

    if (!merchantId || !apiKey || !baseUrl) {
      throw new BadRequestException(
        'Payment gateway configuration missing. Ensure ABA_MERCHANT_ID, ABA_API_KEY, and ABA_BASE_URL are set.',
      );
    }

    return { merchantId, apiKey, baseUrl };
  }

  private buildQrPayload(
    merchantId: string,
    apiKey: string,
    amount: number,
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    },
  ) {
    const amt = parseFloat(String(amount));
    const reqTime = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);
    const tranId = uuidv4().replace(/-/g, '').slice(0, 20);

    const { firstName, lastName, email, phone } = customerInfo;
    const currency = 'USD';
    const purchaseType = 'purchase';
    const paymentOption = 'abapay_khqr';
    const lifetime = 10;
    const qrImageTemplate = 'template3_color';

    // Field order per ABA PayWay QR API spec (HMAC-SHA512)
    const hashData = [
      reqTime,
      merchantId,
      tranId,
      amt.toFixed(2),
      '', // items
      firstName,
      lastName,
      email,
      phone,
      purchaseType,
      paymentOption,
      '', // callback_url
      '', // return_deeplink
      currency,
      '', // custom_fields
      '', // return_params
      '', // payout
      String(lifetime),
      qrImageTemplate,
    ];

    const dataToSign = hashData.join('');
    const hash = crypto
      .createHmac('sha512', apiKey)
      .update(dataToSign)
      .digest('base64');

    console.log('[ABA DEBUG] dataToSign:', dataToSign);
    console.log('[ABA DEBUG] hash (first 20):', hash.substring(0, 20));

    return {
      tranId,
      payload: {
        req_time: reqTime,
        merchant_id: merchantId,
        tran_id: tranId,
        amount: amt.toFixed(2),
        items: '',
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        purchase_type: purchaseType,
        payment_option: paymentOption,
        callback_url: '',
        return_deeplink: '',
        currency,
        custom_fields: '',
        return_params: '',
        payout: '',
        lifetime,
        qr_image_template: qrImageTemplate,
        hash,
      },
    };
  }

  private verifyWebhookHash(payload: any): boolean {
    const publicKeyRaw = this.configService.get<string>('ABA_PUBLIC_KEY');
    if (!publicKeyRaw) return true; // Skip verification if not configured

    try {
      let publicKey = publicKeyRaw.replace(/\\n/g, '\n').trim();
      if (!publicKey.startsWith('-----')) {
        publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
      }
      const { tran_id, hash, ...rest } = payload;
      const data = `${rest.req_time || ''}${rest.merchant_id || ''}${tran_id || ''}${rest.amount || ''}`;
      const verify = crypto.createVerify('SHA256');
      verify.update(data);
      return verify.verify(publicKey, hash, 'base64');
    } catch {
      return false;
    }
  }

  async createPaymentQr(invoiceId: string, amount: number) {
    const invoice = await this.invoicesService.findOne(invoiceId, '');
    if (!invoice) throw new NotFoundException('Invoice not found');

    const { merchantId, apiKey, baseUrl } = this.getAbaConfig();

    const customer = invoice.customer || {};
    const { tranId, payload } = this.buildQrPayload(
      merchantId,
      apiKey,
      amount,
      {
        firstName: customer.first_name || 'Customer',
        lastName: customer.last_name || 'Generic',
        email: customer.email || 'customer@example.com',
        phone: customer.phone || '000000000',
      },
    );

    try {
      const { data: abaResponse } = await axios.post(
        `${baseUrl}/api/payment-gateway/v1/payments/generate-qr`,
        payload,
        { headers: { 'Content-Type': 'application/json' } },
      );

      const { data: payment, error } = await this.supabaseService
        .getAdminClient()
        .from('payments')
        .insert({
          invoice_id: invoiceId,
          store_id: invoice.store_id,
          amount,
          transaction_type: 'QR',
          status: 'pending',
          external_reference: tranId,
        })
        .select()
        .single();

      if (error) throw error;

      return { ...abaResponse, tranId };
    } catch (error: any) {
      console.error(
        'ABA Generate QR Error:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        error.response?.data?.status?.message || 'Payment gateway error',
      );
    }
  }

  async generateWebsiteQr(amount: number, customerInfo: any) {
    const { merchantId, apiKey, baseUrl } = this.getAbaConfig();

    const nameParts = customerInfo.name?.trim()?.split(/\s+/) || ['Customer'];
    const { tranId, payload } = this.buildQrPayload(
      merchantId,
      apiKey,
      amount,
      {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || 'Website',
        email: customerInfo.email || 'customer@example.com',
        phone: customerInfo.phone || '000000000',
      },
    );

    try {
      const { data: abaResponse } = await axios.post(
        `${baseUrl}/api/payment-gateway/v1/payments/generate-qr`,
        payload,
        { headers: { 'Content-Type': 'application/json' } },
      );

      const { data: payment, error } = await this.supabaseService
        .getAdminClient()
        .from('payments')
        .insert({
          amount,
          transaction_type: 'QR',
          status: 'pending',
          external_reference: tranId,
        })
        .select()
        .single();

      if (error) throw error;

      return { ...abaResponse, tranId };
    } catch (error: any) {
      console.error(
        'ABA Generate Website QR Error:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        error.response?.data?.status?.message || 'Payment gateway error',
      );
    }
  }

  async checkTransaction(tranId: string) {
    const { merchantId, apiKey, baseUrl } = this.getAbaConfig();

    const reqTime = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, '')
      .slice(0, 14);

    const checkDataToSign = `${reqTime}${merchantId}${tranId}`;
    const checkHash = crypto
      .createHmac('sha512', apiKey)
      .update(checkDataToSign)
      .digest('base64');

    try {
      const { data } = await axios.post(
        `${baseUrl}/api/payment-gateway/v1/payments/check-transaction`,
        { req_time: reqTime, merchant_id: merchantId, tran_id: tranId, hash: checkHash },
      );

      // If approved, update our payment record
      if (data?.status?.code === '00') {
        await this.markPaymentCompleted(tranId);
      }

      return data;
    } catch (error: any) {
      console.error(
        'ABA Check Transaction Error:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        error.response?.data?.status?.message || 'Check transaction failed',
      );
    }
  }

  private async markPaymentCompleted(tranId: string) {
    const { data: payment, error: fetchError } = await this.supabaseService
      .getAdminClient()
      .from('payments')
      .select('*')
      .eq('external_reference', tranId)
      .single();

    if (fetchError || !payment || payment.status === 'completed') return;

    await this.supabaseService
      .getAdminClient()
      .from('payments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', payment.id);

    if (payment.invoice_id) {
      await this.invoicesService.recordPayment(
        payment.invoice_id,
        {
          amount: payment.amount,
          payment_method: payment.payment_method_id || '',
          notes: `ABA KHQR Payment APPROVED. TranId: ${tranId}`,
        },
        payment.store_id,
      );
    }
  }

  async recordManualPayment(data: {
    invoiceId?: string;
    salesOrderId?: string;
    amount: number;
    paymentMethodId: string;
    notes?: string;
  }) {
    const { invoiceId, salesOrderId, amount, paymentMethodId, notes } = data;
    const payload: any = {
      amount,
      payment_method_id: paymentMethodId,
      transaction_type: 'MANUAL',
      status: 'completed',
      notes,
    };

    if (invoiceId) payload.invoice_id = invoiceId;
    if (salesOrderId) payload.sales_order_id = salesOrderId;

    if (invoiceId) {
      const invoice = await this.invoicesService.findOne(invoiceId, '');
      if (invoice) payload.store_id = invoice.store_id;
    } else if (salesOrderId) {
      const { data: order } = await this.supabaseService
        .getAdminClient()
        .from('sales_orders')
        .select('store_id')
        .eq('id', salesOrderId)
        .single();
      if (order) payload.store_id = order.store_id;
    }

    const { data: payment, error } = await this.supabaseService
      .getAdminClient()
      .from('payments')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    if (invoiceId) {
      await this.invoicesService.recordPayment(
        invoiceId,
        { amount, payment_method: paymentMethodId, notes },
        payload.store_id,
      );
    }

    return payment;
  }

  async findByInvoice(invoiceId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payments')
      .select('*, payment_method:payment_methods(name)')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async handleWebhook(payload: any) {
    if (!this.verifyWebhookHash(payload)) {
      console.warn('ABA webhook signature verification failed', payload);
      return { status: 'error', message: 'Invalid signature' };
    }

    if (payload.payment_status === 'APPROVED') {
      await this.markPaymentCompleted(payload.tran_id);
    }

    return { status: 'ok' };
  }
}
