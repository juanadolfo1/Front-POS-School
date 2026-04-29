import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
    Student,
    localeBirthDay,
    genres,
} from '../../../../core/types/student.class';
import { StudentService } from './student.service';
import { DeleteModalService } from '../../ui/delete-modal/delete-modal.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-student',
    templateUrl: './student.component.html',
    styleUrl: './student.component.scss',
})
export class StudentComponent {
    constructor(
        private _studentService: StudentService,
        private _deleteModalService: DeleteModalService,
        private _toastService: ToastrService
    ) {}

    localeBirthDay: (string) => string = localeBirthDay;
    genres = genres;

    isLoading = false;
    isLoadingTable = false;

    students: Student[] = [];
    rows = 5;
    totalRows: number;
    first = 0;

    searchName = new FormControl<string>({ value: '', disabled: false });

    ngOnInit() {
        this.getAllStudents();
    }

    openStudentModal(student?: Student) {
        this._studentService.isOpenStudentModal = true;
        this._studentService.currentStudent = student;
    }

    public getAllStudents($event?) {
        if ($event?.rows && $event?.rows !== this.rows) this.rows = $event.rows;

        if (!$event) {
            this.isLoading = true;
        } else {
            this.isLoadingTable = true;
        }

        this.first = $event?.first ?? 0;
        const limit = this.rows;
        const offset = $event?.first ?? 0;
        const page = Math.ceil(offset / limit);

        this._studentService
            .getAllStudents(limit, Number.isNaN(page) ? 1 : page + 1, this.searchName.value)
            .subscribe({
                next: ({ data }) => {
                    if (data.length) {
                        this._toastService.info(
                            'Se recuperaron los estudiantes correctamente',
                            'Éxito'
                        );
                    } else {
                        this._toastService.warning(
                            'No se encontraron estudiantes',
                            'Advertencia'
                        );
                    }
                    const students = data;
                    this.totalRows = students[0]?.total;
                    this.students = students;
                    this.isLoading = false;
                    this.isLoadingTable = false;
                },
                error: (err) => {
                    console.log(err);
                    if (err.status === 404) {
                        this.students = [];
                    }
                    this.isLoading = false;
                },
            });
    }

    public openDeleteModal(student: Student): void {
        this._studentService.currentStudent = student;
        this._deleteModalService.openDeleteModal(
            () =>
                this._studentService.deleteStudent().subscribe({
                    next: () => {
                        this.getAllStudents();
                    },
                    error: (err) => {
                        console.log(err);
                    },
                }),
            'Eliminar estudiante',
            '¿Estás seguro de que deseas eliminar este estudiante?'
        );
    }

    public openQrModal(uuid: string) {
        this._studentService.getQrCode(uuid);
    }
}
