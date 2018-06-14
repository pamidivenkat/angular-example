import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , forwardRef
  , Input
  , Output
  , EventEmitter
  , ChangeDetectorRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseElementGeneric } from '../common/base-element-generic';
import { AtlasError } from '../../shared/error-handling/atlas-error';

@Component({
  selector: 'ae-numeric-stepper',
  templateUrl: './ae-numeric-stepper.component.html',
  styleUrls: ['./ae-numeric-stepper.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeNumericStepperComponent), multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeNumericStepperComponent extends BaseElementGeneric<number> implements OnInit {
  // Private field declarations
  private _max: number;
  private _min: number;
  private _step: number;
  // end of private fields

  // Public field declarations
  @Input('max')
  get max() {
    return this._max;
  }
  set max(val: number) {
    this._max = val;
  }

  @Input('min')
  get min() {
    return this._min;
  }
  set min(val: number) {
    this._min = val;
  }

  @Input('step')
  get step() {
    return this._step;
  }
  set step(val: number) {
    this._step = val;
  }
  // end of public field declarations.

  // Output properties start
  @Output()
  aeChange: EventEmitter<number> = new EventEmitter<number>();
  // end of output properties

  // constructor starts
  constructor(private _cdRef: ChangeDetectorRef) {
    super(_cdRef);
  }
  // constructor ends

  // private method declarations
  getValue(): string {
    let roundValue = Math.round(this.value * 100) / 100;
    return parseFloat(roundValue.toString()).toFixed(2);
  }

  increaseValue() {
    let valueToValidate = this.value + this.step;
    if (this._isValidValue(valueToValidate)) {
      this.value = valueToValidate;
      this._updateModel();
    }
  }

  decreaseValue() {
    let valueToValidate = this.value - this.step;
    if (this._isValidValue(valueToValidate)) {
      this.value = valueToValidate;
      this._updateModel();
    }
  }

  private _isValidValue(val: number) {
    return val <= this.max && val >= this.min;
  }

  private _updateModel(): void {
    this._propagateChange(this.value);
    this.aeChange.emit(this.value);
    this._cdRef.markForCheck();
  }
  // end of private method declarations

  // Public method declaration
  ngOnInit() {
    // this._controlValueChange.subscribe((val) => {
    //   if (!this._isValidValue(val)) {
    //     throw new AtlasError('Invalid value to the control.');
    //   }
    //   this._cdRef.markForCheck();
    // });
  }
  // end of public method declaration
}
