import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { SecurityService } from 'app/core/auth/security.service';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private _isRefreshing = false;
    private _refreshToken$ = new BehaviorSubject<string | null>(null);

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

        // Add Authorization header if token is valid
        if (
            this._authService.accessToken &&
            !AuthUtils.isTokenExpired(this._authService.accessToken) &&
            this._securityService.isValidTokenStructure(this._authService.accessToken)
        ) {
            newReq = req.clone({
                headers: req.headers.set(
                    'Authorization',
                    'Bearer ' + this._authService.accessToken
                ),
            });
        }

        return next.handle(newReq).pipe(
            // Check for must-refresh-token header in responses
            tap((event) => {
                if (event instanceof HttpResponse) {
                    const mustRefresh = event.headers.get('must-refresh-token');
                    if (mustRefresh && !this._isRefreshing) {
                        this._refreshTokenSilently();
                    }
                }
            }),
            catchError((error) => {
                if (error instanceof HttpErrorResponse) {
                    switch (error.status) {
                        case 401:
                            this._handle401(error);
                            break;

                        case 403:
                            this._toastr.error('No tienes permiso para realizar esta acción');
                            break;

                        case 409:
                            this._toastr.error(error.error?.message || 'Conflicto: el recurso ya existe');
                            break;

                        case 422:
                            // Don't show toast here if errors object exists — let components handle field-level errors
                            // Only show toast if there's no errors object (generic 422)
                            if (error.error?.errors) {
                                // Field-level errors: propagate to components
                            } else if (error.error?.message) {
                                this._toastr.error(error.error.message);
                            }
                            break;

                        case 429:
                            this._handle429(error);
                            break;

                        case 500:
                            this._toastr.error('Error del servidor. Intenta de nuevo más tarde.');
                            break;
                    }
                }

                return throwError(() => error);
            })
        );
    }

    private _handle401(error: HttpErrorResponse): void {
        const message = error.error?.message || '';

        if (message.includes('revoked') || message.includes('Revoked')) {
            this._toastr.info('Tu sesión fue cerrada');
        }

        // Clear everything and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('user_modules');
        localStorage.removeItem('_sec_hash');
        localStorage.removeItem('_permissions_hash');
        location.href = '/sign-in';
    }

    private _handle429(error: HttpErrorResponse): void {
        const retryAfter = error.headers?.get('Retry-After');
        const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;

        this._toastr.warning(
            `Demasiados intentos. Intenta de nuevo en ${seconds} segundos`,
            'Rate Limit',
            { timeOut: seconds * 1000 }
        );

        // Emit event for login component to show countdown
        this._authService.rateLimitedUntil = Date.now() + (seconds * 1000);
    }

    private _refreshTokenSilently(): void {
        if (this._isRefreshing) return;
        this._isRefreshing = true;

        this._authService.refreshToken().subscribe({
            next: (newToken) => {
                this._isRefreshing = false;
                this._refreshToken$.next(newToken);
            },
            error: () => {
                this._isRefreshing = false;
            },
        });
    }
}
