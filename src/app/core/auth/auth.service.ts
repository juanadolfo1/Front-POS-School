import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
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

    /** Timestamp until which login is rate-limited (used by sign-in component for countdown) */
    rateLimitedUntil: number = 0;

    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _navigationService: NavigationService,
        private _permissionsService: PermissionsService,
        private _securityService: SecurityService,
        private _idleTimeout: IdleTimeoutService
    ) {}

    // =========================================================================
    // Accessors
    // =========================================================================

    set accessToken(token: string) {
        if (token && !this._securityService.isValidTokenStructure(token)) {
            return;
        }
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    get isRateLimited(): boolean {
        return Date.now() < this.rateLimitedUntil;
    }

    get rateLimitRemainingSeconds(): number {
        const remaining = Math.ceil((this.rateLimitedUntil - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
    }

    // =========================================================================
    // Public methods
    // =========================================================================

    signIn(credentials: { email: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError(() => 'User is already logged in.');
        }

        return this._httpClient
            .post(`${this.apiUrl}/auth/login`, credentials)
            .pipe(
                switchMap((response: any) => {
                    const token = response.data.jwt;
                    if (!this._securityService.isValidTokenStructure(token)) {
                        return throwError(() => 'Invalid token received');
                    }

                    // Store token
                    this.accessToken = token;
                    this._authenticated = true;

                    // Extract and store permissions_hash from JWT
                    const permissionsHash = this._securityService.getPermissionsHashFromToken(token);
                    if (permissionsHash) {
                        this._securityService.storePermissionsHash(permissionsHash);
                    }

                    // Store user
                    const user: User = {
                        id: response.data.id,
                        name: response.data.name,
                        email: response.data.email,
                        avatar: 'assets/images/avatars/brian-hughes.jpg',
                        roleId: response.data.role_id,
                    };
                    this._userService.user = user;

                    // Store navigation and permissions with integrity
                    this._navigationService.navigation = response.data.modules;
                    if (response.data.modules) {
                        this._securityService.storePermissions(response.data.modules);
                    }

                    // Start idle timeout
                    this._idleTimeout.start();

                    return of(response);
                })
            );
    }

    signInUsingToken({ isManuallyHandled = false }): Observable<any> {
        if (isManuallyHandled) {
            return this._httpClient
                .post('api/auth/refresh-access-token', { accessToken: this.accessToken })
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
            // Run security check before restoring
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

            // Check if permissions_hash changed (admin modified role permissions)
            if (this._securityService.checkPermissionsHashChanged()) {
                this._refreshPermissions();
            }

            // Start idle timeout
            this._idleTimeout.start();

            return of(true);
        }
    }

    /**
     * Refresh token silently when backend sends must-refresh-token header
     */
    refreshToken(): Observable<string> {
        return this._httpClient.get<any>(`${this.apiUrl}/auth/refresh-token`, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        }).pipe(
            tap((response) => {
                const newToken = response.data?.jwt || response.data?.token;
                if (newToken) {
                    this.accessToken = newToken;

                    // Update permissions_hash if it changed
                    const newHash = this._securityService.getPermissionsHashFromToken(newToken);
                    if (newHash) {
                        this._securityService.storePermissionsHash(newHash);
                    }
                }
            }),
            switchMap((response) => of(response.data?.jwt || response.data?.token))
        );
    }

    signOut(): Observable<any> {
        const token = this.accessToken;
        this._authenticated = false;
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

    check(): Observable<boolean> {
        if (this._authenticated) return of(true);
        if (!this.accessToken) return of(false);

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

    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    // =========================================================================
    // Private methods
    // =========================================================================

    /**
     * Refresh permissions from backend when permissions_hash changed
     */
    private _refreshPermissions(): void {
        this._httpClient.get<any>(`${this.apiUrl}/auth/get-modules`, {
            headers: { Authorization: `Bearer ${this.accessToken}` },
        }).subscribe({
            next: (response) => {
                if (response.data) {
                    this._navigationService.navigation = response.data;
                    this._securityService.storePermissions(response.data);

                    // Update stored hash to match current token
                    const hash = this._securityService.getPermissionsHashFromToken(this.accessToken);
                    if (hash) {
                        this._securityService.storePermissionsHash(hash);
                    }
                }
            },
        });
    }

    private _clearStorage(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        this._permissionsService.clear();
        this._securityService.clearAll();
    }
}
