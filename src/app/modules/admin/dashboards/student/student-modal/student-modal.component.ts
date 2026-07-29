import { Component, OnInit } from '@angular/core';
import { StudentService } from '../student.service';
import { FormControl, Validators } from '@angular/forms';
import { GENDERS } from 'app/core/types/gender';
import { Student } from 'app/core/types/student.class';
import { ToastrService } from 'ngx-toastr';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { ScholarYearService } from 'app/core/scholar-year/scholar-year.service';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { AcademicLevel } from 'app/core/types/academic-level';

@Component({
    selector: 'student-modal',
    templateUrl: './student-modal.component.html',
    styleUrl: './student-modal.component.scss',
})
export class StudentModalComponent implements OnInit {
    constructor(
        private _studentService: StudentService,
        private _catalogService: CatalogService,
        private _scholarYearService: ScholarYearService,
        private _toastrService: ToastrService
    ) {}

    isOpenStudentModal = false;
    title = '';
    step: 1 | 2 = 1;
    newStudentId: number = null;

    genderOptions = GENDERS;
    scholarYears: SchoolarYear[] = [];
    academicLevels: AcademicLevel[] = [];
    groups: any[] = [];

    // Step 1 fields
    birthDay = new FormControl<string>({ value: '', disabled: false }, [Validators.required]);
    curp = new FormControl<string>({ value: '', disabled: false }, [Validators.required, Validators.minLength(18), Validators.maxLength(18)]);
    email = new FormControl<string>({ value: '', disabled: false });
    firstLastName = new FormControl<string>({ value: '', disabled: false }, [Validators.required]);
    secondLastName = new FormControl<string>({ value: '', disabled: false });
    gender = new FormControl<string>({ value: null, disabled: false }, [Validators.required]);
    name = new FormControl<string>({ value: '', disabled: false }, [Validators.required]);
    studentId: number;

    // Step 2 fields
    scholarYear = new FormControl<number>(null, [Validators.required]);
    academicLevel = new FormControl<number>(null, [Validators.required]);
    group = new FormControl<number>(null, [Validators.required]);

    ngOnInit() {
        this._studentService.isOpenStudentModal$.subscribe(isOpen => {
            this.isOpenStudentModal = isOpen;
        });
        this._studentService.currentStudent$.subscribe(student => {
            if (student) {
                this.title = 'Editar estudiante';
                this.birthDay.setValue(student.birthday);
                this.curp.setValue(student.curp);
                this.email.setValue(student.email);
                this.firstLastName.setValue(student.first_lastname);
                this.secondLastName.setValue(student.second_lastname);
                this.gender.setValue(student.gender);
                this.name.setValue(student.name);
                this.studentId = student.id;
            } else {
                this.title = 'Nuevo estudiante';
                this.step = 1;
                this.newStudentId = null;
                this.birthDay.reset();
                this.curp.reset();
                this.email.reset();
                this.firstLastName.reset();
                this.secondLastName.reset();
                this.gender.reset();
                this.name.reset();
            }
        });

        this._catalogService.getSchoolarYears().subscribe({ next: ({ data }) => {
            this.scholarYears = data;
            const active = this._scholarYearService.activeYear;
            if (active?.id) this.scholarYear.setValue(active.id);
        }});
        this._catalogService.getAcademicLevels().subscribe({ next: ({ data }) => (this.academicLevels = data) });
    }

    onScholarYearChange(): void {
        this.group.reset();
        this.groups = [];
        this.loadGroups();
    }

    onAcademicLevelChange(): void {
        this.group.reset();
        this.groups = [];
        this.loadGroups();
    }

    private loadGroups(): void {
        if (!this.scholarYear.value || !this.academicLevel.value) return;
        this._catalogService.getGroups(this.scholarYear.value, this.academicLevel.value).subscribe({
            next: ({ data }) => (this.groups = Array.isArray(data) ? data : []),
            error: () => (this.groups = []),
        });
    }

    onHide() {
        this._studentService.isOpenStudentModal = false;
        this.studentId = null;
        this._studentService.currentStudent = null;
        this.step = 1;
        this.newStudentId = null;
        this.groups = [];
        this.scholarYear.reset();
        this.academicLevel.reset();
        this.group.reset();
    }

    public save(): void {
        const student = new Student();
        student.birthday = this.birthDay.value;
        student.curp = this.curp.value?.toUpperCase().trim();
        student.email = this.email.value?.trim() || null;
        student.first_lastname = this.firstLastName.value?.trim();
        student.second_lastname = this.secondLastName.value?.trim() || null;
        student.gender = this.gender.value;
        student.name = this.name.value?.trim();
        student.id = this.studentId;
        student.status = 1;

        if (this.name.invalid || this.firstLastName.invalid || this.gender.invalid || this.birthDay.invalid || this.curp.invalid) {
            this._toastrService.warning('Verifica los campos requeridos. La CURP debe tener exactamente 18 caracteres.');
            return;
        }

        this._studentService.saveStudent(student).subscribe({
            next: (response) => {
                this._toastrService.success('Estudiante guardado exitosamente');
                const savedId = this.studentId ?? (response.data as any)?.id;
                this.newStudentId = savedId;
                this.step = 2;
                const active = this._scholarYearService.activeYear;
                if (active?.id) {
                    this.scholarYear.setValue(active.id);
                }
                // Si es edición, pre-cargar grupo actual
                if (this.studentId) {
                    this._studentService.getStudentGroups(savedId).subscribe({
                        next: ({ data }) => {
                            if (data?.length) {
                                const current = data[0];
                                this.scholarYear.setValue(current.scholar_year_id);
                                this.academicLevel.setValue(current.academic_level_id);
                                this.loadGroups();
                                setTimeout(() => this.group.setValue(current.group_id), 300);
                            } else {
                                this.loadGroups();
                            }
                        },
                    });
                } else {
                    this.loadGroups();
                }
            },
            error: (error) => {
                const msg = error?.error?.errors
                    ? Object.values(error.error.errors).flat().join(' ')
                    : error?.error?.message || 'Ha ocurrido un error al guardar el estudiante';
                this._toastrService.error(msg as string);
            },
        });
    }

    public assignGroup(): void {
        if (this.group.invalid) {
            this._toastrService.warning('Selecciona un grupo.');
            return;
        }
        this._studentService.assignGroup(this.newStudentId, this.group.value).subscribe({
            next: () => {
                this._toastrService.success('Grupo asignado correctamente');
                this.onHide();
            },
            error: (err) => {
                this._toastrService.error(err?.error?.message || 'Error al asignar grupo');
            },
        });
    }

    public skipGroup(): void {
        this.onHide();
    }

    public delete(): void {
        this._studentService.deleteStudent().subscribe({
            next: () => this.onHide(),
            error: (error) => console.log(error),
        });
    }
}
