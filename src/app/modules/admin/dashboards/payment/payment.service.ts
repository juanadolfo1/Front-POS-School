import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiResponse} from 'app/core/types/api-response';
import {Payment, PaymentToSave} from 'app/core/types/payment';
import {environment} from 'environments/environment';
import {BehaviorSubject, from, map, Observable} from 'rxjs';
import {PaymentMethod} from "../../../../core/types/payment-method";
import {Student} from "../../../../core/types/student.class";
import {Scholarship} from "../../../../core/types/scholarship";

@Injectable({
    providedIn: 'root',
})
export class PaymentService {
    private apiUrl = environment.apiUrl + '/payments';
    private documentsUrl = environment.apiUrl + '/documents';

    private _isOpenPaymentModal = new BehaviorSubject<boolean>(false);
    private _isOpenQrModal = new BehaviorSubject<boolean>(false);
    private _isOpenServicesPaymentsModal = new BehaviorSubject<boolean>(false);
    private _isOpenTicketModal = new BehaviorSubject<boolean>(false);
    private _isOpenDateSelectorModal = new BehaviorSubject<boolean>(false);
    private _paymentList = new BehaviorSubject<Payment[]>([]);
    private _currentPayment = new BehaviorSubject<Payment>(null);
    private _isUpToDate = new BehaviorSubject<boolean>(null);
    private _studentId = new BehaviorSubject<number>(null);
    private _paymentMethods = new BehaviorSubject<PaymentMethod[]>([]);
    private _currentStudent = new BehaviorSubject<Student>(null);
    private _currentScholarShip = new BehaviorSubject<Scholarship>(null);
    private _currentScholarYear = new BehaviorSubject<number>(null);
    private _currentTicket = new BehaviorSubject<string>(null);
    private _currentCheckoutClose = new BehaviorSubject<string>(null);

    constructor(private _http: HttpClient) {
    }

    get isOpenPaymentModal$(): Observable<boolean> {
        return this._isOpenPaymentModal.asObservable();
    }

    get isOpenQrModal$(): Observable<boolean> {
        return this._isOpenQrModal.asObservable();
    }

    get isOpenServicesModal$(): Observable<boolean> {
        return this._isOpenServicesPaymentsModal.asObservable();
    }

    get isOpenTicketModal$(): Observable<boolean> {
        return this._isOpenTicketModal.asObservable();
    }

    get isOpenDateSelectorModal$(): Observable<boolean> {
        return this._isOpenDateSelectorModal.asObservable();
    }

    get currentPayment$(): Observable<Payment> {
        return this._currentPayment.asObservable();
    }

    set currentPayment$(value: Payment) {
        this._currentPayment.next(value);
    }

    get pendingPayments$(): Observable<Payment[]> {
        return this._paymentList.asObservable();
    }

    get isUpToDate$(): Observable<boolean> {
        return this._isUpToDate.asObservable();
    }

    get studentId$(): Observable<number> {
        return this._studentId.asObservable();
    }

    get paymentMethods$(): Observable<PaymentMethod[]> {
        return this._paymentMethods.asObservable();
    }

    set paymentMethods(value: PaymentMethod[]) {
        this._paymentMethods.next(value);
    }

    get currentStudent$(): Observable<Student> {
        return this._currentStudent.asObservable();
    }

    set currentStudent(value: Student) {
        this._currentStudent.next(value);
    }

    get currentScholarship$(): Observable<Scholarship> {
        return this._currentScholarShip.asObservable();
    }

    get currentScholarYear(): Observable<number> {
        return this._currentScholarYear.asObservable();
    }

    get currentTicket(): Observable<string> {
        return this._currentTicket.asObservable();
    }

    get currentCheckoutClose(): Observable<string> {
        return this._currentCheckoutClose.asObservable();
    }

