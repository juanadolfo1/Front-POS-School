import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CatalogService } from 'app/shared/catalog/catalog.service';
import { SchoolarYear } from 'app/core/types/schoolar-year';

@Injectable({ providedIn: 'root' })
export class ScholarYearService {
    private _activeYear$ = new BehaviorSubject<SchoolarYear | null>(null);

    readonly activeYear$ = this._activeYear$.asObservable();

    constructor(private _catalogService: CatalogService) {}

    get activeYear(): SchoolarYear | null {
        return this._activeYear$.value;
    }

    load(): Observable<any> {
        return this._catalogService.getActiveScholarYear().pipe(
            tap((res) => this._activeYear$.next(res.data ?? null))
        );
    }
}
