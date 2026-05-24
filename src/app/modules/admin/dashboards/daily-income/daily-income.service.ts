import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from 'app/core/types/api-response';
import { DailyIncomeSummary } from 'app/core/types/daily-income';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DailyIncomeService {
    private apiUrl = environment.apiUrl + '/payments';

    constructor(private _http: HttpClient) {}

    public getDailyIncome(startDate?: string, endDate?: string): Observable<ApiResponse<DailyIncomeSummary>> {
        const params: any = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        return this._http.get<ApiResponse<DailyIncomeSummary>>(
            `${this.apiUrl}/daily-income`,
            { params }
        );
    }
}
