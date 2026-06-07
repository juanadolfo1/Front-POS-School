import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PermissionsService, ModulePermission } from '../permissions/permissions.service';

@Injectable({ providedIn: 'root' })
export class SecurityService {
    private _integrityKey = '_sec_hash';

    constructor(
        private _router: Router,
        private _toastr: ToastrService,
        private _permissions: PermissionsService
    ) {}

    /**
     * Generates a simple hash for integrity verification of stored data.
     * Not cryptographically secure but detects casual tampering.
     */
    generateHash(data: string): string {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit int
        }
        return hash.toString(36);
    }

    /**
     * Store permissions with integrity hash
     */
    storePermissions(modules: ModulePermission[]): void {
        const data = JSON.stringify(modules);
        const hash = this.generateHash(data);
        localStorage.setItem('user_modules', data);
        localStorage.setItem(this._integrityKey, hash);
    }

    /**
     * Verify permissions haven't been tampered with in localStorage
     */
    verifyPermissionsIntegrity(): boolean {
        const data = localStorage.getItem('user_modules');
        const storedHash = localStorage.getItem(this._integrityKey);

        if (!data || !storedHash) return true; // No data = nothing to verify

        const currentHash = this.generateHash(data);
        return currentHash === storedHash;
    }

    /**
     * Validate JWT structure (3 parts, valid base64, not expired)
     */
    isValidTokenStructure(token: string): boolean {
        if (!token) return false;

        const parts = token.split('.');
        if (parts.length !== 3) return false;

        try {
            const payload = JSON.parse(atob(parts[1]));
            // Must have exp claim
            if (!payload.exp) return false;
            // Must not be expired
            if (payload.exp * 1000 < Date.now()) return false;
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Extract permissions from JWT payload if backend includes them
     */
    getTokenPayload(token: string): any {
        try {
            const parts = token.split('.');
            return JSON.parse(atob(parts[1]));
        } catch {
            return null;
        }
    }

    /**
     * Run full security check. Call on app init and periodically.
     */
    runSecurityCheck(): boolean {
        const token = localStorage.getItem('accessToken');

        // Check token structure
        if (token && !this.isValidTokenStructure(token)) {
            this.handleSecurityViolation('Token inválido detectado');
            return false;
        }

        // Check permissions integrity
        if (!this.verifyPermissionsIntegrity()) {
            this.handleSecurityViolation('Modificación no autorizada detectada');
            return false;
        }

        return true;
    }

    /**
     * Handle security violations — force logout
     */
    private handleSecurityViolation(reason: string): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user_modules');
        localStorage.removeItem('user');
        localStorage.removeItem(this._integrityKey);
        this._permissions.clear();
        this._toastr.error(reason, 'Error de seguridad');
        this._router.navigate(['/sign-in']);
    }

    /**
     * Clear all security data on logout
     */
    clearAll(): void {
        localStorage.removeItem(this._integrityKey);
    }
}
