import { isNullOrUndefined } from 'util';
import { AtlasError } from '../../shared/error-handling/atlas-error';
import { StringHelper } from '../../shared/helpers/string-helper';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AeDatasourceType } from '../common/ae-datasource-type';
import { AeAutoCompleteModel } from '../common/models/ae-autocomplete-model';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { AeInputComponent } from '../ae-input/ae-input.component';
import { AeTextareaResize } from '../common/ae-textarea-resize.enum';
import { AfterViewChecked } from '@angular/core/src/metadata/lifecycle_hooks';
import { ObjectHelper } from '../../atlas-shared/helpers/object-helper';
import { AeInputType } from '../common/ae-input-type.enum';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseElementGeneric } from '../common/base-element-generic';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  IterableDiffers,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  Renderer2
} from '@angular/core';

export const AUTOCOMPLETE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AeAutocompleteComponent),
  multi: true
};

@Component({
  selector: 'ae-autocomplete',
  templateUrl: './ae-autocomplete.component.html',
  styleUrls: ['./ae-autocomplete.component.scss'],
  providers: [AUTOCOMPLETE_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AeAutocompleteComponent<T> extends BaseElementGeneric<any> implements AfterViewInit, OnDestroy, OnChanges {
  /** Private field declarations - start   */
  private _controlType: AeInputType = AeInputType.text;
  private _minLength: number = 2;
  private _debounce: number = 300;
  private _placeholder: string;
  private _readonly: boolean = false;
  private _maxlength: number;
  private _size: number;
  private _suggestions: any[];
  private _scrollHeight: string = '200px';
  private _multiselect: boolean = false;
  private _field: string;
  private _valuefield: string;
  private _initialValue: any;
  private _inputValue: string;
  private _selectedValues: any[];
  private _selectedItems: AeAutoCompleteModel<any>[];
  private _datasourceType: AeDatasourceType = AeDatasourceType.Remote;
  private _highlightMatch: boolean = true;
  private _filteredList: AeAutoCompleteModel<any>[] = [];
  private _controlValueChangeSub: Subscription;
  private _controlAKey: boolean = false;
  private _canCloseSuggestionPanel: boolean = false;
  private _title: string = '';
  private _fromControl: boolean = false;

  /** Private field declarations - end   */

  /** Public variable declaration - start   */
  get controlType(): AeInputType {
    return this._controlType;
  }

  timeout: any;
  searchEventStream: Observable<string>;
  differ: any;
  input: ElementRef;
  documentClickListener: any;
  panelVisible: boolean = false;
  suggestionsUpdated: boolean;
  highlightOption: any;
  highlightOptionChanged: boolean;
  focus: boolean = false;
  filled: boolean = false;
  selectedValue: any;
  iconSize: AeIconSize = AeIconSize.small;
  minCharsEntered: boolean = false;
  isLoading: boolean = false;
  loadingText: string = "Searching ...";
  noMatchFoundText: string;
  staticSource: any[] = [];
  /** Public variable declaration - end   */

  /**
   * determine whether the control needs to operate in multiple selection or single selection
   * true : multi selection mode
   * false : single selection mode
   * default : false
   * 
   * @type : boolean
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get multiselect() {
    return this._multiselect;
  }
  set multiselect(val: boolean) {
    this._multiselect = StringHelper.coerceBooleanProperty(val);
  }

  /**
   * gets or sets the debounce time to begin search operation
   * default : 300ms
   * 
   * @type number
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get debounce() {
    return this._debounce;
  }
  set debounce(val: number) {
    this._debounce = val;
  }

  /**
   * gets or sets the placeholder text on input text box
   *
   * 
   * @type: string
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(val: string) {
    this._placeholder = val;
  }

  /**
   * whether to disable the input textbox or not.
   * default:false
   * 
   * @type: boolean
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(val: boolean) {
    this._disabled = val;
  }

  /**
   * whether to make readonly the input textbox or not.
   * default:false
   * 
   * @type: boolean
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get readonly() {
    return this._readonly;
  }
  set readonly(val: boolean) {
    this._readonly = StringHelper.coerceBooleanProperty(val);
  }

  /**
   * gets or sets the maximum height of suggestion panelVisible 
   * default: '200px'
   * 
   * @type : string
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get scrollHeight() {
    return this._scrollHeight;
  }
  set scrollHeight(val: string) {
    this._scrollHeight = val;
  }

  /**
   * gets or sets the maximum characters that user can enter into the input control
   * 
   * 
   * @type : number
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get maxlength() {
    return this._maxlength;
  }
  set maxlength(val: number) {
    this._maxlength = val;
  }

  /**
   * gets or sets the minimum characters that user can enter into the input control.
   * 
   * @type: number
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get minlength() {
    return this._minLength;
  }
  set minlength(val: number) {
    this._minLength = val;
  }

  /**
    * gets or sets the minimum characters that user can enter into the input control.
    * note: added this property alias to minlength prop, to fix autocomplete field dynamic binding and form validation issues, in ae-form comp.
    * @type: number
    * get/set property
    * 
    * @memberOf AeAutocompleteComponent
    */
  @Input()
  get minimumlength() {
    return this._minLength;
  }
  set minimumlength(val: number) {
    this._minLength = val;
  }

  /**
   * gets or sets the size of input control.
   * 
   * @type: number
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get size() {
    return this._size;
  }
  set size(val: number) {
    this._size = val;
  }

  /**
   * gets or sets the display field in the datasource.
   * 
   * @type: string
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get field() {
    return this._field;
  }
  set field(val: any) {
    this._field = val;
  }

  /**
   * gets or sets the value field in the datasource.
   * If value field is not supplied, then it's value is equal to the display field. 
   * 
   * @type string
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get valuefield() {
    return this._valuefield || this._field;
  }
  set valuefield(val: any) {
    this._valuefield = val;
  }

  /**
   * gets or sets the selected items.
   * 
   * @type: collection of AeAutoCompleteModel<any>
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  get selectedItems() {
    return this._selectedItems || [];
  }
  set selectedItems(val: AeAutoCompleteModel<any>[]) {
    if (!val)
      throw new AtlasError("items to select should not be null.");

    this._selectedItems = [];
    this._selectedItems = val;

    this._selectedValues = [];
    this._selectedValues = ObjectHelper.pluck(this.selectedItems, 'Value')
  }

  /**
   * gets or sets the selected values form the autocomplete control
   * 
   * @type: Array
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  get selectedValues() {
    return this._selectedValues || [];
  }
  set selectedValues(val: any[]) {
    this._selectedValues = val;
  }

  /**
   * gets or sets the type of datasource
   * 
   * @type AeDatasourceType
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input('dstype')
  get datasourceType() {
    return this._datasourceType;
  }
  set datasourceType(val: AeDatasourceType) {
    this._datasourceType = val;
  }

  /**
   * gets or sets the value to input control
   * 
   * @type string
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input('initialtext')
  get inputValue() {
    return this._inputValue;
  }
  set inputValue(val: string) {
    this._inputValue = val;
  }

  /**
   * gets or sets whether to show the focussed item in highlight format or not.   * 
   * 
   * @type boolean
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get automatch() {
    return this._highlightMatch;
  }
  set automatch(val: boolean) {
    this._highlightMatch = val;
  }

  /**
   * gets or sets the datasource to the autocomplete control
   * 
   * @type Array
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  @Input()
  get items() {
    return this._suggestions;
  }
  set items(val: any[]) {
    this._suggestions = (val || []);

    // Tranforms to AeAutoCompleteModel[]
    this._getFilteredList();
  }


  /**
   * list that used for binding items in dropdown panel.
   * 
   * @type AeAutoCompleteModel[]
   * get/set property
   * 
   * @memberOf AeAutocompleteComponent
   */
  get filteredList() {
    return this._filteredList;
  }
  set filteredList(val: AeAutoCompleteModel<any>[]) {
    this._filteredList = val;
  }

  @Input('title')
  get title(): string {
    return this._title;
  }
  set title(val: string) {
    this._title = val;
  }

  /** Output fields declarations - start*/
  /** 
   * Emitter for search operation to get suggestions.
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeAutocompleteComponent
   */
  @Output() aeOnComplete: EventEmitter<any> = new EventEmitter();


  /**
   * Emitter for selection of option from suggestions.
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeAutocompleteComponent
   */
  @Output() aeOnSelect: EventEmitter<any> = new EventEmitter();

  /**
   * Emitter for deselection/removal of item from selected items.
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeAutocompleteComponent
   */
  @Output() aeOnUnselect: EventEmitter<any> = new EventEmitter();

  /**
   * Emitter for clear selected items event.
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeAutocompleteComponent
   */
  @Output() aeOnClearSelected: EventEmitter<any> = new EventEmitter();

  @Output() aeInputChange: EventEmitter<string> = new EventEmitter<string>();

  @Output() aeBlur: EventEmitter<any> = new EventEmitter<string>();

  /** Output fields declarations - end*/

  /** View Child declarations - start   */


  /**
   * view child for ae-input control.
   * 
   * @type {AeInputComponent<string>}
   * @memberOf AeAutocompleteComponent
   */
  @ViewChild(AeInputComponent) aeInput: AeInputComponent<string>;
  /** View Child declarations - end   */

  /**
   * Creates an instance of AeAutocompleteComponent.
   * @param {ElementRef} el 
   * @param {Renderer} renderer 
   * @param {ChangeDetectorRef} _cd 
   * @param {DomSanitizer} sanitizer 
   * 
   * @memberOf AeAutocompleteComponent
   */
  constructor(public el: ElementRef, public renderer: Renderer2, private _cd: ChangeDetectorRef, private sanitizer: DomSanitizer) {
    super(_cd);
  }

  /**
   * used to hide the dropdown panel
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  emptyList(): boolean {
    return !(
      this.isLoading ||
      (this.minCharsEntered && !this.isLoading && this.filteredList.length == 0) ||
      (this.filteredList.length > 0)
    );
  }

  /**
   * To highlight the ae input element in the autocomplete. 
   * 
   * 
   * @memberOf AeAutocompleteComponent
   */
  private _focusInput(): void {
    let el: HTMLElement = this.aeInput._elementRef.nativeElement;
    this.aeInput._renderer.invokeElementMethod(
      el.querySelectorAll('input')[0], 'focus', []);
  }



  /**
   * Transforms supplied input list to AeAutoCompleteModel[]
   * 
   * @param {any[]} val 
   * @returns {AeAutoCompleteModel<any>[]} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  private _mapToAeAutocompleteModel(val: any[]): AeAutoCompleteModel<any>[] {
    if (val != null && val != undefined) {
      if (!ObjectHelper.isArray(val)) {
        throw new AtlasError("data source should be of array.");
      }

      val = val || [];

      if (val.length < 1) return [];

      if (ObjectHelper.isPlainArray(val)) {
        return val.map(v => {
          return new AeAutoCompleteModel<any>(v.toString(), v.toString(), v);
        });
      } else if (!StringHelper.isNullOrUndefinedOrEmpty(this.field) &&
        this.field == this.valuefield &&
        ObjectHelper.hasPropInArray(this.field, val)) {
        return val.map(v => {
          return new AeAutoCompleteModel<any>(ObjectHelper.getProperty(v, this.field), ObjectHelper.getProperty(v, this.valuefield), v);
        });
      } else if (!StringHelper.isNullOrUndefinedOrEmpty(this.field) &&
        !StringHelper.isNullOrUndefinedOrEmpty(this.valuefield) &&
        this.field != this.valuefield &&
        ObjectHelper.hasPropInArray(this.field, val) &&
        ObjectHelper.hasPropInArray(this.valuefield, val)) {
        return val.map(v => {
          return new AeAutoCompleteModel<any>(ObjectHelper.getProperty(v, this.field), ObjectHelper.getProperty(v, this.valuefield), v);
        });
      } else {
        return [];
      }
    }
  }

  /**
   * gets the filtered list based on user's search and it 
   * 
   * 
   * @memberOf AeAutocompleteComponent
   */
  private _getFilteredList() {
    let ds: AeAutoCompleteModel<any>[] = this._mapToAeAutocompleteModel(this.items);
    if (this._datasourceType == AeDatasourceType.Local) {
      if (ds.length > 0 && this.selectedValues && this.selectedValues.length > 0) {
        ds = ds.filter(c => {
          return this.selectedValues.indexOf(c.Value) == -1 && ((!StringHelper.isNullOrUndefinedOrEmpty(this.inputValue)) ? c.Text.toLowerCase().indexOf(this.inputValue.toLowerCase()) != -1 : true);
        });
      }
      else {
        if (!StringHelper.isNullOrUndefinedOrEmpty(this.inputValue)) {
          ds = ds.filter(a => {
            return a.Text.toLowerCase().indexOf(this.inputValue.toLowerCase()) != -1;
          });
        }
      }
    } else if (this._datasourceType == AeDatasourceType.Remote) {
      if (ds.length > 0 && this.selectedValues && this.selectedValues.length > 0) {
        ds = ds.filter(c => {
          return this.selectedValues.indexOf(c.Value) == -1 && ((!StringHelper.isNullOrUndefinedOrEmpty(this.inputValue)) ? c.Text.toLowerCase().indexOf(this.inputValue.toLowerCase()) != -1 : true);
        });
      }
    }
    this.filteredList = [].splice(0).concat(ds);
  }

  /**
   * shows the suggestions panel.
   * 
   * 
   * @memberOf AeAutocompleteComponent
   */
  show(): void {
    if (!this.panelVisible && (this.focus)) {
      this.panelVisible = true;
    }
  }

  /**
   * hides the suggestions panel.
   * 
   * 
   * @memberOf AeAutocompleteComponent
   */
  hide(): void {
    if (this.panelVisible)
      this.panelVisible = false;
  }

  /**
   * Triggers when user changes the value in input textbox.
   * 
   * 
   * @param {any} event 
   * 
   * @memberOf AeAutocompleteComponent
   */
  onInput(e) {
    this._fromControl = false;
    let value = e.event.target.value;
    this.aeInputChange.emit(value);
    this.filteredList = [];
    this.inputValue = value;
    if (this.isRemoteDS() && value.length < (this.minlength)) {
      this.minCharsEntered = false;
    } else {
      this.minCharsEntered = true;
    }

    if (!this.multiselect) {
      this.selectedItems = [];
      if (StringHelper.isNullOrUndefinedOrEmpty(value)) {
        this.value = [];
        this._canCloseSuggestionPanel = false;
        this.writeValue(this.selectedValues);
        this._propagateChange(this.selectedValues);
        this.updateFilledState();
        return;
      } else if (!StringHelper.isNullOrUndefinedOrEmpty(value) &&
        !StringHelper.isNullOrUndefinedOrEmpty(this.value) &&
        this.value.length > 0 &&
        this.value[0].Text !== value) {
        this._fromControl = true;
        if (this.isRemoteDS()) {
          this.items = [];
        }
        this.selectedItems = [];
        this.selectedValues = [];
        this.filteredList = [];
        this.value = [];
        this.writeValue(this.selectedValues);
        this._propagateChange(this.selectedValues);
        this.updateFilledState();
      }
    }

    if (this.isRemoteDS()) {
      if (value.length >= this.minlength) {
        this.search(e.event, value);
      }
      else {
        this.filteredList = [];
        this.hide();
      }
    } else {
      this.search(e.event, value);
      if (value.length === 0) {
        this.show();
      }
    }
    this.updateFilledState();
  }

  /**
   * Emits the oncomplete event along with search criteria.
   * 
   * @param {any} event 
   * @param {string} query 
   * @returns 
   * 
   * @memberOf AeAutocompleteComponent
   */
  search(event: any, query: string) {
    if (query === undefined || query === null) {
      return;
    }

    this.isLoading = true;
    if (this.isRemoteDS()) {
      this.aeOnComplete.emit({
        originalEvent: event,
        query: query
      });
    } else {
      this.filteredList = this.filter(this.staticSource, query);
      this.handleChange();
    }
  }


  /**
   * Triggers when user clicks on any item from selected items.
   * 
   * @param {any} e 
   * 
   * @memberOf AeAutocompleteComponent
   */
  tokenClick(e) {
    let el: HTMLElement = this.aeInput._elementRef.nativeElement;
    this.aeInput._renderer.invokeElementMethod(
      el.querySelectorAll('input')[0], 'focus', []);
  }


  /**
   * selects the supplied option, adds it to the selected items, adds option's vale to the selected values.
   * 
   * @param {any} option 
   * 
   * @memberOf AeAutocompleteComponent
   */
  selectItem(option: AeAutoCompleteModel<any>, e: MouseEvent) {
    let sItems = [];
    let itemToPush = option;
    if (this.multiselect) {
      if (!isNullOrUndefined(e)) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!this.isSelected(option.Value)) {
        sItems = this.selectedItems;
        if (isNullOrUndefined(sItems)) {
          sItems = [];
        }

        sItems = sItems.concat(itemToPush);
        this.selectedItems = sItems;
        this.selectedValues = this.selectedItems.map(c => c.Entity);
        this.inputValue = '';
        this.writeValue(this.selectedValues);
        this._propagateChange(this.selectedValues);
        this.aeOnSelect.emit(this.selectedItems);
        this._filteredList = null;
        this._getFilteredList();
        this._cd.markForCheck();
      }
    } else {
      sItems = sItems.concat(itemToPush);
      this.selectedItems = sItems;
      this.inputValue = this.selectedItems[0].Text;
      this.selectedValues = this.selectedItems.map(c => c.Entity);
      this.writeValue(this.selectedValues);
      this._propagateChange(this.selectedValues);
      this._focusInput();
      this.hide();
      this.aeOnSelect.emit(this.selectedItems);
    }
  }

  inputFocus() {
    if (this.isLocalDS()) {
      this.filteredList = this.staticSource;
    }
    this.aeInput.setFocus();
  }

  /**
   * removes the supplied option from selected items, selected values.
   * 
   * @param {AeAutoCompleteModel<T>} item 
   * 
   * @memberOf AeAutocompleteComponent
   */
  removeItem(item: AeAutoCompleteModel<T>) {
    let removedValue = this.selectedItems.filter((c: AeAutoCompleteModel<T>) => {
      return c.Value == item.Value;
    });

    this.selectedItems = this.selectedItems.filter((c: AeAutoCompleteModel<T>) => {
      return c.Value != item.Value;
    });

    this.aeOnUnselect.emit(removedValue);
    this.aeOnSelect.emit(this.selectedItems);
    this.selectedValues = this.selectedItems.map(c => c.Entity);
    this.writeValue(this.selectedValues);
    this._propagateChange(this.selectedValues);
    this.cdr.markForCheck();
  }

  /**
   * Triggers on each key down on input textbox.
   * 
   * @param {any} event 
   * 
   * @memberOf AeAutocompleteComponent
   */
  onKeydown(event) {
    // event = event.event;
    if (this.panelVisible) {
      let highlightItemIndex = this.findOptionIndex(this.highlightOption);

      switch (event.keyCode) {
        //down
        case 40:
          if (highlightItemIndex != -1) {
            var nextItemIndex = highlightItemIndex + 1;
            if (nextItemIndex != (this.filteredList.length)) {
              this.highlightOption = this.filteredList[nextItemIndex];
              this.highlightOptionChanged = true;
            }
          }
          else {
            this.highlightOption = this.filteredList[0];
          }

          event.preventDefault();
          break;

        //up
        case 38:
          if (highlightItemIndex > 0) {
            let prevItemIndex = highlightItemIndex - 1;
            this.highlightOption = this.filteredList[prevItemIndex];
            this.highlightOptionChanged = true;
          }

          event.preventDefault();
          break;

        //enter
        case 13:
          if (this.highlightOption) {
            this.selectItem(this.highlightOption, event);
            this.hide();
          }
          event.preventDefault();
          break;

        //escape
        case 27:
          this.hide();
          event.preventDefault();
          break;
        //tab
        case 9:
          if (this.highlightOption) {
            this.selectItem(this.highlightOption, event);
          }
          this.hide();
          break;

        case 65:
          if (event.ctrlKey) {
            if (this.selectedItems && this.selectedItems.length && !StringHelper.isNullOrUndefinedOrEmpty(this.inputValue)) {
              this._controlAKey = true;
              this.panelVisible = false;
            }
          }
          break;
      }
    } else {
      if (event.which === 40 && this.filteredList) {
        this.search(event, event.target.value);
      }
      if (this._controlAKey) {
        this._controlAKey = false;
        let removedValue = this.selectedItems.pop();
        this.removeItem(removedValue);
        this.search(event, event.target.value);
      }
    }

    if (this.multiselect) {
      switch (event.which) {
        //backspace
        case 8:
          if (this.selectedItems && this.selectedItems.length && StringHelper.isNullOrUndefinedOrEmpty(this.inputValue)) {
            let removedValue = this.selectedItems.pop();
            //this.aeOnUnselect.emit(removedValue);
            //now we need to remove the removedValue from the items selected.
            this.removeItem(removedValue);
            // this.writeValue(this.selectedValues);
            // this._propagateChange(this.selectedValues);
          }
          break;
      }
    }
  }

  /**
   * Triggers when user focused in to the input textbox.
   * 
   * @param {any} e 
   * 
   * @memberOf AeAutocompleteComponent
   */
  onFocus(e) {
    this.focus = true;
    if (this.isLocalDS() && (StringHelper.isNullOrUndefined(this.inputValue) || this.inputValue.length === 0)) {
      this.search(e, '');
      this.show();
    }
    //when remote search then we should emit search event on focus so that the unfinished search will continue APB-15852 
    else if (this.isRemoteDS() && !StringHelper.isNullOrUndefinedOrEmpty(this.inputValue)) {
      this.search(e, this.inputValue);
    }
  }

  /**
   * Triggers when user focused out from input textbox.
   * 
   * @param {any} e 
   * 
   * @memberOf AeAutocompleteComponent
   */
  onBlur(e) {
    if (!this._canCloseSuggestionPanel) {
      this.focus = false;
      this._propagateTouch(e);
      this.hide();
    }
    let value = e.event.target.value
    this.aeBlur.emit(value);
  }

  onMouseEnterForAutoCompleteDiv(event) {
    if (this.isIPad()) {
      return;
    }
    this._canCloseSuggestionPanel = true;
  }

  onMouseLeaveForAutoCompleteDiv(event) {
    if (this.isIPad()) {
      return;
    }
    this._canCloseSuggestionPanel = false;
  }

  onTouchStartForAutoCompleteDiv(event) {
    this._canCloseSuggestionPanel = true;
  }

  onTouchEndForAutoCompleteDiv(event) {
    this._canCloseSuggestionPanel = false;
  }




  /**
   * Triggers when user enters the mouse on any suggestion list item. 
   * 
   * @param {any} option 
   * @param {Event} e 
   * 
   * @memberOf AeAutocompleteComponent
   */
  onMouseEnter(option, e: Event) {
    this.highlightOption = option;
    e.preventDefault();
  }

  /**
   * Triggers when user leaves the mouse from suggestion list item.
   * 
   * @param {Event} e 
   * 
   * @memberOf AeAutocompleteComponent
   */
  onMouseLeave(e: Event) {
    this.highlightOption = null;
    e.preventDefault();
  }


  /**
   * determines whether supplied option is in selected values or not.
   * 
   * @param {any} val 
   * @returns {boolean} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  isSelected(val: any): boolean {
    let selected: boolean = false;
    if (this.selectedValues && this.selectedValues.length) {
      for (let i = 0, len = this.selectedValues.length; i < len; i++) {
        if (ObjectHelper.equals(this.selectedValues[i], val)) {
          selected = true;
          break;
        }
      }
    }
    return selected;
  }

  filter(list: AeAutoCompleteModel<any>[], keyword: string) {
    let ds = list.filter(
      el => {
        keyword = keyword.toLowerCase();
        return el.Text && el.Text.indexOf(keyword) !== -1;
      }
    );

    if (ds.length > 0 && this.selectedValues && this.selectedValues.length > 0) {
      ds = ds.filter(c => {
        return this.selectedValues.indexOf(c.Value) == -1;
      });
    }
    return ds;
  }


  /**
   * gets the array index of supplied option parameter from selected items.
   * 
   * @param {any} option 
   * @returns {number} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  findOptionIndex(option): number {
    let index: number = -1;
    if (this.filteredList) {
      for (let i = 0, len = this.filteredList.length; i < this.filteredList.length; i++) {
        if (ObjectHelper.equals(option, this.filteredList[i])) {
          index = i;
          break;
        }
      }
    }
    return index;
  }

  updateFilledState() {
    this.filled = this.inputValue && this.inputValue != '';
    // if (this.filled) {
    //   this._inputValue = '';
    // }
  }

  /**
   * gets the selected item from supplied parameter. 
   * 
   * @param {any} val 
   * @returns 
   * 
   * @memberOf AeAutocompleteComponent
   */
  getSelectedValue(val: any) {
    let selItems = this.items.filter((a) => {
      return a[this.field] == val;
    });
    if (selItems)
      return selItems[0][this.field];
  }


  /**
   * clears the selected items, selected values and input control text.
   * 
   * @param {any} e 
   * 
   * @memberOf AeAutocompleteComponent
   */
  clearselected(e): void {
    let itemsToClear = this.selectedItems;
    this.inputValue = '';
    this.selectedValues = [];
    this.selectedItems = [];
    this.value = [];
    this._focusInput();
    this._cd.markForCheck();

    // let inputEL: HTMLElement = this.aeInput._elementRef.nativeElement;
    // this.aeInput._renderer.invokeElementMethod(inputEL.querySelectorAll('input')[0], 'focus', []);
    this.writeValue(this.selectedValues);
    this._propagateChange(this.selectedValues);
    this.aeOnClearSelected.emit({ event: e, items: itemsToClear });
  }

  /**
   * gets the display html from supplied option parameter based on field property.
   * 
   * @param {any} option 
   * @returns {SafeHtml} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  getDisplayText(option: AeAutoCompleteModel<any>): SafeHtml {
    let optionText: string = option.Text;
    if (this.automatch && !StringHelper.isNullOrUndefinedOrEmpty(this.inputValue)) {
      let re = new RegExp("(" + this.inputValue + ")", "gi")
      let template = `<span style="color:red;background-color:yellow" (click)="selectItem(option)">${this.inputValue}</span>`
      optionText = optionText.replace(re, template);
    }
    return this.sanitizer.bypassSecurityTrustHtml(optionText);
  }


  /**
   * gets the option text from supplied option parameter based on field property.
   * 
   * @param {any} option 
   * @returns {string} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  getOptionText(option): string {
    return option && this.hasDisplayField() && ObjectHelper.hasProperty(option, this.field) ? ObjectHelper.getProperty(option, this.field) : option;
  }

  /**
   * gets the value from supplied option parameter based on valuefield property.
   * 
   * @param {any} option 
   * @returns {string} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  getOptionValue(option): string {
    return option && this.hasValueField() && ObjectHelper.hasProperty(option, this.valuefield) ? ObjectHelper.getProperty(option, this.valuefield) : option;
  }


  /**
   * determines whether supplied option parameter is marked with highlight class or not.
   * 
   * @param {any} option 
   * @returns {boolean} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  isOptionHighlighted(option): boolean {
    let result = this.getOptionText(option) == this.getOptionText(this.highlightOption);
    // if (result)
    //   this.items = this.items.filter(c => { return true; });
    return result;
  }


  /**determines supplied field attribute has value or not.
   * 
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  hasDisplayField(): boolean {
    return !StringHelper.isNullOrUndefinedOrEmpty(this.field);
  }

  /**
   * determines supplied valuefield attribute has value or not. 
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  hasValueField(): boolean {
    return !StringHelper.isNullOrUndefinedOrEmpty(this.valuefield);
  }

  /**
   * determines whether supplied data source type is of remote or not.
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  isRemoteDS(): boolean {
    return this.datasourceType == AeDatasourceType.Remote;
  }

  /**
   * determines whether supplied data source type is local array or not.
   * 
   * @returns {boolean} 
   * 
   * @memberOf AeAutocompleteComponent
   */
  isLocalDS(): boolean {
    return this.datasourceType == AeDatasourceType.Local;
  }

  /**
   * The ngOnInit method of a component is called directly after the constructor and before the ngOnChange is triggered for the first time. 
   * It is the perfect place for initialisation work.
   * 
   * 
   * @memberOf AeAutocompleteComponent
   */
  ngOnInit() {
    super.ngOnInit();
    // if (StringHelper.isNullOrUndefinedOrEmpty(this.field)) {
    //   throw new AtlasError('field attribute is mandatory');
    // }
    if (!this.items || !ObjectHelper.isArray(this.items)) {
      throw new AtlasError('items attribute is mandatory');
    }
    if (this.value && !ObjectHelper.isArray(this.items)) {
      throw new AtlasError('value attribute should be array');
    }

    this.selectedItems = [];
    if (this.multiselect || StringHelper.isNullOrUndefinedOrEmpty(this.inputValue))
      this.inputValue = '';

    this.prepareSelectedItems();
    this._getFilteredList();
    if (this.isLocalDS()) {
      this.staticSource = this.filteredList;
    }

    this._controlValueChangeSub = this._controlValueChange.subscribe(() => {
      this.handleChange();
      //the value is empty either from control value change... in non multi select mode the input value should be set to blank     
      if (!this.multiselect && !this._fromControl && this.input && (isNullOrUndefined(this.value) || (this.value != null && this.value instanceof Array && this.value.length <= 0))) {
        this.inputValue = null;
        if (this.input.nativeElement)
          this.input.nativeElement.value = null;
      }
    });
  }

  isIPad() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Called after ngAfterContentInit when the component’s view has been initialised. Applies to components only.
   * 
   * 
   * @memberOf AeAutocompleteComponent
   */
  ngAfterViewInit(): void {
    if (this.aeInput) {
      this.input = this.aeInput._elementRef;
      /*
      Used observables To acheive debounce mechanism, but it is giving some side affects.

      let inputEl = (<HTMLElement>this.input.nativeElement).querySelector('input');
      if (this.isRemoteDS()) {
        this.searchEventStream = Observable.fromEvent(inputEl, 'input')
          .map(function (e: any): string {
            return e.target.value;
          })
          .debounceTime(this.debounce)
          .distinctUntilChanged();
      } else {
        this.searchEventStream = Observable.fromEvent(inputEl, 'input')
          .map(function (e: any): string {
            return e.target.value;
          }).distinctUntilChanged();
      }

      this.searchEventStream.subscribe(d => {        
        this.onInput(d);
      });*/
    }
  }

  handleChange() {
    if (this.items) {
      this._getFilteredList();
      if (this.isLoading)
        this.isLoading = false;
      if (!this.multiselect && !isNullOrUndefined(this.value) && this.value.length > 0) {
        this.hide();
      } else {
        this.show();
      }
      this.suggestionsUpdated = true;
    }
    else {
      this.hide();
    }

    if (this.value) {
      this.prepareSelectedItems();
    } else {
      this._canCloseSuggestionPanel = false;
    }
  }

  prepareSelectedItems() {
    if (this.value && this.value.length > 0) {

      if (!this.hasDisplayField() && ObjectHelper.isPlainArray(this.value)) {
        if (!this.multiselect) {
          this.inputValue = this.value[0];
        }
        let sItems: any[] = [];
        this.value.forEach(c => {
          sItems.push(new AeAutoCompleteModel<any>(c, c, c));
        });
        this.selectedItems = sItems;
      } else if (this.hasDisplayField() && (ObjectHelper.hasPropInArray(this.field, this.value) || ObjectHelper.hasPropInArray(this.valuefield, this.value))) {
        if (!this.multiselect) {
          this.inputValue = this.value[0][this.field];
        }
        let sItems: any[] = [];
        this.value.forEach(c => {
          sItems.push(new AeAutoCompleteModel<any>(c[this.field], c[this.valuefield], c));
        });
        this.selectedItems = sItems;
      }
    } else {
      this.selectedItems = [];
    }

    if (isNullOrUndefined(this.selectedItems) ||
      (!isNullOrUndefined(this.selectedItems) && this.selectedItems.length < 1)) {
      this._canCloseSuggestionPanel = false;
    }
  }

  ngOnChanges() {
    this.handleChange();
  }

  canShowNoResults = function () {
    return this.minCharsEntered && !this.isLoading && this.filteredList && this.filteredList.length < 1
  }

  ngOnDestroy() {
    if (this.searchEventStream)
      this.searchEventStream.subscribe().unsubscribe();

    if (this._controlValueChangeSub) {
      this._controlValueChangeSub.unsubscribe();
    }
  }
}
