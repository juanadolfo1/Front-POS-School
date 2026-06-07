import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { HomeComponent } from './home.component';
import { homeRoutes } from './home.routing';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(homeRoutes),
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
        SpinnerModule,
    ],
})
export class HomeModule {}
