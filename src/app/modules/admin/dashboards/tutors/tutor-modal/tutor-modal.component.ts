import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TutorsService, Tutor } from '../tutors.service';
import { StudentService } from '../../student/student.service';

@Component({
    selector: 'tutor-modal',
    templateUrl: './tutor-modal.component.html',
})
export class TutorModalComponent implements OnInit {
    @Output() saved = new EventEmitter<void>();

    isOpen = false;
    title = '';
    tutorId: number = null;
    students: any[] = [];

    name = new FormControl('', [Validators.required]);
    firstLastname = new FormControl('', [Validators.required]);
    secondLastname = new FormControl('');
    email = new FormControl('');
    relation = new FormControl('', [Validators.required]);
    tutorType = new FormControl<string>(null, [Validators.required]);
    studentId = new FormControl<number>(null, [Validators.required]);

    tutorTypeOptions = [
        { label: 'Padre', value: 'P' },
        { label: 'Madre', value: 'M' },
        { label: 'Otro', value: 'O' },
    ];

    constructor(
        private _service: TutorsService,
        private _studentService: StudentService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this._service.isOpenModal$.subscribe(isOpen => (this.isOpen = isOpen));
        this._service.current$.subscribe(tutor => {
            if (tutor) {
                this.title = 'Editar tutor';
                this.tutorId = tutor.id;
                this.name.setValue(tutor.name);
                this.firstLastname.setValue(tutor.first_lastname);
                this.secondLastname.setValue(tutor.second_lastname ?? '');
                this.email.setValue(tutor.email ?? '');
                this.relation.setValue(tutor.relation);
                this.tutorType.setValue(tutor.tutor_type);
                this.studentId.setValue(tutor.student_id);
            } else {
                this.title = 'Nuevo tutor';
                this.tutorId = null;
                this.name.reset();
                this.firstLastname.reset();
                this.secondLastname.reset();
                this.email.reset();
                this.relation.reset();
                this.tutorType.reset();
                this.studentId.reset();
            }
        });

        this._studentService.getAllStudents(200, 1, '').subscribe({
            next: ({ data }) => (this.students = Array.isArray(data) ? data : []),
        });
    }

    onHide(): void {
        this._service.closeModal();
    }

    save(): void {
        if (this.name.invalid || this.firstLastname.invalid || this.relation.invalid || this.tutorType.invalid || this.studentId.invalid) {
            this._toastr.warning('Verifica los campos requeridos.');
            return;
        }

        const tutor: Tutor = {
            id: this.tutorId,
            name: this.name.value.trim(),
            first_lastname: this.firstLastname.value.trim(),
            second_lastname: this.secondLastname.value?.trim() || null,
            email: this.email.value?.trim() || null,
            relation: this.relation.value.trim(),
            tutor_type: this.tutorType.value,
            student_id: this.studentId.value,
            status: 1,
        };

        this._service.save(tutor).subscribe({
            next: () => {
                this._toastr.success('Tutor guardado exitosamente');
                this.saved.emit();
                this.onHide();
            },
            error: (err) => {
                this._toastr.error(err?.error?.message || 'Error al guardar el tutor');
            },
        });
    }
}
