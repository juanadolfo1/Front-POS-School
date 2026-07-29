import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CancelTicketModalComponent } from './cancel-ticket-modal/cancel-ticket-modal.component';
import { AcademicLevel } from 'app/core/types/academic-level';
import { Group } from 'app/core/types/group';
import { SchoolarYear } from 'app/core/types/schoolar-year';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { ScholarYearService } from 'app/core/scholar-year/scholar-year.service';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { StudentService } from '../student/student.service';
import { Student } from 'app/core/types/student.class';
import { PaymentService } from './payment.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrl: './payment.component.scss',
})
export class PaymentComponent {
    @ViewChild(CancelTicketModalComponent) cancelTicketModal: CancelTicketModalComponent;
    private _destroy$ = new Subject<void>();
    constructor(
        private _catalogService: CatalogService,
        private _scholarYearService: ScholarYearService,
        private _studentService: StudentService,
        private _paymentService: PaymentService,
        private _toastrService: ToastrService,
    ) {}

    public scholarYears: SchoolarYear[] = [];
    public academicLevels: AcademicLevel[] = [];
    public groups: Group[] = [];
    public students: Student[] = [];

    public scholarYear: FormControl<number> = new FormControl();
    public academicLevel: FormControl<number> = new FormControl();
    public group: FormControl<number> = new FormControl();

    public accountStatementStudentId: number | null = null;
    public accountStatementYearId: number | null = null;

    public isLoading: boolean = false;

    ngOnInit(): void {
        this.getSchoolarYears();
        this.getAcademicLevels();

        // Pre-seleccionar ciclo activo
        const active = this._scholarYearService.activeYear;
        if (active?.id) {
            this.scholarYear.setValue(active.id);
        }

        combineLatest([
            this.scholarYear.valueChanges,
            this.academicLevel.valueChanges,
        ])
            .pipe(takeUntil(this._destroy$))
            .subscribe(([scholarYear, academicLevel]) => {
                if (scholarYear && academicLevel) {
                    this.getGroups(scholarYear, academicLevel);
                } else {
                    this.groups = [];
                }
            });
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    currentGroup() {
        return this.groups.find((g) => g.id == this.group.value)?.label ?? '';
    }

    getSchoolarYears() {
        this._catalogService.getSchoolarYears().subscribe({
            next: ({ data }) => {
                this.scholarYears = data;
                // Si aún no hay valor seleccionado, usar el activo
                if (!this.scholarYear.value) {
                    const active = this._scholarYearService.activeYear;
                    if (active?.id) this.scholarYear.setValue(active.id);
                }
            },
        });
    }

    getAcademicLevels() {
        this._catalogService.getAcademicLevels().subscribe({
            next: ({ data }) => { this.academicLevels = data; },
            error: () => this._toastrService.error('Error al cargar los niveles académicos'),
        });
    }

    getGroups(scholarYearId?: number, academicLevelId?: number) {
        this._catalogService.getGroups(scholarYearId, academicLevelId).subscribe({
            next: ({ data }) => { this.groups = data; },
            error: () => this._toastrService.error('Error al cargar los grupos'),
        });
    }

    getStudentsByGroup() {
        this.isLoading = true;
        if (this.group.value) {
            this._studentService
                .getStudentsByGroup(this.group.value)
                .subscribe({
                    next: ({ data }) => {
                        if (data.length) {
                            this._toastrService.info(
                                'Estudiantes cargados correctamente'
                            );
                            this.students = data;
                        }
                        this.isLoading = false;
                    },
                    error: (err) => {
                        console.log(err);
                        this._toastrService.error(
                            'Error al cargar los estudiantes'
                        );
                        this.isLoading = false;
                    },
                });
        } else {
            this.isLoading = false;
            this._toastrService.error('Llena el formulario correctamente');
        }
    }

    openQrModal(): void {
        this._paymentService.openQrModal();
    }

    openPaymentModal(studentId: number, studentGroupId: number) {
        this._paymentService
            .getPaymentsByStudentId(
                studentId,
                this.scholarYear.value,
                this.academicLevel.value
            )
            .subscribe({
                next: ({ data }) => {
                    const { payments, paymentMethods, scholarship, is_up_to_date } = data;
                    if (payments.length) {
                        this._paymentService.openPaymentModal(
                            payments,
                            paymentMethods,
                            scholarship,
                            is_up_to_date,
                            studentGroupId,
                            this.scholarYear.value,
                        );
                    }
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
            });
    }

    openServicesPaymentModal(studentGroupId: number){
        this._paymentService.getServicesPayments(
            this.scholarYear.value,
            this.academicLevel.value
        ).subscribe({
            next: ({ data }) => {
                const {payments, paymentMethods} = data

                if(payments.length) {
                    this._paymentService.openServicesPaymentsModal(
                        payments,
                        paymentMethods,
                        studentGroupId,
                        this.scholarYear.value
                    )
                } else {
                    this._toastrService.warning('No se encontraron conceptos de pago');
                }
            },
            error: (err: HttpErrorResponse) => {
                console.error(err);
                if (err.status == 404) {
                    this._toastrService.info(
                        'No se encontraron servicios por pagar'
                    );
                    return;
                }
                this._toastrService.error(
                    'Error al cargar los servicios por pagar'
                );
            },
        })
    }

    openDateSelectorModal(){
        this._paymentService.openDateSelectorModal();
    }

    openCancelTicketModal(ticketId: number) {
        this.cancelTicketModal.open(ticketId, () => this.getStudentsByGroup());
    }

    openAccountStatement(studentId: number) {
        this.accountStatementStudentId = null;
        this.accountStatementYearId = null;
        setTimeout(() => {
            this.accountStatementStudentId = studentId;
            this.accountStatementYearId = this.scholarYear.value;
        });
    }

    getPendingPaymentReport() {
        this._paymentService.getPendingPaymentReport().subscribe({
            next: (result) => {
                this._toastrService.info('Reporte generado exitosamente');
                const a = document.createElement("a");
                const now = new Date();
                const filename = `reporte-pagos-pendientes-${now.toLocaleDateString('es-MX')}.csv`
                a.href = URL.createObjectURL(result);
                a.download = filename;
                a.click();
            }
        })
    }

}
