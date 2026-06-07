import { Component } from '@angular/core';
import { BrandingService } from 'app/core/branding/branding.service';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    constructor(private _branding: BrandingService)
    {
        this._branding.load();
    }
}
