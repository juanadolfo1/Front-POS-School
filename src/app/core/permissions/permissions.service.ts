import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModulePermission {
    id: number;
    module_name: string;
    path: string;
    icon: string;
    operations: { id: number; operation_name: string }[];
}

@Injectable({ providedIn: 'root' })
export class PermissionsService {
    private _modules = new BehaviorSubject<ModulePermission[]>([]);

    get modules$(): Observable<ModulePermission[]> {
        return this._modules.asObservable();
    }

    set modules(value: ModulePermission[]) {
        this._modules.next(value);
        localStorage.setItem('user_modules', JSON.stringify(value));
    }

    loadFromStorage(): void {
        const stored = localStorage.getItem('user_modules');
        if (stored) {
            this._modules.next(JSON.parse(stored));
        }
    }

    hasOperation(modulePath: string, operationName: string): boolean {
        const modules = this._modules.value;
        const mod = modules.find(m => m.path === modulePath || m.path === `/${modulePath}`);
        if (!mod) return false;
        return mod.operations.some(op => op.operation_name.toLowerCase() === operationName.toLowerCase());
    }

    clear(): void {
        this._modules.next([]);
        localStorage.removeItem('user_modules');
    }
}
