import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { Site } from './../../../../company/sites/models/site.model';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { emptyGuid } from './../../../../shared/app.constants';
import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { RiskAssessment } from './../../../../risk-assessment/models/risk-assessment';
import { AeTemplateComponent } from './../../../../atlas-elements/ae-template/ae-template.component';
import { UserService } from './../../../../shared/services/user-services';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { RiskAssessmentSearchService } from './../../../../risk-assessment/services/risk-assessment-search-service';
import { FormGroup } from '@angular/forms';
import { CppGeneralForm } from './../../../models/cpp-general.form';
import { ConstructionPhasePlan, CPPSafetyPrecautions, CPPEvent } from './../../../models/construction-phase-plans';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Subscription';
import { AeWizardStep } from './../../../../atlas-elements/common/models/ae-wizard-step';
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input, ViewChild, asNativeElements } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { mapRAKeyValuesToAeSelectItems } from "./../../../../risk-assessment/common/extract-helper";
import { AePageChangeEventModel } from "./../../../../atlas-elements/common/models/ae-page-change-event-model";
import { AeSortModel, SortDirection } from "./../../../../atlas-elements/common/models/ae-sort-model";
import { CommonHelpers } from "../../../../shared/helpers/common-helpers";
import { extractDataTableOptions } from "../../../../shared/helpers/extract-helpers";
import { PagingInfo } from "./../../../../atlas-elements/common/models/ae-paging-info";


