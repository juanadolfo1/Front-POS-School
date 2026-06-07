import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { environment } from 'environments/environment';

interface DashboardSummary {
    students_by_level: { academic_level_id: number; academic_level: string; total_students: number }[];
    total_students: number;
    revenue: { collected: number; expected: number; percentage: number; total_tickets: number };
    promotion: { with_discount: number; without_discount: number };
    withdrawals: { temporal_active: number; definitiva: number; reactivated: number };
    cancelled_tickets: { total: number; total_amount: number };
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
    scholarYears: SchoolarYear[] = [];
    filterYear = new FormControl<number>(null);
    summary: DashboardSummary | null = null;
    isLoading = false;

    constructor(
        private _http: HttpClient,
        private _catalogService: CatalogService
    ) {}

    ngOnInit(): void {
        this._catalogService.getSchoolarYears().subscribe({
            next: ({ data }) => (this.scholarYears = data),
        });
    }

    loadSummary(): void {
        if (!this.filterYear.value) return;
        this.isLoading = true;
        this._http.get<any>(`${environment.apiUrl}/dashboard/summary`, {
            params: { scholar_year_id: this.filterYear.value },
        }).subscribe({
            next: ({ data }) => {
                this.summary = data;
                this.isLoading = false;
            },
            error: () => (this.isLoading = false),
        });
    }
}
