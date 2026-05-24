import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { User } from '../user/user.types';
import { NavigationService } from '../navigation/navigation.service';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;
    private apiUrl = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _navigationService: NavigationService,
        private _permissionsService: PermissionsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(`${this.apiUrl}/auth/login`, credentials)
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.data.jwt;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    const user: User = {
                        id: response.data.id,
                        name: response.data.name,
                        email: response.data.email,
                        avatar: 'assets/images/avatars/brian-hughes.jpg',
                        roleId: response.data.role_id,
                    };

                    // Store the user on the user service
                    this._userService.user = user;

                    this._navigationService.navigation = response.data.modules;

                    // Return a new observable with the response
                    return of(response);
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken({ isManuallyHandled = false }): Observable<any> {
        // Renew token
        if (isManuallyHandled) {
            return this._httpClient
                .post('api/auth/refresh-access-token', {
                    accessToken: this.accessToken,
                })
                .pipe(
                    catchError(() =>
                        // Return false
                        of(false)
                    ),
                    switchMap((response: any) => {
                        // Store the access token in the local storage
                        this.accessToken = response.accessToken;

                        // Set the authenticated flag to true
                        this._authenticated = true;

                        // Store the user on the user service
                        this._userService.user = response.user;

                        // Return true
                        return of(true);
                    })
                );
        } else {
            const user: User = this._userService.localUser;
            if (!user) {
                return of(false);
            }
            this._authenticated = true;
            this._userService.user = user;
            this._permissionsService.loadFromStorage();
            return of(true);
        }
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        const token = this.accessToken;
        this._authenticated = false;

        if (token) {
            return this._httpClient.post(`${this.apiUrl}/auth/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            }).pipe(
                catchError(() => of(true)),
                switchMap(() => {
                    localStorage.removeItem('accessToken');
                    this._permissionsService.clear();
                    return of(true);
                })
            );
        }
        localStorage.removeItem('accessToken');
        this._permissionsService.clear();
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken({});
    }
}
