import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , OnDestroy
  , ChangeDetectorRef
  , ViewEncapsulation
  , Input
  , Output
  , EventEmitter
} from '@angular/core';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublicHoliday } from '../../../nonworkingdaysandbankholidays/models/nonworkingdays-model';
import { OperationModes } from '../../../../holiday-absence/models/holiday-absence.model';
import { isNullOrUndefined } from 'util';
import { generatePublicHolidayYears } from '../../../nonworkingdaysandbankholidays/common/extract-helpers';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { AeSelectEvent } from '../../../../atlas-elements/common/ae-select.event';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { GUID } from '../../../../shared/helpers/guid-helper';
import {
  duplicatePublicHolidayValidator
  , whiteSpaceFieldValidator
} from '../../../nonworkingdaysandbankholidays/common/nonworkingdays-validators';
import { DateTimeHelper } from '../../../../shared/helpers/datetime-helper';
import {
  NonWorkingDaysAndPublicHolidayService
} from '../../../nonworkingdaysandbankholidays/services/nonworkingdaysandbankholiday.service';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';

@Component({
  selector: 'add-update-public-holiday',
  templateUrl: './add-update-public-holiday.component.html',
  styleUrls: ['./add-update-public-holiday.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUpdatePublicHolidayComponent extends BaseComponent implements OnInit, OnDestroy {
  // Start of Private Fields
  private _publicHolidayYears: Immutable.List<AeSelectItem<number>>;
  private _publicHolidayForm: FormGroup;
  private _publicHolidayVM: PublicHoliday;
  private _minDate: Date;
  private _maxDate: Date;
  private _operationMode: OperationModes;
  private _dayNames: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // End of Private Fields

  // Public properties
  @Input('operationMode')
  set operationMode(val: OperationModes) {
    this._operationMode = val;
  }
  get operationMode() {
    return this._operationMode;
  }
 

  @Input('publicHolidayVM')
  set publicHolidayVM(val: PublicHoliday) {
    this._publicHolidayVM = val;

    if (!isNullOrUndefined(val)) {
      this._prepareModel();
    }
  }
  get publicHolidayVM() {
    return this._publicHolidayVM;
  }
  

  get publicHolidayForm() {
    return this._publicHolidayForm;
  }

  get publicHolidayYears() {
    return this._publicHolidayYears;
  }

  get minDate() {
    return this._minDate;
  }

  get maxDate() {
    return this._maxDate;
  }

  get lightClass() {
    return AeClassStyle.Light;
  }

  get defaultClass() {
    return AeClassStyle.Default;
  }
  // End of Public properties

  // Public Output bindings
  @Output()
  saveCompleted: EventEmitter<PublicHoliday> = new EventEmitter<PublicHoliday>();

  @Output()
  clearSelected: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  yearChanged: EventEmitter<number> = new EventEmitter<number>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _publicHolidayService: NonWorkingDaysAndPublicHolidayService
  ) {
    super(_localeService, _translationService, _changeDetector);

  }
  // End of constructor

  // Private methods
  isAddMode() {
    return this._operationMode == OperationModes.Add;
  }

  private _isUpdateMode() {
    return this._operationMode == OperationModes.Update;
  }

  private _getOperationText() {
    return OperationModes[this._operationMode];
  }

  private _fieldHasRequiredError(fieldName: string) {
    return !isNullOrUndefined(this._publicHolidayForm.get(fieldName)) &&
      this._publicHolidayForm.get(fieldName).hasError('required') &&
      !this._publicHolidayForm.get(fieldName).pristine;
  }

  private _fieldHasWhitespaceError(fieldName: string) {
    return !isNullOrUndefined(this._publicHolidayForm.get(fieldName)) &&
      this._publicHolidayForm.get(fieldName).getError('hasWhiteSpace') &&
      !this._publicHolidayForm.get(fieldName).pristine;
  }

  private _fieldHasDupError(fieldName: string) {
    return !isNullOrUndefined(this._publicHolidayForm.get(fieldName)) &&
      this._publicHolidayForm.get(fieldName).getError('duplicatePublicHoliday') === true &&
      !this._publicHolidayForm.get(fieldName).pristine;
  }

  isFieldInvalid(fieldName: string): boolean {
    return !this._publicHolidayForm.get(fieldName).valid &&
      !this._publicHolidayForm.get(fieldName).pristine;
  }

  hasError(fieldName: string): string {
    let message = '';
    switch (fieldName) {
      case 'Year': {
        if (this._fieldHasRequiredError(fieldName)) {
          message = 'Please select year.';
        }
      }
        break;
      case 'Name': {
        if (this._fieldHasRequiredError(fieldName) ||
          this._fieldHasWhitespaceError(fieldName)) {
          message = 'Name is required.';
        }
      }
        break;
      case 'HolidayDate': {
        if (this._fieldHasRequiredError(fieldName)) {
          message = 'Holiday date is required.';
        } else if (this._fieldHasDupError(fieldName)) {
          message = 'Holiday day with same date already exists.';
        }
      }
        break;
    }
    return message;
  }

  private _initForm() {
    this._publicHolidayForm = this._fb.group({
      Name: [{ value: this._publicHolidayVM.Name, disabled: false }
        , Validators.compose([Validators.required, whiteSpaceFieldValidator])],
      Year: [{ value: this._publicHolidayVM.Year, disabled: false }, Validators.required],
      HolidayDate: [{ value: new Date(this._publicHolidayVM.HolidayDate), disabled: false },
      Validators.required]
    });

    for (let name in this._publicHolidayForm.controls) {
      if (this._publicHolidayForm.controls.hasOwnProperty(name)) {
        let control = this._publicHolidayForm.controls[name];
        control.valueChanges.subscribe(v => {
          if (name === 'HolidayDate') {
            if (!isNullOrUndefined(v)) {
              this._publicHolidayVM.HolidayDate = v;
              let dt:Date = DateTimeHelper.getDatePartfromString(this._publicHolidayVM.HolidayDate);
              this._publicHolidayVM.DayOfTheWeek = this._dayNames[dt.getDay()];
              this._minDate = new Date(this._publicHolidayVM.Year, 0, 1);
              this._maxDate = new Date(this._publicHolidayVM.Year, 11, 31);
            } else {
              this._publicHolidayVM.HolidayDate = null;
              this._publicHolidayVM.DayOfTheWeek = '';
              this._minDate = null;
              this._maxDate = null;
            }
          } else if (name === 'Year') {
            this._publicHolidayVM.Year = parseInt(v, 10);
          } else {
            this._publicHolidayVM[name] = !isNullOrUndefined(v) ? (<string>v).toString() : '';
          }
        });
      }
    }
  }

  onYearChange($event: AeSelectEvent<number>) {
    if (!isNullOrUndefined($event)) {
      if (!StringHelper.isNullOrUndefinedOrEmpty($event.SelectedValue)) {
        let selectedYear: number = parseInt($event.SelectedValue, 10);
        if (selectedYear === (new Date()).getFullYear()) {
          this._publicHolidayForm.get('HolidayDate').setValue(new Date());
        } else {
          this._publicHolidayForm.get('HolidayDate').setValue(new Date(selectedYear, 0, 1));
        }
        this.yearChanged.emit(selectedYear);
      } else {
        this._publicHolidayForm.get('HolidayDate').setValue(null);
        this.yearChanged.emit(null);
      }
    }
  }

  private _prepareModel() {
    if (!isNullOrUndefined(this._publicHolidayVM)) {

      if (isNullOrUndefined(this._publicHolidayYears) || this._publicHolidayYears.count() < 1) {
        this._fillPublicYears();
      }

      if (isNullOrUndefined(this._publicHolidayForm)) {
        this._minDate = new Date(this._publicHolidayVM.Year, 0, 1);
        this._maxDate = new Date(this._publicHolidayVM.Year, 11, 31);
        this._publicHolidayVM.DayOfTheWeek = this._dayNames[new Date(this._publicHolidayVM.HolidayDate).getDay()];
        this._initForm();
      } else {
        for (let name in this._publicHolidayForm.controls) {
          if (this._publicHolidayForm.controls.hasOwnProperty(name)) {
            let control = this._publicHolidayForm.controls[name];
            control.markAsPristine();
          }
        }
        this._publicHolidayForm.patchValue({
          Year: this._publicHolidayVM.Year,
          HolidayDate: new Date(this._publicHolidayVM.HolidayDate),
          Name: this._publicHolidayVM.Name
        });

      }
    }
  }

  addPublicHoliday() {
    if (!this._publicHolidayForm.valid) {
      for (let name in this._publicHolidayForm.controls) {
        if (this._publicHolidayForm.controls.hasOwnProperty(name)) {
          let control = this._publicHolidayForm.controls[name];
          control.markAsDirty();
        }
      }
      return;
    }
    this.saveCompleted.emit(this._publicHolidayVM);
  }

  clearForm() {
    this.clearSelected.emit(true);
  }

  private _fillPublicYears() {
    this._publicHolidayYears = generatePublicHolidayYears();
  }
  // End of Private methods
  ngOnInit() {

  }

  ngOnDestroy() {

  }
}
