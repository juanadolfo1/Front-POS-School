import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    NgForm,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, interval, takeUntil } from 'rxjs';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthSignInComponent implements OnInit, OnDestroy {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    logoPath = environment.logo;

    // Rate limit countdown
    isRateLimited = false;
    countdownSeconds = 0;
    private _destroy$ = new Subject<void>();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            rememberMe: [''],
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    signIn(): void {
        if (this.signInForm.invalid || this.isRateLimited) return;

        this.signInForm.disable();
        this.showAlert = false;

        this._authService.signIn(this.signInForm.value).subscribe({
            next: () => {
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                this._router.navigateByUrl(redirectURL);
            },
            error: (error: HttpErrorResponse) => {
                this.signInForm.enable();

                if (error.status === 429) {
                    this._startCountdown(error);
                    return;
                }

                // Default error message
                let message = 'Correo o contraseña incorrectos';
                if (error.error?.message) {
                    message = error.error.message;
                }

                this.alert = { type: 'error', message };
                this.showAlert = true;
            },
        });
    }

    private _startCountdown(error: HttpErrorResponse): void {
        const retryAfter = error.headers?.get('Retry-After');
        const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;

        this.isRateLimited = true;
        this.countdownSeconds = seconds;

        this.alert = {
            type: 'warning',
            message: `Demasiados intentos. Intenta de nuevo en ${seconds} segundos`,
        };
        this.showAlert = true;

        interval(1000)
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                this.countdownSeconds--;
                this.alert.message = `Demasiados intentos. Intenta de nuevo en ${this.countdownSeconds} segundos`;

                if (this.countdownSeconds <= 0) {
                    this.isRateLimited = false;
                    this.showAlert = false;
                    this._destroy$.next(); // Stop interval
                }
            });
    }
}
