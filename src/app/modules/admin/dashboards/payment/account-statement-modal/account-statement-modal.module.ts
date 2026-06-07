import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { AccountStatementModalComponent } from './account-statement-modal.component';

@NgModule({
    declarations: [AccountStatementModalComponent],
    imports: [CommonModule, MatButtonModule, MatIconModule, SpinnerModule],
    exports: [AccountStatementModalComponent],
})
export class AccountStatementModalModule {}
