import { Component } from '@angular/core';
import { BrandingService } from 'app/core/branding/branding.service';
import { ScholarYearService } from 'app/core/scholar-year/scholar-year.service';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    constructor(
        private _branding: BrandingService,
        private _scholarYear: ScholarYearService
    )
    {
        this._branding.load();
        this._scholarYear.load().subscribe();
    }
}
