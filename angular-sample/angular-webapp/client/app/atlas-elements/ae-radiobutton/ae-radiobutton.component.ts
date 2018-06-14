import { Subject } from 'rxjs/Rx';
import { AeRadioItem } from '../common/models/ae-radio-item';
import { BaseElementGeneric } from '../common/base-element-generic';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    Renderer,
    ElementRef,
    ViewChild,
    AfterViewInit
} from '@angular/core';
import { NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { AePosition } from '../common/ae-position.enum';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { AeSelectItem } from '../common/models/ae-select-item';
import { isNullOrUndefined } from 'util';

/**
 *
 * @export
 * @class AeRadioButtonComponent
 * @extends {BaseElementGeneric<string>}
 * @implements {OnInit}
 */
@Component({
    selector: 'ae-radiobutton',
    templateUrl: './ae-radiobutton.component.html',
    styleUrls: ['./ae-radiobutton.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AeRadioButtonComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeRadioButtonComponent<T> extends BaseElementGeneric<T> implements OnInit, AfterViewInit {
    // Private Fields
    private _text: string;
    private _defaultValue: T;
    // End of Private Fields

    // Public properties
    public input: HTMLInputElement;

    @Input('text')
    get text() {
        return this._text;
    }
    set text(val: string) {
        this._text = val;
    }

    @Input('defaultValue')
    get defaultValue() {
        return this._defaultValue;
    }
    set defaultValue(val: T) {
        this._defaultValue = val;
    }

    @Input('disabled')
    get disabled() {
        return this._disabled;
    }
    set disabled(val: boolean) {
        this._disabled = val;
    }
    // End of Public properties

    // Public Output bindings
    @Output()
    public aeChange: EventEmitter<T> = new EventEmitter<T>();
    // End of public Output bindings

    // view child properties
    @ViewChild('rb') inputViewChild: ElementRef;
    // end of view child properties

    // Constructor
    constructor(cdr: ChangeDetectorRef, private _renderer: Renderer, private _elementRef: ElementRef) {
        super(cdr);
    }
    // End of constructor

    // Private Methods
    onSelectionChanged(event) {
        this.value = event.target.value;
        this.aeChange.emit(this.value);
    }

    isDisabled(): boolean {
        return this._disabled === true ? true : null;
    }
    // End of Private Methods

    // Public Methods
    ngOnInit(): void {
        super.ngOnInit();
    }

    ngAfterViewInit(): void {
        this.input = <HTMLInputElement>this.inputViewChild.nativeElement;
        if (this.defaultValue == this.value) {
            this.input.checked = true;
        }
    }
    // End of Public Methods

}
