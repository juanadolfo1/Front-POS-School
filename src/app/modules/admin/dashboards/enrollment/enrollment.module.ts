import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { EnrollmentComponent } from './enrollment.component';
import { enrollmentRoutes } from './enrollment.routing';

@NgModule({
    declarations: [EnrollmentComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(enrollmentRoutes),
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSlideToggleModule,
        SpinnerModule,
    ],
})
export class EnrollmentModule {}
