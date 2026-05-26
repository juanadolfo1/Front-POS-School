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
    paidAt = new FormControl<Date>({value: null, disabled: false});

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
                    const hasDiscount = this.isUpToDate || this.promotionEligible;
                    this.subtotal = this.selectedPayments.reduce((acc, curr) =>
                        acc + Number(hasDiscount ? curr.discount_amount : curr.amount), 0);
                    this.discount = hasDiscount
                        ? this.selectedPayments.reduce((acc, curr) => acc + (Number(curr.amount) - Number(curr.discount_amount)), 0)
                        : 0;
                    this.total = this.subtotal;
                    if (this.scholarship) {
                        this.scholarshipAmount = this.total * this.scholarship.amount / 100;
                        this.total = this.total - this.scholarshipAmount;
                    }
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

        const hasDiscount = this.isUpToDate || this.promotionEligible;
        const discountType = hasDiscount
            ? (this.scholarship ? 'scholarship' : 'early_payment')
            : null;

        const paymentToSave = {
            is_full_payed: !this.isPartial.value,
            amount: this.selectedPayments.reduce((acc, c) =>
                acc + Number(hasDiscount ? c.discount_amount : c.amount), 0),
            has_discount: hasDiscount,
            discount_type: discountType,
            discount_amount: hasDiscount
                ? this.selectedPayments.reduce((acc, c) => acc + (Number(c.amount) - Number(c.discount_amount)), 0)
                : 0,
            student_group_id: this.studentId,
            scholar_year_id: this.currentStudent?.scholar_year_id ?? this.scholarYearId,
            scholarship: this.scholarship,
            payment_method: {
                id: this.currentPaymentMethod.value
            },
            pay_concepts: this.selectedPayments.map((concept) => {
                const price = hasDiscount ? Number(concept.discount_amount) : Number(concept.amount);
                const discountAmt = hasDiscount ? Number(concept.amount) - Number(concept.discount_amount) : 0;
                let received_payment = price;

                if (this.scholarship) {
                    received_payment = price - (price * this.scholarship.amount / 100);
                }

                if (this.isPartial.value) {
                    received_payment = this.partialAmount.value;
                }

                return {
                    pay_concept_id: concept.id,
                    pay_concept_name: concept.label,
                    pay_concept_type: concept.pay_concept_type,
                    amount: price,
                    discount: discountAmt,
                    last_day_with_discount: concept.last_day_with_discount ?? '',
                    quantity: 1,
                    payments: [
                        {
                            paid_at: this.paidAt.value ? this.formatDate(this.paidAt.value) : null,
                            has_discount: hasDiscount,
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
        this.paidAt.reset();
        this._paymentService.closePaymentModal();
        this.subtotal = undefined;
        this.discount = undefined;
        this.total = undefined;
        this.folioTicket = undefined;
    }

    private formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}
