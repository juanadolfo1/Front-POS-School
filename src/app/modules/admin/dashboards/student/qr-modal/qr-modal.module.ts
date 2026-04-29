import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {QrModalComponent} from "./qr-modal.component";
import {DialogModule} from "primeng/dialog";



@NgModule({
  declarations: [QrModalComponent],
    exports: [QrModalComponent],
  imports: [
      CommonModule,
      DialogModule,
  ]
})
export class QrModalModule { }
