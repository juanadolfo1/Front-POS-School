import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from 'app/core/types/api-response';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

export interface PromotionConfigOverride {
    id?: number;
    month: number;
    deadline_date: string;
}

export interface PromotionConfig {
    id?: number;
    default_day: number;
    academic_level_id: number;
    scholar_year_id: number;
    academic_level?: { id: number; label: string };
    scholar_year?: { id: number; year: string };
    overrides: PromotionConfigOverride[];
}

@Injectable({ providedIn: 'root' })
export class PromotionConfigService {
    private apiUrl = environment.apiUrl + '/promotion-config';

    constructor(private _http: HttpClient) {}

    getAll(scholarYearId: number): Observable<ApiResponse<PromotionConfig[]>> {
        return this._http.get<ApiResponse<PromotionConfig[]>>(this.apiUrl, {
            params: { scholar_year_id: scholarYearId },
        });
    }

    create(data: any): Observable<ApiResponse> {
        return this._http.post<ApiResponse>(this.apiUrl, data);
    }

    update(data: any): Observable<ApiResponse> {
        return this._http.put<ApiResponse>(this.apiUrl, data);
    }

    delete(id: number): Observable<ApiResponse> {
        return this._http.delete<ApiResponse>(`${this.apiUrl}/${id}`);
    }
}
