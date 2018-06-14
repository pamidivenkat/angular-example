import { BaseElement } from '../common/base-element';
import { BaseComponent } from '../../shared/base-component';
import { Component, Input, OnInit, TemplateRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'ae-list-item',
    templateUrl: './ae-list-item.component.html',
    styleUrls: ['./ae-list-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeListItemComponent<T> extends BaseElement implements OnInit {

    private _template: TemplateRef<T>
    private _item: T;

    @Input('template')
    get template() {
        return this._template;
    }
    set template(val: TemplateRef<T>) {
        this._template = val;
    }

    @Input('item')
    get item() {
        return this._item;
    }
    set item(val: T) {
        this._item = val;
    }

    // Constructor
    constructor() {
        super()
    }
    // End of Constructor

    ngOnInit() {
    }

}
