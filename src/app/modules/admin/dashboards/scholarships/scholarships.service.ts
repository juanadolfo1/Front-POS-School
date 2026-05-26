import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from 'app/core/types/api-response';
import { Scholarship } from 'app/core/types/scholarship';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScholarshipsService {
    private apiUrl = environment.apiUrl + '/scholarships';

    constructor(private _http: HttpClient) {}

    getAll(scholarYearId?: number): Observable<ApiResponse<Scholarship[]>> {
        const params: any = {};
        if (scholarYearId) params.scholar_year_id = scholarYearId;
        return this._http.get<ApiResponse<Scholarship[]>>(this.apiUrl, { params });
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
