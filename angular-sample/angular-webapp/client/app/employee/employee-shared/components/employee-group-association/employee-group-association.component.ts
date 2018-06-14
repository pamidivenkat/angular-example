import { LoadSitesAction, LoadSitesCompleteAction } from '../../../../shared/actions/company.actions';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../shared/base-component';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { Site } from '../../../../calendar/model/calendar-models';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { mapSiteLookupTableToAeSelectItems } from '../../../../shared/helpers/extract-helpers';
import { mapLookupTableToAeSelectItems, mapEmployeesToAeSelectItems } from '../../../../employee/common/extract-helpers';
import { EmployeeGroup } from './../../../../shared/models/company.models';
import { EmployeeGroupAssociation, AssociatedEmployees } from '../../../../employee/models/employee-group-association.model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from '../../../../employee/models/employee.model';
import { AeAutoCompleteModel } from './../../../../atlas-elements/common/models/ae-autocomplete-model';
import { EmployeeSearchService } from '../../../../employee/services/employee-search.service';
import { BehaviorSubject } from 'rxjs/Rx';

import {
  LoadEmployeeGroupsEmployeesAction, ClearEmployeesLoadingState, AssociateEmployeesToEmployeeGroupAction
} from '../../../../employee/employee-group/actions/employee-group.actions';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
//import { EmployeeGroupAssociation } from '../../models/employee-group-association.model';

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../../../shared/reducers';
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";

