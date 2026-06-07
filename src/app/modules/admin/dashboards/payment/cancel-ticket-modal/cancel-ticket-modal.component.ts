import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'environments/environment';

@Component({
    selector: 'cancel-ticket-modal',
    templateUrl: './cancel-ticket-modal.component.html',
})
export class CancelTicketModalComponent {
    isOpen = false;
    ticketId: number;
    reason = new FormControl<string>('', [Validators.required, Validators.maxLength(255)]);
    onCancelled: () => void;

    constructor(private _http: HttpClient, private _toastr: ToastrService) {}

    open(ticketId: number, onCancelled?: () => void): void {
        this.ticketId = ticketId;
        this.onCancelled = onCancelled;
        this.reason.reset();
        this.isOpen = true;
    }

    close(): void {
        this.isOpen = false;
    }

    confirm(): void {
        if (this.reason.invalid) {
            this.reason.markAsTouched();
            return;
        }
        this._http.post<any>(`${environment.apiUrl}/tickets/cancel`, {
            ticket_id: this.ticketId,
            reason: this.reason.value,
        }).subscribe({
            next: () => {
                this._toastr.success('Ticket cancelado correctamente');
                this.isOpen = false;
                this.onCancelled?.();
            },
            error: (err) => this._toastr.error(err?.error?.message || 'Error al cancelar ticket'),
        });
    }
}
