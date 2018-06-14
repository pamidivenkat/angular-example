import { DOWN_ARROW, END, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, UP_ARROW } from '../common/models/ae-slider-keycodes';
import { BaseElementGeneric } from '../common/base-element-generic';
import { AeSliderRenderer } from '../common/models/ae-slider-renderer';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Optional,
  Output,
  ViewEncapsulation
} from '@angular/core';

/** The thumb gap size for a disabled slider. */
const DISABLED_THUMB_GAP = 7;

/** The thumb gap size for a non-active slider at its minimum value. */
const MIN_VALUE_NONACTIVE_THUMB_GAP = 7;

/** The thumb gap size for an active slider at its minimum value. */
const MIN_VALUE_ACTIVE_THUMB_GAP = 10;

/** A simple change event emitted by the AeSlider component. */
export class AeSliderChange {
  source: AeSliderComponent;
  value: number;
}

/**
 *  Interface for mouse slider events
 * 
 * @export
 * @interface HammerInput
 */
export interface HammerInput {
  preventDefault: () => {};
  deltaX: number;
  deltaY: number;
  center: { x: number; y: number; };
}

/**
 * 
 * 
 * @export
 * @class AeSliderComponent
 * @extends {BaseElementGeneric<any>}
 * @implements {OnInit}
 */

@Component({
  selector: 'ae-slider',
  templateUrl: './ae-slider.component.html',
  styleUrls: ['./ae-slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.mat-slider]': 'true',
    '(blur)': '_onBlur()',
    '(click)': '_onClick($event)',
    '(keydown)': '_onKeydown($event)',
    '(keyup)': '_onKeyup()',
    '(mouseenter)': '_onMouseEnter()',
    '(slide)': '_onSlide($event)',
    '(slideend)': '_onSlideEnd()',
    '(slidestart)': '_onSlideStart($event)',
    'role': 'slider',
    'tabindex': '0',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-valuenow]': 'value',
    '[class.mat-slider-active]': '_isActive',
    '[class.mat-slider-disabled]': 'disabled',
    '[class.mat-slider-horizontal]': '!vertical',
    '[class.mat-slider-axis-inverted]': 'invertAxis',
    '[class.mat-slider-sliding]': '_isSliding',
    '[class.mat-slider-thumb-label-showing]': 'thumbLabel',
    '[class.mat-slider-vertical]': 'vertical',
    '[class.mat-slider-min-value]': '_isMinValue',
  },

})
export class AeSliderComponent extends BaseElementGeneric<any> implements OnInit {

  // Private Fields

  /** A renderer to handle updating the slider's thumb and fill track. */
  private _renderer: AeSliderRenderer = null;
  private _sliderDimensions: ClientRect = null;
  private _thumbLabel: boolean = false;
  private _lastChangeValue: number = null;
  private _lastInputValue: number = null;
  private _roundLabelTo: number;
  private _step: number = 1;
  private _percent: number = 0;
  private _value: number = null;
  private _min: number = 0;
  private _max: number = 100;
  private _invert = false;
  private _vertical = false;
  private _direction: string = 'leftToRight';
  private _isSliding: boolean = false;
  private _isActive: boolean = false;

  // End of Private Fields

  // Public properties

  _disabled: boolean = false;

  // End of Public properties

  // Input Bindings
  //  

