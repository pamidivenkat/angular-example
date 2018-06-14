import { AtlasError } from '../../../shared/error-handling/atlas-error';
import { isNullOrUndefined } from 'util';
import { AeTemplateComponent } from '../../ae-template/ae-template.component';
import { BaseElement } from '../../common/base-element';
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
    selector: 'ae-tab-item',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeTabItemComponent extends BaseElement implements OnInit, AfterContentInit {

    // Private Fields
    private _header: string;
    private _headerTitle:string;
    private _headerIcon: string;
    private _headerTemplate: AeTemplateComponent<any>;
    private _contentTemplate: AeTemplateComponent<any>;
    // End of Private Fields

    // Public properties
    get contentTemplate() {
        return this._contentTemplate;
    }

    get headerTemplate() {
        return this._headerTemplate;
    }

    @Input('header')
    get header() {
        return this._header;
    }
    set header(val: string) {
        this._header = val;
    }

    @Input('title')
    get headerTitle() {
        return this._headerTitle;
    }
    set headerTitle(val: string) {
        this._headerTitle = val;
    }

    @Input('headerIcon')
    get headerIcon() {
        return this._headerIcon;
    }
    set headerIcon(val: string) {
        this._headerIcon = val;
    }
    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    @ContentChildren(AeTemplateComponent)
    templates: QueryList<AeTemplateComponent<any>>;
    // End of Public ViewContent bindings

    // Constructor

    constructor() {
        super();
    }
    // End of constructor

    // Private methods
    private _setTempaltes(val: AeTemplateComponent<any>): void {
        if (val.type === 'header') {
            this._headerTemplate = val;
        } else {
            this._contentTemplate = val;
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

    checkHeaderTemplateDefined(isStandard:boolean):void{
        if(!isStandard && isNullOrUndefined(this._headerTemplate)){
            //throw new AtlasError("Tab Item header template is not defined");
        }else if(isStandard && !isNullOrUndefined(this._headerTemplate)){
            //throw new AtlasError("Tab Item header template is unneccessary for standard headers");
        }
    }

    checkContentTemplateDefined():void{
        if(isNullOrUndefined(this._contentTemplate)){
            //throw new AtlasError("Tab Item content template is always mandatory");
        }
    }
    // End of public methods

}
