import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Student } from '../../../../core/types/student.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse } from 'app/core/types/api-response';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class StudentService {
    private _isOpenStudentModal = new BehaviorSubject<boolean>(false);
    private _isOpenQrModal = new BehaviorSubject<boolean>(false);
    private _currentStudent = new BehaviorSubject<Student>(null);
    private _currentQrCodeUuid = new BehaviorSubject<string>(null);

    constructor(private _http: HttpClient) {}

    get isOpenStudentModal$(): Observable<boolean> {
        return this._isOpenStudentModal.asObservable();
    }

    set isOpenStudentModal(value: boolean) {
        this._isOpenStudentModal.next(value);
    }

    get isOpenQrModal(): Observable<boolean>
    {
        return this._isOpenQrModal.asObservable();
    }

    get currentStudent$(): Observable<Student> {
        return this._currentStudent.asObservable();
    }

    set currentStudent(value: Student) {
        this._currentStudent.next(value);
    }

    get currentQrCodeUuid(): Observable<string>
    {
        return this._currentQrCodeUuid.asObservable();
    }

    private apiUrl = environment.apiUrl;

    public getAllStudents(
        limit: number,
        page: number,
        search = ''
    ): Observable<ApiResponse<Student[]>> {
        return this._http.get<ApiResponse<Student[]>>(
            `${this.apiUrl}/student`,
            {
                params: {
                    limit,
                    page,
                    search,
                },
            }
        );
    }

    public saveStudent(student: Student): Observable<ApiResponse<Student>> {
        if (this._currentStudent.value) {
            return this._http.put<ApiResponse<Student>>(
                `${this.apiUrl}/student`,
                student
            );
        }

        return this._http.post<ApiResponse<Student>>(
            `${this.apiUrl}/student`,
            student
        );
    }

    public deleteStudent(): Observable<ApiResponse<Student>> {
        const id = this._currentStudent.value.id;
        return this._http.delete<ApiResponse<Student>>(
            `${this.apiUrl}/student/${id}`
        );
    }

    public getStudentsByGroup(
        groupId: number
    ): Observable<ApiResponse<Student[]>> {
        return this._http.get<ApiResponse<Student[]>>(
            `${this.apiUrl}/student/by-group/${groupId}`
        );
    }

    public getStudentByUuid(
        uuid: string
    ): Observable<ApiResponse<Student>> {
        return this._http.get<ApiResponse<Student>>(
            `${this.apiUrl}/student/${uuid}`
        );
    }

    public getQrCode(uuid: string){
        this._currentQrCodeUuid.next(uuid);
        this._isOpenQrModal.next(true);
    }
}
