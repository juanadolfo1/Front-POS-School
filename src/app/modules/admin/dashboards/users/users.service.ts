import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApiResponse } from 'app/core/types/api-response';
import { environment } from 'environments/environment';

export interface AppUser {
    id?: number;
    name: string;
    email: string;
    password?: string;
    role_id: number;
    role_name?: string;
}

export interface PaginatedUsers {
    current_page: number;
    data: AppUser[];
    last_page: number;
    per_page: number;
    total: number;
}

export interface Role {
    id: number;
    role_name: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
    private apiUrl = environment.apiUrl + '/users';
    private _isOpenModal = new BehaviorSubject<boolean>(false);
    private _current = new BehaviorSubject<AppUser>(null);

    constructor(private _http: HttpClient) {}

    get isOpenModal$(): Observable<boolean> {
        return this._isOpenModal.asObservable();
    }

    get current$(): Observable<AppUser> {
        return this._current.asObservable();
    }

    openModal(user?: AppUser): void {
        this._current.next(user ?? null);
        this._isOpenModal.next(true);
    }

    closeModal(): void {
        this._isOpenModal.next(false);
        this._current.next(null);
    }

    getAll(limit: number, page: number): Observable<ApiResponse<PaginatedUsers>> {
        return this._http.get<ApiResponse<PaginatedUsers>>(this.apiUrl, {
            params: { limit, page },
        });
    }

    getRoles(): Observable<ApiResponse<Role[]>> {
        return this._http.get<ApiResponse<Role[]>>(`${environment.apiUrl}/roles`);
    }

    save(user: AppUser): Observable<ApiResponse<AppUser>> {
        if (user.id) {
            return this._http.put<ApiResponse<AppUser>>(this.apiUrl, user);
        }
        return this._http.post<ApiResponse<AppUser>>(this.apiUrl, user);
    }

    delete(id: number): Observable<ApiResponse<any>> {
        return this._http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
    }
}
