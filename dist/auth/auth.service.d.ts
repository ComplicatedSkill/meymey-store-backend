import { SupabaseService } from '../supabase/supabase.service';
import { SignUpDto } from './dto/signup.dto';
export declare class AuthService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    signUp(signUpDto: SignUpDto): Promise<{
        user: import("@supabase/auth-js").User;
        store: any;
    }>;
    signIn(email: string, password: string): Promise<{
        access_token: any;
        refresh_token: any;
        user: any;
        store: any;
    }>;
    getUser(accessToken: string): Promise<import("@supabase/auth-js").User>;
}
