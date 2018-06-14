import {
  Component
  , OnInit
  , OnDestroy
  , ChangeDetectorRef
  , Output
  , EventEmitter
  , Input
  , ChangeDetectionStrategy
  , ViewEncapsulation
} from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { EmployeeBasicInfoModel } from '../../models/employee-basic-info.model';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { EmergencyContact } from '../../../../employee/models/emergency-contact.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AtlasApiRequest } from '../../../../shared/models/atlas-api-response';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { EmployeeEmergencyContactsLoadAction } from '../../../../employee/actions/employee.actions';
import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';

@Component({
  selector: 'employee-basic-info',
  templateUrl: './employee-basic-info.component.html',
  styleUrls: ['./employee-basic-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None

})
export class EmployeeBasicInfoComponent extends BaseComponent implements OnInit, OnDestroy {
  // private fields start
  private _employeeBasicInfo: EmployeeBasicInfoModel;
  private _actions = Immutable.List([]);
  private _keys = Immutable.List(['Name', 'EmployeeRelationName', 'Town', 'MobilePhone', 'Email', 'IsPrimary']);
  private _totalRecords: Observable<number>;
  private _dataTableOptions: Observable<DataTableOptions>;
  private _emergencyContacts: Observable<Immutable.List<EmergencyContact>>;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _loading: boolean = true;
  // end of private fields

  // public properties start
  @Input()
  set employeeBasicInfo(val: EmployeeBasicInfoModel) {
    if (!isNullOrUndefined(val)) {
      this._employeeBasicInfo = val;
      this._loading = false;
      this._store.dispatch(new EmployeeEmergencyContactsLoadAction({
        EmployeeId: val.Id
        , apiRequest: new AtlasApiRequest(1, 10, 'Name', SortDirection.Ascending)
      }));
    }
  }
  get employeeBasicInfo() {
    return this._employeeBasicInfo;
  }  

  @Output()
  cancelled: EventEmitter<boolean> = new EventEmitter<boolean>();

  get employeeSalutation(){
    return this._employeeBasicInfo.Salutation;
  }

  get emergencyContacts(){
    return this._emergencyContacts;
  }

  get totalRecords(){
    return this._totalRecords;
  }

  get loaderType(){
    return this._loaderType;
  }

  get keys(){
    return this._keys;
  }

  get loading(){
    return this._loading;
  }

  get dataTableOptions(){
    return this._dataTableOptions;
  }

  get employeeFirstName(){
    return this._employeeBasicInfo.FirstName;
  }

  get employeeMiddleName(){
    return this._employeeBasicInfo.MiddleName;
  }

  get employeeSurname(){
    return this._employeeBasicInfo.Surname;
  }

  get employeeKnownAs(){
    return this._employeeBasicInfo.KnownAs;
  }

  get employeePreviousName(){
    return this._employeeBasicInfo.PreviousName;
  }

  get employeeGenderText(){
    return this._employeeBasicInfo.GenderText;
  }

  get employeeDOB(){
    return this._employeeBasicInfo.DOB;
  }

  get employeeAge(){
    return this._employeeBasicInfo.Age;
  }

  get employeeSalutationEthnicGroupValueName(){
    return this._employeeBasicInfo.EthnicGroupValueName;
  }

  get employeeNationality(){
    return this._employeeBasicInfo.Nationality;
  }

  get employeeNINumber(){
    return this._employeeBasicInfo.NINumber;
  }

  get employeeTaxCode(){
    return this._employeeBasicInfo.TaxCode;
  }

  get employeeFullAddress(){
    return this._employeeBasicInfo.FullAddress;
  }

  get employeePersonalEmail(){
    return this._employeeBasicInfo.PersonalEmail;
  }

  get employeeEmail(){
    return this._employeeBasicInfo.Email;
  }

  get employeeMobilePhone(){
    return this._employeeBasicInfo.MobilePhone;
  }

  get employeeHomePhone(){
    return this._employeeBasicInfo.HomePhone;
  }
  // end of public properties

  // constructor starts
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _changeDetector);
  }
  // end of constructor

  // private methods start
  onPanelClosed(e) {
    this.cancelled.emit(true);
  }

  getEthnicity() {
    if (!isNullOrUndefined(this._employeeBasicInfo)) {
      if (this._employeeBasicInfo.EthnicGroupValueType === 2) {
        return this._employeeBasicInfo.EthnicGroupName;
      } else {
        return this._employeeBasicInfo.EthnicGroupValueName;
      }
    } else {
      return null;
    }
  }

  getEmpUpdateUrl() {
    if (!isNullOrUndefined(this._employeeBasicInfo) &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._employeeBasicInfo.Id)) {
      return `/employee/edit/${this._employeeBasicInfo.Id}/personal`;
    }
    return null;
  }
  // end of private methods

  // public methods start
  ngOnInit() {
    this._emergencyContacts = this._store.let(fromRoot.getEmployeeEmergencyContacts);
    this._totalRecords = this._store.let(fromRoot.getEmployeeEmergencyContactsTotalCount);
    this._dataTableOptions = this._store.let(fromRoot.getEmployeeEmergencyContactsDataTableOptions);
  }

  ngOnDestroy() {

  }
  // end of public methods
}
