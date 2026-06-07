import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthInterceptor } from 'app/core/auth/auth.interceptor';
import { SecurityService } from 'app/core/auth/security.service';
import { IdleTimeoutService } from 'app/core/auth/idle-timeout.service';

@NgModule({
    imports: [],
    providers: [
        AuthService,
        SecurityService,
        IdleTimeoutService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        provideHttpClient(withInterceptorsFromDi()),
    ],
})
export class AuthModule {}
