import { Injectable, Injector, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, fromEvent, merge, timer, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class IdleTimeoutService implements OnDestroy {
    private _timeoutMinutes = 30;
    private _warningSeconds = 60;
    private _idle$: Subscription;
    private _warning$: Subscription;
    private _isIdle = false;
    private _destroy$ = new Subject<void>();

    constructor(
        private _injector: Injector,
        private _router: Router,
        private _toastr: ToastrService,
        private _ngZone: NgZone
    ) {}

    start(): void {
        this.stop();

        this._ngZone.runOutsideAngular(() => {
            const activity$ = merge(
                fromEvent(document, 'mousemove'),
                fromEvent(document, 'keydown'),
                fromEvent(document, 'click'),
                fromEvent(document, 'touchstart')
            );

            this._idle$ = activity$.pipe(
                switchMap(() => {
                    this._isIdle = false;
                    const warningTime = (this._timeoutMinutes * 60 - this._warningSeconds) * 1000;
                    return timer(warningTime);
                }),
                tap(() => {
                    this._ngZone.run(() => {
                        this._isIdle = true;
                        this._toastr.warning(
                            `Tu sesión se cerrará en ${this._warningSeconds} segundos por inactividad`,
                            'Sesión por expirar',
                            { timeOut: this._warningSeconds * 1000 }
                        );
                    });
                }),
                switchMap(() => timer(this._warningSeconds * 1000))
            ).subscribe(() => {
                if (this._isIdle) {
                    this._ngZone.run(() => this.forceLogout());
                }
            });

            // Fallback timer if no activity events fire at all
            this._warning$ = timer(this._timeoutMinutes * 60 * 1000).subscribe(() => {
                this._ngZone.run(() => this.forceLogout());
            });
        });
    }

    stop(): void {
        this._idle$?.unsubscribe();
        this._warning$?.unsubscribe();
    }

    /**
     * Force logout without calling AuthService to avoid circular dependency.
     * Clears storage directly and redirects.
     */
    private forceLogout(): void {
        this.stop();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('user_modules');
        localStorage.removeItem('_sec_hash');
        this._toastr.info('Sesión cerrada por inactividad');
        this._router.navigate(['/sign-in']);
    }

    ngOnDestroy(): void {
        this.stop();
        this._destroy$.next();
        this._destroy$.complete();
    }
}
