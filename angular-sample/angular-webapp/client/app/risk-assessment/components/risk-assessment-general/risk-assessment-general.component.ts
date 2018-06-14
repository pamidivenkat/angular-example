import { clearTime } from '../../../help/common/help-helper';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';

import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { LoadSitesAction } from '../../../shared/actions/company.actions';
import { LoadSectorsAction, WorkSpaceTypeLoadAction } from '../../../shared/actions/lookup.actions';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { getAeSelectItemsFromEnum } from '../../../shared/helpers/extract-helpers';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { IFormBuilderVM } from '../../../shared/models/iform-builder-vm';
import { WorkspaceTypes } from '../../../shared/models/lookup.models';
import { Sector } from '../../../shared/models/sector';
import * as fromRoot from '../../../shared/reducers';
import { UserService } from '../../../shared/services/user-services';
import { ReviewPeriod } from '../../common/review-period';
import { RiskAssessmentStatus } from '../../common/risk-assessment-status.enum';
import { RiskAssessment } from '../../models/risk-assessment';
import { RiskAssessmentForm, RiskAssessmentFormFieldWrapper } from '../../models/risk-assessment-form';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { createSelectOptionFromArrayList } from '../../../employee/common/extract-helpers';
import { LoadCompanyStructureAction } from "../../../root-module/actions/company-structure.actions";

