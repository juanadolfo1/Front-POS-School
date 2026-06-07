import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { SecurityService } from 'app/core/auth/security.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private _loginAttempts = 0;
    private _lastLoginAttempt = 0;
    private _maxLoginAttempts = 5;
    private _lockoutDuration = 60000; // 1 minute

    constructor(
        private _authService: AuthService,
        private _securityService: SecurityService,
        private _toastr: ToastrService
    ) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        let newReq = req.clone();

        // Rate limit login attempts on client side
        if (req.url.includes('/auth/login') && req.method === 'POST') {
            if (!this._checkLoginRateLimit()) {
                this._toastr.error('Demasiados intentos. Espera un momento.');
                return throwError(() => new Error('Rate limited'));
            }
        }

        // Add Authorization header if token is valid
        if (
            this._authService.accessToken &&
            !AuthUtils.isTokenExpired(this._authService.accessToken)
        ) {
            // Validate token structure before sending
            if (this._securityService.isValidTokenStructure(this._authService.accessToken)) {
                newReq = req.clone({
                    headers: req.headers.set(
                        'Authorization',
                        'Bearer ' + this._authService.accessToken
                    ),
                });
            } else {
                // Token corrupted — force logout
                this._authService.signOut().subscribe();
                location.reload();
                return throwError(() => new Error('Invalid token'));
            }
        }

        // Response handling
        return next.handle(newReq).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse) {
                    switch (error.status) {
                        case 401:
                            this._authService.signOut().subscribe();
                            location.reload();
                            break;

                        case 403:
                            this._toastr.error('No tienes permiso para realizar esta acción');
                            break;

                        case 422:
                            if (error.error?.errors) {
                                const messages = Object.values(error.error.errors).flat();
                                messages.forEach((msg: string) => this._toastr.error(msg));
                            }
                            break;

                        case 429:
                            this._toastr.warning('Demasiadas solicitudes. Intenta de nuevo en un momento.');
                            break;
                    }
                }

                return throwError(() => error);
            })
        );
    }

    private _checkLoginRateLimit(): boolean {
        const now = Date.now();

        // Reset counter if lockout period has passed
        if (now - this._lastLoginAttempt > this._lockoutDuration) {
            this._loginAttempts = 0;
        }

        this._lastLoginAttempt = now;
        this._loginAttempts++;

        return this._loginAttempts <= this._maxLoginAttempts;
    }
}
