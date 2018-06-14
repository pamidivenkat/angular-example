import { AtlasError } from '../../../shared/error-handling/atlas-error';
import { isNullOrUndefined } from 'util';
import { AeTemplateComponent } from '../../ae-template/ae-template.component';
import { BaseElement } from '../../common/base-element';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Input,
    OnInit,
    QueryList,
    EventEmitter,
    Output
} from '@angular/core';

@Component({
    selector: 'ae-tabstrip-item',
    template: ``
    , changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeTabStripItemComponent extends BaseElement implements OnInit, AfterContentInit {

    // Private Fields
    private _header: string;
    private _headerIcon: string;
    private _navigateUrl: string;
    private _headerTemplate: AeTemplateComponent<any>;
    private _hasCount: boolean;
    private _count: number;
    private _title: string;
    // End of Private Fields

    // Public properties


    get headerTemplate() {
        return this._headerTemplate;
    }
    set headerTemplate(val: AeTemplateComponent<any>) {
        this._headerTemplate = val;
    }

    @Input('header')
    get header() {
        return this._header;
    }
    set header(val: string) {
        this._header = val;
    }

    @Input('headerIcon')
    get headerIcon() {
        return this._headerIcon;
    }
    set headerIcon(val: string) {
        this._headerIcon = val;
    }
    @Input('navigateUrl')
    get NavigateUrl() {
        return this._navigateUrl;
    }
    set NavigateUrl(val: string) {
        this._navigateUrl = val;
    }

    @Input('title')
    get Title(): string {
        return this._title;
    }
    set Title(val: string) {
        this._title = val;
    }

    @Input('count')
    get Count(): number {
        return this._count;
    }
    set Count(val: number) {
        let isChanged: boolean = false;
        if (this._count != val)
            isChanged = true;
        this._count = val;
        if (isChanged)
            this.onTabStripCountChange.emit(isChanged);
    }

    @Input('hasCount')
    get HasCount(): boolean {
        return this._hasCount;
    }
    set HasCount(val: boolean) {
        this._hasCount = val;
    }

    // End of Public properties

    // Public Output bindings
    @Output('aeTabStripCountChanged')
    onTabStripCountChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    // End of Public Output bindings

    // Public ViewChild bindings
    @ContentChildren(AeTemplateComponent)
    templates: QueryList<AeTemplateComponent<any>>;
    // End of Public ViewChild bindings

    // Public ViewContent bindings

    // End of Public ViewContent bindings

    // Constructor

    constructor(private _cdr: ChangeDetectorRef) {
        super();
    }
    // End of constructor

    // Private methods
    private _setTempaltes(val: AeTemplateComponent<any>): void {
        if (val.type === 'header') {
            this._headerTemplate = val;
        }
    }
    // End of private methods

    // Public methods
    ngOnInit(): void {
        super.ngOnInit();
    }
    ngAfterContentInit(): void {
        this.templates.map((t) => {
            this._setTempaltes(t);
        });
    }
    // End of public methods

}
