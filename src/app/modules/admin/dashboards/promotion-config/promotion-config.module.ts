import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { PromotionConfigComponent } from './promotion-config.component';
import { promotionConfigRoutes } from './promotion-config.routing';

@NgModule({
    declarations: [PromotionConfigComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(promotionConfigRoutes),
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        SpinnerModule,
    ],
})
export class PromotionConfigModule {}
