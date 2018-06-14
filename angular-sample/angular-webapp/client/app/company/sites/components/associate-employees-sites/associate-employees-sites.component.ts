import { Identity } from './../../../../shared/models/identity';
import { select } from '@ngrx/core';
import { AssociatedEmployees } from './../../../../employee/models/employee-group-association.model';
import { IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { FormGroup } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Site } from '../../models/site.model';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Store } from "@ngrx/store";
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AssociateEmployeeForm } from "./../../models/associate-employee-form";
import { extractAeSelectItemEmployee } from "../../common/extract-helper";

@Component({
  selector: 'associate-employees-sites',
  templateUrl: './associate-employees-sites.component.html',
  styleUrls: ['./associate-employees-sites.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AssociateEmployeesSitesComponent extends BaseComponent implements OnInit {

  // Private Fields
  private _siteDetails: Site;
  private _allEmployeeOptionsList: BehaviorSubject<AeSelectItem<string>[]>;
  private _associateEmployeeFormVM: AssociateEmployeeForm;
  private _associateEmployeeForm: FormGroup;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _empData: Array<any>;
  private _empDataFilter: Array<any>;

  // End of Private Fields

  // Output Events
  @Output('aesClose')
  _aesClose: EventEmitter<any> = new EventEmitter<any>();

  @Output('aesSave')
  _aesSave: EventEmitter<any> = new EventEmitter<any>();
  // Output Events

  // Getters
  // Input Properties
  @Input('siteDetails')
  get siteDetails(): Site {
    return this._siteDetails
  }
  set siteDetails(val: Site) {
    this._siteDetails = val;
  }
  // End of Input Properties


  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of Constructor

  private _patchForm() {
    if (!isNullOrUndefined(this._empData)) {
      this._empDataFilter = this._empData.filter((data) => { return data.SiteId === this._siteDetails.Id });
      if (!isNullOrUndefined(this._empDataFilter)) {
        let currentSiteEmp = extractAeSelectItemEmployee(this._empDataFilter);
        this._associateEmployeeForm.patchValue({
          Employee: (!isNullOrUndefined(currentSiteEmp)) ? currentSiteEmp : null,
        });
        this._cdRef.markForCheck();
      }
    }
  }

  getTitle(): string {
    return `Associate to site: ` + this._siteDetails.Name;
  }

  onFormInit(fg: FormGroup) {
    this._associateEmployeeForm = fg;
    this._patchForm();
  }

  onFormValidityChange(status: boolean) {
  }

  onassociateEmployeeFormCancel($event) {
    this._aesClose.emit(false);
  }

  onassociateEmployeeFormSubmitted($event) {
    if (!this._associateEmployeeForm.pristine) {
      let myArray = this._associateEmployeeForm.value['Employee'];

        let removedEmp = this._empDataFilter.filter(function (el) {
         return !myArray.includes(el.Id);
       });

      let addedEmp = (<Array<string>>myArray).filter(el => {
        let index = this._empDataFilter.findIndex(e => e.Id === el);
        return (index < 0);
      });

      let empList = [];
      addedEmp.map((element) => {
        let empDataFilter = this._empData.filter((data) => { return data.Id == element });
        let selectedData = {
          "Id": empDataFilter[0].Id,
          "FullName": empDataFilter[0].Name,
          "HasUser": true,
          "Job": { 'DepartmentId': empDataFilter[0].DepartmentId, "SiteId": this._siteDetails.Id, "Id": empDataFilter[0].JobId, "SiteName": this._siteDetails.Name },
          "isUpdated": 1
        }
        empList.push(selectedData);
      });
      removedEmp.map((element) => {
        let selectedData = {
          "Id": element.Id,
          "FullName": element.Name,
          "HasUser": true,
          "Job": { 'DepartmentId': element.DepartmentId, "SiteId": null, "Id": element.JobId, "SiteName": null },
          "isUpdated": 1
        }
        empList.push(selectedData);
      });
      let finalData = { 'EmployeeList': empList }
      this._aesSave.emit(finalData);
    }
    else{
      this._aesClose.emit(false);
    }
  }
  get associateEmployeeFormVM() {
    return this._associateEmployeeFormVM;
  }

  // Public Methods
  ngOnInit() {
    this._associateEmployeeFormVM = new AssociateEmployeeForm('AssociateEmployeeForm');
    this._formFields = this._associateEmployeeFormVM.init();
    this._store.let(fromRoot.getCompanyEmployeesData).takeUntil(this._destructor$).subscribe((emp) => {
      if (!isNullOrUndefined(emp)) {
        this._empData = emp;
        let autoSuggestData = extractAeSelectItemEmployee(emp);
        let employeeField = this._formFields.find(f => f.field.name === 'Employee');
        if (!isNullOrUndefined(employeeField)) {
          (<BehaviorSubject<AeSelectItem<string>[]>>employeeField.context.getContextData().get('items')).next(autoSuggestData);
        }
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
  // End of Public Methods

}