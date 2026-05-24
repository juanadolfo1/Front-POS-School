import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse } from 'app/core/types/api-response';
import { environment } from 'environments/environment';

export interface Tutor {
    id?: number;
    status?: number;
    relation: string;
    tutor_type: string;
    name: string;
    first_lastname: string;
    second_lastname: string;
    email: string;
    student_id?: number;
    student_name?: string;
}

@Injectable({ providedIn: 'root' })
export class TutorsService {
    private apiUrl = environment.apiUrl + '/tutor';
    private _isOpenModal = new BehaviorSubject<boolean>(false);
    private _current = new BehaviorSubject<Tutor>(null);

    constructor(private _http: HttpClient) {}

    get isOpenModal$(): Observable<boolean> {
        return this._isOpenModal.asObservable();
    }

    get current$(): Observable<Tutor> {
        return this._current.asObservable();
    }

    openModal(tutor?: Tutor): void {
        this._current.next(tutor ?? null);
        this._isOpenModal.next(true);
    }

    closeModal(): void {
        this._isOpenModal.next(false);
        this._current.next(null);
    }

    getAll(): Observable<ApiResponse<Tutor[]>> {
        return this._http.get<ApiResponse<Tutor[]>>(this.apiUrl);
    }

    save(tutor: Tutor): Observable<ApiResponse<Tutor>> {
        if (tutor.id) {
            return this._http.put<ApiResponse<Tutor>>(this.apiUrl, tutor);
        }
        return this._http.post<ApiResponse<Tutor>>(this.apiUrl, tutor);
    }

    delete(id: number): Observable<ApiResponse<any>> {
        return this._http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
    }
}
