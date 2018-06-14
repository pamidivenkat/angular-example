import { AtlasError } from '../../shared/error-handling/atlas-error';
import { StringHelper } from '../../shared/helpers/string-helper';

import { isNullOrUndefined } from 'util';
import { Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, Validator } from '@angular/forms';
import { Subject } from 'rxjs/Rx';

export abstract class BaseElement implements OnInit, OnDestroy, Validator {

    // Private Fields
    private _id: string;
    private _name: string;
    private _tabIndex: number;
    protected _destructor$: Subject<boolean> = new Subject();
    //End of Privae Fileds


    // Public Properties
    @Input('id')
    get id() {
        return this._id;
    }
    set id(value: string) {
        this._id = value;
    }

    @Input('name')
    get name() {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }

    @Input('tabIndex')
    get tabIndex() {
        return this._tabIndex;
    }
    set tabIndex(value: number) {
        this._tabIndex = value;
    }
    //End of Pulbic Properties

    // Public Methods    
    public getChildId(elementType: string, index: number): string {
        if (!isNullOrUndefined(index)) {
            return `${this._id}_${elementType}_${index}`;
        }
        return `${this._id}_${elementType}`;
    }

    public getChildName(elementType: string, index: number): string {
        if (!isNullOrUndefined(index)) {
            return `${this._name}_${elementType}_${index}`;
        }
        return `${this._name}_${elementType}`;
    }

    public getAbsoluteUrl(icon: string) {
        if (!isNullOrUndefined(icon)) {
            let baseUrl = window.location.href;
            return `${baseUrl}#${icon}`;
        }
        return `${icon}`;
    }

    public validate(c: AbstractControl): {
        [key: string]: any;
    } {
        return null;
        //throw new Error('Not implemented yet.');
    }

    public registerOnValidatorChange(fn: () => void): void {
        //throw new Error('Not implemented yet.');
    }

    public ngOnInit(): void {
        if (StringHelper.isNullOrUndefinedOrEmpty(this._id)) {
            throw new AtlasError('id is mandatory');
        }
        if (StringHelper.isNullOrUndefinedOrEmpty(this._name)) {
            throw new AtlasError('name is mandatory');
        }
    }

    public ngOnDestroy(): void {
        this._destructor$.next(true);
    }
    // End of Public Methods
}
