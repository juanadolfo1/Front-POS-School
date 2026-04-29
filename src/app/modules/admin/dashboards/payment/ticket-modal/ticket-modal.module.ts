import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TicketModalComponent} from "./ticket-modal.component";
import {DialogModule} from "primeng/dialog";
import {MatButtonModule} from "@angular/material/button";



@NgModule({
    declarations: [TicketModalComponent],
    exports: [
        TicketModalComponent
    ],
    imports: [
        CommonModule,
        DialogModule
    ]
})
export class TicketModalModule { }
