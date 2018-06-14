import { ChangeDetectionStrategy, Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import * as Immutable from 'immutable';

@Component({
    selector: 'ae-template',
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeTemplateComponent<T> implements OnInit {

    // Private Fields
    private _type: string;
    private _keys: Immutable.List<string>;
    private _contextObject: T;
    // End of Private Fields

    // Public properties
    @Input('type')
    get type() {
        return this._type;
    }
    set type(val: string) {
        this._type = val;
    }

    /**
     * @description 
     * Input field of contextObjectProperties
     * Once assiged it will create context item object also.
     * @readonly
     * 
     * @memberOf AeTemplateComponent
     */
    @Input('keys')
    get keys() {
        return this._keys;
    }
    set keys(val: Immutable.List<string>) {
        this._keys = val;
        let contextItem = Object.create(null);
        this._keys.forEach((val, key) => {
            contextItem[val] = null;
        });
        this._contextObject = contextItem;
    }

    @Input('context')
    get context(){
        return this._contextObject;
    }
    set context(val: any){
        this._contextObject = val;
    }

    /**
     * @description contextObject
     * 
     * @readonly
     * 
     * @memberOf AeTemplateComponent
     */
    get contextObject() {
        return this._contextObject;
    }
    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    /**
     * @description 
     * <ng-template></ng-template> tag binding 
     * @type {TemplateRef<T>}
     * @memberOf AeTemplateComponent
     */
    @ContentChild(TemplateRef) template: TemplateRef<T>;
    // End of Public ViewContent bindings

    // Constructor
    constructor() { }
    // End of constructor

    // Private methods
    // End of private methods

    // Public methods
    ngOnInit(): void {
    }
    // End of public methods

}
