import { isNullOrUndefined } from 'util';
import { AeElementDirectiveModel } from '../common/models/ae-element-directive-model';
import { Directive, ElementRef, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[aeElement]'
})
export class AeElementDirective {

  private _context: any;

  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
    if (!isNullOrUndefined(this._context) && !isNullOrUndefined(this._context.property) && !isNullOrUndefined(this._context.propertyValue)) {
      this._context.propertyValue.subscribe(val => {
        this._updateElement(val);
      });
    }
    else {
      this._viewContainer.createEmbeddedView(this._templateRef, { "item": this._context });
    }

  }

  constructor(private _templateRef: TemplateRef<any>
    , private _viewContainer: ViewContainerRef
    , private _elementRef: ElementRef) {

  }

  private _updateElement(val: any) {
    switch (this._context.property) {
      case 'visibility':
        this._toggleVisibility(<boolean>val);
        break;
    }
  }

  private _toggleVisibility(visible: boolean) {
    if (visible) {
      this._viewContainer.clear();
      this._viewContainer.createEmbeddedView(this._templateRef, { "item": this._context });
    } else {
      this._viewContainer.clear();
    }
  }

}

