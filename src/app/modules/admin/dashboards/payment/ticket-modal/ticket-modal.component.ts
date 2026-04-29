import {Component} from '@angular/core';
import {PaymentService} from "../payment.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: 'ticket-modal',
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.scss'
})
export class TicketModalComponent {

    constructor(private _paymentService: PaymentService, private _sanitizer: DomSanitizer) {
    }
    public title: string;
    public folio: string;
    public isOpenTicketModal = false;
    public ticketUrl: SafeResourceUrl;

    public ngOnInit() {
        this._paymentService.currentTicket.subscribe({
            next: value => {
                if(value?.length){
                    this.folio = value;
                    this.ticketUrl = this._sanitizer.bypassSecurityTrustResourceUrl(environment.apiUrl + '/documents/get-ticket/' + this.folio)
                    this.title = 'Ticket: ' + this.folio;
                }
            },

        });
        this._paymentService.currentCheckoutClose.subscribe({
            next: value => {
                if(value?.length){
                    this.ticketUrl = this._sanitizer.bypassSecurityTrustResourceUrl(environment.apiUrl + '/documents/close-ticket/' + value);
                    this.title = 'Cierre de caja de ' + value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1');
                }
            }
        })
        this._paymentService.isOpenTicketModal$.subscribe(isOpen => {
            this.isOpenTicketModal = isOpen;
        })
    }

    public onHide(){
        this._paymentService.closeTicketModal();
    }

}
