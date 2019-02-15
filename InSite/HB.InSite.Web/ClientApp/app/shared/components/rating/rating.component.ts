import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { BaseComponent } from "../../base-component";

export const RATING_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RatingComponent),
  multi: true
};

@Component({
  selector: "app-rating",
  templateUrl: "./rating.component.html",
  styleUrls: ["./rating.component.scss"],
  providers: [RATING_VALUE_ACCESSOR]
})
export class RatingComponent extends BaseComponent implements OnInit, ControlValueAccessor {
  // Private Fields
  private _readOnly: boolean;
  private _rate: number;

  // End of Private Fields

  // Public properties
  public hovered;
  public rates: Array<any> = [
    { value: 1, name: "1 - Far Below Expectations" },
    { value: 2, name: "2" },
    { value: 3, name: "3 - Meets Expectations" },
    { value: 4, name: "4" },
    { value: 5, name: "5 - Far Exceeds Expectations" }
  ];

  @Input("readOnly")
  set readOnly(value: boolean) {
    this._readOnly = value;
  }
  get readOnly(): boolean {
    return this._readOnly;
  }

  @Input("rate")
  set rate(value: number) {
    if (value !== this._rate) {
      this._rate = value;
      this._propagateChange(value);
    }
  }
  get rate(): number {
    return Math.floor(this._rate < 1 ? this._rate * 10 : this._rate);
  }

  @Input()
  otherColor: boolean;
  @Input()
  margin: boolean = true;
  @Input()
  viewOnly: boolean = false;
  @Input()
  showDropdown: boolean = false;
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor() {
    super();
  }
  // End of constructor

  // Private methods
  private _propagateChange = (_: any) => {};
  private _propagateTouch = (_: any) => {};
  // End of private methods

  // Public methods
  writeValue(obj): void {
    this._rate = obj;
  }

  registerOnChange(fn: any): void {
    this._propagateChange = fn;
    this._propagateTouch = fn;
  }

  registerOnTouched(fn: any): void {
    this._propagateTouch = fn;
  }
  ngOnInit() {}

  valueChange(event) {
    // console.log(event);
  }
  // End of public methods
}
