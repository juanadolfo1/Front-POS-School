import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CancelTicketModalComponent } from './cancel-ticket-modal.component';

@NgModule({
    declarations: [CancelTicketModalComponent],
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule],
    exports: [CancelTicketModalComponent],
})
export class CancelTicketModalModule {}
