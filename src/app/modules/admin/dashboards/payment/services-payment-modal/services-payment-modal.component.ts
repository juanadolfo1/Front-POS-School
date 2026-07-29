import {Component, OnDestroy, OnInit} from '@angular/core';
import {SelectedPayConcept} from "../../../../../core/types/selected-pay-concept";
import {FormControl} from "@angular/forms";
import {PaymentMethod} from "../../../../../core/types/payment-method";
import {PaymentService} from "../payment.service";
import {Payment} from "../../../../../core/types/payment";
import {ToastrService} from "ngx-toastr";
import {Subject, takeUntil} from 'rxjs';

@Component({
    selector: 'services-payment-modal',
    templateUrl: './services-payment-modal.component.html',
    styleUrl: './services-payment-modal.component.scss'
})
export class ServicesPaymentModalComponent implements OnInit, OnDestroy {
    private _destroy$ = new Subject<void>();

    public selectedPayConcepts: SelectedPayConcept[] = []

    public paymentMethods: PaymentMethod[] = [];
    public payConcepts: Payment[] = [];

    public currentPaymentMethod = new FormControl<number>({value: null, disabled: false});
    public currentPayConcepts = new FormControl<number[]>({value: [], disabled: false});

    public isOpenServicesPaymentModal = false;
    public title = 'Registrar pago';
    public total: number = 0;

    public studentGroupId: number;
    public scholarYearId: number;
    public folioTicket: string;

    public constructor(
        private _paymentService: PaymentService,
        private _toastrService: ToastrService,
    ) {
    }

    ngOnInit() {
        this._paymentService.studentId$.pipe(takeUntil(this._destroy$)).subscribe({
            next: value => this.studentGroupId = value,
        });
        this._paymentService.currentScholarYear.pipe(takeUntil(this._destroy$)).subscribe({
            next: value => this.scholarYearId = value,
        });
        this._paymentService.paymentMethods$.pipe(takeUntil(this._destroy$)).subscribe({
            next: value => this.paymentMethods = value,
        });
        this._paymentService.pendingPayments$.pipe(takeUntil(this._destroy$)).subscribe({
            next: value => this.payConcepts = value,
        });
        this._paymentService.isOpenServicesModal$.pipe(takeUntil(this._destroy$)).subscribe({
            next: value => this.isOpenServicesPaymentModal = value,
        });
        this.currentPayConcepts.valueChanges.pipe(takeUntil(this._destroy$)).subscribe({
            next: value => {
                this.selectedPayConcepts = this.currentPayConcepts.value.map(payConceptId => {
                    const payConcept = this.payConcepts.find(payConcept => payConcept.id === payConceptId);
                    return new SelectedPayConcept(payConcept);
                });

                this.total = this.selectedPayConcepts.reduce(
                    (acc, curr) => acc + (curr.payment.amount * curr.quantity.value),
                    0
                )

                this.selectedPayConcepts.forEach(payConcept => {
                    payConcept.quantity.valueChanges.subscribe({
                        next: value => {
                            this.total = this.selectedPayConcepts.reduce(
                                (acc, curr) => acc + (curr.payment.amount * curr.quantity.value),
                                0
                            )
                        }
                    })
                })
            },
        });
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    public onHide() {
        this.currentPayConcepts.reset();
        this.currentPaymentMethod.reset();
        this.selectedPayConcepts = [];
        this.folioTicket = undefined;
        this._paymentService.closeServicesModal();
    }

    public savePayment() {
        if (!this.currentPaymentMethod.value) {
            this._toastrService.warning('Selecciona un método de pago');
            return;
        }
        const today = (new Date()).toISOString();
        const paymentToSave = {
            is_full_payed: true,
            amount: this.total,
            has_discount: false,
            discount_type: null,
            discount_amount: 0,
            student_group_id: this.studentGroupId,
            scholar_year_id: this.scholarYearId,
            payment_method: {
                id: this.currentPaymentMethod.value,
            },
            pay_concepts: this.selectedPayConcepts.map(({payment, quantity}) => {
                return {
                    pay_concept_id: payment.id,
                    pay_concept_name: payment.label,
                    pay_concept_type: payment.pay_concept_type,
                    amount: payment.amount,
                    quantity: quantity.value,
                    last_day_with_discount: today,
                    discount: 0,
                    scholar_year_id: this.scholarYearId,
                    payments: [
                        {
                            paid_at: today,
                            has_discount: false,
                            received_payment: payment.amount * quantity.value,
                            is_full_payed: false,
                        }
                    ]
                }
            })
        };

        this._paymentService.savePayment(paymentToSave).subscribe({
            next: ({data}) => {
                this._toastrService.success('Pago guardado correctamente');
                this.folioTicket = data.folio_ticket;
                // this.onHide();
            },
            error: (err) => {
                console.error(err);
                this._toastrService.error('Error al guardar el pago');
            },
        });
    }

    public printTicket(){
        this._paymentService.openTicketModal(this.folioTicket);
    }

}
