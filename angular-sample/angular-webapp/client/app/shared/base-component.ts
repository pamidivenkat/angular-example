import { Subject } from 'rxjs/Rx';
import { ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { LocaleService, Localization, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from "util";

export abstract class BaseComponent extends Localization implements OnDestroy {
    private _id: string;
    private _name: string;

    protected _destructor$: Subject<boolean> = new Subject();

    @Input()
    get id() { return this._id; }
    set id(value: string) {
        this._id = value;
    }

    @Input()
    get name() { return this._name; }
    set name(value: string) {
        this._name = value;
    }

    constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, protected _cdRef: ChangeDetectorRef) {
        super(_localeService, _translationService, _cdRef);
    }
    ngOnInit() {
    }

    ngOnDestroy() {
        this._destructor$.next(true);
        this._destructor$.unsubscribe();
    }

    // Public Methods    
    public getChildId(elementType: string, index: number = 1): string {
        if (!isNullOrUndefined(index)) {
            return `${this._id}_${elementType}_${index}`;
        }
        return `${this._id}_${elementType}`;
    }

    public getChildName(elementType: string, index: number = 1): string {
        if (isNullOrUndefined(index)) {
            return `${this._name}_${elementType}_${index}`;
        }
        return `${this._name}_${elementType}`;
    }

    public getAbsoluteUrl(icon: string) {
        if (!isNullOrUndefined(icon)) {
            let baseUrl = window.location.href;
           // let baseUrl = location.protocol + '//' + location.host + location.pathname
            return `${baseUrl}#${icon}`;
        }
        return `${icon}`;
    }
}
