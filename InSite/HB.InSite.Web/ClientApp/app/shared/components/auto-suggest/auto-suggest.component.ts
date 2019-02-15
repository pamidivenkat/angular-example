import {
  Component,
  forwardRef,
  Input,
  OnInit,
  ViewEncapsulation
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material";

import { AutoSuggest } from "../../../core/models/auto-suggest";
import { BaseComponent } from "../../base-component";

export const AUTOSUGGEST_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AutoSuggestComponent),
  multi: true
};

@Component({
  selector: "app-auto-suggest",
  templateUrl: "./auto-suggest.component.html",
  styleUrls: ["./auto-suggest.component.scss"],
  providers: [AUTOSUGGEST_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class AutoSuggestComponent extends BaseComponent
  implements OnInit, ControlValueAccessor {
  // Private Fields
  private _options: Array<AutoSuggest>; //Array of objects {}
  private _value: any;
  // End of Private Fields

  // Public properties
  chips = [];
  set value(value) {
    if (value !== this._value) {
      this._value = value;
      this._propagateChange(value);
    }
  }
  get value() {
    return this._value;
  }

  @Input() placeholder: string = "Venues";
  @Input("options")
  set options(value: Array<AutoSuggest>) {
    this._options = value;
  }
  get options(): Array<AutoSuggest> {
    return this._options;
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
    super();
  }
  // End of constructor

  // Private methods
  private _propagateChange = (_: any) => {};
  private _propagateTouch = (_: any) => {};
  // End of private methods

  // Public methods
  ngOnInit() {}

  writeValue(obj): void {
    this._value = obj;
  }

  registerOnChange(fn: any): void {
    this._propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._propagateTouch = fn;
  }

  optionSelected(selected: MatAutocompleteSelectedEvent) {
    let index = this._options.findIndex(option => {
      return option.id === selected.option.value;
    });
    this.chips.push(this._options[index]);
    this._options.splice(index, 1);
    this.chips.sort((a, b) => {
      return a.name > b.name ? 1 : -1;
    });
  }

  remove(id: number) {
    let index = this.chips.findIndex(chip => {
      return chip.id === id;
    });
    this._options.push(this.chips[index]);
    this.chips.splice(index, 1);
    this._options.sort((a, b) => {
      return a.name > b.name ? 1 : -1;
    });
  }

  // End of public methods
}
