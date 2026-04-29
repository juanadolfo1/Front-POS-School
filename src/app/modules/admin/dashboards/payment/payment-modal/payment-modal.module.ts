import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentModalComponent } from './payment-modal.component';
import { DialogModule } from 'primeng/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [PaymentModalComponent],
    exports: [PaymentModalComponent],
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        FormsModule,
        MatIconModule,
        NgSelectModule,
        MatCheckboxModule,
    ],
})
export class PaymentModalModule {}
