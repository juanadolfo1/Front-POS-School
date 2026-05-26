import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { ScholarshipsComponent } from './scholarships.component';
import { scholarshipsRoutes } from './scholarships.routing';

@NgModule({
    declarations: [ScholarshipsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(scholarshipsRoutes),
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        SpinnerModule,
    ],
})
export class ScholarshipsModule {}
