import { NgModule } from '@angular/core';
import { DeleteModalComponent } from './delete-modal.component';
import { DialogModule } from 'primeng/dialog';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [DeleteModalComponent],
  exports: [DeleteModalComponent],
  imports: [
    DialogModule,
    MatButtonModule,

  ]
})
export class DeleteModalModule { }
