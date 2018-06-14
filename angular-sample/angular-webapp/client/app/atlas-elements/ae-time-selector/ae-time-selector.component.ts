import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseElementGeneric } from '../common/base-element-generic';
import { AtlasError } from '../../shared/error-handling/atlas-error';
import { StringHelper } from '../../shared/helpers/string-helper';
import { isNullOrUndefined, isNumber } from 'util';
import { BaseElement } from '../common/base-element';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
  ViewChild,
  ElementRef
} from '@angular/core';
import { AeInputType, MinMaxUsage } from "../../atlas-elements/common/ae-input-type.enum";

type TimePart = { Hours: number, Minutes: number };

@Component({
  selector: 'ae-time-selector',
  templateUrl: './ae-time-selector.component.html',
  styleUrls: ['./ae-time-selector.component.scss'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AeTimeSelectorComponent), multi: true }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AeTimeSelectorComponent extends BaseElementGeneric<string> implements OnInit {
  // Private field declarations
  private _max: string;
  private _min: string;
  private _hourminutes: string;

  private _hour: number;
  private _minute: number;

  private _maxHourMinutes: TimePart;
  private _minHourMinutes: TimePart;
  private _inputReadOnly: boolean = true;
  private _defaultValue: string;
  private _defaultHourMinutes: TimePart;
  private _defaultMin: string;
  private _defaultMax: string;
  private _minLength: number;
  // end of private fields

  // Public field declarations
  get defaultMin(): string {
    return this._defaultMin;
  }
  get defaultMax(): string {
    return this._defaultMax;
  }

  @Input('max')
  get max() {
    return this._max;
  }
  set max(val: string) {
    if (!this._validateHourTime(val)) {
      throw new AtlasError('Invalid value to max attribute.');
    }
    this._maxHourMinutes = this._extractHourMinutes(val);
    this._max = val;
  }

  @Input('min')
  get min() {
    return this._min;
  }
  set min(val: string) {
    if (!this._validateHourTime(val)) {
      throw new AtlasError('Invalid value to min attribute.');
    }
    this._minHourMinutes = this._extractHourMinutes(val);
    this._min = val;
  }

  @Input('defaultValue')
  get defaultValue(): string {
    return this._defaultValue;
  }
  set defaultValue(val: string) {
    this._defaultValue = val;
    if (!this._validateHourTime(val)) {
      throw new AtlasError('Invalid default value attribute.');
    }
    this._defaultHourMinutes = this._extractHourMinutes(val);
  }

  @Input('inputReadOnly')
  get readOnly() {
    return this._inputReadOnly || null;
  }
  set readOnly(value: boolean) {
    this._inputReadOnly = StringHelper.coerceBooleanProperty(value);
  }

  @Input('minLength')
  get minLength() {
    return this._minLength || null;
  }
  set minLength(value: number) {
    this._minLength = value
  }

  // end of public field declarations.

  // Output properties start
  @Output()
  aeChange: EventEmitter<string> = new EventEmitter<string>();
  // end of output properties

  // constructor starts
  constructor(private _cdRef: ChangeDetectorRef) {
    super(_cdRef);

  }
  // constructor ends

  // private method declarations
  getHour(): string {
    if (this._hour < 10) {
      return `0${this._hour}`;
    } else {
      return this._hour.toString();
    }
  }

  getTime(): string {
    if (this._minute < 10) {
      return `0${this._minute}`;
    } else {
      return this._minute.toString();
    }
  }

  increaseHour() {
    let hourValue = this._hour + 1;
    if (this._isValidDate(hourValue, this._minute)) {
      this._hour = hourValue;
      this._updateModel();
    }
    else {
      this.setDefaultValuesBasedOnMinMaxUsage()
    }
  }

  decreaseHour() {
    let hourValue = this._hour - 1;
    if (this._isValidDate(hourValue, this._minute)) {
      this._hour = hourValue;
      this._updateModel();
    }
    else {
      this.setDefaultValuesBasedOnMinMaxUsage()
    }
  }

  increaseMinute() {
    let minuteValue = this._minute + 10;
    let hourValue = this._hour;
    if (minuteValue >= 60) {
      hourValue = hourValue + 1;
      minuteValue = 0;
    }
    if (this._isValidDate(hourValue, minuteValue)) {
      this._minute = minuteValue;
      this._hour = hourValue;
      this._updateModel();
    }
    else {
      this.setDefaultValuesBasedOnMinMaxUsage()
    }
  }

  decreaseMinute() {
    let minuteValue = (this._minute === 0 ? 60 : this._minute) - 10;
    let hourValue = this._minute === 0 ? (this._hour - 1) : this._hour;

    if (this._isValidDate(hourValue, minuteValue)) {
      this._minute = minuteValue;
      this._hour = hourValue;
      this._updateModel();
    }
    else {
      this.setDefaultValuesBasedOnMinMaxUsage()
    }
  }

  private _isValidDate(hour: number, minute: number) {
    let currentDate = new Date(1900, 1, 1, hour, minute);
    let maxDate = new Date(1900, 1, 1, this._maxHourMinutes.Hours, this._maxHourMinutes.Minutes);
    let minDate = new Date(1900, 1, 1, this._minHourMinutes.Hours, this._minHourMinutes.Minutes);

    return currentDate <= maxDate && currentDate >= minDate;
  }

  private _extractHourMinutes(input: string): TimePart {
    let splits: Array<string> = input.split(':');
    let timePart: TimePart = { Hours: parseInt(splits[0], 10), Minutes: parseInt(splits[1], 10) };
    return timePart;
  }

  private _validateHourTime(input: string): boolean {
    if (!StringHelper.isNullOrUndefinedOrEmpty(input)
      && input.indexOf(':') !== -1
      && input.split(':').length === 2
      && isNumber(parseInt(input.split(':')[0], 10))
      && isNumber(parseInt(input.split(':')[1], 10))) {
      return true;
    }
    return false;
  }

  private _updateModel(): void {
    this.inputHourHtmlElement.nativeElement.value = this.getHour();
    this.inputTimeHtmlElement.nativeElement.value = this.getTime();
    this.value = `${this.getHour()}:${this.getTime()}`;
    this._propagateChange(this.value);
    this.aeChange.emit(this.value);
    this._cdRef.markForCheck();
  }


  // end of private method declarations

  // View Child Properties
  @ViewChild('inputHourField')
  inputHourHtmlElement: ElementRef;
  @ViewChild('inputTimeField')
  inputTimeHtmlElement: ElementRef;
  // End of View Child Properies

  // Public method declaration
  ngOnInit() {
    this._controlValueChange.subscribe((val) => {
      if (!this._validateHourTime(val)) {
        throw new AtlasError('Invalid value to the control.');
      }
      let hourMinuteValue = this._extractHourMinutes(val);
      this._hour = hourMinuteValue.Hours;
      this._minute = hourMinuteValue.Minutes;
      this._cdRef.markForCheck();
    });
  }

  onHourInputChange(e) {
    let value = Number(e.target.value);
    let hourValue = value;
    if (this._isValidDate(hourValue, this._minute)) {
      this._hour = hourValue;
      this._updateModel();
    } else {
      this.setDefaultValuesBasedOnMinMaxUsage()
    }
  }
  setDefaultValuesBasedOnMinMaxUsage() {
    this._hour = this._defaultHourMinutes.Hours;
    this._minute = this._defaultHourMinutes.Minutes;
    this._updateModel();
  }
  onTimeInputChange(e) {
    let value = Number(e.target.value);
    let minuteValue;
    let hourValue
    if (this._minute > value) {
      minuteValue = value === 0 ? 60 : value;
      hourValue = value === 0 ? (this._hour - 1) : this._hour;
    }
    else {
      minuteValue = value;
      hourValue = this._hour;
      if (minuteValue >= 60) {
        hourValue = hourValue + 1;
        minuteValue = 0;
      }
    }
    if (this._isValidDate(hourValue, minuteValue)) {
      this._minute = minuteValue;
      this._hour = hourValue;
      this._updateModel();
    }
    else {
      this.setDefaultValuesBasedOnMinMaxUsage()
    }
  }

  onKeyPress(e: any, isHour: boolean) {
    if (!this.isIntegerChar(e)) {
      event.preventDefault();
    }
  }

  isIntegerChar(e) {
    return /[0-9]|-/.test(
      String.fromCharCode(e.which));
  }

  // end of public method declaration
}