@Component({
  selector: 'risk-assessment-general',
  templateUrl: './risk-assessment-general.component.html',
  styleUrls: ['./risk-assessment-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentGeneralComponent extends BaseComponent implements OnInit, OnDestroy {
  private _riskAssessmentForm: FormGroup;
  private _riskAssessmentFormVM: IFormBuilderVM;
  private _formName: string;
  private _isExample: boolean;
  private _currentRiskAssessment: RiskAssessment;
  private _fields: Array<RiskAssessmentFormFieldWrapper<any>>;
  private _siteOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _sitesList: Immutable.List<AeSelectItem<string>>;
  private _riskAssessmentTypes$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _reviewPeriodOptions$: BehaviorSubject<Immutable.List<AeSelectItem<number>>>;
  private _assessorOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _stepSubscription: Subscription;
  private _currentRiskAssessmentSubscription$: Subscription;
  private _context: any;
  private _siteLocationVisibility: BehaviorSubject<boolean>;
  private _siteVisibility: BehaviorSubject<boolean>;
  private _assessorVisibility: BehaviorSubject<boolean>;
  private _assessorNameVisibility: BehaviorSubject<boolean>;
  private _businessAreaVisibility: BehaviorSubject<boolean>;
  private _assessmentDateVisibility: BehaviorSubject<boolean>;
  private _reviewDateVisibility: BehaviorSubject<boolean>;
  private _reviewDateDisplayVisibility: BehaviorSubject<boolean>;
  private _whoIsAtRiskVisibility: BehaviorSubject<boolean>;
  private _howRiskControlledVisibility: BehaviorSubject<boolean>;
  private _workspaceTypes: Array<WorkspaceTypes>;
  private _sectors: Array<Sector>;
  private workspaceAndSectorSubscription: Subscription;
  private _generalForm: FormGroup;
  private _hasAcknowledgementVisibility: BehaviorSubject<boolean>;
  private _allSectorsSubscription: Subscription;
  private _riskAssessmentNameChangeSubscription: Subscription;
  private _riskAssessmentId: string;
  private _isFirstTimeLoaded: boolean = true;
  private _subScriptions: Subscription[] = [];
  private _previousGeneralFormGroup: FormGroup;

  get generalForm(): FormGroup {
    return this._generalForm;
  }
  get workspaceTypes(): Array<WorkspaceTypes> {
    return this._workspaceTypes;
  }
  get riskAssessmentFormVM(): IFormBuilderVM {
    return this._riskAssessmentFormVM;
  }
  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _claimsHelper: ClaimsHelperService
    , private _activatedRoute: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _riskAssessmentService: RiskAssessmentService
    , private _userService: UserService
    , private _datePipe: DatePipe) {
    super(_localeService, _translationService, _cdRef);
    this._currentRiskAssessment = new RiskAssessment();
  }

  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  @Input('isExample')
  get isExample(): boolean {
    return this._isExample;
  }
  set isExample(val: boolean) {
    this._isExample = val;
  }

  @Input('RiskAssessmentTypeId')
  get RiskAssessmentTypeId(): string {
    return this._riskAssessmentId;
  }
  set RiskAssessmentTypeId(val: string) {
    this._riskAssessmentId = val;
  }
  @Input('previousGeneralFormGroup')
  get previousGeneralFormGroup(): FormGroup {
    return this._previousGeneralFormGroup;
  }
  set previousGeneralFormGroup(val: FormGroup) {
    this._previousGeneralFormGroup = val;
  }
  imageLink(pictureId): string {
    return "/filedownload?documentId=" + pictureId + "&isSystem=true"
  }

  onFormInit(fg: FormGroup) {
    this._riskAssessmentForm = fg;
    if (isNullOrUndefined(this._currentRiskAssessment)) { //in add mode    
      this._setDefaultValues();
      this._toggleFieldVisibility(this._riskAssessmentId);
      //here we should patch this form value with that of previous form value we received if that exists
      if (!isNullOrUndefined(this._previousGeneralFormGroup)) {
        Object.keys(this._previousGeneralFormGroup.controls).forEach(previousCtrl => {
          //need to skip the RiskAssessmentTypeId value          
          let existingControl = this._riskAssessmentForm.get(previousCtrl);
          if (!isNullOrUndefined(existingControl) && previousCtrl != "RiskAssessmentTypeId") {
            existingControl.patchValue(this._previousGeneralFormGroup.controls[previousCtrl].value);
            existingControl.updateValueAndValidity();
          }
        });
      }
    }
    else {
      this._setFormValues();
      this._initWorkSpaceFormGroup(this._currentRiskAssessment.RiskAssessmentWorkspaceTypes);
      if (this._isExample) {
        this._initSectorsFormGroup(this._currentRiskAssessment.RiskAssessmentSectors);
      }
      this._toggleFieldVisibility(this._riskAssessmentId);
    }

    if (!isNullOrUndefined(this._riskAssessmentForm.get('SiteId'))) {
      this._riskAssessmentForm.get('SiteId').valueChanges.takeUntil(this._destructor$).subscribe((newVal) => {
        if (newVal === '0') {
          this._siteLocationVisibility.next(true);
        }
        else {
          this._siteLocationVisibility.next(false);
        }
      });
    }

    if (!isNullOrUndefined(this._riskAssessmentForm.get('RiskAssessmentTypeId'))) {
      this._riskAssessmentForm.get('RiskAssessmentTypeId').valueChanges.takeUntil(this._destructor$).subscribe((newVal) => {
        this._changeRiskAssessmentType.emit(this._riskAssessmentForm);
        this._riskAssessmentService.setRiskAssessmentType(newVal);
      });
    }

    if (!isNullOrUndefined(this._riskAssessmentForm.get('AssessmentDate'))) {
      this._riskAssessmentForm.get('AssessmentDate').valueChanges.takeUntil(this._destructor$).subscribe((newVal) => {
        let reviewPeriod: ReviewPeriod;
        reviewPeriod = !isNullOrUndefined(this._riskAssessmentForm.get('ReviewPeriod')) ? (<ReviewPeriod>(this._riskAssessmentForm.get('ReviewPeriod').value)) : ReviewPeriod.Annually;
        let showReviewDateField = (Number(reviewPeriod) === ReviewPeriod.Custom);
        this._updateReviewDate(showReviewDateField, false);
      });
    }
    if (!isNullOrUndefined(this._riskAssessmentForm.get('ReviewPeriod'))) {
      this._riskAssessmentForm.get('ReviewPeriod').valueChanges.takeUntil(this._destructor$).subscribe((newVal) => {
        let showReviewDateField = (Number(newVal) === ReviewPeriod.Custom);
        this._updateReviewDate(showReviewDateField, true);
      });
    }
    this._riskAssessmentNameChangeSubscription = this._riskAssessmentForm.get('Name').valueChanges.takeUntil(this._destructor$).subscribe((val) => {
      this._riskAssessmentService.setRiskAssessmentName(val);
    });

  }

  onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  private _updateReviewDate(showReviewDateField: boolean, updateReviewDate: boolean) {
    this._reviewDateVisibility.next(showReviewDateField && !this._isExample);
    this._reviewDateDisplayVisibility.next(!showReviewDateField && !this._isExample);
    if (!showReviewDateField && !this._isExample) {
      let reviewDateDisplayField = this._fields.find(f => f.field.name === 'ReviewDateDisplay');
      if (!isNullOrUndefined(reviewDateDisplayField)) {
        let reviewDateFieldValue = <BehaviorSubject<string>>reviewDateDisplayField.context.getContextData().get('displayValue');
        let dateValue = <Date>this._calculateReviewDate(updateReviewDate);
        reviewDateFieldValue.next(this._datePipe.transform(dateValue, 'dd/MM/yyyy'));
      }
    }
    if (showReviewDateField && !this.isExample) {
      let assessmentDateField = this._fields.find(f => f.field.name === 'AssessmentDate');
      if (!isNullOrUndefined(assessmentDateField) && !this._isExample) {
        if (this._riskAssessmentForm) {
          if (!isNullOrUndefined(this._riskAssessmentForm.get('ReviewDate'))) {
            this._riskAssessmentForm.get('ReviewDate').setValue(new Date(this._calculateReviewDate(updateReviewDate)));
          }
        }
      }
    }

  }

  private _calculateReviewDate(updateReviewDate: boolean) {
    if (isNullOrUndefined(this._riskAssessmentForm)) return;
    let dateFormValue = this._riskAssessmentForm.get('AssessmentDate').value;
    if (!dateFormValue) return;
    let assessmentDate = new Date(dateFormValue);
    let reviewPeriod: ReviewPeriod = <ReviewPeriod>(this._riskAssessmentForm.get('ReviewPeriod') ? Number(this._riskAssessmentForm.get('ReviewPeriod').value) : ReviewPeriod.Annually);
    let reviewDate: Date;
    switch (reviewPeriod) {
      case ReviewPeriod.Daily:
        reviewDate = this._addDaysToDate(assessmentDate, 1);
        break;
      case ReviewPeriod.Weekly:
        reviewDate = this._addDaysToDate(assessmentDate, 7);
        break;
      case ReviewPeriod.Monthly:
        reviewDate = this._addDaysToDate(assessmentDate, 30);
        break;
      case ReviewPeriod.Annually:
        reviewDate = this._addDaysToDate(assessmentDate, 365);
        break;
      case ReviewPeriod.Custom:
        if (this._currentRiskAssessment && !updateReviewDate) {
          reviewDate = !isNullOrUndefined(this._currentRiskAssessment.ReviewDate) ? this._currentRiskAssessment.ReviewDate : new Date();
        }
        else {
          reviewDate = updateReviewDate ? assessmentDate : new Date();
        }
        break;
    }
    return reviewDate;

  }

  private _addDaysToDate(date: Date, days: number) {
    date.setDate(date.getDate() + days);
    return date;
  }

  private _setFormValues() {
    if (isNullOrUndefined(this._riskAssessmentForm) || isNullOrUndefined(this._currentRiskAssessment)) return;
    this._riskAssessmentForm.patchValue({
      Name: this._currentRiskAssessment.Name,
      Description: this._currentRiskAssessment.Description,
      AssessorId: this._currentRiskAssessment.AssessorId,
      Assessor_Name: this._currentRiskAssessment.Assessor_Name || null,
      Mig_WhoIsAtRisk: this._currentRiskAssessment.Mig_WhoIsAtRisk || null,
      Mig_HowRiskControlled: this._currentRiskAssessment.Mig_HowRiskControlled || null,
      BusinessArea: this._currentRiskAssessment.BusinessArea || null,
      ReferenceNumber: this._currentRiskAssessment.ReferenceNumber,
      RiskAssessmentTypeId: this._riskAssessmentId,
      SiteId: !StringHelper.isNullOrUndefinedOrEmpty(this._currentRiskAssessment.SiteLocation) ? '0' : this._currentRiskAssessment.SiteId,
      SiteLocation: this._currentRiskAssessment.SiteLocation || null,
      AssessmentDate: this._getAssessmentDate(),
      ReviewPeriod: this._currentRiskAssessment.ReviewPeriod,
      HasAcknowledgement: this._currentRiskAssessment.HasAcknowledgement,
      StartDate: this._currentRiskAssessment.ReviewDate == null ? null : new Date(this._currentRiskAssessment.ReviewDate)
    });
  }

  private _setDefaultValues() {
    if (!isNullOrUndefined(this._riskAssessmentForm)) {
      if (!this._isExample) {
        this._setFieldValue('AssessmentDate', new Date());
        this._setFieldValue('ReviewPeriod', ReviewPeriod.Annually);
      }

      this._setFieldValue('RiskAssessmentTypeId', this._riskAssessmentId);
      this._setFieldValue('ReviewPeriod', ReviewPeriod.Annually);
    }
  }

  //reset assessment date to today if the date is past.
  private _getAssessmentDate(): Date {
    let today = clearTime(new Date());
    if (!isNullOrUndefined(this._currentRiskAssessment.AssessmentDate)) {
      let assessmentDate = clearTime(new Date(this._currentRiskAssessment.AssessmentDate));
      return assessmentDate < today ? new Date() : new Date(this._currentRiskAssessment.AssessmentDate); //reset assessment date to today if the date is past.
    } else {
      return new Date();
    }
  }

  private _setFieldValue(fieldName: string, value: any) {
    let field = this._riskAssessmentForm.get(fieldName);
    if (!isNullOrUndefined(field)) {
      this._riskAssessmentForm.get(fieldName).setValue(value);
    }
  }

  private _getVisibility() {

    let siteField = this._fields.find(f => f.field.name === 'SiteId');
    if (!isNullOrUndefined(siteField)) {
      this._siteVisibility = <BehaviorSubject<boolean>>siteField.context.getContextData().get('propertyValue');
    }

    let siteLocationField = this._fields.find(f => f.field.name === 'SiteLocation');
    if (!isNullOrUndefined(siteLocationField)) {
      this._siteLocationVisibility = <BehaviorSubject<boolean>>siteLocationField.context.getContextData().get('propertyValue');
    }

    let assessorField = this._fields.find(f => f.field.name === 'AssessorId');
    if (!isNullOrUndefined(assessorField)) {
      this._assessorVisibility = <BehaviorSubject<boolean>>assessorField.context.getContextData().get('propertyValue');
    }

    let assessorNameField = this._fields.find(f => f.field.name === 'Assessor_Name');
    if (!isNullOrUndefined(assessorNameField)) {
      this._assessorNameVisibility = <BehaviorSubject<boolean>>assessorNameField.context.getContextData().get('propertyValue');
    }

    let businessAreaField = this._fields.find(f => f.field.name === 'BusinessArea');
    if (!isNullOrUndefined(businessAreaField)) {
      this._businessAreaVisibility = <BehaviorSubject<boolean>>businessAreaField.context.getContextData().get('propertyValue');
    }

    let assessmentDateField = this._fields.find(f => f.field.name === 'AssessmentDate');
    if (!isNullOrUndefined(assessmentDateField)) {
      this._assessmentDateVisibility = <BehaviorSubject<boolean>>assessmentDateField.context.getContextData().get('propertyValue');
    }

    let reviewDateField = this._fields.find(f => f.field.name === 'ReviewDate');
    if (!isNullOrUndefined(reviewDateField)) {
      this._reviewDateVisibility = <BehaviorSubject<boolean>>reviewDateField.context.getContextData().get('propertyValue');
    }

    let reviewDateDisplayField = this._fields.find(f => f.field.name === 'ReviewDateDisplay');
    if (!isNullOrUndefined(reviewDateDisplayField)) {
      this._reviewDateDisplayVisibility = <BehaviorSubject<boolean>>reviewDateDisplayField.context.getContextData().get('propertyValue');
    }

    let whoIsAtRiskField = this._fields.find(f => f.field.name === 'Mig_WhoIsAtRisk');
    if (!isNullOrUndefined(whoIsAtRiskField)) {
      this._whoIsAtRiskVisibility = <BehaviorSubject<boolean>>whoIsAtRiskField.context.getContextData().get('propertyValue');
    }

    let howRiskControlledField = this._fields.find(f => f.field.name === 'Mig_HowRiskControlled');
    if (!isNullOrUndefined(howRiskControlledField)) {
      this._howRiskControlledVisibility = <BehaviorSubject<boolean>>howRiskControlledField.context.getContextData().get('propertyValue');
    }

    let hasAcknowledgement = this._fields.find(f => f.field.name === 'HasAcknowledgement');
    if (!isNullOrUndefined(hasAcknowledgement)) {
      this._hasAcknowledgementVisibility = <BehaviorSubject<boolean>>hasAcknowledgement.context.getContextData().get('propertyValue');
    }


  }

  private _setVisibility() {
    let isMigrated = this._isMigrated(this._riskAssessmentId);
    let isCoshh = this._isCoshh(this._riskAssessmentId);
    this._assessorNameVisibility.next(isMigrated);
    this._whoIsAtRiskVisibility.next(isMigrated);
    this._howRiskControlledVisibility.next(isMigrated);
    this._assessorVisibility.next((!isMigrated && !this._isExample));
    this._businessAreaVisibility.next(isCoshh);
  }

  private _bindDropdownData() {
    let riskAssessmnetTypeField = this._fields.find(f => f.field.name === 'RiskAssessmentTypeId');
    if (!isNullOrUndefined(riskAssessmnetTypeField)) {
      this._riskAssessmentTypes$ = riskAssessmnetTypeField.context.getContextData().get('options');
      let sub = this._store.let(fromRoot.getRiskAssessmentTypesData).subscribe((res) => {
        if (!isNullOrUndefined(res)) {
          this._riskAssessmentTypes$.next(res);
        }
        else {
          this._riskAssessmentService._loadRiskAssessmentTypes();
        }
      });
      this._subScriptions.push(sub);
    }
    let siteField = this._fields.find(f => f.field.name === 'SiteId');
    if (!isNullOrUndefined(siteField)) {
      this._siteOptions$ = siteField.context.getContextData().get('options');
      let sub = this._store.let(fromRoot.getSiteStructureData).subscribe((res) => {
        if (!isNullOrUndefined(res)) {
          let sites = res.sort((a, b) => a.Name.localeCompare(b.Name));
          let sitesList = createSelectOptionFromArrayList(sites, "Id", "Name");
          sitesList.push(new AeSelectItem<string>('Select New Affected Site Location', '0'));
          this._siteOptions$.next(Immutable.List<AeSelectItem<string>>(sitesList));
        } else {
          this._store.dispatch(new LoadCompanyStructureAction(true));
        }
      });
      this._subScriptions.push(sub);
    }


    let reviewPeriodField = this._fields.find(f => f.field.name === 'ReviewPeriod');
    if (!isNullOrUndefined(reviewPeriodField)) {
      this._reviewPeriodOptions$ = reviewPeriodField.context.getContextData().get('options');
      this._reviewPeriodOptions$.next(getAeSelectItemsFromEnum(ReviewPeriod));
    }

    let assessorField = this._fields.find(f => f.field.name === 'AssessorId');
    if (!isNullOrUndefined(assessorField)) {
      this._assessorOptions$ = assessorField.context.getContextData().get('options');
      if (!isNullOrUndefined(this._currentRiskAssessment) && this._currentRiskAssessment.Id) {
        let cid = this._currentRiskAssessment && this._currentRiskAssessment.CompanyId;
        this._userService.getUsersList(cid).first().subscribe((data) => {
          (assessorField.context.getContextData().get('options')).next(Immutable.List(data));
        });
      } else {
        this._userService.getUsersList(null).first().subscribe((data) => {
          (assessorField.context.getContextData().get('options')).next(Immutable.List(data));
        });
      }
    }
  }

  private _initGeneralForm() {
    this._generalForm = this._fb.group({
      SelectALL: [{ value: null, disabled: false }],
      WorkspaceTypes: this._fb.array([]),
      Sectors: this._fb.array([])
    });
  }

  private _initWorkSpaceFormGroup(_selectedWorkspaces: WorkspaceTypes[]) {
    if (isNullOrUndefined(this._workspaceTypes) || isNullOrUndefined(_selectedWorkspaces)) return;
    this._generalForm.controls['WorkspaceTypes'] = this._fb.array([]);
    let formArray = <FormArray>this._generalForm.controls['WorkspaceTypes'];
    this._workspaceTypes.forEach(workSpace => {
      let isSelected = false;
      let itemSelected = _selectedWorkspaces.find(x => x.Id === workSpace.Id);
      if (!isNullOrUndefined(itemSelected)) {
        isSelected = true;
      }
      workSpace.isSelected = isSelected;
      formArray.push(this._initWorkSpace(workSpace));
    });
    for (let formGroupIndex in formArray.controls) {
      let formGroup = <FormGroup>formArray.controls[formGroupIndex];
      for (let name in formGroup.controls) {
        let element = formGroup.controls[name];
        let sub = element.valueChanges.subscribe((value) => {
          this._workspaceTypes[formGroupIndex][name] = value;
          this._generalForm.updateValueAndValidity();
        });
        this._subScriptions.push(sub);
      }
    }
    this._cdRef.markForCheck();
  }
  private _initSectorsFormGroup(_selectedSectors: Sector[]) {
    if (isNullOrUndefined(this._sectors) || isNullOrUndefined(_selectedSectors)) return;
    this._generalForm.controls['Sectors'] = this._fb.array([]);
    let formArray = <FormArray>this._generalForm.controls['Sectors'];
    this._sectors.forEach(sector => {
      let isSelected = false;
      let itemSelected = _selectedSectors.find(x => x.Id === sector.Id);
      if (!isNullOrUndefined(itemSelected)) {
        isSelected = true;
      }
      sector.isSelected = isSelected;
      formArray.push(this._initSectors(sector));
    });
    for (let formGroupIndex in formArray.controls) {
      let formGroup = <FormGroup>formArray.controls[formGroupIndex];
      for (let name in formGroup.controls) {
        let element = formGroup.controls[name];
        let sub = element.valueChanges.subscribe((value) => {
          this._sectors[formGroupIndex][name] = value;
          this._generalForm.updateValueAndValidity();
        });
        this._subScriptions.push(sub);
      }
    }
    this._cdRef.markForCheck();
  }

  private _initWorkSpace(checklistWorkspaceTypes: WorkspaceTypes) {
    return this._fb.group({
      Id: [{ value: checklistWorkspaceTypes.Id, disabled: false }],
      Name: [{ value: checklistWorkspaceTypes.Name, disabled: false }],
      PictureId: [{ value: checklistWorkspaceTypes.PictureId, disabled: false }],
      isSelected: [{ value: checklistWorkspaceTypes.isSelected, disabled: false }],
    });
  }
  private _initSectors(sector: Sector) {
    return this._fb.group({
      Id: [{ value: sector.Id, disabled: false }],
      Name: [{ value: sector.Name, disabled: false }],
      PictureId: [{ value: sector.PictureId, disabled: false }],
      isSelected: [{ value: sector.isSelected, disabled: false }],
    });
  }

  get IsExampleRiskAssessment(): boolean {
    return this._isExample;
  }

  private _isMigrated(riskAssessmentTypeId: string) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(riskAssessmentTypeId)) {
      return ((riskAssessmentTypeId.toLowerCase() === fromConstants.coshhMigratedRiskAssessmentTypeId.toLowerCase())
        || (riskAssessmentTypeId.toLowerCase() === fromConstants.generalMigratedRiskAssessmentTypeId));
    }

    return false;
  }

  private _isCoshh(riskAssessmentTypeId: string) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(riskAssessmentTypeId)) {
      return ((riskAssessmentTypeId.toLowerCase() === fromConstants.coshhMigratedRiskAssessmentTypeId.toLowerCase())
        || (riskAssessmentTypeId.toLowerCase() === fromConstants.coshhRiskAssessmentTypeId));
    }

    return false;
  }

  private _toggleFieldVisibility(riskAssessmentTypeId: string) {
    this._siteVisibility.next(!this.isExample);
    this._assessorVisibility.next(!this.isExample);
    this._assessmentDateVisibility.next(!this.isExample);
    this._hasAcknowledgementVisibility.next(!this.isExample);
    if (!this.isExample) {
      if (this._currentRiskAssessment && this._currentRiskAssessment.ReviewPeriod == ReviewPeriod.Custom) {
        this._updateReviewDate(true, false);
      }
      else {
        this._updateReviewDate(false, true);
      }
    }

    let isMigrated = this._isMigrated(riskAssessmentTypeId);
    let isCoshh = this._isCoshh(riskAssessmentTypeId);

    this._assessorNameVisibility.next(isMigrated);
    this._whoIsAtRiskVisibility.next(isMigrated && !isCoshh);
    this._howRiskControlledVisibility.next(isMigrated && !isCoshh);
    this._assessorVisibility.next((!isMigrated && !this._isExample));
    this._businessAreaVisibility.next(isCoshh);
    if (!isNullOrUndefined(this._currentRiskAssessment) && this._currentRiskAssessment.SiteLocation) {
      this._siteLocationVisibility.next(true);
    }
  }
  //OutPut bindings
  @Output('changeRiskAssessmentType') _changeRiskAssessmentType = new EventEmitter<any>();

  ngOnInit() {
    let isMigrated = this._isMigrated(this._riskAssessmentId);
    this._formName = 'add-update-risk-assessment-general-form';
    this._riskAssessmentFormVM = new RiskAssessmentForm(this._formName, this._isExample, isMigrated);
    this._initGeneralForm();
    this._fields = this._riskAssessmentFormVM.init();
    this._getVisibility();
    this._setVisibility();
    this._stepSubscription = this._context.submitEvent.subscribe((val) => {
      if (val) {
        this._currentRiskAssessment = Object.assign({}, this._currentRiskAssessment, <RiskAssessment>this._riskAssessmentForm.value);
        this._currentRiskAssessment.StatusId = this._isExample ? RiskAssessmentStatus.Example : RiskAssessmentStatus.Pending;
        this._currentRiskAssessment.IsExample = this._isExample;
        this._currentRiskAssessment.RiskAssessmentWorkspaceTypes = this._workspaceTypes.filter(f => f.isSelected === true);
        if (this._isExample) {
          this._currentRiskAssessment.AssessmentDate = new Date();
          this._currentRiskAssessment.ReviewDate = new Date();
          this._currentRiskAssessment.RiskAssessmentSectors = this._sectors.filter(f => f.isSelected === true);
        } else {
          if (!isNullOrUndefined(this._currentRiskAssessment.AssessmentDate)) {
            let assmentDtString = this._currentRiskAssessment.AssessmentDate.toString().split('+');
            this._currentRiskAssessment.AssessmentDate = assmentDtString[0];
          }
          if (this._currentRiskAssessment.ReviewPeriod != ReviewPeriod.Custom) {
            this._currentRiskAssessment.ReviewDate = this._calculateReviewDate(true);
          }

        }
        if (isNullOrUndefined(this._currentRiskAssessment.Id)) {
          this._riskAssessmentService._createRiskAssessment(this._currentRiskAssessment);
        }
        else {
          // SiteLocation needs to be null on selecting site other than 'New affected site location'
          if (this._currentRiskAssessment.SiteId !== "0") {
            this._currentRiskAssessment.SiteLocation = null;
          }
          this._riskAssessmentService._updateRiskAssessment(this._currentRiskAssessment);
        }

      }
    });

    this._currentRiskAssessmentSubscription$ = this._store.let(fromRoot.getCurrentRiskAssessment).subscribe((riskassessment) => {
      this._currentRiskAssessment = riskassessment;
      this._bindDropdownData();
      if (!isNullOrUndefined(riskassessment)) {
        this._setFormValues();
        this._toggleFieldVisibility(this._riskAssessmentId);
        this._initWorkSpaceFormGroup(this._currentRiskAssessment.RiskAssessmentWorkspaceTypes);
        if (this._isExample) {
          this._initSectorsFormGroup(this._currentRiskAssessment.RiskAssessmentSectors);
        }
      }
      else {
        this._setDefaultValues();
        this._toggleFieldVisibility(this._riskAssessmentId);
      }
    });

    let workspaces$ = this._store.let(fromRoot.getWorkSpaceTypeOptionListData);
    let sectors$ = this._store.let(fromRoot.getsectorsData);

    let workspaceAndSectorData = Observable.combineLatest(workspaces$, sectors$, (workspaces, sectors) => {
      if (isNullOrUndefined(workspaces)) {
        this._store.dispatch(new WorkSpaceTypeLoadAction(true));
      }
      if (isNullOrUndefined(sectors) && this._isExample) {
        this._store.dispatch(new LoadSectorsAction(true));
      }
      if (!isNullOrUndefined(workspaces)) {
        this._workspaceTypes = workspaces.sort((a, b) => a.Name.localeCompare(b.Name));
        let selectedWorkspaces = !isNullOrUndefined(this._currentRiskAssessment) ? this._currentRiskAssessment.RiskAssessmentWorkspaceTypes : [];
        this._initWorkSpaceFormGroup(selectedWorkspaces);
        if (!isNullOrUndefined(sectors)) {
          this._sectors = sectors;
          let selectedSectors = !isNullOrUndefined(this._currentRiskAssessment) ? this._currentRiskAssessment.RiskAssessmentSectors : [];
          this._initSectorsFormGroup(selectedSectors);
        }
      }
    });

    this.workspaceAndSectorSubscription = workspaceAndSectorData.subscribe();

    this._allSectorsSubscription = this._generalForm.get("SelectALL").valueChanges.subscribe((value) => {
      if (this._isExample && !isNullOrUndefined(this._sectors)) {
        for (var i = 0; i < this._sectors.length; i++) {
          if (value)
            this._sectors[i].isSelected = true;
          else
            this._sectors[i].isSelected = false;
        }
      }

    });
  }

  ngOnDestroy() {
    if (this._subScriptions) {
      this._subScriptions.forEach(sub => {
        if (sub) {
          sub.unsubscribe();
        }
      });
    }
    if (this._stepSubscription) {
      this._stepSubscription.unsubscribe();
    }
    if (this._currentRiskAssessmentSubscription$) {
      this._currentRiskAssessmentSubscription$.unsubscribe();
    }
    if (this.workspaceAndSectorSubscription) {
      this.workspaceAndSectorSubscription.unsubscribe();
    }
    if (this._allSectorsSubscription) {
      this._allSectorsSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

}