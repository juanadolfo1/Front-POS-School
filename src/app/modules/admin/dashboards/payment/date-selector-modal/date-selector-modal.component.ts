import { Component } from '@angular/core';
import {PaymentService} from "../payment.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'date-selector-modal',
  templateUrl: './date-selector-modal.component.html',
  styleUrl: './date-selector-modal.component.scss'
})
export class DateSelectorModalComponent {

    constructor(
        private _paymentService: PaymentService,
    ) {
    }

    public isOpenModal = false;
    public title = 'Corte de caja';

    public selectedDate = new FormControl<string>((new Date()).toISOString().slice(0, 10));

    ngOnInit(): void {
        this._paymentService.isOpenDateSelectorModal$.subscribe({
            next: (isOpen: boolean) => {
                this.isOpenModal = isOpen;
            }
        });

        this.selectedDate.valueChanges.subscribe(value => {
            console.log(value);
        })
    }

    printReport(){
        this._paymentService.openCheckoutCloseModal(this.selectedDate.value);
    }

    onClose(){
        this._paymentService.closeCheckoutCloseModal();
    }
}
