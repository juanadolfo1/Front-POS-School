import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DocumentsService } from './documents.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

    constructor(
        private _documentsService: DocumentsService,
        private _toastr: ToastrService,
        private _sanitizer: DomSanitizer
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
}
