import {FormControl} from "@angular/forms";
import {Payment} from "./payment";

export class SelectedPayConcept{
    quantity: FormControl<number>;
    payment: Payment;
    id: number;

    constructor(payment: Payment) {
        this.quantity = new FormControl<number>({value: 1, disabled: false});
        this.payment = payment;
        this.id = payment.id;
    }
}
