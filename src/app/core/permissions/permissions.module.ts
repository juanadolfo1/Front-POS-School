import { NgModule } from '@angular/core';
import { HasOperationDirective } from './has-operation.directive';

@NgModule({
    declarations: [HasOperationDirective],
    exports: [HasOperationDirective],
})
export class PermissionsModule {}
