import { Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Rx';

export abstract class BaseComponent implements OnDestroy {
    // Private Fields
    private _id: string;
    private _name: string;

    protected _destructor$: Subject<boolean> = new Subject();
    // End of Private Fields

    // Public properties
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
    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ContentChild bindings
    // End of Public ContentChild bindings

    // Constructor
    constructor() {

    }
    // End of constructor

    // Private methods
    // End of private methods

    // Public methods
    ngOnInit() {
    }

    ngOnDestroy() {
        this._destructor$.next(true);
        this._destructor$.unsubscribe();
    }
    // End of public methods
}
