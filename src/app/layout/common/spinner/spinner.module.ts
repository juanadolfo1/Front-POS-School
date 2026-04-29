import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './spinner.component';

@NgModule({
    imports: [CommonModule, SpinnerComponent],
    exports: [SpinnerComponent],
})
export class SpinnerModule {}
