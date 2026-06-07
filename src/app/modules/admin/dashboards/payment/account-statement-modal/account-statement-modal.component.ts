import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

interface ConceptPayment {
    amount: number;
    date: string;
    folio: string;
    applied_discount: boolean;
}

interface AccountConcept {
    concept_id: number;
    label: string;
    amount: number;
    discount_amount: number;
    paid_amount: number;
    balance: number;
    status: 'paid' | 'partial' | 'pending';
    payments: ConceptPayment[];
}

interface AccountStatement {
    student: { id: number; curp: string; name: string };
    group: string;
    concepts: AccountConcept[];
    totals: { total_due: number; total_paid: number; balance: number };
}

@Component({
    selector: 'account-statement-modal',
    templateUrl: './account-statement-modal.component.html',
})
export class AccountStatementModalComponent implements OnInit {
    isOpen = false;
    statement: AccountStatement | null = null;
    isLoading = false;
    expandedRows: Set<number> = new Set();

    private _studentId: number;
    private _scholarYearId: number;

    constructor(private _http: HttpClient) {}

    ngOnInit(): void {}

    open(studentId: number, scholarYearId: number): void {
        this._studentId = studentId;
        this._scholarYearId = scholarYearId;
        this.isOpen = true;
        this.load();
    }

    close(): void {
        this.isOpen = false;
        this.statement = null;
        this.expandedRows.clear();
    }

    toggleRow(conceptId: number): void {
        if (this.expandedRows.has(conceptId)) {
            this.expandedRows.delete(conceptId);
        } else {
            this.expandedRows.add(conceptId);
        }
    }

    private load(): void {
        this.isLoading = true;
        this._http.get<any>(`${environment.apiUrl}/dashboard/account-statement`, {
            params: { student_id: this._studentId, scholar_year_id: this._scholarYearId },
        }).subscribe({
            next: ({ data }) => {
                this.statement = data;
                this.isLoading = false;
            },
            error: () => (this.isLoading = false),
        });
    }
}
