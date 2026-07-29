import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { ScholarYearService } from 'app/core/scholar-year/scholar-year.service';
import { StudentService } from '../student/student.service';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { Student } from 'app/core/types/student.class';
import { Withdrawal, WithdrawalsService } from './withdrawals.service';
import { Subject, debounceTime, switchMap } from 'rxjs';

@Component({
    selector: 'app-withdrawals',
    templateUrl: './withdrawals.component.html',
    styleUrl: './withdrawals.component.scss',
})
export class WithdrawalsComponent implements OnInit {
    withdrawals: Withdrawal[] = [];
    scholarYears: SchoolarYear[] = [];
    students: Student[] = [];
    isLoading = false;
    showForm = false;

    filterYear = new FormControl<number>(null);
    searchInput = new FormControl<string>('');
    private _searchSubject = new Subject<string>();

    form = new FormGroup({
        student_id: new FormControl<number>(null, Validators.required),
        scholar_year_id: new FormControl<number>(null, Validators.required),
        type: new FormControl<string>('temporal', Validators.required),
        reason: new FormControl<string>('', [Validators.required, Validators.maxLength(255)]),
        effective_date: new FormControl<string>(new Date().toISOString().slice(0, 10), Validators.required),
    });

    selectedStudentLabel = '';
    private _datePipe = new DatePipe('en-US');

    constructor(
        private _withdrawalsService: WithdrawalsService,
        private _catalogService: CatalogService,
        private _scholarYearService: ScholarYearService,
        private _studentService: StudentService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this._catalogService.getSchoolarYears().subscribe({
            next: ({ data }) => {
                this.scholarYears = data;
                // Pre-seleccionar ciclo activo en filtro y formulario
                const active = this._scholarYearService.activeYear;
                if (active?.id) {
                    this.filterYear.setValue(active.id);
                    this.form.patchValue({ scholar_year_id: active.id });
                    this.loadWithdrawals();
                }
            },
        });

        this._searchSubject.pipe(
            debounceTime(400),
            switchMap((term) => this._studentService.getAllStudents(20, 1, term))
        ).subscribe({
            next: ({ data }) => (this.students = data),
        });
    }

    onSearchChange(value: string): void {
        this._searchSubject.next(value);
    }

    selectStudent(student: Student): void {
        this.form.patchValue({ student_id: student.id });
        this.selectedStudentLabel = `${student.name} ${student.first_lastname} ${student.second_lastname} — ${student.curp}`;
        this.students = [];
        this.searchInput.setValue('');
    }

    clearStudent(): void {
        this.form.patchValue({ student_id: null });
        this.selectedStudentLabel = '';
    }

    loadWithdrawals(): void {
        if (!this.filterYear.value) return;
        this.isLoading = true;
        this._withdrawalsService.getAll(this.filterYear.value).subscribe({
            next: ({ data }) => {
                this.withdrawals = Array.isArray(data) ? data : [];
                this.isLoading = false;
            },
            error: () => {
                this.withdrawals = [];
                this.isLoading = false;
            },
        });
    }

    openCreate(): void {
        this.form.reset({ type: 'temporal', effective_date: new Date().toISOString().slice(0, 10) });
        this.selectedStudentLabel = '';
        this.showForm = true;
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const val = { ...this.form.value };
        if (val.effective_date && typeof val.effective_date !== 'string') {
            val.effective_date = this._datePipe.transform(val.effective_date, 'yyyy-MM-dd');
        }

        this._withdrawalsService.create(val).subscribe({
            next: () => {
                this._toastr.success('Baja registrada correctamente');
                this.showForm = false;
                this.loadWithdrawals();
            },
            error: (err) => {
                if (err.status === 409) {
                    this._toastr.error('El alumno ya tiene una baja activa en este ciclo escolar');
                } else {
                    this._toastr.error(err?.error?.message || 'Error al registrar baja');
                }
            },
        });
    }

    reactivate(w: Withdrawal): void {
        if (!confirm('¿Estás seguro de reactivar a este alumno? Se restaurará su grupo asignado.')) return;
        this._withdrawalsService.reactivate(w.id).subscribe({
            next: () => {
                this._toastr.success('Alumno reactivado correctamente');
                this.loadWithdrawals();
            },
            error: (err) => {
                this._toastr.error(err?.error?.message || 'Error al reactivar');
            },
        });
    }
}