@Component({
  selector: 'employee-association',
  templateUrl: './employee-group-association.component.html',
  styleUrls: ['./employee-group-association.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class EmployeeGroupAssociationComponent extends BaseComponent implements OnInit, OnDestroy {

  /** Private variable declarations - start. */
  private _siteData: Site[];
  private _locations: Immutable.List<AeSelectItem<string>>;
  private _employees: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>(null);
  private _employeesSubscription: Subscription;
  private _employeeSelected: AeSelectItem<string>[];
  private _remoteDataSourceType: AeDatasourceType;
  private _vm: EmployeeGroup;
  private _employeegroupassociationForm: FormGroup;
  private _associatedEmployees: AssociatedEmployees[];
  private _employeesData$: Observable<AssociatedEmployees[]>;
  private _employeeSearchResults: any[];
  private _sitesSubscription: Subscription;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  /** Private variable declarations - end. */


  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _employeeSearchService: EmployeeSearchService
    , private _router: Router, private _messenger: MessengerService) {
    super(_localeService, _translationService, _cdRef);
    this._remoteDataSourceType = AeDatasourceType.Remote;
    this._onCancel = new EventEmitter<string>();
    this._onSaveComplete = new EventEmitter<EmployeeGroupAssociation>();
  }

  /**
 *EmployeeGroup model object, selected item
 * @type {EmployeeGroup}
 * @memberOf EmployeeGroupFormComponent
 */
  @Input('vm')
  set vm(value: EmployeeGroup) {
    this._vm = value;
    if (!isNullOrUndefined(value)) {
      this._store.dispatch(new LoadEmployeeGroupsEmployeesAction(this._vm.Id));
    }

  }
  get vm() {
    return this._vm;
  }
  

  @Output('onCancel') _onCancel: EventEmitter<string>;
  @Output('onSaveComplete') _onSaveComplete: EventEmitter<EmployeeGroupAssociation>;

  ngOnInit() {

    this._sitesSubscription = this._store.let(fromRoot.getApplicableSitesData).subscribe(sites => {
      if (!isNullOrUndefined(sites)) {
        this._locations = mapSiteLookupTableToAeSelectItems(sites);
      }
    });

    this._employeesSubscription = this._store.let(fromRoot.getEmployeeGroupAssociationEmployeesData).subscribe(employees => {
      if (!isNullOrUndefined(employees)) {
        this._associatedEmployees = employees; // master data
        this._employeeSelected = mapEmployeesToAeSelectItems(employees);
        this._cdRef.markForCheck();
      }
    })
    this._employeegroupassociationForm = this._fb.group({
      SiteId: [{ value: "", disabled: false }],
      employee: [{ value: "", disabled: false }]
      // Name :[{ value: this._vm.Name, disabled: false }],
    });
    this._loadSelectedEmployees();
  }

  ngOnDestroy() {
    if (this._employeesSubscription)
      this._employeesSubscription.unsubscribe();
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe()
  }

  // private methods
  private _isExistedEmployee(employeeId: string) {
    let emp = this._associatedEmployees.find(data => data.Id == employeeId);
    return emp;

  }

  private _loadSelectedEmployees() {

  }
  // end of private methods

  // public methods
  onFormSubmit(e) {
    if (this._employeegroupassociationForm.valid) {
      //dispatch an action to save form
      let formDataToSave = <EmployeeGroupAssociation>{};
      formDataToSave.EmployeeGroupId = this._vm.Id;
      formDataToSave.EmployeeGroupName = this._vm.Name;
      formDataToSave.AssociatedEmployees = this._associatedEmployees;
      this._onSaveComplete.emit(formDataToSave); //emit to parent component
      this._employeegroupassociationForm.reset(); //clear form.
    }
  }

  onSelectEmployee($event: any) {
    if ($event.length > 0) {
      if (!isNullOrUndefined(this._isExistedEmployee($event[$event.length - 1].Value))) {
        this._associatedEmployees.forEach(item => {
          if (item.Id == $event[$event.length - 1].Value) {
            item.IsDeleted = false;
          }
        });
      }
      else {
        var emp = <AssociatedEmployees>{};
        let jobData = <any>{};
        emp.IsDeleted = false;
        emp.Id = $event[$event.length - 1].Value;
        emp.FullName = $event[$event.length - 1].Text;
        jobData.SiteId = this._employeeSearchResults.find(data => data.Id == $event[$event.length - 1].Value).SiteId;
        emp.Job = jobData;
        this._associatedEmployees.push(emp);
      }
    }
  }

  aeOnUnselectEmployee($event) {
    this._associatedEmployees.forEach(item => {
      if (item.Id == $event[0].Value) {
        item.IsDeleted = !item.IsDeleted;
      }
    });
  }

  aeOnClearEmployee($event) {
    $event.items.forEach(dt => {
      this._associatedEmployees.forEach(item => {
        if (item.Id == dt.Value) {
          item.IsDeleted = !item.IsDeleted;
        }
      });
    });
  }

  /**
 * on slide-out pop cancel
 * @param {any} e 
 * 
 * @memberOf EmployeeGroupFormComponent
 */
  onFormClosed(e) {
    this._employeegroupassociationForm.reset(); //clear form.
    this._store.dispatch(new ClearEmployeesLoadingState());
    this._onCancel.emit('false');
  }

  onSiteChange($event: any) {
    if (!isNullOrUndefined($event.SelectedValue) && $event.SelectedValue !== "") {
      let employeeSelectedBySite = this._associatedEmployees.filter((emp) => {
        return emp.Job.SiteId == $event.SelectedValue.toString() && emp.IsDeleted == false;
      });
      this._employeeSelected = mapEmployeesToAeSelectItems(employeeSelectedBySite);
    }
    else {
      let employees = this._associatedEmployees.filter((emp) => {
        return emp.IsDeleted == false;
      });
      this._employeeSelected = mapEmployeesToAeSelectItems(employees);
    }
  }

  searchEmployees($event: any) {
    let siteId = this._employeegroupassociationForm.get('SiteId').value;

    this._employeeSearchService.getEmployeesData($event.query, siteId).first().subscribe((empData) => {
      this._employeeSearchResults = empData;
      this._employees.next(mapEmployeesToAeSelectItems(empData));
    });
  }

  get employeegroupassociationForm(): FormGroup {
    return this._employeegroupassociationForm;
  }

  get locations(): Immutable.List<AeSelectItem<string>> {
    return this._locations;
  }

  get employeeSelected(): AeSelectItem<string>[] {
    return this._employeeSelected;
  }

  get employees(): BehaviorSubject<AeSelectItem<string>[]> {
    return this._employees;
  }

  get remoteDataSourceType(): AeDatasourceType {
    return this._remoteDataSourceType;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  // end of public methods

}
