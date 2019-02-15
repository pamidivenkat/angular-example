import { select } from "@angular-redux/store";
import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatSelect } from "@angular/material";
import { Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

import { PostType } from "../../../core/models/post";
import { CommonHelpers } from "../../helpers/common-helper";

export const POSTTYPE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PosttypeFilterComponent),
  multi: true
};

@Component({
  selector: "app-posttype-filter",
  templateUrl: "./posttype-filter.component.html",
  styleUrls: ["./posttype-filter.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PosttypeFilterComponent),
      multi: true
    }
  ]
})
export class PosttypeFilterComponent implements OnInit, ControlValueAccessor {
  public isMobile: boolean;
  private _selectedType: Array<any>;

  @Input("selectedType")
  set selectedType(value: Array<any>) {
    this._selectedType = value;
    this._propagateChange(value);
    this._propagateTouch(value);
  }
  get selectedType(): Array<any> {
    return this._selectedType;
  }

  @Input()
  postTypes: Array<any>;
  @Input()
  includeVenue: boolean = false;

  @select(["layout", "isMobile"])
  private _isMobile$: Observable<boolean>;

  private _propagateChange = (_: any) => {};
  private _propagateTouch = (_: any) => {};

  writeValue(obj): void {
    this._selectedType = obj;
  }

  registerOnChange(fn: any): void {
    this._propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._propagateTouch = fn;
  }

  @Output()
  onSelectionChange: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

  @ViewChild(MatSelect)
  matSelect: MatSelect;

  constructor(private elementRef: ElementRef) {
    this.postTypes = CommonHelpers.EnumToArray(PostType);
    this._isMobile$.pipe(distinctUntilChanged()).subscribe(value => {
      this.isMobile = value;
    });
  }

  ngOnInit() {
    if (!this.includeVenue) {
      this.postTypes = this.postTypes.filter(postType => postType.value < PostType.Venue);
    } else {
      this.postTypes = this.postTypes.filter(postType => postType.value < PostType.CVB);
    }
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.querySelector("mat-select").addEventListener("click", this.onClick.bind(this));
  }

  onClick(event) {
    //don't remove, some reason mat select click is not working so attached manually.
  }

  updateList() {
    if (this.matSelect.panelOpen === false) {
      this.onSelectionChange.emit(this.selectedType);
    }
  }
}
