import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { Navigation } from 'app/core/navigation/navigation.types';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    private apiUrl = environment.apiUrl;

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    set navigation(values: Array<any>) {
        const home: FuseNavigationItem = {
            id: 'home',
            title: 'Inicio',
            type: 'basic',
            icon: 'heroicons_outline:home',
            link: '/dashboards/home',
        };
        const children: FuseNavigationItem[] = values.map((item) => {
            return {
                id: item.id,
                title: item.module_name,
                type: 'basic',
                icon: item.icon,
                link: item.path,
            };
        });

        const newNavigation: FuseNavigationItem[] = [
            {
                id: 'dashboards',
                title: 'Dashboards',
                type: 'group',
                children: [home, ...children],
            },
        ];

        this._navigation.next({
            default: newNavigation,
            compact: newNavigation,
            futuristic: newNavigation,
            horizontal: newNavigation,
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._httpClient
            .get<any>(`${this.apiUrl}/auth/get-modules`)
            .pipe(
                tap((navigation) => {
                    this.navigation = navigation.data;
                })
            );
    }
}
