import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentComponent } from './student.component';
import { RouterModule } from '@angular/router';
import { studentRoutes } from './student.routing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { StudentModalModule } from './student-modal/student-modal.module';
import { DeleteModalModule } from '../../ui/delete-modal/delete-modal.module';
import {QrModalModule} from "./qr-modal/qr-modal.module";
@NgModule({
    declarations: [StudentComponent],
    imports: [
        RouterModule.forChild(studentRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        SpinnerModule,
        StudentModalModule,
        DeleteModalModule,
        QrModalModule
    ],
})
export class StudentModule {}
