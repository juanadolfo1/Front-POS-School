import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { tap, catchError } from 'rxjs';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BrandingService {
    private apiUrl = environment.apiUrl;

    constructor(private _http: HttpClient) {}

    load(): void {
        this._http.get<any>(`${this.apiUrl}/branding`).pipe(
            tap((response) => {
                const data = response.data;
                if (data?.school_name) {
                    document.title = data.school_name;
                }
                if (data?.favicon_url) {
                    this.setFavicon(data.favicon_url);
                }
            }),
            catchError(() => of(null))
        ).subscribe();
    }

    private setFavicon(url: string): void {
        let link: HTMLLinkElement = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = url;
    }
}
