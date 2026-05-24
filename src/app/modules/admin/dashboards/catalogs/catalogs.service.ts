import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from 'app/core/types/api-response';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogsAdminService {
    private apiUrl = environment.apiUrl + '/catalog';

    constructor(private _http: HttpClient) {}

    saveScholarYear(data: any): Observable<ApiResponse> {
        if (data.id) return this._http.put<ApiResponse>(`${this.apiUrl}/scholar-years`, data);
        return this._http.post<ApiResponse>(`${this.apiUrl}/scholar-years`, data);
    }

    deleteScholarYear(id: number): Observable<ApiResponse> {
        return this._http.delete<ApiResponse>(`${this.apiUrl}/scholar-years/${id}`);
    }

    saveAcademicLevel(data: any): Observable<ApiResponse> {
        if (data.id) return this._http.put<ApiResponse>(`${this.apiUrl}/academic-levels`, data);
        return this._http.post<ApiResponse>(`${this.apiUrl}/academic-levels`, data);
    }

    deleteAcademicLevel(id: number): Observable<ApiResponse> {
        return this._http.delete<ApiResponse>(`${this.apiUrl}/academic-levels/${id}`);
    }

    saveGroup(data: any): Observable<ApiResponse> {
        if (data.id) return this._http.put<ApiResponse>(`${this.apiUrl}/groups`, data);
        return this._http.post<ApiResponse>(`${this.apiUrl}/groups`, data);
    }

    deleteGroup(id: number): Observable<ApiResponse> {
        return this._http.delete<ApiResponse>(`${this.apiUrl}/groups/${id}`);
    }
}
