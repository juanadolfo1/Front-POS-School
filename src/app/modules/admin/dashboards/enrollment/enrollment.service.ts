import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from 'app/core/types/api-response';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

export interface PreviewResult {
    to_promote: { student_id: number; name: string; from_grade: string; to_grade: string }[];
    to_graduate: { student_id: number; name: string; current_grade: string }[];
    excluded: { student_id: number; name: string; curp: string; reason: string }[];
    no_rule: { student_id: number; name: string; current_grade: string }[];
    summary: { total: number; to_promote: number; to_graduate: number; excluded: number; no_rule: number };
}

export interface PromoteBatchResult {
    process_id: number;
    promoted: number;
    graduated: number;
    excluded: number;
    total_processed: number;
}

export interface EnrollmentHistory {
    id: number;
    date: string;
    from_scholar_year: string;
    to_scholar_year: string;
    academic_level: string;
    promoted: number;
    graduated: number;
    excluded: number;
}

export interface GradePromotion {
    id?: number;
    academic_level_id: number;
    from_grade: string;
    to_grade: string;
    is_final_grade: boolean;
    academic_level?: { id: number; label: string };
}

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
    private apiUrl = environment.apiUrl;

    constructor(private _http: HttpClient) {}

    preview(data: any): Observable<ApiResponse<PreviewResult>> {
        return this._http.post<ApiResponse<PreviewResult>>(`${this.apiUrl}/enrollment/preview`, data);
    }

    promoteBatch(data: any): Observable<ApiResponse<PromoteBatchResult>> {
        return this._http.post<ApiResponse<PromoteBatchResult>>(`${this.apiUrl}/enrollment/promote-batch`, data);
    }

    promoteStudent(data: any): Observable<ApiResponse> {
        return this._http.post<ApiResponse>(`${this.apiUrl}/enrollment/promote-student`, data);
    }

    getHistory(): Observable<ApiResponse<EnrollmentHistory[]>> {
        return this._http.get<ApiResponse<EnrollmentHistory[]>>(`${this.apiUrl}/enrollment/history`);
    }

    getGradePromotions(academicLevelId: number): Observable<ApiResponse<GradePromotion[]>> {
        return this._http.get<ApiResponse<GradePromotion[]>>(`${this.apiUrl}/grade-promotions`, {
            params: { academic_level_id: academicLevelId },
        });
    }

    createGradePromotion(data: any): Observable<ApiResponse> {
        return this._http.post<ApiResponse>(`${this.apiUrl}/grade-promotions`, data);
    }

    updateGradePromotion(data: any): Observable<ApiResponse> {
        return this._http.put<ApiResponse>(`${this.apiUrl}/grade-promotions`, data);
    }

    deleteGradePromotion(id: number): Observable<ApiResponse> {
        return this._http.delete<ApiResponse>(`${this.apiUrl}/grade-promotions/${id}`);
    }
}
