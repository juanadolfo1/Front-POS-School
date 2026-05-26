import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { Scholarship } from 'app/core/types/scholarship';
import { ScholarshipsService } from './scholarships.service';
import { StudentService } from '../student/student.service';
import { Student } from 'app/core/types/student.class';

@Component({
    selector: 'app-scholarships',
    templateUrl: './scholarships.component.html',
    styleUrl: './scholarships.component.scss',
})
export class ScholarshipsComponent implements OnInit {
    scholarships: Scholarship[] = [];
    scholarYears: SchoolarYear[] = [];
    students: Student[] = [];
    isLoading = false;
    isEditing = false;

    filterYear = new FormControl<number>(null);

    form = new FormGroup({
        id: new FormControl<number>(null),
        name: new FormControl<string>('', Validators.required),
        amount: new FormControl<number>(null, [Validators.required, Validators.min(1), Validators.max(100)]),
        student_id: new FormControl<number>(null, Validators.required),
        scholar_year_id: new FormControl<number>(null, Validators.required),
    });

    constructor(
        private _scholarshipsService: ScholarshipsService,
        private _catalogService: CatalogService,
        private _studentService: StudentService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this._catalogService.getSchoolarYears().subscribe({
            next: ({ data }) => (this.scholarYears = data),
        });
        this.loadStudents();
        this.loadScholarships();
    }

    loadStudents(): void {
        this._studentService.getAllStudents(1000, 1, '').subscribe({
            next: ({ data }) => (this.students = data),
        });
    }

    loadScholarships(): void {
        this.isLoading = true;
        this._scholarshipsService.getAll(this.filterYear.value).subscribe({
            next: ({ data }) => {
                this.scholarships = Array.isArray(data) ? data : [];
                this.isLoading = false;
            },
            error: () => {
                this.scholarships = [];
                this.isLoading = false;
            },
        });
    }

    save(): void {
        if (this.form.invalid) return;
        const payload = this.form.value;

        const request = this.isEditing
            ? this._scholarshipsService.update({ id: payload.id, name: payload.name, amount: payload.amount })
            : this._scholarshipsService.create({
                  name: payload.name,
                  amount: payload.amount,
                  student_id: payload.student_id,
                  scholar_year_id: payload.scholar_year_id,
              });

        request.subscribe({
            next: () => {
                this._toastr.success(this.isEditing ? 'Beca actualizada' : 'Beca asignada');
                this.resetForm();
                this.loadScholarships();
            },
            error: () => this._toastr.error('Error al guardar'),
        });
    }

    edit(item: Scholarship): void {
        this.isEditing = true;
        this.form.patchValue({
            id: item.id,
            name: item.name,
            amount: item.amount,
            student_id: item.student_id,
            scholar_year_id: item.scholar_year_id,
        });
    }

    delete(id: number): void {
        if (!confirm('¿Eliminar esta beca?')) return;
        this._scholarshipsService.delete(id).subscribe({
            next: () => {
                this._toastr.success('Beca eliminada');
                this.loadScholarships();
            },
            error: () => this._toastr.error('Error al eliminar'),
        });
    }

    resetForm(): void {
        this.form.reset();
        this.isEditing = false;
    }
}
