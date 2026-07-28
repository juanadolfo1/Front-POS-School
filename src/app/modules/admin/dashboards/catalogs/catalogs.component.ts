import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { AcademicLevel } from 'app/core/types/academic-level';
import { Group } from 'app/core/types/group';
import { CatalogsAdminService } from './catalogs.service';
import { environment } from 'environments/environment';
import { BrandingService } from 'app/core/branding/branding.service';

@Component({
    selector: 'app-catalogs',
    templateUrl: './catalogs.component.html',
    styleUrl: './catalogs.component.scss',
})
export class CatalogsComponent implements OnInit {
    activeTab: 'years' | 'levels' | 'groups' | 'clone' | 'branding' = 'years';
    scholarYears: SchoolarYear[] = [];
    academicLevels: AcademicLevel[] = [];
    groups: Group[] = [];
    availableYears: string[] = [];
    isLoading = false;

    // Clone concepts form
    cloneForm = new FormGroup({
        from_scholar_year_id: new FormControl<number>(null, Validators.required),
        to_scholar_year_id: new FormControl<number>(null, Validators.required),
        academic_level_id: new FormControl<number>(null, Validators.required),
        increase_percent: new FormControl<number>(0, [Validators.min(0)]),
    });

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

    // Branding
    schoolName = '';
    currentLogoUrl: string | null = null;
    currentFaviconUrl: string | null = null;
    selectedLogo: File | null = null;
    selectedFavicon: File | null = null;
    logoPreview: string | null = null;
    faviconPreview: string | null = null;

    constructor(
        private _catalogService: CatalogService,
        private _catalogsAdmin: CatalogsAdminService,
        private _toastr: ToastrService,
        private _http: HttpClient,
        private _branding: BrandingService
    ) {}

    ngOnInit(): void {
        this.generateAvailableYears();
        this.loadAll();
        this.loadBranding();
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

    objectKeys = Object.keys;

    get groupsByLevel(): Record<string, Group[]> {
        return this.groups.reduce((acc, group) => {
            const level = group.academic_level ?? 'Sin nivel';
            if (!acc[level]) acc[level] = [];
            acc[level].push(group);
            return acc;
        }, {} as Record<string, Group[]>);
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

    cloneConcepts(): void {
        if (this.cloneForm.invalid) return;
        this._http.post<any>(`${environment.apiUrl}/catalog/pay-concepts/clone`, this.cloneForm.value).subscribe({
            next: ({ data }) => {
                this._toastr.success(`Se copiaron ${data.cloned_concepts} conceptos con incremento del ${data.increase_percent}%`);
                this.cloneForm.reset({ increase_percent: 0 });
            },
            error: (err) => this._toastr.error(err?.error?.message || 'Error al clonar conceptos'),
        });
    }

    // ===== Branding =====

    loadBranding(): void {
        this._http.get<any>(`${environment.apiUrl}/branding`).subscribe({
            next: ({ data }) => {
                this.schoolName = data?.school_name || '';
                this.currentLogoUrl = data?.logo_url || null;
                this.currentFaviconUrl = data?.favicon_url || null;
            },
        });
    }

    onLogoSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedLogo = file;
            this.logoPreview = URL.createObjectURL(file);
        }
    }

    onFaviconSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedFavicon = file;
            this.faviconPreview = URL.createObjectURL(file);
        }
    }

    saveBranding(): void {
        const formData = new FormData();
        if (this.schoolName) formData.append('school_name', this.schoolName);
        if (this.selectedLogo) formData.append('logo', this.selectedLogo);
        if (this.selectedFavicon) formData.append('favicon', this.selectedFavicon);

        this._http.post<any>(`${environment.apiUrl}/branding`, formData).subscribe({
            next: ({ data }) => {
                this._toastr.success('Configuración guardada');
                this.currentLogoUrl = data.logo_url;
                this.currentFaviconUrl = data.favicon_url;
                this.selectedLogo = null;
                this.selectedFavicon = null;
                this.logoPreview = null;
                this.faviconPreview = null;
                this._branding.load();
            },
            error: (err) => this._toastr.error(err?.error?.message || 'Error al guardar'),
        });
    }
}
