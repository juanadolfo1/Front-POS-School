import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { StudentService } from '../student/student.service';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { AcademicLevel } from 'app/core/types/academic-level';
import { Student } from 'app/core/types/student.class';
import { Subject, debounceTime, switchMap } from 'rxjs';
import {
    EnrollmentHistory,
    EnrollmentService,
    GradePromotion,
    PreviewResult,
    PromoteBatchResult,
} from './enrollment.service';

@Component({
    selector: 'app-enrollment',
    templateUrl: './enrollment.component.html',
    styleUrl: './enrollment.component.scss',
})
export class EnrollmentComponent implements OnInit {
    activeTab: 'enrollment' | 'grades' = 'enrollment';
    scholarYears: SchoolarYear[] = [];
    academicLevels: AcademicLevel[] = [];
    isLoading = false;

    // Tab 1: Enrollment
    fromYear = new FormControl<number>(null, Validators.required);
    toYear = new FormControl<number>(null, Validators.required);
    academicLevel = new FormControl<number>(null, Validators.required);
    previewResult: PreviewResult | null = null;
    showHistory = false;
    history: EnrollmentHistory[] = [];

    // Individual enrollment
    showIndividualForm = false;
    students: Student[] = [];
    searchInput = new FormControl<string>('');
    private _searchSubject = new Subject<string>();
    selectedStudentLabel = '';
    individualForm = new FormGroup({
        student_id: new FormControl<number>(null, Validators.required),
        from_scholar_year_id: new FormControl<number>(null, Validators.required),
        to_scholar_year_id: new FormControl<number>(null, Validators.required),
        academic_level_id: new FormControl<number>(null, Validators.required),
    });

    // Tab 2: Grade Promotions
    gradeFilter = new FormControl<number>(null);
    gradePromotions: GradePromotion[] = [];
    showGradeForm = false;
    isEditingGrade = false;
    gradeForm = new FormGroup({
        id: new FormControl<number>(null),
        academic_level_id: new FormControl<number>(null, Validators.required),
        from_grade: new FormControl<string>('', [Validators.required, Validators.maxLength(6)]),
        to_grade: new FormControl<string>('', Validators.maxLength(6)),
        is_final_grade: new FormControl<boolean>(false),
    });

    constructor(
        private _enrollmentService: EnrollmentService,
        private _catalogService: CatalogService,
        private _studentService: StudentService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this._catalogService.getSchoolarYears().subscribe({ next: ({ data }) => (this.scholarYears = data) });
        this._catalogService.getAcademicLevels().subscribe({ next: ({ data }) => (this.academicLevels = data) });

        this._searchSubject.pipe(
            debounceTime(400),
            switchMap((term) => this._studentService.getAllStudents(20, 1, term))
        ).subscribe({ next: ({ data }) => (this.students = data) });
    }

    // === Tab 1: Enrollment ===

    runPreview(): void {
        if (!this.fromYear.value || !this.toYear.value || !this.academicLevel.value) {
            this._toastr.error('Selecciona ciclo origen, destino y nivel académico');
            return;
        }
        this.isLoading = true;
        this.previewResult = null;
        const payload = {
            from_scholar_year_id: this.fromYear.value,
            to_scholar_year_id: this.toYear.value,
            academic_level_id: this.academicLevel.value,
        };
        this._enrollmentService.preview(payload).subscribe({
            next: ({ data }) => {
                this.previewResult = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.handleError(err);
                this.isLoading = false;
            },
        });
    }

    executePromotion(): void {
        const count = this.previewResult.summary.to_promote + this.previewResult.summary.to_graduate;
        if (!confirm(`¿Estás seguro? Se crearán los grupos del nuevo ciclo para ${count} alumnos. Esta acción no se puede deshacer.`)) return;

        this.isLoading = true;
        const payload = {
            from_scholar_year_id: this.fromYear.value,
            to_scholar_year_id: this.toYear.value,
            academic_level_id: this.academicLevel.value,
        };
        this._enrollmentService.promoteBatch(payload).subscribe({
            next: ({ data }) => {
                this._toastr.success(`Reinscripción completada: ${data.promoted} promovidos, ${data.graduated} egresados`);
                this.previewResult = null;
                this.isLoading = false;
            },
            error: (err) => {
                this.handleError(err);
                this.isLoading = false;
            },
        });
    }

