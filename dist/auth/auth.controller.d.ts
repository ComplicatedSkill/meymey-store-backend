import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
declare class SignInDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signUp(signUpDto: SignUpDto): Promise<{
        user: import("@supabase/auth-js").User;
        store: any;
    }>;
    login(signInDto: SignInDto): Promise<{
        access_token: any;
        refresh_token: any;
        user: any;
        store: any;
    }>;
    getProfile(req: any): any;
}
export {};
