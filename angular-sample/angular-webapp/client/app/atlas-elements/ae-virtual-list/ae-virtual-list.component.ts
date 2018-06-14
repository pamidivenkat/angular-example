import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core';
import * as Immutable from 'immutable';
import { BehaviorSubject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AtlasError } from '../../shared/error-handling/atlas-error';
import { AeTemplateComponent } from '../ae-template/ae-template.component';
import { BaseElement } from '../common/base-element';
import { AeChangeEvent } from '../common/models/ae-change-event';

@Component({
    selector: 'ae-virtual-list',
    templateUrl: './ae-virtual-list.component.html',
    styleUrls: ['./ae-virtual-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AeVirtualListComponent<T> extends BaseElement implements OnInit, AfterContentInit, OnDestroy {
    // Private Fields
    private _items: BehaviorSubject<Immutable.List<T>>;
    private _replace: boolean;
    private _buffer: T[] = [];
    private _numberVisibleItems: number;
    private _defaultItems: Immutable.List<T>;
    private _contentLoaded: boolean;
    // End of Private Fields

    // Getters
    get buffer() {
        return this._buffer;
    }

    get defaultItems() {
        return this._defaultItems;
    }

    get contentLoaded() {
        return this._contentLoaded;
    }
    // End of Getters

    // Public properties
    @Input('noOfVisibleItems')
    get numberOfVisibleItems() {
        return this._numberVisibleItems;
    }
    set numberOfVisibleItems(val: number) {
        this._numberVisibleItems = val;
    }

    @Input("replace")
    get replace() {
        return this._replace;
    }
    set replace(val: boolean) {
        this._replace = val;
    }

    @Input('itemsStream')
    set itemsStream(val: BehaviorSubject<Immutable.List<T>>) {
        if (isNullOrUndefined(this._items)) {
            this._items = val;
        } else {
            throw new AtlasError("Should not over ride items stream");
        }
    }
    get itemsStream() {
        return this._items;
    }

    // End of Public properties

    // Public Output bindings
    @Output('change')
    change: EventEmitter<AeChangeEvent> = new EventEmitter<AeChangeEvent>();
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    @ContentChild(AeTemplateComponent)
    template: AeTemplateComponent<T>;
    // End of Public ViewContent bindings

    // Constructor
    constructor(private _cdr: ChangeDetectorRef) {
        super();
        this._contentLoaded = false;
        this._replace = false;
    }
    // End of constructor

    // Private methods

    private _createDefaultItems(count: number): void {
        let defaultItemsArray = new Array<T>();
        for (let i = 0; i < count; i++) {
            defaultItemsArray.push(Object.assign({}, this.template.contextObject));
        }
        this._defaultItems = Immutable.List(defaultItemsArray);
    }

    private _updateItemsData(nextDataSet: Immutable.List<T>) {
        for (let i = 0; i < this._defaultItems.count(); i++) {
            let item = this._defaultItems.get(i);
            for (let key in item) {
                item[key] = null;
            }
        }
        for (let i = 0; i < nextDataSet.count(); i++) {
            let item = nextDataSet.get(i);
            let defaultItem = this._defaultItems.get(i);
            for (let key in defaultItem) {
                defaultItem[key] = item[key];
            }
        }
    }
    // End of private methods

    // Public methods
    getTemplate(): TemplateRef<T> {
        return this.template.template;
    }

    onUpdate(nextDataSet: T[]) {
        this._defaultItems = Immutable.List<T>(nextDataSet);
        this._contentLoaded = true;
        this._cdr.markForCheck();
    }

    onChange(event) {
        if (event.end === this._buffer.length) {
            this._contentLoaded = false;
            this.change.emit(event);
        }
    }

    ngOnInit(): void {

    }

    ngAfterContentInit(): void {
        this._items.takeUntil(this._destructor$).subscribe((nextDataSet) => {
            if (this._replace) {
                this._buffer = [];
            }
            if (!isNullOrUndefined(nextDataSet)) {
                this._buffer = this._buffer.concat(nextDataSet.toArray());
                this._cdr.markForCheck();
            }
        });
        this._contentLoaded = true;
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
    // End of public methods

}
