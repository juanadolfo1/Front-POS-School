import { Component } from '@angular/core';
import {StudentService} from "../student.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: 'qr-modal',
  templateUrl: './qr-modal.component.html',
  styleUrl: './qr-modal.component.scss'
})
export class QrModalComponent {

    public title = 'Código QR';
    public isOpenModal = false;

    public qrUrl: SafeResourceUrl;

    constructor(private _studentService: StudentService, private _sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        this._studentService.currentQrCodeUuid.subscribe(uuid => {
            this.qrUrl = this._sanitizer.bypassSecurityTrustResourceUrl(environment.apiUrl + '/qr?content=' + uuid);
        })
        this._studentService.isOpenQrModal.subscribe(isOpen => {
            this.isOpenModal = isOpen;
        })
    }

    getQrCode(uuid: string){
        this._studentService.getQrCode(uuid);
    }

}