    public getPaymentsByStudentId(
        studentId: number,
        yearId: number,
        academicLevelId: number
    ): Observable<
        ApiResponse<{
            is_up_to_date: boolean;
            payments: Payment[];
            paymentMethods: PaymentMethod[],
            scholarship: Scholarship
        }>
    > {
        return this._http.post<
            ApiResponse<{
                is_up_to_date: boolean;
                payments: Payment[];
                paymentMethods: PaymentMethod[],
                scholarship: Scholarship
            }>
        >(`${this.apiUrl}/pending-payments`, {
            student_id: studentId,
            year_id: yearId,
            academic_level_id: academicLevelId,
        });
    }

    public getServicesPayments(
        yearId: number,
        academicLevelId: number
    ): Observable<ApiResponse<{ payments: Payment[], paymentMethods: PaymentMethod[] }>> {
        return this._http.post<ApiResponse<{ payments: Payment[], paymentMethods: PaymentMethod[] }>>(
            `${this.apiUrl}/service-payments`, {
                year_id: yearId,
                academic_level_id: academicLevelId,
            }
        );
    }

    public openPaymentModal(
        payments: Payment[],
        paymentMethods: PaymentMethod[],
        scholarship: Scholarship,
        isUpToDate: boolean,
        studentId: number,
        scholarYearId: number,
    ) {
        this._isOpenPaymentModal.next(true);
        this._paymentList.next(payments);
        this._paymentMethods.next(paymentMethods);
        this._currentScholarShip.next(scholarship);
        this._isUpToDate.next(isUpToDate);
        this._studentId.next(studentId);
        this._currentScholarYear.next(scholarYearId);
    }

    public openServicesPaymentsModal(
        payments: Payment[],
        paymentMethods: PaymentMethod[],
        studentGroupId: number,
        scholarYearId: number
    ) {
        this._isOpenServicesPaymentsModal.next(true);
        this._paymentList.next(payments);
        this._paymentMethods.next(paymentMethods);
        this._studentId.next(studentGroupId);
        this._currentScholarYear.next(scholarYearId);
    }

    public openQrModal() {
        this._isOpenQrModal.next(true);
    }

    public openTicketModal(folio: string) {
        this._isOpenTicketModal.next(true);
        this._currentTicket.next(folio);
    }

    public openCheckoutCloseModal(date: string) {
        this._isOpenTicketModal.next(true);
        this._currentCheckoutClose.next(date);
    }

    public openDateSelectorModal() {
        this._isOpenDateSelectorModal.next(true);
    }

    public closePaymentModal() {
        this._isOpenPaymentModal.next(false);
        this._isOpenQrModal.next(false);
        this._isOpenTicketModal.next(false);
        this._paymentList.next([]);
        this._isUpToDate.next(null);
        this._studentId.next(null);
        this._paymentMethods.next([]);
    }

    public closeServicesModal() {
        this._isOpenServicesPaymentsModal.next(false);
        this._paymentList.next([]);
        this._studentId.next(null);
        this._paymentMethods.next([]);
    }

    public closeQrModal() {
        this._isOpenQrModal.next(false);
    }

    public closeTicketModal() {
        this._isOpenTicketModal.next(false);
        this._isOpenDateSelectorModal.next(false);
        this._currentTicket.next(null);
    }

    public closeCheckoutCloseModal() {
        this._isOpenDateSelectorModal.next(false);
        this._isOpenTicketModal.next(false);
        this._currentCheckoutClose.next(null);
    }

    public savePayment(
        payment
    ): Observable<ApiResponse> {
        return this._http.post<ApiResponse>(
            `${this.apiUrl}`,
            payment
        );
    }

    public getTicket(folio: string) {
        return from(fetch(`${environment.apiUrl}/documents/get-ticket/${folio}`, {
            method: 'GET',
            mode: 'no-cors',
        })).pipe(
            map((response: Response) => {
                return response.blob();
            }),
        );
    }

    public getPendingPaymentReport() {
        return this._http.get(`${this.documentsUrl}/get-pending-payments-report`, {
            params: {
                'return-file': 1
            },
            responseType: 'blob',
        })
    }
}
