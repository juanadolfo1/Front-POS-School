import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

interface ConceptPayment {
    amount: number;
    date: string;
    folio: string;
    applied_discount: boolean;
    is_full_payment: boolean;
    paid_amount: number;
    paid_at: string;
    folio_ticket: string;
    pay_concept_name: string;
    pay_concept_type: string;
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
export class AccountStatementModalComponent implements OnInit, OnChanges {
    @Input() studentId: number | null = null;
    @Input() scholarYearId: number | null = null;

    @Output() closed = new EventEmitter<void>();
    isOpen = false;
    statement: AccountStatement | null = null;
    isLoading = false;
    expandedRows: Set<number> = new Set();

    constructor(private _http: HttpClient) {}

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['studentId'] || changes['scholarYearId']) && this.studentId && this.scholarYearId) {
            this.isOpen = true;
            this.load();
        }
    }

    open(studentId: number, scholarYearId: number): void {
        this.studentId = studentId;
        this.scholarYearId = scholarYearId;
        this.isOpen = true;
        this.load();
    }

    close(): void {
        this.isOpen = false;
        this.statement = null;
        this.expandedRows.clear();
        this.closed.emit();
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
        this.statement = null;
        this.expandedRows.clear();
        this._http.get<any>(`${environment.apiUrl}/dashboard/account-statement`, {
            params: { student_id: this.studentId, scholar_year_id: this.scholarYearId },
        }).subscribe({
            next: ({ data }) => {
                this.statement = data;
                this.isLoading = false;
            },
            error: () => (this.isLoading = false),
        });
    }
}
