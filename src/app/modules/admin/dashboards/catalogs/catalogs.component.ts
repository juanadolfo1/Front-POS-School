import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { AcademicLevel } from 'app/core/types/academic-level';
import { Group } from 'app/core/types/group';
import { CatalogsAdminService } from './catalogs.service';

@Component({
    selector: 'app-catalogs',
    templateUrl: './catalogs.component.html',
    styleUrl: './catalogs.component.scss',
})
export class CatalogsComponent implements OnInit {
    activeTab: 'years' | 'levels' | 'groups' = 'years';
    scholarYears: SchoolarYear[] = [];
    academicLevels: AcademicLevel[] = [];
    groups: Group[] = [];
    availableYears: string[] = [];
    isLoading = false;

    yearForm = new FormGroup({
        id: new FormControl<number>(null),
        year: new FormControl<string>('', Validators.required),
        starts_at: new FormControl<string>('', Validators.required),
        ends_at: new FormControl<string>('', Validators.required),
    });

    levelForm = new FormGroup({
        id: new FormControl<number>(null),
        label: new FormControl<string>('', Validators.required),
    });

    groupForm = new FormGroup({
        id: new FormControl<number>(null),
        label: new FormControl<string>('', Validators.required),
        scholar_year_id: new FormControl<number>(null, Validators.required),
        academic_level_id: new FormControl<number>(null, Validators.required),
    });

    constructor(
        private _catalogService: CatalogService,
        private _catalogsAdmin: CatalogsAdminService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.generateAvailableYears();
        this.loadAll();
    }

    generateAvailableYears(): void {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 2; i <= currentYear + 3; i++) {
            this.availableYears.push(`${i}-${i + 1}`);
        }
    }

    loadAll(): void {
        this.isLoading = true;
        this._catalogService.getSchoolarYears().subscribe({ next: ({ data }) => (this.scholarYears = data) });
        this._catalogService.getAcademicLevels().subscribe({ next: ({ data }) => (this.academicLevels = data) });
        this._catalogService.getGroups().subscribe({
            next: ({ data }) => {
                this.groups = data;
                this.isLoading = false;
            },
            error: () => (this.isLoading = false),
        });
    }

    saveYear(): void {
        if (this.yearForm.invalid) return;
        this._catalogsAdmin.saveScholarYear(this.yearForm.value).subscribe({
            next: () => {
                this._toastr.success('Año escolar guardado');
                this.yearForm.reset();
                this.loadAll();
            },
            error: () => this._toastr.error('Error al guardar'),
        });
    }

    saveLevel(): void {
        if (this.levelForm.invalid) return;
        this._catalogsAdmin.saveAcademicLevel(this.levelForm.value).subscribe({
            next: () => {
                this._toastr.success('Nivel académico guardado');
                this.levelForm.reset();
                this.loadAll();
            },
            error: () => this._toastr.error('Error al guardar'),
        });
    }

    saveGroup(): void {
        if (this.groupForm.invalid) return;
        this._catalogsAdmin.saveGroup(this.groupForm.value).subscribe({
            next: () => {
                this._toastr.success('Grupo guardado');
                this.groupForm.reset();
                this.loadAll();
            },
            error: () => this._toastr.error('Error al guardar'),
        });
    }

    deleteYear(id: number): void {
        if (!confirm('¿Eliminar?')) return;
        this._catalogsAdmin.deleteScholarYear(id).subscribe({
            next: () => { this._toastr.success('Eliminado'); this.loadAll(); },
        });
    }

    deleteLevel(id: number): void {
        if (!confirm('¿Eliminar?')) return;
        this._catalogsAdmin.deleteAcademicLevel(id).subscribe({
            next: () => { this._toastr.success('Eliminado'); this.loadAll(); },
        });
    }

    deleteGroup(id: number): void {
        if (!confirm('¿Eliminar?')) return;
        this._catalogsAdmin.deleteGroup(id).subscribe({
            next: () => { this._toastr.success('Eliminado'); this.loadAll(); },
        });
    }

    editYear(item: SchoolarYear): void {
        this.yearForm.patchValue({ id: item.id, year: item.year, starts_at: item.starts_at, ends_at: item.ends_at });
    }

    editLevel(item: AcademicLevel): void {
        this.levelForm.patchValue({ id: item.id, label: item.label });
    }

    editGroup(item: Group): void {
        this.groupForm.patchValue({ id: item.id, label: item.label, scholar_year_id: item.scholar_year_id, academic_level_id: item.academic_level_id });
    }
}
