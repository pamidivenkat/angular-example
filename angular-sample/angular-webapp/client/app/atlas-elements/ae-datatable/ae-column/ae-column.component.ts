import { AeTemplateComponent } from '../../ae-template/ae-template.component';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    Input,
    OnInit,
    QueryList
} from '@angular/core';

@Component({
    selector: 'ae-column',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeColumnComponent<T> implements OnInit, AfterContentInit {

    // Private Fields
    private _headerTempalate: AeTemplateComponent<T>;
    private _cellTempalate: AeTemplateComponent<T>;
    private _editTemplate: AeTemplateComponent<T>;
    private _headerText: string;
    private _sortable: boolean = true;
    private _sortKey: string;
    private _isMobileView: boolean = false;
    // End of Private Fields

    // Public properties
    @Input('headerText')
    get headerText() {
        return this._headerText;
    }
    set headerText(val: string) {
        this._headerText = val;
    }

    @Input('sortable')
    get sortable() {
        return this._sortable;
    }
    set sortable(val: boolean) {
        this._sortable = val;
    }

    @Input('sortKey')
    get sortKey() {
        return this._sortKey;
    }
    set sortKey(val: string) {
        this._sortKey = val;
    }

    @Input('isMobileView')
    get isMobileView() {
        return this._isMobileView;
    }
    set isMobileView(val: boolean) {
        this._isMobileView = val;
    }
    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ContnetChild bindings
    @ContentChildren(AeTemplateComponent)
    tempales: QueryList<AeTemplateComponent<T>>;
    // End of Public ContnetChild bindings

    // Constructor
    constructor() { }
    // End of constructor

    // Private methods
    // End of private methods

    // Public methods
    public getHeaderTemplate() {
        return this._headerTempalate;
    }

    public getCellTemplate() {
        return this._cellTempalate;
    }
    public getEditTemplate() {
        return this._editTemplate;
    }

    public ngOnInit(): void {
    }

    public ngAfterContentInit(): void {
        this._headerTempalate = this.tempales.find((template) => template.type === 'header');
        this._cellTempalate = this.tempales.find((template) => template.type === 'cell');
        this._editTemplate = this.tempales.find((template) => template.type === 'edit');
    }

    // End of public methods

}
