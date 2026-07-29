import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { PermissionsModule } from 'app/core/permissions/permissions.module';
import { TutorsComponent } from './tutors.component';
import { TutorModalComponent } from './tutor-modal/tutor-modal.component';
import { tutorsRoutes } from './tutors.routing';

@NgModule({
    declarations: [TutorsComponent, TutorModalComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(tutorsRoutes),
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatRippleModule,
        TableModule,
        DialogModule,
        NgSelectModule,
        SpinnerModule,
        PermissionsModule,
    ],
})
export class TutorsModule {}
