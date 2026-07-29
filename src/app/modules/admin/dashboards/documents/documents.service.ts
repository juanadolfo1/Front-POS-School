import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentsService {
    private apiUrl = environment.apiUrl;

    constructor(private _http: HttpClient) {}

    getTicketPdf(folio: string): Observable<Blob> {
        return this._http.get(`${this.apiUrl}/documents/get-ticket/${folio}`, {
            responseType: 'blob',
        });
    }

    getCheckoutClosePdf(date: string): Observable<Blob> {
        return this._http.get(`${this.apiUrl}/documents/close-ticket/${date}`, {
            responseType: 'blob',
        });
    }

    getPendingPaymentReport(): Observable<Blob> {
        return this._http.get(`${this.apiUrl}/documents/get-pending-payments-report`, {
            params: { 'return-file': 1 },
            responseType: 'blob',
        });
    }
}
