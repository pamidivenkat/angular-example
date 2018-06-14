import { CommonValidators } from './../../../../shared/validators/common-validators';
import { createSelectOptionFromArrayList } from '../../../../employee/common/extract-helpers';
import { isNullOrUndefined, error } from 'util';
import { FormGroup } from '@angular/forms';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { MethodStatement } from './../../../models/method-statement';
import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { Subscription, Observable, BehaviorSubject } from 'rxjs/Rx';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeSelectItem } from "./../../../../atlas-elements/common/models/ae-select-item";
import { MethodStatementGeneralForm } from './../../../models/methodstatement-general.form';

@Component({
  selector: 'general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralComponent extends BaseComponent implements OnInit, OnDestroy {


  // Private Fields
  private _context: any;
  private _isExample: any;
  private _sitesSubscription: Subscription;
  private _methodStatement: MethodStatement = new MethodStatement();
  private _methodStatementGeneralFormVM: IFormBuilderVM;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _addUpdateMsGeneralForm: FormGroup;
  private _msSubscription: Subscription;
  private _submitEventSubscription: Subscription;
  private _siteOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _sitesList: Immutable.List<AeSelectItem<string>>;
  private _siteLocationVisibility: BehaviorSubject<boolean>;
  private _siteChangeSubscription: Subscription;
  // End of Private Fields

  // Public properties

  get methodStatementGeneralFormVM(): IFormBuilderVM {
    return this._methodStatementGeneralFormVM;
  }
  @Input('context')
  set context(val: any) {
    this._context = val;
  }
  get context() {
    return this._context;
  }
  @Input('isExample')
  set isExample(val: any) {
    this._isExample = val;
  }
  get isExample() {
    return this._isExample;
  }

  get addUpdateMsGeneralForm() {
    return this._addUpdateMsGeneralForm;
  }
  get formFields() {
    return this._formFields;
  }
  get siteOptions() {
    return this._siteOptions$;
  }

  // End of Public properties

  // Public Output bindings
  @Output('onAeSubmit') _onAeSubmit: EventEmitter<MethodStatement> = new EventEmitter<MethodStatement>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods 
  public onSubmit($event) {
    if (this._addUpdateMsGeneralForm.valid && !this._addUpdateMsGeneralForm.pristine) {
      let msToSave: MethodStatement = Object.assign({}, this._methodStatement, <MethodStatement>this._addUpdateMsGeneralForm.value);
      if (this._isExample) {
        msToSave.IsExample = true;
      }
      msToSave.MSOtherRiskAssessments = null;
      msToSave.MSPPE = null;
      msToSave.MSProcedures = null;
      msToSave.MSRiskAssessmentMap = null;
      msToSave.MSSafetyResponsibilities = null;
      if (!isNullOrUndefined(msToSave.Site) && msToSave.SiteId !== msToSave.Site.Id) {
        msToSave.Site = null;
      }
      this._onAeSubmit.emit(msToSave);
    }
  }


  public _patchForm(msModel: MethodStatement) {
    let SiteId: AeSelectItem<string>[] = [];
    if (this._addUpdateMsGeneralForm) {
      if (this._isExample) {
        this._addUpdateMsGeneralForm.patchValue({
          Name: msModel.Name,
          Description: msModel.Description,
        });
      } else {
        this._addUpdateMsGeneralForm.patchValue({
          Name: msModel.Name,
          StartDate: msModel.StartDate == null ? null : new Date(msModel.StartDate),
          EndDate: msModel.EndDate == null ? null : new Date(msModel.EndDate),
          SiteId: msModel.SiteId,
          NewLocationOfWork: msModel.NewLocationOfWork,
          ClientName: msModel.ClientName,
          ClientAddress: msModel.ClientAddress,
          ClientTelephoneNumber: msModel.ClientTelephoneNumber,
          ClientReference: msModel.ClientReference,
          ProjectReference: msModel.ProjectReference,
          SiteSupervisor: msModel.SiteSupervisor,
          SiteSupervisorTelephone: msModel.SiteSupervisorTelephone,
          PrincipalDesigner: msModel.PrincipalDesigner,
          PrincipalContractor: msModel.PrincipalContractor,
          Description: msModel.Description,
        });
        if (msModel.SiteId === null && !isNullOrUndefined(msModel)) {
          this._addUpdateMsGeneralForm.get('SiteId').setValue(9999);
          this._siteLocationVisibility.next(true);
          this._addUpdateMsGeneralForm.get('NewLocationOfWork').setValue(msModel.NewLocationOfWork);
        }
      }
    }
  }
  // End of private methods

  // Public methods
  onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  public onFormInit(fg: FormGroup) {
    this._addUpdateMsGeneralForm = fg;
    this._addUpdateMsGeneralForm.get('EndDate').setValidators(CommonValidators.dateCompare(this._addUpdateMsGeneralForm.get('StartDate'), (base, target) => {
      if (target > base) {
        return false;
      } else {
        return true;
      }

    }));

    let siteLocationField = this._formFields.find(f => f.field.name === 'NewLocationOfWork');
    this._siteLocationVisibility = <BehaviorSubject<boolean>>siteLocationField.context.getContextData().get('propertyValue');
    if (!isNullOrUndefined(this._addUpdateMsGeneralForm.get('SiteId'))) {
      this._siteChangeSubscription = this._addUpdateMsGeneralForm.get('SiteId').valueChanges.subscribe((newVal) => {
        if (newVal === '9999') {
          this._siteLocationVisibility.next(true);
        }
        else {
          this._siteLocationVisibility.next(false);
        }
      });
    }

    this._patchForm(this._methodStatement);
    if (this._isExample) {
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'StartDate').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'EndDate').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'SiteId').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'ClientName').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'ClientAddress').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'ClientTelephoneNumber').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'ClientReference').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'ProjectReference').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'SiteSupervisor').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'SiteSupervisorTelephone').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'PrincipalDesigner').context.getContextData().get('propertyValue').next(false);
      <BehaviorSubject<boolean>>this._formFields.find(f => f.field.name === 'PrincipalContractor').context.getContextData().get('propertyValue').next(false);
    }
  }

  ngOnInit() {

    this._formName = 'MethodStatementGeneral';
    this._methodStatementGeneralFormVM = new MethodStatementGeneralForm(this._formName, this._methodStatement, this._isExample);
    this._formFields = this._methodStatementGeneralFormVM.init();


    this._submitEventSubscription = this._context.submitEvent.subscribe((value) => {
      if (value) {
        this.onSubmit(null);
      }
    });

    let siteField = this._formFields.find(f => f.field.name === 'SiteId');
    if (!isNullOrUndefined(siteField)) {
      this._siteOptions$ = siteField.context.getContextData().get('options');
      //Subscription to get Site Location Option Data, using existing effect
      this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe((res) => {
        if (!isNullOrUndefined(res)) {
          let siteList = createSelectOptionFromArrayList(res, "Id", "Name");
          siteList.push(new AeSelectItem<string>('New Location of Work', '9999', false));
          this._sitesList = Immutable.List<AeSelectItem<string>>(siteList);
          this._siteOptions$.next(this._sitesList);
        } else {
          this._store.dispatch(new LoadSitesAction(false));
        }
      });
    }

    this._msSubscription = this._store.let(fromRoot.getManageMethodStatementData).subscribe((ms) => {
      if (ms) {
        this._methodStatement = ms;
        this._patchForm(ms);
      }
    });



  }
  ngOnDestroy() {
    if (this._msSubscription) {
      this._msSubscription.unsubscribe();
    }
    if (this._sitesSubscription) {
      this._sitesSubscription.unsubscribe();
    }
    if (this._submitEventSubscription) {
      this._submitEventSubscription.unsubscribe();
    }
    if (this._siteChangeSubscription) {
      this._siteChangeSubscription.unsubscribe();
    }
  }
  // End of public methods
}