@Component({
  selector: 'general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class GeneralComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields   
  private _cppId: string;
  private _cppGeneralFormVM: IFormBuilderVM;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _formName: string;
  private _constructionPhasePlan: ConstructionPhasePlan = new ConstructionPhasePlan();
  private _addUpdateCppGeneralForm: FormGroup;
  private _submitEventSubscription: Subscription;
  private _context: any;
  private _riskAssessments$: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>([]);
  private _ownerSearchEventSubscription: Subscription;
  private _userServiceSub: Subscription;
  private _selectedRAs: BehaviorSubject<Immutable.List<RiskAssessment>> = new BehaviorSubject<Immutable.List<RiskAssessment>>(Immutable.List<RiskAssessment>([]));
  private _showRASelectorSlide: boolean = false;
  private _sites$: Observable<AeSelectItem<string>[]>;
  private _sitesSubscription: Subscription;
  private _showSafetyPrecautionsSlide: boolean;
  private _showSeqOfEventsSlide: boolean;
  private _sitesMultiSelectSub: Subscription;
  private _siteSelectedSub: Subscription;
  private _siteRemoveSub: Subscription;
  private _sitesClearSub: Subscription;
  private _otherLocationField: IFormFieldWrapper<any>;
  private _otherLocationVisibility: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _showSeletedRiskAssesments = false;

  private _selectedSafetyPrecations: CPPSafetyPrecautions;
  private _selectedCPPEvents: CPPEvent[] = [];
  private _selectedSites: Array<string> = [];
  private _selectedOwnerId: string;
  private _riskAssessmentDataTableOptions$: BehaviorSubject<DataTableOptions> = new BehaviorSubject<DataTableOptions>(null);
  private _actions: Immutable.List<AeDataTableAction>;
  private _deleteAction = new Subject();
  private _deleteActionSub: Subscription;
  private _totalCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private _keys = ['Id', 'Name', 'ReferenceNumber', 'SiteName'];
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _action: string;
  private _generalFormValidity: boolean;
  private _hasAnySequenceOfEventsAvailable: boolean;
  private _hasAnySafetyPrecautionsAvailable: boolean;
  private _selectedRiskAssessments: RiskAssessment[] = [];
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _sortField: string = 'Name';
  private _sortDirection: SortDirection = SortDirection.Ascending;
  // End of Private Fields

  // Public properties
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }


  @Input('constructionPhasePlan')
  set constructionPhasePlan(val: ConstructionPhasePlan) {
    this._constructionPhasePlan = val;
    if (val) {
      this._selectedSafetyPrecations = this._constructionPhasePlan.CPPSafetyPrecautions;
      this._selectedCPPEvents = this._constructionPhasePlan.CPPEvents;
      this._patchForm(this._constructionPhasePlan);
      this._cdRef.markForCheck();
    }
  }
  get constructionPhasePlan() {
    return this._constructionPhasePlan;
  }
  

  get cppGeneralFormVM(): IFormBuilderVM {
    return this._cppGeneralFormVM;
  }
  get showRASelectorSlide(): boolean {
    return this._showRASelectorSlide
  }
  get showSafetyPrecautionsSlide(): boolean {
    return this._showSafetyPrecautionsSlide;
  }
  get safetyPrecautions(): CPPSafetyPrecautions {
    return this._selectedSafetyPrecations;
  }
  get showSeqOfEventsSlide(): boolean {
    return this._showSeqOfEventsSlide;
  }
  get selectedRAs(): BehaviorSubject<Immutable.List<RiskAssessment>> {
    return this._selectedRAs;
  }
  get actions() {
    return this._actions;
  }
  get totalCount$() {
    return this._totalCount$
  }
  get riskAssessmentDataTableOptions$() {
    return this._riskAssessmentDataTableOptions$;
  }
  get cppEvents(): CPPEvent[] {
    return this._selectedCPPEvents;
  }

  get showSeletedRiskAssesments(): boolean {
    return this._showSeletedRiskAssesments;
  }

  get selectedRiskAssessments(): RiskAssessment[] {
    return this._selectedRiskAssessments;
  }
  // End of Public properties

  // Public Output bindings
  @Output('onAeSubmit') _onAeSubmit: EventEmitter<ConstructionPhasePlan> = new EventEmitter<ConstructionPhasePlan>();
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
    , private _router: ActivatedRoute
    , private _RASearchService: RiskAssessmentSearchService
    , private _userService: UserService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._deleteActionSub = this._deleteAction.subscribe((val) => {
      // 
      this.onRARemove(null, val);
    });
    this._actions = Immutable.List([
      new AeDataTableAction("Remove", this._deleteAction, false),
    ]);
  }
  // End of constructor

  // Private methods 

  private _searchRiskAssessments(e) {
    this._RASearchService.getRiskAssessments('a').first().subscribe((raData) => {
      this._riskAssessments$.next(mapRAKeyValuesToAeSelectItems(raData));
    });
  }


  private _patchSelectedRAs(selectedRAs: RiskAssessment[]) {
    if (this._addUpdateCppGeneralForm) {
      this._addUpdateCppGeneralForm.patchValue({
        RASelector: Immutable.List<RiskAssessment>(selectedRAs)
      });
    }
  }
  private _setRequiredValidities(cppModel: ConstructionPhasePlan) {
    if (!isNullOrUndefined(cppModel)) {
      this._generalFormValidity = true;
    } else {
      this._generalFormValidity = false;
    }
    if (!isNullOrUndefined(cppModel) && !isNullOrUndefined(cppModel.CPPSafetyPrecautions)) {
      this._hasAnySafetyPrecautionsAvailable = true;
    } else {
      this._hasAnySafetyPrecautionsAvailable = false;
    }
    if (!isNullOrUndefined(cppModel) && !isNullOrUndefined(cppModel.CPPEvents) && cppModel.CPPEvents.length > 0) {
      this._hasAnySequenceOfEventsAvailable = true;
    } else {
      this._hasAnySafetyPrecautionsAvailable = false;
    }
    this._emitFormValidity();
  }
  private _patchForm(cppModel: ConstructionPhasePlan) {
    //patch only when form fields are defined here...
    this._setRequiredValidities(cppModel);
    if (isNullOrUndefined(this._formFields))
      return;
    let owner = [];
    if (cppModel.Owner) {
      this._selectedOwnerId = cppModel.OwnerId;
      owner.push(new AeSelectItem(cppModel.Owner.FullName, cppModel.OwnerId, false));
    }

    let cppSites: AeSelectItem<string>[] = [];
    if (cppModel.CPPSites && cppModel.CPPSites.length > 0) {
      cppModel.CPPSites.forEach((site) => {
        this._selectedSites.push(site.Id);
        let newRA: AeSelectItem<string> = new AeSelectItem(site.SiteNameAndPostcode, site.Id);
        cppSites.push(newRA);
      });
    }
    //if there is other site location is also added then add one other option with empty Guid
    if (!StringHelper.isNullOrUndefinedOrEmpty(cppModel.OtherLocation)) {
      let emptyLoc: AeSelectItem<string> = new AeSelectItem('Other', emptyGuid);
      cppSites.push(emptyLoc);
    }

    this._selectedRiskAssessments = cppModel.ConstructionPhasePlanRA;
    this.loadRiskAssessmentsData(this._pageNumber, this._pageSize, this._sortField, this._sortDirection);

    let RASelector = this._formFields.filter(f => f.field.name === 'RASelector')[0];
    (<BehaviorSubject<Immutable.List<RiskAssessment>>>RASelector.context.getContextData().get('selectedRAs')).next(Immutable.List<RiskAssessment>(this._selectedRiskAssessments));

    this.setOtherLocationVisibility(cppSites, this._otherLocationVisibility);

    if (this._addUpdateCppGeneralForm) {
      this._addUpdateCppGeneralForm.patchValue({
        Name: cppModel.Name,
        Intent: cppModel.Intent,
        PET: cppModel.PET,
        HSENotifiable: cppModel.HSENotifiable ? '1' : '0',
        IsDomestic: cppModel.IsDomestic ? '1' : '0',
        OwnerId: owner,
        StartDate: cppModel.StartDate == null ? null : new Date(cppModel.StartDate),
        ReviewDate: cppModel.ReviewDate == null ? null : new Date(cppModel.ReviewDate),
        WhoIsImpacted: cppModel.WhoIsImpacted,
        CPPSites: cppSites,
        OtherLocation: cppModel.OtherLocation,
        RASelector: Immutable.List<RiskAssessment>(this._selectedRiskAssessments),
        LPS: cppModel.LPS,
        MonitoringSystems: cppModel.MonitoringSystems,
        Information: cppModel.Information
      });
    }
  }


  private _onSubmit($event) {
    if (this._addUpdateCppGeneralForm.valid) {

      let cppToSave: ConstructionPhasePlan = Object.assign({}, this._constructionPhasePlan, <ConstructionPhasePlan>this._addUpdateCppGeneralForm.value);
      //:We might need to assign any other properties to this form here and save this object either put or post should be raised based on mode of saving the data
      // we need to remove the empty Guid from the from the CPP sites if other is selected
      let selectedSites = this._selectedSites;
      let selectedOwner = this._addUpdateCppGeneralForm.value.OwnerId;
      cppToSave.OwnerId = selectedOwner[0].Value ? selectedOwner[0].Value : selectedOwner[0];
      cppToSave.Owner = null;
      //when there is no 'other' option is selected we can simply remove the new location other value
      if (isNullOrUndefined(this._addUpdateCppGeneralForm.value.OtherLocation))
        cppToSave.OtherLocation = null;

      cppToSave.CPPSites = selectedSites.filter(obj => obj != emptyGuid).map((s: string) => { let site: Site = new Site(); site.Id = <string>s; return site; });
      cppToSave.CPPEvents = this._selectedCPPEvents;
      cppToSave.ConstructionPhasePlanRA = this._selectedRiskAssessments.map((r) => { let ra: RiskAssessment = new RiskAssessment(); ra.Id = r.Id; return ra; });
      cppToSave.CPPSafetyPrecautions = this._selectedSafetyPrecations;
      if (cppToSave.CPPSafetyPrecautions) {
        cppToSave.CPPSafetyPrecautions.AccidentRespUser = null;
        cppToSave.CPPSafetyPrecautions.EmergencyRespUser = null;
        cppToSave.CPPSafetyPrecautions.FireRespUser = null;
        cppToSave.CPPSafetyPrecautions.FirstAidRespUser = null;
      }
      //update is hse notifiable and fordomestic values to boolean from strings
      cppToSave.HSENotifiable = cppToSave.HSENotifiable.toString() === "1" ? true : false;
      cppToSave.IsDomestic = cppToSave.IsDomestic.toString() === "1" ? true : false;
      cppToSave.IsPristine = this._addUpdateCppGeneralForm.pristine
      this._onAeSubmit.emit(cppToSave);
    }
  }
  private _mergeExistingWithNewlySelected(existingRAs: RiskAssessment[], newRAs: RiskAssessment[]) {
    let mergedRiskAssessments: RiskAssessment[];
    mergedRiskAssessments = existingRAs.slice(0);// create new instance of array..
    newRAs.forEach(newRA => {
      let alreadyAdded = mergedRiskAssessments.filter(obj => obj.Id == newRA.Id);
      if (alreadyAdded && alreadyAdded.length == 0) {
        mergedRiskAssessments.push(newRA);
      }
    });
    return mergedRiskAssessments;
  }
  private _updateSelectedRAs(selectedRAs: RiskAssessment[]) {
    this.loadRiskAssessmentsData(this._pageNumber, this._pageSize, this._sortField, this._sortDirection);
    let RASelector = this._formFields.filter(f => f.field.name === 'RASelector')[0];
    (<BehaviorSubject<RiskAssessment[]>>RASelector.context.getContextData().get('selectedRAs')).next(selectedRAs);
    this._patchSelectedRAs(selectedRAs);
  }
  // End of private methods

  // Public methods
  getButtonTitle() {
    if (this._constructionPhasePlan) {
      this._action = 'update';
      return 'BUTTONS.UPDATE'
    }
    else {
      this._action = 'add';
      return 'BUTTONS.ADD';
    }
  }
  getAction() {
    return this._action;
  }
  getSelectedRiskAssesmentsIcon(): string {
    if (this._showSeletedRiskAssesments) {
      return 'expand';
    } else {
      return 'collapse';
    }
  }

  showHideSelectedRiskAssesments(event) {
    this._showSeletedRiskAssesments = !this.showSeletedRiskAssesments;
  }

  onSequenceOfEventsClose($event) {
    this._showSeqOfEventsSlide = false;
  }

  onSequnceOfEventsSubmit(data: CPPEvent[]) {
    this._selectedCPPEvents = data;
    this._showSeqOfEventsSlide = false;
    this._addUpdateCppGeneralForm.markAsDirty();
    if (!isNullOrUndefined(this._selectedCPPEvents) && this._selectedCPPEvents.length > 0) {
      this._hasAnySequenceOfEventsAvailable = true;
    } else {
      this._hasAnySequenceOfEventsAvailable = false;
    }
    this._emitFormValidity();
  }
  onSafetyPrecautionsClose($event) {
    this._showSafetyPrecautionsSlide = false;
  }

  onSafetyPrecautionsSubmit(data: CPPSafetyPrecautions) {
    this._selectedSafetyPrecations = data;
    this._showSafetyPrecautionsSlide = false;
    this._addUpdateCppGeneralForm.markAsDirty();
    if (!isNullOrUndefined(this._selectedSafetyPrecations)) {
      this._hasAnySafetyPrecautionsAvailable = true;
    } else {
      this._hasAnySafetyPrecautionsAvailable = false;
    }
    this._emitFormValidity();
  }
  onRARemove($event, ra) {
    let valuesExisting = this._selectedRiskAssessments;
    let fitleredValues = valuesExisting.filter(obj => obj.Id != ra.Id);
    this._selectedRiskAssessments = fitleredValues;
    this._pageNumber = 1;
    this._updateSelectedRAs(fitleredValues);
    this._addUpdateCppGeneralForm.markAsDirty();
  }

  onShowSafetyPrecations($event, context): void {
    this._showSafetyPrecautionsSlide = true;
  }
  onShowSequnceOfEvents($event, context): void {
    this._showSeqOfEventsSlide = true;
  }
  getRASelectorSlideoutState(): string {
    return this._showRASelectorSlide ? 'expanded' : 'collapsed';
  }
  getSafetyPrecautionsState(): string {
    return this._showSafetyPrecautionsSlide ? 'expanded' : 'collapsed';
  }
  getSequneceOfEventsSlideoutState(): string {
    return this._showSeqOfEventsSlide ? 'expanded' : 'collapsed';
  }
  onRASelected(selectedRAs: RiskAssessment[]) {
    //the selection that we get from the ra-selector should be merged with local already selected values and the merged list is set as current selected assesments..
  //  selectedRAs = this._mergeExistingWithNewlySelected(this._selectedRiskAssessments, selectedRAs);
    this._showRASelectorSlide = false;
    this._selectedRiskAssessments = selectedRAs;
    this._updateSelectedRAs(selectedRAs);
    this._addUpdateCppGeneralForm.markAsDirty();
  }
  onRASelectClose($event) {
    this._showRASelectorSlide = false;
  }

  onAddRA($event): void {
    this._showRASelectorSlide = true;
  }
  onFormInit(fg: FormGroup) {
    this._addUpdateCppGeneralForm = fg;
    if (this._constructionPhasePlan) {
      this._patchForm(this._constructionPhasePlan);
    } else {
      //add mode set other location visiblity to false by default..
      this.setOtherLocationVisibility([], this._otherLocationVisibility);
    }
  }
  onFormValidityChange(status: boolean) {
    this._generalFormValidity = status;
    this._emitFormValidity();
  }
  private _emitFormValidity() {
    this._context.isValidEvent.emit(this._generalFormValidity && this._hasAnySafetyPrecautionsAvailable && this._hasAnySequenceOfEventsAvailable);
  }
  ngOnInit() {
    this._formName = 'CPPGeneral';

    this._cppGeneralFormVM = new CppGeneralForm(this._formName, this._constructionPhasePlan, this._sites$);
    this._formFields = this._cppGeneralFormVM.init();

    this._submitEventSubscription = this._context.submitEvent.subscribe((value) => {
      if (value) {
        this._onSubmit(null);
      }
    });

    let ownerField = this._formFields.filter(f => f.field.name === 'OwnerId')[0];
    this._ownerSearchEventSubscription = (<EventEmitter<any>>ownerField.context.getContextData().get('searchEvent')).subscribe((event) => {
      this._userServiceSub = this._userService.getFilteredUserData(event.query).first().subscribe((data) => {
        (<BehaviorSubject<AeSelectItem<string>[]>>ownerField.context.getContextData().get('items')).next(data);
      });
    });


    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });

    let siteField = this._formFields.filter(f => f.field.name === 'CPPSites')[0];
    this._sitesMultiSelectSub = this._store.let(fromRoot.getsitesClientsForMultiSelectData).subscribe((sites) => {
      //add other option with empty guid to the list , make sure this empty guid is removed from the list before saving...
      if (sites) {
        let newLocation: AeSelectItem<string> = new AeSelectItem('Other', emptyGuid);
        sites.push(newLocation);
        (<BehaviorSubject<AeSelectItem<string>[]>>siteField.context.getContextData().get('items')).next(sites);
      }
    });

    let locationFieldContextData = this._formFields.filter(f => f.field.name === 'CPPSites')[0].context.getContextData();
    this._otherLocationField = this._formFields.filter(f => f.field.name === 'OtherLocation')[0];
    this._otherLocationVisibility = <BehaviorSubject<boolean>>this._otherLocationField.context.getContextData().get('propertyValue');

    this._siteSelectedSub = (<EventEmitter<any>>locationFieldContextData.get('onSelectEvent')).subscribe((selectedSites) => {
      this.setOtherLocationVisibility(selectedSites, this._otherLocationVisibility);
    });

    this._siteRemoveSub = (<EventEmitter<any>>locationFieldContextData.get('onUnSelect')).subscribe((selectedSites) => {
      this.setOtherLocationVisibility(selectedSites, this._otherLocationVisibility);
    });

    this._sitesClearSub = (<EventEmitter<any>>locationFieldContextData.get('onClearSelect')).subscribe((e) => {
      this.setOtherLocationVisibility([], this._otherLocationVisibility);
    });
    //InAdd mode path form will not be called to we need to set OtherLocationVisibility to false..

  }
  setOtherLocationVisibility(selectedSites: any, otherLocationVisibility: BehaviorSubject<boolean>) {
    this._selectedSites = selectedSites.map((s) => { return s.Value; });
    if (selectedSites && selectedSites.filter(obj => obj.Value == emptyGuid).length > 0) {
      otherLocationVisibility.next(true);
    }
    else {
      //here we need to make the other location value as empty or null
      if (this._addUpdateCppGeneralForm) {
        this._addUpdateCppGeneralForm.patchValue({ OtherLocation: null });
      }
      otherLocationVisibility.next(false);
      //here in this case the the appropirate UserObject property should be set to proper user object 
    }

    //Action buttons



  }


  onPageChange(event: AePageChangeEventModel) {
    this._pageNumber = event.pageNumber;
    this._pageSize = event.noOfRows;
    this.loadRiskAssessmentsData(this._pageNumber, this._pageSize, this._sortField, this._sortDirection);
  }
  onSorting(event: AeSortModel) {
    this._sortField = event.SortField;
    this._sortDirection = event.Direction;
    this.loadRiskAssessmentsData(this._pageNumber, this._pageSize, this._sortField, this._sortDirection);
  }

  loadRiskAssessmentsData(pageNumber, pageSize, sortField, sortDirection) {
    let riskAssessments = this._selectedRiskAssessments;
    let totalCount = this._selectedRiskAssessments.length;
    riskAssessments = CommonHelpers.sortArray(this._selectedRiskAssessments, sortField, sortDirection);
    let startPage = (pageNumber * pageSize) - pageSize;
    let endPage = (pageNumber * pageSize);
    let slicedRiskAssessments = riskAssessments.slice(startPage, endPage);
    let pagingInfo = new PagingInfo(pageSize, totalCount, pageNumber, pageSize);
    let sortingInfo = <AeSortModel>{};
    sortingInfo.Direction = sortDirection;
    sortingInfo.SortField = sortField;
    this._totalCount$.next(totalCount);
    this._riskAssessmentDataTableOptions$.next(extractDataTableOptions(pagingInfo, sortingInfo));
    this._selectedRAs.next(Immutable.List<RiskAssessment>(slicedRiskAssessments));
  }

  ngOnDestroy() {

    if (this._submitEventSubscription) {
      this._submitEventSubscription.unsubscribe();
    }
    if (this._ownerSearchEventSubscription) {
      this._ownerSearchEventSubscription.unsubscribe();
    }
    if (this._sitesSubscription) {
      this._sitesSubscription.unsubscribe();
    }
    if (this._sitesMultiSelectSub) {
      this._sitesMultiSelectSub.unsubscribe();
    }
    if (this._userServiceSub) {
      this._userServiceSub.unsubscribe();
    }

    if (this._siteSelectedSub) {
      this._siteSelectedSub.unsubscribe();
    }

    if (this._siteRemoveSub) {
      this._siteRemoveSub.unsubscribe();
    }

    if (this._sitesClearSub) {
      this._sitesClearSub.unsubscribe();
    }
    if (this._deleteActionSub) {
      this._deleteActionSub.unsubscribe();
    }

  }
  // End of public methods

}
