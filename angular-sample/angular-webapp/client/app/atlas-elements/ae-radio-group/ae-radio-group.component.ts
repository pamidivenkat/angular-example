import { isNullOrUndefined } from 'util';
import { BaseElementGeneric } from '../common/base-element-generic';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AeRadioItem } from '../common/models/ae-radio-item';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output
} from '@angular/core';
import * as Immutable from 'immutable';
import { AeSelectItem } from '../common/models/ae-select-item';
import { LocaleService, TranslationService } from "angular-l10n";

@Component({
    selector: 'ae-radio-group',
    templateUrl: './ae-radio-group.component.html',
    styleUrls: ['./ae-radio-group.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AeRadioGroupComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeRadioGroupComponent<T> extends BaseElementGeneric<T> implements OnInit {

    // Private Fields
    private _options: Immutable.List<AeSelectItem<T>>;
    private _defaultValue: number;
    // End of Private Fileds

    // Public Properties
    @Input('options')
    get options() {
        return this._options;
    }
    set options(value: Immutable.List<AeSelectItem<T>>) {
        this._options = Immutable.List(value);
    }
    // End of Public Properties

    // Public Output bindings
    @Output()
    aeChange: EventEmitter<AeSelectItem<T>> = new EventEmitter<AeSelectItem<T>>();
    // End of Output bindings

    // Constructor
    constructor(cdr: ChangeDetectorRef, protected _localeService: LocaleService
        , protected _translationService: TranslationService) {
        super(cdr);
    }
    // End of Constructor
    getTranslationText(inputVal) {
        return this._translationService.translate(inputVal)
    }

    // Private Methods
    valueChanged(value) {
        this.value = value;
        this._propagateChange(this.value);
        let selectedItems = this.options.filter(c => c.Value == value);
        if (selectedItems.count()) {
            this.aeChange.emit(selectedItems.first());
        }
    }

    getSeqId(index: number, name: string) {
        return `${this.getChildId('AeRadiobutton' + '-' + name, index)}_${index}`
    }
    // End of Private Methods

    // Public Methods
    ngOnInit(): void {
        super.ngOnInit();
    }
    // End of Public Methods

}
