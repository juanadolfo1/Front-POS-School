import {ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {PaymentService} from "../payment.service";
import {FormControl} from "@angular/forms";
import {validUuid} from "../../../../../shared/validators/uuid-validator";
import {StudentService} from '../../student/student.service';
import {Student} from 'app/core/types/student.class';
import {ToastrService} from 'ngx-toastr';
import {HttpErrorResponse} from "@angular/common/http";

@Component({
    selector: 'qr-modal',
    templateUrl: './qr-modal.component.html',
    styleUrl: './qr-modal.component.scss'
})
export class QrModalComponent implements OnInit {
    public title = 'Buscar con QR';
    public isOpenQrModal = false;
    public isValidUuid = false;

    public uuidControl = new FormControl('', [validUuid()]);
    @ViewChild('uuidForm') uuidForm: ElementRef;

    public currentStudent?: Student;

    constructor(
        private _paymentService: PaymentService,
        private _studentService: StudentService,
        private _toastrService: ToastrService,
        private cdr: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        this._paymentService.isOpenQrModal$.subscribe({
            next: isOpen => {
                this.isOpenQrModal = isOpen;

                if(isOpen) {
                    setTimeout(() => {
                        this.uuidForm.nativeElement.focus();
                    }, 300);
                }
            }
        })
    }

    @HostListener('document:keypress', ['$event'])
    listenKeys(event: KeyboardEvent) {
        if (this.isOpenQrModal) {
            event.preventDefault();
            const currentCode = event.code;
            this.currentStudent = undefined;
            if (currentCode === 'Enter') {
                if (this.uuidControl.hasError('invalidUuid')) {
                    this._toastrService.error('Código QR inválido');
                } else {
                    this._studentService.getStudentByUuid(this.uuidControl.value)
                        .subscribe({
                            next: ({data, message}) => {
                                this.currentStudent = data
                                this._paymentService.currentStudent = data;
                            },
                            error: (error) => {
                                this._toastrService.error('Código QR inválido');
                                console.log(error)
                            },
                            complete: () => {
                                this.isValidUuid = !this.uuidControl.hasError('invalidUuid');
                            }
                        })
                }
                // this.uuidControl.reset();
            } else {
                if (this.uuidControl.value.length >= 36) {
                    this.uuidControl.setValue('');
                    console.log('Se elimina uuid anterior')
                }

                this.uuidControl.setValue(this.uuidControl.value + event.key);
            }
        }
    }

    openPaymentModal(): void {
        this._paymentService.getPaymentsByStudentId(
            this.currentStudent.id,
            this.currentStudent.scholar_year_id,
            this.currentStudent.academic_level_id
        ).subscribe({
            next: ({data, message}) => {
                const {payments, paymentMethods, is_up_to_date, scholarship} = data;
                this._paymentService.paymentMethods = paymentMethods;

                this._paymentService.openPaymentModal(
                    payments,
                    paymentMethods,
                    scholarship,
                    is_up_to_date,
                    this.currentStudent.id,
                    this.currentStudent.scholar_year_id,
                )

                this._paymentService.closeQrModal();
            },
            error: (err: HttpErrorResponse) => {
                console.error(err);
                if (err.status == 404) {
                    this._toastrService.info(
                        'No se encontraron pagos pendientes'
                    );
                    return;
                }
                this._toastrService.error(
                    'Error al cargar los pagos pendientes'
                );
            },
        })
    }

    onHideQrModal() {
        this.isOpenQrModal = false;
        this.uuidControl.setValue('');
        this.isValidUuid = false;
    }
}