  @Input('disabled')
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = this.coerceBooleanProperty(value);
  }

  @Input('thumbLabel')
  get thumbLabel() {
    return this._thumbLabel;
  }
  set thumbLabel(value: boolean) {
    this._thumbLabel = this.coerceBooleanProperty(value);
  }

  @Input('step')
  get step() {
    return this._step;
  }
  set step(val: number) {
    this._step = this.coerceNumberProperty(val, this._step);
    if (this._step % 1 !== 0) {
      this._roundLabelTo = this._step.toString().split('.').pop().length;
    }
  }

  @Input('value')
  get value() {
    if (this._value === null) {
      this.value = this._min;
    }
    return this._value;
  }
  set value(val: number) {
    this._value = this.coerceNumberProperty(val, this._value);
    this._percent = this._calculatePercentage(this._value);
    this._emitValueIfChanged();
  }


  @Input('min')
  get min() {
    return this._min;
  }
  set min(val: number) {
    this._min = this.coerceNumberProperty(val, this._min);
    // If the value wasn't explicitly set by the user, set it to the min.
    if (this._value === null) {
      this.value = this._min;
    }
    this._percent = this._calculatePercentage(this.value);
  }


  @Input('max')
  get max() {
    return this._max;
  }
  set max(val: number) {
    this._max = this.coerceNumberProperty(val, this._max);
    this._percent = this._calculatePercentage(this.value);
  }


  @Input()
  get invert() {
    return this._invert;
  }
  set invert(value: any) {
    this._invert = this.coerceBooleanProperty(value);
  }


  @Input()
  get vertical() {
    return this._vertical;
  }
  set vertical(value: any) {
    this._vertical = this.coerceBooleanProperty(value);
  }

  // End of Input Bindings

  // Public Output bindings

  @Output()
  aeChange: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  aeInput: EventEmitter<any> = new EventEmitter<any>();
  //
  // End of Public Output bindings

  // Public ViewChild bindings

  // End of Public ViewChild bindings

  // Public ViewContent bindings

  // End of Public ViewContent bindings

  // Constructor
  //
  constructor(elementRef: ElementRef, cdr: ChangeDetectorRef) {
    super(cdr);
    this._renderer = new AeSliderRenderer(elementRef);
  }

  //
  // End of constructor

  ngOnInit() {
    // this._controlValueChange.subscribe(c => {
    //   this._percent = this._calculatePercentage(c);
    // });
  }

  // Private methods

  /** Increments the slider by the given number of steps (negative number decrements). */
  private _increment(numSteps: number) {
    this.value = this._clamp(this.value + this.step * numSteps, this.min, this.max);
    this._emitInputEvent();
    this._emitValueIfChanged();
  }

  /** Calculate the new value from the new physical location. The value will always be snapped. */
  private _updateValueFromPosition(pos: { x: number, y: number }) {
    if (!this._sliderDimensions) {
      return;
    }

    let offset = this.vertical ? this._sliderDimensions.top : this._sliderDimensions.left;
    let size = this.vertical ? this._sliderDimensions.height : this._sliderDimensions.width;
    let posComponent = this.vertical ? pos.y : pos.x;

    // The exact value is calculated from the event and used to find the closest snap value.
    let percent = this._clamp((posComponent - offset) / size);
    if (this.invertMouseCoords) {
      percent = 1 - percent;
    }
    let exactValue = this._calculateValue(percent);
    let closestValue = Math.round((exactValue - this.min) / this.step) * this.step + this.min;
    // The value needs to snap to the min and max.
    this.value = this._clamp(closestValue, this.min, this.max);
  }

  /** Emits a change event if the current value is different from the last emitted value. */
  private _emitValueIfChanged() {
    if (this.value != this._lastChangeValue) {
      let event = this._createChangeEvent();
      this._lastChangeValue = this.value;
      this.aeChange.emit(event);
    }
  }

  /** Emits an input event when the current value is different from the last emitted value. */
  private _emitInputEvent() {
    if (this.value != this._lastInputValue) {
      let event = this._createChangeEvent();
      this._lastInputValue = this.value;
      this.aeInput.emit(event);
    }
  }

  /** Creates a slider change object from the specified value. */
  private _createChangeEvent(value = this.value): AeSliderChange {
    let event = new AeSliderChange();
    event.source = this;
    event.value = value;
    return event;
  }

  /** Calculates the percentage of the slider that a value is. */
  private _calculatePercentage(value: number) {
    return (value - this.min) / (this.max - this.min);
  }

  /** Calculates the value a percentage of the slider corresponds to. */
  private _calculateValue(percentage: number) {
    return this.min + percentage * (this.max - this.min);
  }

  /** Return a number between two numbers. */
  private _clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(value, max));
  }

  private coerceBooleanProperty(value: any): boolean {
    return value != null && `${value}` !== 'false';
  }

  private coerceNumberProperty(value: any, fallbackValue = 0) {
    return isNaN(parseFloat(value as any)) || isNaN(Number(value)) ? fallbackValue : Number(value);
  }

  // End of private methods

  // Public methods

  get percent() {
    return this._clamp(this._percent);
  }

  get displayValue(): string | number {
    if (this._roundLabelTo && this.value % 1 !== 0) {
      return this.value.toFixed(this._roundLabelTo);
    }
    return this.value;
  }

  get invertAxis() {
    return this.vertical ? !this.invert : this.invert;
  }

  get invertMouseCoords() {
    return (this.direction == 'rtl' && !this.vertical) ? !this.invertAxis : this.invertAxis;
  }

  get _isMinValue() {
    return this.percent === 0;
  }

  get _thumbGap() {
    if (this.disabled) {
      return DISABLED_THUMB_GAP;
    }
    if (this._isMinValue && !this.thumbLabel) {
      return this._isActive ? MIN_VALUE_ACTIVE_THUMB_GAP : MIN_VALUE_NONACTIVE_THUMB_GAP;
    }
    return 0;
  }

  get direction() {
    return (this._direction == 'leftToRight') ? 'ltr' : 'rtl';
  }

  _onMouseEnter() {
    if (this.disabled) {
      return;
    }
    this._sliderDimensions = this._renderer.getSliderDimensions();
  }

  _onClick(event: MouseEvent) {
    if (this.disabled) {
      return;
    }
    this._isActive = true;
    this._isSliding = false;
    this._renderer.addFocus();
    this._updateValueFromPosition({ x: event.clientX, y: event.clientY });

    /* Emits a change and input event if the value changed. */
    this._emitInputEvent();
    this._emitValueIfChanged();
  }

  _onSlide(event: HammerInput) {
    if (this.disabled) {
      return;
    }
    // Prevent the slide from selecting anything else.
    event.preventDefault();
    this._updateValueFromPosition({ x: event.center.x, y: event.center.y });

    // Native range elements always emit `input` events when the value changed while sliding.
    this._emitInputEvent();
  }

  _onSlideStart(event: HammerInput) {
    if (this.disabled) {
      return;
    }
    // Simulate mouseenter in case this is a mobile device.
    this._onMouseEnter();
    event.preventDefault();
    this._isSliding = true;
    this._isActive = true;
    this._renderer.addFocus();
    this._updateValueFromPosition({ x: event.center.x, y: event.center.y });
  }

  _onSlideEnd() {
    this._isSliding = false;
    this._emitValueIfChanged();
  }

  _onBlur() {
    this._isActive = false;
  }

  _onKeydown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }
    switch (event.keyCode) {
      case PAGE_UP:
        this._increment(10);
        break;
      case PAGE_DOWN:
        this._increment(-10);
        break;
      case END:
        this.value = this.max;
        this._emitValueIfChanged();
        break;
      case HOME:
        this.value = this.min;
        this._emitValueIfChanged();
        break;
      case LEFT_ARROW:
        this._increment(this.direction == 'rtl' ? 1 : -1);
        break;
      case UP_ARROW:
        this._increment(1);
        break;
      case RIGHT_ARROW:
        this._increment(this.direction == 'rtl' ? -1 : 1);
        break;
      case DOWN_ARROW:
        this._increment(-1);
        break;
      default:
        return;
    }
    this._isSliding = true;
    event.preventDefault();
  }

  _onKeyup() {
    this._isSliding = false;
  }

  // add css methods

  /** CSS styles for the track background element. */
  get trackBackgroundStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    let sign = this.invertMouseCoords ? '-' : '';
    return {
      'transform': `translate${axis}(${sign}${this._thumbGap}px) scale${axis}(${1 - this.percent})`
    };
  }

  /** CSS styles for the track fill element. */
  get trackFillStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    let sign = this.invertMouseCoords ? '' : '-';
    return {
      'transform': `translate${axis}(${sign}${this._thumbGap}px) scale${axis}(${this.percent})`
    };
  }

  /** CSS styles for the thumb container styles. */
  get thumbContainerStyles(): { [key: string]: string } {
    let axis = this.vertical ? 'Y' : 'X';
    // For a horizontal slider in RTL languages we push the thumb container off the left edge
    // instead of the right edge to avoid causing a horizontal scrollbar to appear.
    let invertOffset =
      (this.direction == 'rtl' && !this.vertical) ? !this.invertAxis : this.invertAxis;
    let offset = (invertOffset ? this.percent : 1 - this.percent) * 100;
    return {
      'transform': `translate${axis}(-${offset}%)`
    };
  }

  //
  // End of public methods

}
