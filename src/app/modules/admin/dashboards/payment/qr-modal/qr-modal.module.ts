import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QrModalComponent} from "./qr-modal.component";
import {DialogModule} from "primeng/dialog";
import {MatButtonModule} from "@angular/material/button";
import {ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";


@NgModule({
    declarations: [QrModalComponent],
    exports: [QrModalComponent],
    imports: [
        CommonModule,
        DialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatInputModule
    ]
})
export class QrModalModule {
}
