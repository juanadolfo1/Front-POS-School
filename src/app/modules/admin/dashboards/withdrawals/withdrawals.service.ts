import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from 'app/core/types/api-response';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

export interface Withdrawal {
    id: number;
    type: 'temporal' | 'definitiva';
    reason: string;
    effective_date: string;
    reactivated_at: string | null;
    status: number;
    student_id: number;
    scholar_year: string;
    student_name: string;
    curp: string;
}

@Injectable({ providedIn: 'root' })
export class WithdrawalsService {
    private apiUrl = environment.apiUrl + '/withdrawals';

    constructor(private _http: HttpClient) {}

    getAll(scholarYearId: number): Observable<ApiResponse<Withdrawal[]>> {
        return this._http.get<ApiResponse<Withdrawal[]>>(this.apiUrl, {
            params: { scholar_year_id: scholarYearId },
        });
    }

    create(data: any): Observable<ApiResponse> {
        return this._http.post<ApiResponse>(this.apiUrl, data);
    }

    reactivate(id: number): Observable<ApiResponse> {
        return this._http.put<ApiResponse>(`${this.apiUrl}/reactivate/${id}`, {});
    }
}
