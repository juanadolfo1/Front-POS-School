import { Injectable } from '@angular/core';
import { StudentService } from '../../student/student.service';

@Injectable({
  providedIn: 'root'
})
export class QrModalService {

  constructor(
    private studentService: StudentService
  ) { }

}
