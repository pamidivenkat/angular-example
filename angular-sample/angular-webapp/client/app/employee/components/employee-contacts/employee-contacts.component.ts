import { EmployeeEmergencyContactsUpdateCompleteAction } from './../../actions/employee.actions';
import { Tristate } from '../../../atlas-elements/common/tristate.enum';
import { withLatestFrom } from 'rxjs/operator/withLatestFrom';
import { ActivatedRoute } from '@angular/router';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { Subscription } from 'rxjs/Subscription';
import { LookupState } from '../../../shared/reducers/lookup.reducer';
import { County, Country, EmployeeRelations } from './../../../shared/models/lookup.models';
import {
  EmployeeEmergencyContactsCreateAction,
  EmployeeEmergencyContactsDeleteAction,
  EmployeeEmergencyContactsGetAction,
  EmployeeContactsLoadAction,
  EmployeeContactsUpdateAction,
  EmployeeEmergencyContactsLoadAction,
  EmployeeLoadAction,
  EmployeeTabChangeAction,
  EmployeeEmergencyContactsGetCompleteAction
} from '../../actions/employee.actions';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { EmployeeTabs } from '../../common/employee-tabs';
import { isNullOrUndefined } from 'util';
import { EmergencyContact } from '../../models/emergency-contact.model';
import { EmployeeFullEntity } from '../../models/employee-full.model';
import { mergeEmployeeContacts } from '../../common/extract-helpers';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import { Employee, EmployeeContacts, EmployeeEmergencyContacts } from '../../models/employee.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { CountryLoadAction, CountyLoadAction, EmployeeRelationsLoadAction } from '../../../shared/actions/lookup.actions';

