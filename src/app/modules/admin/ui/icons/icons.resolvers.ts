import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { IconsService } from 'app/modules/admin/ui/icons/icons.service';

@Injectable({
    providedIn: 'root'
})
export class IconsResolver 
{
    /**
     * Constructor
     */
    constructor(private _iconsService: IconsService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolve
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        return this._iconsService.getIcons(state.url);
    }
}
