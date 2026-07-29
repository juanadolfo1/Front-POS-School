import { Component, OnDestroy, OnInit } from '@angular/core';
import {PaymentService} from "../payment.service";
import {FormControl} from "@angular/forms";
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'date-selector-modal',
  templateUrl: './date-selector-modal.component.html',
  styleUrl: './date-selector-modal.component.scss'
})
export class DateSelectorModalComponent implements OnInit, OnDestroy {
    private _destroy$ = new Subject<void>();

    constructor(
        private _paymentService: PaymentService,
    ) {
    }

    public isOpenModal = false;
    public title = 'Corte de caja';

    public selectedDate = new FormControl<string>((new Date()).toISOString().slice(0, 10));

    ngOnInit(): void {
        this._paymentService.isOpenDateSelectorModal$.pipe(takeUntil(this._destroy$)).subscribe({
            next: (isOpen: boolean) => { this.isOpenModal = isOpen; }
        });
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    printReport(){
        this.isOpenModal = false;
        this._paymentService.openCheckoutCloseModal(this.selectedDate.value);
    }

    onClose(){
        this._paymentService.closeCheckoutCloseModal();
    }
}
