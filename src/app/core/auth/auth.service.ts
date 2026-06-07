import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { User } from '../user/user.types';
import { NavigationService } from '../navigation/navigation.service';
import { PermissionsService } from '../permissions/permissions.service';
import { SecurityService } from './security.service';
import { IdleTimeoutService } from './idle-timeout.service';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;
    private apiUrl = environment.apiUrl;

    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _navigationService: NavigationService,
        private _permissionsService: PermissionsService,
        private _securityService: SecurityService,
        private _idleTimeout: IdleTimeoutService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    set accessToken(token: string) {
        if (token && !this._securityService.isValidTokenStructure(token)) {
            return; // Reject invalid tokens
        }
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    signIn(credentials: { email: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(`${this.apiUrl}/auth/login`, credentials)
            .pipe(
                switchMap((response: any) => {
                    // Validate token before storing
                    const token = response.data.jwt;
                    if (!this._securityService.isValidTokenStructure(token)) {
                        return throwError('Invalid token received');
                    }

                    this.accessToken = token;
                    this._authenticated = true;

                    const user: User = {
                        id: response.data.id,
                        name: response.data.name,
                        email: response.data.email,
                        avatar: 'assets/images/avatars/brian-hughes.jpg',
                        roleId: response.data.role_id,
                    };

                    this._userService.user = user;
                    this._navigationService.navigation = response.data.modules;

                    // Store permissions with integrity hash
                    if (response.data.modules) {
                        this._securityService.storePermissions(response.data.modules);
                    }

                    // Start idle timeout monitoring
                    this._idleTimeout.start();

                    return of(response);
                })
            );
    }

    signInUsingToken({ isManuallyHandled = false }): Observable<any> {
        if (isManuallyHandled) {
            return this._httpClient
                .post('api/auth/refresh-access-token', {
                    accessToken: this.accessToken,
                })
                .pipe(
                    catchError(() => of(false)),
                    switchMap((response: any) => {
                        this.accessToken = response.accessToken;
                        this._authenticated = true;
                        this._userService.user = response.user;
                        return of(true);
                    })
                );
        } else {
            // Security check before restoring session
            if (!this._securityService.runSecurityCheck()) {
                return of(false);
            }

            const user: User = this._userService.localUser;
            if (!user || !user.id) {
                return of(false);
            }
            this._authenticated = true;
            this._userService.user = user;
            this._permissionsService.loadFromStorage();

            // Start idle timeout for restored sessions
            this._idleTimeout.start();

            return of(true);
        }
    }

    signOut(): Observable<any> {
        const token = this.accessToken;
        this._authenticated = false;

        // Stop idle monitoring
        this._idleTimeout.stop();

        if (token) {
            return this._httpClient.post(`${this.apiUrl}/auth/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).pipe(
                catchError(() => of(true)),
                switchMap(() => {
                    this._clearStorage();
                    return of(true);
                })
            );
        }
        this._clearStorage();
        return of(true);
    }

    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    check(): Observable<boolean> {
        if (this._authenticated) {
            return of(true);
        }

        if (!this.accessToken) {
            return of(false);
        }

        // Validate token structure and expiration
        if (!this._securityService.isValidTokenStructure(this.accessToken)) {
            this._clearStorage();
            return of(false);
        }

        if (AuthUtils.isTokenExpired(this.accessToken)) {
            this._clearStorage();
            return of(false);
        }

        return this.signInUsingToken({});
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _clearStorage(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        this._permissionsService.clear();
        this._securityService.clearAll();
    }
}
