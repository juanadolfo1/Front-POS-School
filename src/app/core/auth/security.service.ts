import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PermissionsService, ModulePermission } from '../permissions/permissions.service';

@Injectable({ providedIn: 'root' })
export class SecurityService {
    private _integrityKey = '_sec_hash';
    private _permissionsHashKey = '_permissions_hash';

    constructor(
        private _router: Router,
        private _toastr: ToastrService,
        private _permissions: PermissionsService
    ) {}

    // =========================================================================
    // Token validation
    // =========================================================================

    /**
     * Validate JWT structure (3 parts, valid base64, has exp, not expired)
     */
    isValidTokenStructure(token: string): boolean {
        if (!token) return false;
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        try {
            const payload = JSON.parse(atob(parts[1]));
            if (!payload.exp) return false;
            if (payload.exp * 1000 < Date.now()) return false;
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Decode JWT payload
     */
    getTokenPayload(token: string): any {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch {
            return null;
        }
    }

    /**
     * Extract permissions_hash from JWT
     */
    getPermissionsHashFromToken(token: string): string | null {
        const payload = this.getTokenPayload(token);
        return payload?.permissions_hash || null;
    }

    // =========================================================================
    // Permissions hash — detect backend permission changes
    // =========================================================================

    /**
     * Store the permissions_hash from the JWT payload
     */
    storePermissionsHash(hash: string): void {
        localStorage.setItem(this._permissionsHashKey, hash);
    }

    /**
     * Get stored permissions hash
     */
    getStoredPermissionsHash(): string | null {
        return localStorage.getItem(this._permissionsHashKey);
    }

    /**
     * Check if permissions_hash in current token matches stored hash.
     * If they don't match, it means admin changed permissions for this user's role.
     * Returns true if they match (or if no hash exists yet).
     */
    checkPermissionsHashChanged(): boolean {
        const token = localStorage.getItem('accessToken');
        if (!token) return false;

        const tokenHash = this.getPermissionsHashFromToken(token);
        const storedHash = this.getStoredPermissionsHash();

        if (!tokenHash || !storedHash) return false;

        return tokenHash !== storedHash;
    }

    // =========================================================================
    // Integrity hash — detect localStorage tampering
    // =========================================================================

    /**
     * Store permissions with integrity hash
     */
    storePermissions(modules: ModulePermission[]): void {
        const data = JSON.stringify(modules);
        const hash = this._generateHash(data);
        localStorage.setItem('user_modules', data);
        localStorage.setItem(this._integrityKey, hash);
    }

    /**
     * Verify permissions haven't been tampered with in localStorage
     */
    verifyPermissionsIntegrity(): boolean {
        const data = localStorage.getItem('user_modules');
        const storedHash = localStorage.getItem(this._integrityKey);

        if (!data || !storedHash) return true;

        const currentHash = this._generateHash(data);
        return currentHash === storedHash;
    }

    // =========================================================================
    // Full security check
    // =========================================================================

    /**
     * Run full security check:
     * 1. Token exists
     * 2. Token not expired
     * 3. permissions_hash matches
     * 4. localStorage integrity OK
     * If any fails → logout
     */
    runSecurityCheck(): boolean {
        const token = localStorage.getItem('accessToken');

        // 1. Token must exist
        if (!token) {
            return false;
        }

        // 2. Token must be valid and not expired
        if (!this.isValidTokenStructure(token)) {
            this._handleSecurityViolation('Token inválido detectado');
            return false;
        }

        // 3. Check localStorage tampering
        if (!this.verifyPermissionsIntegrity()) {
            this._handleSecurityViolation('Modificación no autorizada detectada');
            return false;
        }

        return true;
    }

    // =========================================================================
    // Cleanup
    // =========================================================================

    clearAll(): void {
        localStorage.removeItem(this._integrityKey);
        localStorage.removeItem(this._permissionsHashKey);
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private _generateHash(data: string): string {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    private _handleSecurityViolation(reason: string): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user_modules');
        localStorage.removeItem('user');
        localStorage.removeItem(this._integrityKey);
        localStorage.removeItem(this._permissionsHashKey);
        this._permissions.clear();
        this._toastr.error(reason, 'Error de seguridad');
        this._router.navigate(['/sign-in']);
    }
}
