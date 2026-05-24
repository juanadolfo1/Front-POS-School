import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
    private apiUrl = environment.apiUrl;

    constructor(private _http: HttpClient) {}

    getTicketUrl(folio: string): string {
        return `${this.apiUrl}/documents/get-ticket/${folio}`;
    }

    getCheckoutCloseUrl(date: string): string {
        return `${this.apiUrl}/documents/close-ticket/${date}`;
    }

    getPendingPaymentReport(): Observable<Blob> {
        return this._http.get(`${this.apiUrl}/documents/get-pending-payments-report`, {
            params: { 'return-file': 1 },
            responseType: 'blob',
        });
    }
}
