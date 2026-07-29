import {Component, OnDestroy, OnInit} from '@angular/core';
import {PaymentService} from "../payment.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {environment} from "../../../../../../environments/environment";
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'ticket-modal',
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.scss'
})
export class TicketModalComponent implements OnInit, OnDestroy {
    private _destroy$ = new Subject<void>();

    constructor(private _paymentService: PaymentService, private _sanitizer: DomSanitizer) {}
    public title: string;
    public folio: string;
    public isOpenTicketModal = false;
    public ticketUrl: SafeResourceUrl;

    public ngOnInit() {
        this._paymentService.currentTicket.pipe(takeUntil(this._destroy$)).subscribe({
            next: value => {
                if (value?.length) {
                    this.folio = value;
                    const token = localStorage.getItem('accessToken') ?? '';
                    this.ticketUrl = this._sanitizer.bypassSecurityTrustResourceUrl(environment.apiUrl + '/documents/get-ticket/' + this.folio + '?token=' + token);
                    this.title = 'Ticket: ' + this.folio;
                }
            },
        });
        this._paymentService.currentCheckoutClose.pipe(takeUntil(this._destroy$)).subscribe({
            next: value => {
                if (value?.length) {
                    const token = localStorage.getItem('accessToken') ?? '';
                    this.ticketUrl = this._sanitizer.bypassSecurityTrustResourceUrl(environment.apiUrl + '/documents/close-ticket/' + value + '?token=' + token);
                    this.title = 'Cierre de caja de ' + value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1');
                }
            }
        });
        this._paymentService.isOpenTicketModal$.pipe(takeUntil(this._destroy$)).subscribe(isOpen => {
            this.isOpenTicketModal = isOpen;
        });
    }

    public ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }

    public onHide(){
        this._paymentService.closeTicketModal();
    }

}
