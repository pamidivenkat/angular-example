import { Subject } from 'rxjs/Rx';
import { BaseElement } from './base-element';
import { ChangeDetectorRef, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ControlValueAccessor } from '@angular/forms/src/directives';

export abstract class BaseElementGeneric<T> extends BaseElement implements ControlValueAccessor {
    _propagateChange = (_: any) => { };
    _propagateTouch = (_: any) => { };
    _disabled: boolean = false;
    protected _controlValueChange: Subject<T>;
     _controlValue: T;

    @Input('value')
    get value() {
        return this._controlValue;
    } 
	
    set value(val: T) {        
        this._controlValue = val;
        this._controlValueChange.next(val);
    }

    @Input('disabled')
    get disabled() {
        return this._disabled;
    } 
	
    set disabled(val: boolean) {
        this._disabled = val;
    }


    constructor(protected cdr: ChangeDetectorRef) {
        super();
        this._controlValueChange = new Subject<T>();
    }

    public writeValue(obj: T): void {
        this.value = obj;
        this.cdr.markForCheck();
    }

    public registerOnChange(fn: any): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this._propagateTouch = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this._disabled = isDisabled;
    }

    public _onChange(event) {
        let value = event.target.value;
        this._propagateChange(value);
    }

    private _onTouch(event) {
        this._propagateTouch(event);
    }
}
