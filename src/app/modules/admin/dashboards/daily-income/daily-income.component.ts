import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DailyIncomeByLevel, DailyIncomeSummary } from 'app/core/types/daily-income';
import { DailyIncomeService } from './daily-income.service';
import { ToastrService } from 'ngx-toastr';
import { ChartComponent } from 'ng-apexcharts';

@Component({
    selector: 'app-daily-income',
    templateUrl: './daily-income.component.html',
    styleUrl: './daily-income.component.scss',
})
export class DailyIncomeComponent implements OnInit {
    @ViewChild('barChart') barChart: ChartComponent;
    @ViewChild('donutChart') donutChart: ChartComponent;

    summary: DailyIncomeSummary;
    startDate = new FormControl<string>(this.getFirstOfMonth());
    endDate = new FormControl<string>(this.getToday());
    isLoading = false;

    barChartOptions: any = {};
    donutChartOptions: any = {};
    maxIncome = 0;

    private getToday(): string {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    private getFirstOfMonth(): string {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    }

    constructor(
        private _dailyIncomeService: DailyIncomeService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this._dailyIncomeService
            .getDailyIncome(this.startDate.value, this.endDate.value)
            .subscribe({
                next: ({ data }) => {
                    if (data && data.by_level?.length) {
                        this.summary = data;
                        this.maxIncome = Math.max(...data.by_level.map(l => l.total_income), 1);
                        this.buildBarChart(data.by_level);
                        this.buildDonutChart(data.by_level);
                    } else {
                        this.summary = null;
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    if (err.status === 404) {
                        this.summary = null;
                    } else {
                        this._toastr.error('Error al cargar ingresos');
                    }
                    this.isLoading = false;
                },
            });
    }

    getPercentage(income: number): number {
        return (income / this.maxIncome) * 100;
    }

    buildBarChart(levels: DailyIncomeByLevel[]): void {
        this.barChartOptions = {
            series: [
                { name: 'Ingreso', data: levels.map(l => l.total_income) },
                { name: 'Alumnos pagaron', data: levels.map(l => l.total_students_paid) },
            ],
            chart: { type: 'bar', height: 300, toolbar: { show: false }, fontFamily: 'inherit' },
            plotOptions: { bar: { horizontal: false, columnWidth: '60%', borderRadius: 6 } },
            dataLabels: { enabled: false },
            stroke: { show: true, width: 2, colors: ['transparent'] },
            xaxis: { categories: levels.map(l => l.academic_level_name) },
            yaxis: { title: { text: 'Monto (MXN)' }, labels: { formatter: (v) => '$' + Number(v).toLocaleString() } },
            fill: { opacity: 1 },
            tooltip: { y: { formatter: (v) => '$' + Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2 }) } },
            colors: ['#6366F1', '#22C55E'],
            legend: { position: 'top', horizontalAlign: 'right' },
            grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
        };
    }

    buildDonutChart(levels: DailyIncomeByLevel[]): void {
        this.donutChartOptions = {
            series: levels.map(l => l.total_income),
            chart: { type: 'donut', height: 300, fontFamily: 'inherit' },
            labels: levels.map(l => l.academic_level_name),
            colors: ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#8B5CF6'],
            legend: { position: 'bottom', fontSize: '13px' },
            dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%' },
            plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total', formatter: (w) => '$' + w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString() } } } } },
            stroke: { width: 0 },
            responsive: [{ breakpoint: 480, options: { chart: { height: 260 }, legend: { position: 'bottom' } } }],
        };
    }

    exportCsv(): void {
        if (!this.summary?.by_level?.length) {
            this._toastr.warning('No hay datos para exportar');
            return;
        }
        const headers = 'Nivel,Ingreso,Alumnos Pagaron,Con Promo';
        const rows = this.summary.by_level.map(
            l => `${l.academic_level_name},${l.total_income},${l.total_students_paid},${l.promotion_eligible_count}`
        );
        const totals = `TOTAL,${this.summary.total_income},${this.summary.total_transactions},${this.summary.promotion_eligible_total}`;
        const csv = [headers, ...rows, totals].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `ingresos-${this.startDate.value}-a-${this.endDate.value}.csv`;
        a.click();
        this._toastr.success('Archivo exportado');
    }

    private formatDate(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    setToday(): void {
        const today = this.formatDate(new Date());
        this.startDate.setValue(today);
        this.endDate.setValue(today);
        this.loadData();
    }

    setThisWeek(): void {
        const now = new Date();
        const day = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        this.startDate.setValue(this.formatDate(monday));
        this.endDate.setValue(this.formatDate(now));
        this.loadData();
    }

    setThisMonth(): void {
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        this.startDate.setValue(this.formatDate(first));
        this.endDate.setValue(this.formatDate(last));
        this.loadData();
    }
}
