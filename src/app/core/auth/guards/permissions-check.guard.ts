import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SecurityService } from 'app/core/auth/security.service';
import { AuthService } from 'app/core/auth/auth.service';

/**
 * Guard that checks if permissions_hash in JWT has changed.
 * If it has, triggers a refresh of permissions from backend.
 * Always allows navigation (doesn't block) — just updates permissions silently.
 */
@Injectable({ providedIn: 'root' })
export class PermissionsCheckGuard {
    constructor(
        private _securityService: SecurityService,
        private _authService: AuthService
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | boolean {
        // Only check if we have a token
        const token = localStorage.getItem('accessToken');
        if (!token) return true;

        // Check if permissions_hash has changed
        if (this._securityService.checkPermissionsHashChanged()) {
            // Permissions changed — trigger refresh (fire and forget, don't block navigation)
            this._authService.refreshToken().subscribe();
        }

        return true;
    }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | boolean {
        return this.canActivate(childRoute, state);
    }
}
