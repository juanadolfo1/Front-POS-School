import { Component } from '@angular/core';
import { StudentService } from '../student.service';
import { FormControl, Validators } from '@angular/forms';
import { GENDERS } from 'app/core/types/gender';
import { Student } from 'app/core/types/student.class';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'student-modal',
    templateUrl: './student-modal.component.html',
    styleUrl: './student-modal.component.scss',
})
export class StudentModalComponent {
    constructor(
        private _studentService: StudentService,
        private _toastrService: ToastrService
    ) {}

    isOpenStudentModal: boolean = false;
    title: string;

    genderOptions = GENDERS;

    birthDay = new FormControl<string>({ value: '', disabled: false, }, [Validators.required]);
    curp = new FormControl<string>({ value: '', disabled: false }, [Validators.required]);
    email = new FormControl<string>({ value: '', disabled: false }, [Validators.required]);
    firstLastName = new FormControl<string>({ value: '', disabled: false }, [Validators.required]);
    secondLastName = new FormControl<string>({ value: '', disabled: false }, [Validators.required]);
    gender = new FormControl<string>({ value: null, disabled: false }, [Validators.required]);
    name = new FormControl<string>({ value: '', disabled: false }, [Validators.required]);

    studentId: number;

    ngOnInit() {
        this._studentService.isOpenStudentModal$.subscribe({
            next: (isOpen) => {
                this.isOpenStudentModal = isOpen;
            },
        });
        this._studentService.currentStudent$.subscribe({
            next: (student) => {
                console.log(student);
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
                    this.birthDay.reset();
                    this.curp.reset();
                    this.email.reset();
                    this.firstLastName.reset();
                    this.secondLastName.reset();
                    this.gender.reset();
                    this.name.reset();
                }
            },
        });

        this.birthDay.valueChanges.subscribe((value) => {
            console.log('El valor de birthDay cambió:', value);
        });
    }

    onHide() {
        this._studentService.isOpenStudentModal = false;
        this.studentId = null;
        this._studentService.currentStudent = null;
    }

    public save(): void{
        const student = new Student();
        student.birthday = this.birthDay.value;
        student.curp = this.curp.value;
        student.email = this.email.value;
        student.first_lastname = this.firstLastName.value;
        student.second_lastname = this.secondLastName.value;
        student.gender = this.gender.value;
        student.name = this.name.value;
        student.id = this.studentId;
        student.status = 1;

        this._studentService.saveStudent(student).subscribe({
            next: (response) => {
                this._toastrService.info('Estudiante guardado exitosamente')
                this.onHide();
            },
            error: (error) => {
                this._toastrService.warning('Ha ocurrido un error al guardar el estudiante');
                console.log(error);
            },
        });
    }

    public delete(): void{
        this._studentService.deleteStudent().subscribe({
            next: (response) => {
                this.onHide();
            },
            error: (error) => {
                console.log(error);
            },
        });
    }
}
