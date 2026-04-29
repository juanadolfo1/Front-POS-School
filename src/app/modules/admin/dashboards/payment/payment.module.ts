import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentComponent } from './payment.component';
import { RouterModule } from '@angular/router';
import { paymentRoutes } from './payment.routing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaymentModalModule } from './payment-modal/payment-modal.module';
import {QrModalModule} from "./qr-modal/qr-modal.module";
import {ServicesPaymentModalModule} from "./services-payment-modal/services-payment-modal.module";
import {TicketModalModule} from "./ticket-modal/ticket-modal.module";
import {DateSelectorModalModule} from "./date-selector-modal/date-selector-modal.module";

@NgModule({
    declarations: [PaymentComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(paymentRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        SpinnerModule,
        NgSelectModule,
        PaymentModalModule,
        QrModalModule,
        ServicesPaymentModalModule,
        TicketModalModule,
        DateSelectorModalModule
    ],
})
export class PaymentModule {}