    get canExecute(): boolean {
        return this.previewResult && this.previewResult.summary.no_rule === 0;
    }

    // Individual
    onSearchChange(value: string): void {
        this._searchSubject.next(value);
    }

    selectStudent(student: Student): void {
        this.individualForm.patchValue({ student_id: student.id });
        this.selectedStudentLabel = `${student.name} ${student.first_lastname} ${student.second_lastname}`;
        this.students = [];
        this.searchInput.setValue('');
    }

    clearStudent(): void {
        this.individualForm.patchValue({ student_id: null });
        this.selectedStudentLabel = '';
    }

    promoteIndividual(): void {
        if (this.individualForm.invalid) {
            this.individualForm.markAllAsTouched();
            return;
        }
        this._enrollmentService.promoteStudent(this.individualForm.value).subscribe({
            next: ({ data }) => {
                const d = data as any;
                if (d.status === 'graduated') {
                    this._toastr.success(d.message || 'El alumno egresa del nivel académico');
                } else {
                    this._toastr.success(`Promovido: ${d.from_grade} → ${d.to_grade}`);
                }
                this.showIndividualForm = false;
                this.individualForm.reset();
                this.selectedStudentLabel = '';
            },
            error: (err) => this.handleError(err),
        });
    }

    // History
    loadHistory(): void {
        this.showHistory = !this.showHistory;
        if (!this.showHistory) return;
        this._enrollmentService.getHistory().subscribe({
            next: ({ data }) => (this.history = Array.isArray(data) ? data : []),
        });
    }

    // === Tab 2: Grade Promotions ===

    loadGradePromotions(): void {
        if (!this.gradeFilter.value) return;
        this._enrollmentService.getGradePromotions(this.gradeFilter.value).subscribe({
            next: ({ data }) => (this.gradePromotions = Array.isArray(data) ? data : []),
        });
    }

    openGradeCreate(): void {
        this.gradeForm.reset({ is_final_grade: false });
        this.isEditingGrade = false;
        this.showGradeForm = true;
    }

    editGrade(item: GradePromotion): void {
        this.isEditingGrade = true;
        this.showGradeForm = true;
        this.gradeForm.patchValue({
            id: item.id,
            academic_level_id: item.academic_level_id,
            from_grade: item.from_grade,
            to_grade: item.to_grade,
            is_final_grade: item.is_final_grade,
        });
    }

    saveGrade(): void {
        if (this.gradeForm.invalid) {
            this.gradeForm.markAllAsTouched();
            return;
        }
        const val = this.gradeForm.value;
        if (val.is_final_grade) val.to_grade = '';

        const request = this.isEditingGrade
            ? this._enrollmentService.updateGradePromotion({ id: val.id, from_grade: val.from_grade, to_grade: val.to_grade, is_final_grade: val.is_final_grade })
            : this._enrollmentService.createGradePromotion(val);

        request.subscribe({
            next: () => {
                this._toastr.success(this.isEditingGrade ? 'Regla actualizada' : 'Regla creada');
                this.showGradeForm = false;
                this.loadGradePromotions();
            },
            error: (err) => this._toastr.error(err?.error?.message || 'Error al guardar'),
        });
    }

    deleteGrade(id: number): void {
        if (!confirm('¿Eliminar esta regla?')) return;
        this._enrollmentService.deleteGradePromotion(id).subscribe({
            next: () => {
                this._toastr.success('Regla eliminada');
                this.loadGradePromotions();
            },
            error: () => this._toastr.error('Error al eliminar'),
        });
    }

    private handleError(err: any): void {
        const msg = err?.error?.message || 'Error inesperado';
        if (err.status === 409) {
            this._toastr.warning(msg);
        } else {
            this._toastr.error(msg);
        }
    }
}
