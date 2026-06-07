import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { DocumentsService } from './documents.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'environments/environment';

interface CancelledTicket {
    folio: string;
    student_name: string;
    amount: number;
    reason: string;
    cancelled_at: string;
}

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrl: './documents.component.scss',
})
export class DocumentsComponent {
    folio = new FormControl<string>('');
    selectedDate = new FormControl<string>(new Date().toISOString().slice(0, 10));
    ticketUrl: SafeResourceUrl;
    showPreview = false;

    // Cancelled tickets
    startDate = new FormControl<string>('');
    endDate = new FormControl<string>('');
    cancelledTickets: CancelledTicket[] = [];
    showCancelled = false;

    constructor(
        private _documentsService: DocumentsService,
        private _toastr: ToastrService,
        private _sanitizer: DomSanitizer,
        private _http: HttpClient
    ) {}

    searchTicket(): void {
        if (!this.folio.value?.trim()) {
            this._toastr.warning('Ingresa un folio');
            return;
        }
        this.ticketUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
            this._documentsService.getTicketUrl(this.folio.value)
        );
        this.showPreview = true;
    }

    generateCheckoutClose(): void {
        this.ticketUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
            this._documentsService.getCheckoutCloseUrl(this.selectedDate.value)
        );
        this.showPreview = true;
    }

    downloadPendingReport(): void {
        this._documentsService.getPendingPaymentReport().subscribe({
            next: (blob) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `reporte-pagos-pendientes-${new Date().toLocaleDateString('es-MX')}.csv`;
                a.click();
                this._toastr.success('Reporte descargado');
            },
            error: () => this._toastr.error('Error al generar reporte'),
        });
    }

    loadCancelledTickets(): void {
        if (!this.startDate.value || !this.endDate.value) {
            this._toastr.warning('Selecciona rango de fechas');
            return;
        }
        this._http.get<any>(`${environment.apiUrl}/tickets/cancelled`, {
            params: { start_date: this.startDate.value, end_date: this.endDate.value },
        }).subscribe({
            next: ({ data }) => {
                this.cancelledTickets = Array.isArray(data) ? data : [];
                this.showCancelled = true;
            },
            error: () => this._toastr.error('Error al cargar tickets cancelados'),
        });
    }
}
