import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AcademicLevel } from 'app/core/types/academic-level';
import { ApiResponse } from 'app/core/types/api-response';
import { Group } from 'app/core/types/group';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CatalogService {
    private readonly API_URL = environment.apiUrl + '/catalog';

    constructor(private _httpClient: HttpClient) {}

    public getSchoolarYears(): Observable<ApiResponse<SchoolarYear[]>> {
        return this._httpClient.get<ApiResponse<SchoolarYear[]>>(
            `${this.API_URL}/scholar-years`
        );
    }

    public getAcademicLevels(): Observable<ApiResponse<AcademicLevel[]>> {
        return this._httpClient.get<ApiResponse<AcademicLevel[]>>(
            `${this.API_URL}/academic-levels`
        );
    }

    public getGroups(
        scholarYearId?: number,
        academicLevelId?: number
    ): Observable<ApiResponse<Group[]>> {
        return this._httpClient.get<ApiResponse<any[]>>(
            `${this.API_URL}/groups`,
            {
                params: {
                    scholar_year_id: scholarYearId,
                    academic_level_id: academicLevelId,
                },
            }
        );
    }
}
