import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { AcademicLevel } from 'app/core/types/academic-level';
import { PromotionConfig, PromotionConfigService } from './promotion-config.service';

@Component({
    selector: 'app-promotion-config',
    templateUrl: './promotion-config.component.html',
    styleUrl: './promotion-config.component.scss',
})
export class PromotionConfigComponent implements OnInit {
    configs: PromotionConfig[] = [];
    scholarYears: SchoolarYear[] = [];
    academicLevels: AcademicLevel[] = [];
    isLoading = false;
    isEditing = false;
    showForm = false;

    filterYear = new FormControl<number>(null);

    form = new FormGroup({
        id: new FormControl<number>(null),
        scholar_year_id: new FormControl<number>(null, Validators.required),
        academic_level_id: new FormControl<number>(null, Validators.required),
        default_day: new FormControl<number>(null, [Validators.required, Validators.min(1), Validators.max(31)]),
        overrides: new FormArray([]),
    });

    months = [
        { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
    ];

    private _datePipe = new DatePipe('en-US');

    constructor(
        private _promotionConfigService: PromotionConfigService,
        private _catalogService: CatalogService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this._catalogService.getSchoolarYears().subscribe({
            next: ({ data }) => (this.scholarYears = data),
        });
        this._catalogService.getAcademicLevels().subscribe({
            next: ({ data }) => (this.academicLevels = data),
        });
    }

    get overrides(): FormArray {
        return this.form.get('overrides') as FormArray;
    }

    loadConfigs(): void {
        if (!this.filterYear.value) return;
        this.isLoading = true;
        this._promotionConfigService.getAll(this.filterYear.value).subscribe({
            next: ({ data }) => {
                this.configs = Array.isArray(data) ? data : [];
                this.isLoading = false;
            },
            error: () => {
                this.configs = [];
                this.isLoading = false;
            },
        });
    }

    openCreate(): void {
        this.resetForm();
        this.showForm = true;
        this.isEditing = false;
    }

    edit(item: PromotionConfig): void {
        this.resetForm();
        this.isEditing = true;
        this.showForm = true;
        this.form.patchValue({
            id: item.id,
            scholar_year_id: item.scholar_year_id,
            academic_level_id: item.academic_level_id,
            default_day: item.default_day,
        });
        item.overrides?.forEach((o) => this.addOverride(o.month, o.deadline_date));
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        if (this.hasDuplicateMonths()) {
            this._toastr.error('No se puede repetir el mismo mes en las excepciones');
            return;
        }

        const val = this.form.value;
        const overrides = (val.overrides as any[]).map((o) => ({
            month: o.month,
            deadline_date: this._datePipe.transform(o.deadline_date, 'yyyy-MM-dd') || o.deadline_date,
        }));

        if (this.isEditing) {
            this._promotionConfigService.update({ id: val.id, default_day: val.default_day, overrides }).subscribe({
                next: () => {
                    this._toastr.success('Configuración actualizada');
                    this.showForm = false;
                    this.loadConfigs();
                },
                error: (err) => this.handleError(err),
            });
        } else {
            this._promotionConfigService.create({
                default_day: val.default_day,
                academic_level_id: val.academic_level_id,
                scholar_year_id: val.scholar_year_id,
                overrides,
            }).subscribe({
                next: () => {
                    this._toastr.success('Configuración creada');
                    this.showForm = false;
                    this.loadConfigs();
                },
                error: (err) => this.handleError(err),
            });
        }
    }

    delete(id: number): void {
        if (!confirm('¿Eliminar esta configuración?')) return;
        this._promotionConfigService.delete(id).subscribe({
            next: () => {
                this._toastr.success('Configuración eliminada');
                this.loadConfigs();
            },
            error: () => this._toastr.error('Error al eliminar'),
        });
    }

    addOverride(month: number = null, deadline_date: string = ''): void {
        this.overrides.push(
            new FormGroup({
                month: new FormControl<number>(month, Validators.required),
                deadline_date: new FormControl<string>(deadline_date, Validators.required),
            })
        );
    }

    removeOverride(index: number): void {
        this.overrides.removeAt(index);
    }

    getMonthLabel(month: number): string {
        return this.months.find((m) => m.value === month)?.label || '';
    }

    getOverrideSummary(config: PromotionConfig): string {
        if (!config.overrides?.length) return 'Sin excepciones — todos los meses usan el día default';
        return config.overrides.map((o) => `${this.getMonthLabel(o.month)}: ${o.deadline_date.substring(8)}`).join(' | ');
    }

    private hasDuplicateMonths(): boolean {
        const months = (this.overrides.value as any[]).map((o) => o.month);
        return new Set(months).size !== months.length;
    }

    private resetForm(): void {
        this.form.reset();
        this.overrides.clear();
        this.isEditing = false;
    }

    private handleError(err: any): void {
        const error = err?.error;
        if (err.status === 422 && error?.message?.includes('existe')) {
            this._toastr.error('Ya existe una configuración para este nivel y ciclo escolar');
        } else if (err.status === 404) {
            this._toastr.error('Configuración no encontrada');
        } else {
            this._toastr.error(error?.message || 'Error al guardar');
        }
    }
}
