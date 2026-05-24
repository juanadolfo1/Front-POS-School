import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionsService } from './permissions.service';

@Directive({ selector: '[hasOperation]' })
export class HasOperationDirective implements OnInit {
    @Input() hasOperation: string; // format: "modulePath:operationName"

    private _isVisible = false;

    constructor(
        private _templateRef: TemplateRef<any>,
        private _viewContainer: ViewContainerRef,
        private _permissions: PermissionsService
    ) {}

    ngOnInit(): void {
        const [modulePath, operation] = this.hasOperation.split(':');
        if (this._permissions.hasOperation(modulePath, operation)) {
            if (!this._isVisible) {
                this._viewContainer.createEmbeddedView(this._templateRef);
                this._isVisible = true;
            }
        } else {
            this._viewContainer.clear();
            this._isVisible = false;
        }
    }
}
