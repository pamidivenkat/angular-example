import { isNullOrUndefined } from 'util';
import {
  Component
  , OnInit
  , ChangeDetectorRef
  , ChangeDetectionStrategy
  , OnDestroy,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { BaseComponent } from './../../../../shared/base-component';
import { NonWorkingdaysModel, PublicHoliday } from './../../../nonworkingdaysandbankholidays/models/nonworkingdays-model';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AeListItem } from './../../../../atlas-elements/common/models/ae-list-item';
import { getAssignedToItems } from './../../../../company/nonworkingdaysandbankholidays/common/extract-helpers';
import { DateTimeHelper } from './../../../../shared/helpers/datetime-helper';

@Component({
  selector: 'nonworkingdays-publicholiday-profile-view',
  templateUrl: './nonworkingdays-publicholiday-profile-view.component.html',
  styleUrls: ['./nonworkingdays-publicholiday-profile-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NonworkingdaysPublicholidayProfileViewComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _nonWorkingDaysModel: NonWorkingdaysModel;
  private _defaultLocale: string;
  private _years: Immutable.List<AeSelectItem<string>>;
  private _currentYear: number;
  private _keys = Immutable.List(['Id', 'Name', 'Year', 'DayOfTheWeek', 'HolidayDate']);
  private _bankHolidays$: Observable<Immutable.List<PublicHoliday>>;
  private _bankHolidaysCount$: Observable<number>;
  private _bankHolidaysBehavSub: BehaviorSubject<Immutable.List<PublicHoliday>> = new BehaviorSubject<Immutable.List<PublicHoliday>>(null);
  private _bankHolidaysCountBehavSub: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _nonWorkingDaysDataTableOptions: DataTableOptions;
  private _assignedItems: Immutable.List<AeListItem>;
  private _excludedEmployees: Immutable.List<AeListItem>;
  private _showAssignedToSection: boolean = true;
  // End of Private Fields

  // Public properties
  @Input('nonWorkingdaysModel')
  set NonWorkingdaysModel(val: NonWorkingdaysModel) {
    this._nonWorkingDaysModel = val;
    if (val) {
      this._setAllRequriedData();
    }
  }
  get NonWorkingdaysModel() {
    return this._nonWorkingDaysModel;
  }
  

  @Input('showAssignedToSection')
  get showAssignedToSection() {
    return this._showAssignedToSection;
  }
  set showAssignedToSection(val: boolean) {
    this._showAssignedToSection = val;
  }

  get nonWorkingDaysModelName() {
    return this._nonWorkingDaysModel.Name;
  }

  get nonWorkingDaysModelDescription() {
    return isNullOrUndefined(this._nonWorkingDaysModel.Description) ? '': this._nonWorkingDaysModel.Description;
  }

  get nonWorkingDaysModelCountryName() {
    return this._nonWorkingDaysModel.CountryName;
  }

  get years() {
    return this._years;
  }

  get currentYear() {
    return this._currentYear;
  }

  get bankHolidays$() {
    return this._bankHolidays$;
  }

  get bankHolidaysCount$() {
    return this._bankHolidaysCount$;
  }

  get nonWorkingDaysDataTableOptions() {
    return this._nonWorkingDaysDataTableOptions;
  }

  get assignedItems() {
    return this._assignedItems;
  }

  get excludedEmployees() {
    return this._excludedEmployees;
  }

  get keys() {
    return this._keys;
  }
  // End of Public properties

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // end of constructor

  // Private methods
  getTranslatedDayOfTheWeek(keyToTranslate: string) {
    if (!isNullOrUndefined(keyToTranslate)) {
      return this._translationService.translate('DAYOFWEEK.' + keyToTranslate.toUpperCase());
    }
  }
  getStartTime(DayName: any) {
    if (this._nonWorkingDaysModel && this._nonWorkingDaysModel.WorkingProfileList) {
      let workingProfile = this._nonWorkingDaysModel.WorkingProfileList.find(obj => obj.DayName == DayName);
      if (workingProfile)
        return workingProfile.StartTimeHours;
    }
  }
  getEndTime(DayName: any) {
    if (this._nonWorkingDaysModel && this._nonWorkingDaysModel.WorkingProfileList) {
      let workingProfile = this._nonWorkingDaysModel.WorkingProfileList.find(obj => obj.DayName == DayName);
      if (workingProfile)
        return workingProfile.EndTimeHours;
    }
  }
  getAssignedTo() {
    if (this._nonWorkingDaysModel && this._nonWorkingDaysModel.HWPAssignedTo && this._nonWorkingDaysModel.HWPAssignedTo.length > 0)
      return this._nonWorkingDaysModel.HWPAssignedTo[0].AssignTo;
  }
  isWorkingDay(DayName: any) {
    if (this._nonWorkingDaysModel && this._nonWorkingDaysModel.WorkingProfileList) {
      let workingProfile = this._nonWorkingDaysModel.WorkingProfileList.find(obj => obj.DayName == DayName);
      if (workingProfile)
        return workingProfile.IsWorkingDay;
    }
    return false;
  }
  hasAnyAssignedItems(): boolean {
    if (this._assignedItems && this._assignedItems.count() > 0)
      return true;
    return false;
  }
  getIsDefaultText(): string {
    if (this._nonWorkingDaysModel && this._nonWorkingDaysModel.HWPAssignedTo && this._nonWorkingDaysModel.HWPAssignedTo.length > 0 && this._nonWorkingDaysModel.HWPAssignedTo[0].AssignTo.toLowerCase() == 'company')
      return this._nonWorkingDaysModel.HWPAssignedTo[0].IsDefault ? 'Yes' : 'No';
  }
  isDefaultShown(): boolean {
    if (this._nonWorkingDaysModel && this._nonWorkingDaysModel.HWPAssignedTo && this._nonWorkingDaysModel.HWPAssignedTo.length > 0 && this._nonWorkingDaysModel.HWPAssignedTo[0].AssignTo.toLowerCase() == 'company')
      return true;
    return false;
  }
  canAssignedToItemsShown(): boolean {
    if (this._nonWorkingDaysModel && this._nonWorkingDaysModel.HWPAssignedTo && this._nonWorkingDaysModel.HWPAssignedTo.length > 0 && this._nonWorkingDaysModel.HWPAssignedTo[0].AssignTo.toLowerCase() != 'company')
      return true;
    return false;
  }
  canExcludedItemsShown(): boolean {
    if (this._nonWorkingDaysModel && this._nonWorkingDaysModel.HWPAssignedTo && this._nonWorkingDaysModel.HWPAssignedTo.length > 0 && (this._nonWorkingDaysModel.HWPAssignedTo[0].AssignTo.toLowerCase() == 'department' || this._nonWorkingDaysModel.HWPAssignedTo[0].AssignTo.toLowerCase() == 'site'))
      return true;
    return false;
  }
  hasAnyExclEmployees(): boolean {
    if (this._excludedEmployees && this._excludedEmployees.count() > 0)
      return true;
    return false;
  }
  onYearChange($event) {
    if (this._nonWorkingDaysModel.PublicHolidayList && this._nonWorkingDaysModel.PublicHolidayList.length > 0) {
      this._currentYear = $event.SelectedValue;
      this._pushYearsData();
      //this._setYearsDataTableRequisites();

    }
  }
  private _setAllRequriedData() {
    this._currentYear = new Date().getFullYear();
    this._setYears();
    this._setYearsDataTableRequisites();
    this._setAssignedToItems();
    this._setExcludedEmployees();
  }
  private _setExcludedEmployees() {
    if (this._nonWorkingDaysModel.ExcludedEmployees)
      this._excludedEmployees = Immutable.List<AeListItem>(this._nonWorkingDaysModel.ExcludedEmployees.map((keyValuePair) => {
        let aeListItem = new AeListItem();
        aeListItem.Text = keyValuePair.Employee.FirstName + ' ' + keyValuePair.Employee.Surname;
        return aeListItem;
      }));

  }
  private _setAssignedToItems() {
    this._assignedItems = getAssignedToItems(this._nonWorkingDaysModel);
  }
  private _setYearsDataTableMetaRequisites(totalYears: number) {
    this._bankHolidays$ = this._bankHolidaysBehavSub;
    this._bankHolidaysCount$ = this._bankHolidaysCountBehavSub;
    this._nonWorkingDaysDataTableOptions = new DataTableOptions(1, totalYears);
  }
  private _setYearsDataTableRequisites() {
    this._setYearsDataTableMetaRequisites(this._nonWorkingDaysModel.PublicHolidayList ? this._nonWorkingDaysModel.PublicHolidayList.length : 0);
    this._pushYearsData();
  }
  private _pushYearsData() {
    let selectedYearItems: Array<PublicHoliday>;
    if (this._currentYear) {
      selectedYearItems = (!isNullOrUndefined(this._nonWorkingDaysModel.PublicHolidayList)) ? this._nonWorkingDaysModel.PublicHolidayList.filter(obj => obj.Year == this._currentYear) : [];
    }
    else {
      selectedYearItems = [];
      this._nonWorkingDaysModel.PublicHolidayList.forEach((item) => {
        if (item.Year >= (new Date()).getFullYear()) {
          selectedYearItems.push(item);
        }
      })

    }
    this._bankHolidaysBehavSub.next(Immutable.List<PublicHoliday>(selectedYearItems));
    this._bankHolidaysCountBehavSub.next(selectedYearItems.length);

  }
  private _setYears() {
    this._years = DateTimeHelper.getYears(this._currentYear, 1, 10);
  }
  // End of private methods

  // public methods start
  ngOnInit() {
  }

  ngOnDestroy() {
  }

  // end of public methods

}
