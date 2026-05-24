import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DailyIncomeComponent } from './daily-income.component';
import { dailyIncomeRoutes } from './daily-income.routing';

@NgModule({
    declarations: [DailyIncomeComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(dailyIncomeRoutes),
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NgApexchartsModule,
    ],
})
export class DailyIncomeModule {}
