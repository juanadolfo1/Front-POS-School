import {Component} from '@angular/core';
import {PaymentService} from '../payment.service';
import {Payment, PaymentToSave} from 'app/core/types/payment';
import {FormControl} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {PaymentMethod} from "../../../../../core/types/payment-method";
import {Student} from "../../../../../core/types/student.class";
import {Scholarship} from "../../../../../core/types/scholarship";

@Component({
    selector: 'payment-modal',
    templateUrl: './payment-modal.component.html',
    styleUrl: './payment-modal.component.scss',
})
export class PaymentModalComponent {
    constructor(
        private _paymentService: PaymentService,
        private _toastrService: ToastrService
    ) {
    }

    isOpenPaymentModal = false;
    title: string = 'Registrar pago';
    pendingPayments: Payment[] = [];
    isUpToDate: boolean = false;
    promotionEligible: boolean = false;
    selectedPayments?: Payment[];
    studentId: number;
    paymentMethods: PaymentMethod[];
    subtotal: number;
    discount: number;
    total: number;
    currentStudent: Student;
    folioTicket: string;
    scholarship: Scholarship;
    scholarshipAmount: number;
    scholarYearId: number;

    isPartial = new FormControl<boolean>({value: false, disabled: false});
    currentPayments = new FormControl<number[]>({value: [], disabled: false});
    currentPaymentMethod = new FormControl<number>({value: null, disabled: false});
    partialAmount = new FormControl<number>({value: null, disabled: false});
    paidAt = new FormControl<string>({value: null, disabled: false});

    ngOnInit() {
        this._paymentService.isOpenPaymentModal$.subscribe({
            next: (isOpen) => {
                this.isOpenPaymentModal = isOpen;
            },
        });

        this._paymentService.pendingPayments$.subscribe({
            next: (payments) => {
                this.pendingPayments = payments;
            },
        });

        this._paymentService.isUpToDate$.subscribe({
            next: (isUpToDate) => {
                this.isUpToDate = isUpToDate;
                this.promotionEligible = isUpToDate;
            },
        });

        this._paymentService.paymentMethods$.subscribe({
            next: (paymentMethods) => {
                this.paymentMethods = paymentMethods;
            }
        });

        this._paymentService.currentStudent$.subscribe({
            next: (currentStudent) => {
                this.currentStudent = currentStudent;
            }
        });

        this._paymentService.currentScholarship$.subscribe({
            next: (currentScholarship) => {
                this.scholarship = currentScholarship;
            }
        })

        this._paymentService.currentScholarYear.subscribe({
            next: (currentScholarYear) => {
                this.scholarYearId = currentScholarYear;
            }
        })

        this.currentPayments.valueChanges.subscribe({
            next: (value) => {
                if (value) {
                    this.selectedPayments = this.pendingPayments.filter((payment) => value.includes(payment.id));
                    this.subtotal = this.selectedPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);
                    this.discount = this.promotionEligible
                        ? this.selectedPayments.reduce((acc, curr) => acc + Number(curr.discount_amount), 0)
                        : 0;
                    this.scholarshipAmount = this.promotionEligible
                        ? this.selectedPayments.reduce((acc, curr) => acc + Number(this.scholarship?.amount ?? 0), 0)
                        : 0;
                    this.total = this.scholarship != null
                        ? this.subtotal - this.scholarshipAmount
                        : this.subtotal - this.discount;
                }
            },
        });
        this._paymentService.studentId$.subscribe({
            next: (studentd) => {
                this.studentId = studentd;
            },
        });

        this.paidAt.valueChanges.subscribe({
            next: (paidAt) => {console.log(paidAt)}
        })
    }

    isThereDiscount(): boolean {
        return this.promotionEligible;
    }

    public savePayment() {
        if (Number(this.partialAmount.value) >= Number(this.selectedPayments[0].amount)) {
            this._toastrService.error(
                'El monto no puede ser superior a ' +
                this.selectedPayments[0].amount
            );
            return;
        }
        if (this.partialAmount.value == null && this.isPartial.value) {
            this._toastrService.error('Especifique un monto a abonar');
            return;
        }

        const hasDiscount = this.isThereDiscount();
        const discountType = this.isUpToDate ? this.scholarship?.id ? 'scholarship' : 'early_payment' : null;
        const paymentToSave = {
            is_full_payed: !this.isPartial.value,
            amount: this.subtotal,
            has_discount: this.isThereDiscount(),
            discount_type: discountType,
            discount_amount: this.scholarship?.id ? this.scholarshipAmount : this.discount,
            student_group_id: this.studentId,
            scholar_year_id: this.currentStudent?.scholar_year_id ?? this.scholarYearId,
            scholarship: this.scholarship,
            payment_method: {
                id: this.currentPaymentMethod.value
            },
            pay_concepts: this.selectedPayments.map((concept) => {
                let received_payment = concept.amount;

                if (this.promotionEligible) {
                    received_payment = concept.amount - concept.discount_amount;
                    if (this.scholarship?.id) {
                        received_payment = concept.amount - this.scholarship?.amount;
                    }
                }

                if (this.isPartial.value) {
                    received_payment = this.partialAmount.value;
                }

                return {
                    pay_concept_id: concept.id,
                    pay_concept_name: concept.label,
                    pay_concept_type: concept.pay_concept_type,
                    amount: concept.amount,
                    discount: this.scholarship?.id ? this.scholarshipAmount : concept.discount_amount,
                    last_day_with_discount: concept.last_day_with_discount ?? '',
                    scholar_year_id: this.scholarship?.id ? this.scholarshipAmount : concept.discount_amount,
                    quantity: 1,
                    payments: [
                        {
                            // paid_at: (new Date()).toISOString().replace(/(\d{4})-(\d{2})-(\d{2}).*/, '$1-$2-$3'),
                            paid_at: this.paidAt.value,
                            has_discount: this.isUpToDate,
                            received_payment,
                            is_full_payed: !this.isPartial.value,
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

    public onHide() {
        this.currentPayments.reset();
        this.currentPaymentMethod.reset();
        this.selectedPayments = undefined;
        this.isPartial.reset();
        this.partialAmount.reset();
        this._paymentService.closePaymentModal();
        this.subtotal = undefined;
        this.discount = undefined;
        this.total = undefined;
        this.folioTicket = undefined;
    }
}