@Component({
  selector: 'employee-contacts',
  templateUrl: './employee-contacts.component.html',
  styleUrls: ['./employee-contacts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeContactsComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _employeeContacts$: Observable<EmployeeContacts>;
  private _empContactsToSave: EmployeeContacts;
  private _empEmergencyContactToSave: EmployeeEmergencyContacts;
  private _btnStyle: AeClassStyle;
  private _showUpdateEmpContactsForm: boolean = false;
  private _showUpdateEmpEmergencyContactsForm: boolean = false;
  private _updateBtnText: string;
  private _noneText: string;
  private _emergencyContacts: Observable<Immutable.List<EmergencyContact>>;
  private _dataSource = new BehaviorSubject<Immutable.List<EmergencyContact>>(Immutable.List([]));
  private _updateAction = new Subject();
  private _removeAction = new Subject();
  private _keys = Immutable.List(['Name', 'EmployeeRelationName', 'Town', 'MobilePhone', 'Email', 'IsPrimary']);
  private _totalRecords: Observable<number>;
  private _dataTableOptions: Observable<DataTableOptions>;

  private _county$: Observable<County[]>;
  private _country$: Observable<Country[]>;
  private _employeeRelation$: Observable<EmployeeRelations[]>;
  private _countyDataLoaded$: Observable<boolean>
  private _countyDataLoadedSubscription: Subscription;

  private _countryDataLoaded$: Observable<boolean>
  private _countryDataLoadedSubscription: Subscription;

  private _employeeRelationDataLoaded$: Observable<boolean>

  private _contactsDataLoaded$: Observable<boolean>

  private _emergencyContactDataLoaded$: Observable<boolean>
  private _emergencyContactSubscription: Subscription;


  private _showRemoveDialog: boolean = false;
  private _emergencyContactToBeDeleted: EmergencyContact = null;
  private _operationMode: string = "add";
  private _preferredSortfield: string = "Name"
  private _preferredSortDirection: SortDirection = SortDirection.Ascending;
  private _employeeIdToFetch$: Observable<string>;
  private _routeParamsScription: Subscription;
  private _employeeRelationDataLoadedSubscription: Subscription;
  private _employeeEmergenccyConctactsLoaded$: Observable<boolean>;
  private _employeeId: string;
  private _contactDataLoaded: boolean;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _translationChnageSub: Subscription;
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  // End of private Fields
  //Public Properties 
  get EmployeeContacts$(): Observable<EmployeeContacts> {
    return this._employeeContacts$;
  }
  set EmployeeContacts$(value: Observable<EmployeeContacts>) {
    this._employeeContacts$ = value;
  }

  get County$(): Observable<County[]> {
    return this._county$;
  }
  set County$(value: Observable<County[]>) {
    this._county$ = value;
  }

  get Country$(): Observable<Country[]> {
    return this._country$;
  }
  set Country$(value: Observable<Country[]>) {
    this._country$ = value;
  }

  get EmployeeRelation$(): Observable<EmployeeRelations[]> {
    return this._employeeRelation$;
  }
  set EmployeeRelation$(value: Observable<EmployeeRelations[]>) {
    this._employeeRelation$ = value;
  }

  //End of Public properties
  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _employeeSecurityService: EmployeeSecurityService
  ) {
    super(_localeService, _translationService, _cdRef);

  }
  //end of constructor

  //public method start

  get showRemoveDialog() {
    return this._showRemoveDialog;
  }

  get keys() {
    return this._keys;
  }
  get noneText(): string {
    return this._noneText;
  }
  get actions() {
    return this._actions;
  }

  get emergencyContacts() {
    return this._emergencyContacts;
  }
  get canUpdate$() {
    return this._canUpdate$;
  }

  get contactsDataLoaded$() {
    return this._contactsDataLoaded$;
  }

  get showUpdateEmpContactsForm() {
    return this._showUpdateEmpContactsForm;
  }

  get showUpdateEmpEmergencyContactsForm() {
    return this._showUpdateEmpEmergencyContactsForm;
  }

  get operationMode() {
    return this._operationMode;
  }

  get btnStyle() {
    return this._btnStyle;
  }

  get dataTableOptions() {
    return this._dataTableOptions;
  }

  get totalRecords() {
    return this._totalRecords;
  }

  ngOnInit() {
    //despatching the actions that are needed to get the employee contacts related data

    this._countyDataLoaded$ = this._store.let(fromRoot.getCountyLoadingState);
    this._countryDataLoaded$ = this._store.let(fromRoot.getCountryLoadingState);
    this._employeeRelationDataLoaded$ = this._store.let(fromRoot.getEmployeeRelationsLoadingState);
    this._employeeEmergenccyConctactsLoaded$ = this._store.let(fromRoot.getEmployeeEmergencyContactsLoadData);

    this._contactsDataLoaded$ = this._store.let(fromRoot.getEmployeeContactsLoadingState);
    this._emergencyContactDataLoaded$ = this._store.let(fromRoot.getEmployeeEmergencyContactGetStatus);
    this._employeeIdToFetch$ = this._store.let(fromRoot.getEmployeeId);

    this._routeParamsScription = this._employeeIdToFetch$.combineLatest(this._contactsDataLoaded$, this._employeeEmergenccyConctactsLoaded$, (employeeId$, contactsLoaded$, emergencyContactLoaded$) => {
      return { employeeId: employeeId$, contactsLoaded: contactsLoaded$, emergencyContactLoaded: emergencyContactLoaded$ };
    }).subscribe((vl) => {
      if (vl.employeeId) {
        this._employeeId = vl.employeeId;

        if (!this._canUpdate$.value)
          this._canUpdate$.next(this._employeeSecurityService.CanUpdateContact(this._employeeId));


        if (!vl.contactsLoaded)
          this._store.dispatch(new EmployeeContactsLoadAction(vl.employeeId));

        if (!vl.emergencyContactLoaded)
          this._store.dispatch(new EmployeeEmergencyContactsLoadAction({ EmployeeId: vl.employeeId, apiRequest: new AtlasApiRequest(1, 10, this._preferredSortfield, this._preferredSortDirection) }));
      }
    });



    this._countyDataLoadedSubscription = this._countyDataLoaded$.subscribe(countyLoaded => {
      if (!countyLoaded)
        this._store.dispatch(new CountyLoadAction(null));
    });

    this._countryDataLoadedSubscription = this._countyDataLoaded$.subscribe(countryLoaded => {
      if (!countryLoaded)
        this._store.dispatch(new CountryLoadAction(null));
    });

    this._employeeRelationDataLoadedSubscription = this._countyDataLoaded$.subscribe(empRelationLoaded => {
      if (!empRelationLoaded)
        this._store.dispatch(new EmployeeRelationsLoadAction(null));
    });



    this._county$ = this._store.let(fromRoot.getCountyData);
    this._country$ = this._store.let(fromRoot.getCountryData);
    this._employeeRelation$ = this._store.let(fromRoot.getEmployeeRelationsData);


    this._btnStyle = AeClassStyle.Light;

    //Here we need to subscribe to the translation changed observable 
    this._doAllTranslations();
    this._translationChnageSub = this._translationService.translationChanged.subscribe(
      () => {
        this._doAllTranslations();
      }
    );
    this._employeeContacts$ = this._store.let(fromRoot.getEmployeeContactsData);

    this._store.let(fromRoot.getEmployeeContactUpdateStatus).subscribe(status => {
      if (status) {
        this._showUpdateEmpContactsForm = false;
        this._cdRef.markForCheck();
      }
    });

    this._store.let(fromRoot.getEmployeeEmergencyContactUpdateStatus).subscribe(status => {
      if (status) {
        this._showUpdateEmpEmergencyContactsForm = false;
        this._cdRef.markForCheck();
      }
    });



    this._emergencyContacts = this._store.let(fromRoot.getEmployeeEmergencyContacts);
    this._totalRecords = this._store.let(fromRoot.getEmployeeEmergencyContactsTotalCount);
    this._dataTableOptions = this._store.let(fromRoot.getEmployeeEmergencyContactsDataTableOptions);

    this._store.let(fromRoot.getEmployeeEmergencyContactGetStatus).subscribe(status => {
      if (status == true) {
        this._showUpdateEmpEmergencyContactsForm = true;
        this._operationMode = "update";
        this._cdRef.markForCheck();
      }
    });

    this._updateAction.subscribe(ec => {
      let ecToBeUpdated: EmergencyContact = <EmergencyContact>ec;
      this._store.dispatch(new EmployeeEmergencyContactsGetAction({ EmployeeEmergencyContactId: ecToBeUpdated.Id }));
    });

    this._removeAction.subscribe(ec => {
      this._showRemoveDialog = true;
      this._emergencyContactToBeDeleted = <EmergencyContact>ec;
    });
  }
  ngOnDestroy() {
    if (this._translationChnageSub) {
      this._translationChnageSub.unsubscribe();
    }
    if (this._countyDataLoadedSubscription)
      this._countyDataLoadedSubscription.unsubscribe();
    if (this._countryDataLoadedSubscription)
      this._countryDataLoadedSubscription.unsubscribe();
    if (this._employeeRelationDataLoadedSubscription)
      this._employeeRelationDataLoadedSubscription.unsubscribe();
    if (this._routeParamsScription)
      this._routeParamsScription.unsubscribe();
  }
  //End of public methods

  // Private methods start


  private _doAllTranslations() {
    this._updateBtnText = this._translationService.translate('BUTTONS.UPDATE');
    this._noneText = '';//this._translationService.translate('NONE');
  }
  getSlideoutState(): string {
    return this._showUpdateEmpContactsForm ? 'expanded' : 'collapsed';
  }

  getEmergencyContactsSlideoutState(): string {
    return this._showUpdateEmpEmergencyContactsForm ? 'expanded' : 'collapsed';
  }

  modalClosed(option) {
    if (option == 'yes') {
      this._store.dispatch(new EmployeeEmergencyContactsDeleteAction(this._emergencyContactToBeDeleted));
    }
    this._showRemoveDialog = false;
    this._emergencyContactToBeDeleted = null;
  }

  private _actions = Immutable.List([
    new AeDataTableAction("Update", this._updateAction, false, (item) => { return this._commandSelector() }),
    new AeDataTableAction("Remove", this._removeAction, false, (item) => { return this._commandSelector() })
  ]);

  private _commandSelector(): Tristate {
    let canManage = this._employeeSecurityService.CanUpdateContact(this._employeeId);
    return canManage ? Tristate.True : Tristate.False;
  }


  openEmpContactsUpdateForm(e) {
    this._showUpdateEmpContactsForm = true;
  }

  openEmpEmergencyContactsUpdateForm(e) {
    this._showUpdateEmpEmergencyContactsForm = true;
    this._operationMode = "add";
  }

  closeUpdateForm(e) {
    this._showUpdateEmpContactsForm = false;    
  }

  closeEmpEmergencyContactsUpdateForm(e) {
    this._showUpdateEmpEmergencyContactsForm = false;
    this._store.dispatch(new EmployeeEmergencyContactsUpdateCompleteAction(true));
  }

  onPageChange($event) {
    //TODO
    this._pageNumber = $event.pageNumber;
    this._pageSize = $event.noOfRows;
    this._store.dispatch(new EmployeeEmergencyContactsLoadAction({ EmployeeId: this._employeeId, apiRequest: new AtlasApiRequest(this._pageNumber,this._pageSize, this._preferredSortfield, this._preferredSortDirection) }));
  }
  onSortChange($event) {
    this._pageNumber =  1;
    this._preferredSortfield = $event.SortField;
    this._preferredSortDirection = $event.Direction;
    this._store.dispatch(new EmployeeEmergencyContactsLoadAction({ EmployeeId: this._employeeId, apiRequest: new AtlasApiRequest(this._pageNumber,this._pageSize, this._preferredSortfield, this._preferredSortDirection) }));
  }
  // End of Private methods
  highLightRow = (context: any) => context.IsPrimary;
}
