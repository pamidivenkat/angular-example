import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AeSplitButtonOption } from '../../../../atlas-elements/common/models/ae-split-button-options';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AtlasParams, AtlasApiRequest } from "./../../../../shared/models/atlas-api-response";
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { Subject } from "rxjs/Subject";
import { StringHelper } from "./../../../../shared/helpers/string-helper";
import { Subscription } from "rxjs/Subscription";
import { MethodStatement, MSOtherRiskAssessments, MSRiskAssessment } from "../../../../method-statements/models/method-statement";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { isNullOrUndefined } from "util";
import { RiskAssessment } from "../../../../risk-assessment/models/risk-assessment";
import { Observable } from "rxjs/Rx";
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { LoadMSRiskAssessmentsPagingSortingAction, DeleteMSOtherRiskAssessmentAction, LoadMethodStatementByIdAction, AddMSOtherRAAction } from '../../../../method-statements/manage-methodstatements/actions/manage-methodstatement.actions';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { AeTabComponent } from '../../../../atlas-elements/ae-tab/ae-tab.component';

@Component({
  selector: 'further-information',
  templateUrl: './further-information.component.html',
  styleUrls: ['./further-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class FurtherInformationComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _furtherInformationForm: FormGroup;
  private _addFromLibraryCommand = new Subject<boolean>();
  private _addFromComputerCommand = new Subject<boolean>();
  private _splitButtonOptions: any[] = [
    new AeSplitButtonOption<boolean>('FROM LIBRARY', this._addFromLibraryCommand, false),
    new AeSplitButtonOption<boolean>('FROM OTHER', this._addFromComputerCommand, false),
  ];
  private _viewFurtherInformationSubscription: Subscription;
  private _addItems: Immutable.List<AeSelectItem<string>>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _value: boolean = false;
  private _showLibrarySlideOut: boolean = false;
  private _showComputerSlideOut: boolean = false;
  private _methodStatementObject: MethodStatement;
  private _context: any;
  private _furtherInformation: Array<MethodStatement> = [];
  private _selectedList: Array<string>;
  private _tempFurtherInformationInit: Array<MSOtherRiskAssessments>;
  private _msRiskAssessmentsListLoaded: boolean;
  private _msRiskAssessmentsList$: Observable<Immutable.List<MSRiskAssessment>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _keys = Immutable.List(['Id', 'Name', 'NameOfResponsible', 'ReferenceNumber', 'type']);
  private _actionApiRequest: AtlasApiRequest = new AtlasApiRequest(1, 10, '', null);
  private _isModified: boolean = false;

  private _removeAction = new Subject();
  private _actions: Immutable.List<AeDataTableAction>;
  private _deleteActionSubscription: Subscription;
  private _deleteStatusSubscription: Subscription;
  private _showRemoveDialog: boolean = false;
  private _selectedRecord: MSRiskAssessment;
  private _class: AeClassStyle = AeClassStyle.Light;

  private _msSelectedRiskAssessmentSubscription: Subscription;
  private _msSelectedRiskAssessments: RiskAssessment[] = [];

  // End of Private Fields
  // Public Output bindings
  get msSelectedRiskAssessments() {
    return this._msSelectedRiskAssessments;
  }

  get buttonLight(): AeClassStyle {
    return this._class;
  }
  @Input('methodStatement')
  set methodStatement(val: any) {
    this._methodStatementObject = Object.assign({}, val);
    if (val) {
      this.initLoadMSRiskAssessments();
      this._msRiskAssessmentsListLoaded = true;
      this._cdRef.markForCheck();
    }
  }
  get methodStatement() {
    return this._methodStatementObject;
  }


  get splitButtonOptions(): any[] {
    return this._splitButtonOptions;
  }

  get showLibrarySlideOut() {
    return this._showLibrarySlideOut;
  }
  get showComputerSlideOut() {
    return this._showComputerSlideOut;
  }

  @Input('otherracontext')
  set otherracontext(val: any) {
    this._context = val;
    this._context.submitEvent.subscribe((val) => {
      if (val) {
        this._submitData();
      }
    })
  }
  get otherracontext() {
    return this._context;
  }


  get lightClass() {
    return this._lightClass;
  }

  get actions() {
    return this._actions;
  }
  get msRiskAssessmentsList() {
    return this._msRiskAssessmentsList$;
  }

  get recordsCount() {
    return this._recordsCount$;
  }

  get msRiskAssessmentsListLoaded() {
    return this._msRiskAssessmentsListLoaded;
  }

  get showRemoveDialog() {
    return this._showRemoveDialog;
  }

  get selectedRecord() {
    return this._selectedRecord;
  }
  get selectedRecordName() {
    return this._selectedRecord.Name;
  }

  get keys() {
    return this._keys;
  }

  get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  get furtherInformationForm() {
    return this._furtherInformationForm;
  }

  get removeAction() {
    return this._removeAction;
  }

  get addFromLibraryCommand() {
    return this._addFromLibraryCommand;
  }
  get addFromComputerCommand() {
    return this._addFromComputerCommand;
  }

  @Output('selectRA')
  _aeSelectmethodStatement: EventEmitter<MethodStatement>;

  @Output('onFurtherInformationSave')
  _savingMethodStatementObject: EventEmitter<MethodStatement>;
  // End of Public Output bindings

  // Public Properties
  // End of Public properties

  // Public ViewChild bindings
  @ViewChild(AeTabComponent)
  tabComponent: AeTabComponent;
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._selectedList = new Array();
    this._savingMethodStatementObject = new EventEmitter<MethodStatement>();
    this._aeSelectmethodStatement = new EventEmitter<MethodStatement>();
  }
  // End of constructor

  // Private methods 
  private _initForm() {
    this._furtherInformationForm = this._fb.group({
      FacilitiesAffectedText: [{ value: this._methodStatementObject.FacilitiesEffectedByWork, disabled: false }],
      ForeseeableAffectsText: [{ value: this._methodStatementObject.ForeseeAdverseEffects, disabled: false }],
      MonitoringText: [{ value: this._methodStatementObject.MonitoringSystems, disabled: false }],
    })
  }

  private _submitData() {
    this._isModified = true;
    this._methodStatementObject.FacilitiesEffectedByWork = this._furtherInformationForm.value.FacilitiesAffectedText;
    this._methodStatementObject.ForeseeAdverseEffects = this._furtherInformationForm.value.ForeseeableAffectsText;
    this._methodStatementObject.MonitoringSystems = this._furtherInformationForm.value.MonitoringText;
    this._methodStatementObject.ApprovedBy = null;
    this._methodStatementObject.ApprovedDate = null;
    this._methodStatementObject.MSOtherRiskAssessments = null;
    this._methodStatementObject.MSPPE = null;
    this._methodStatementObject.MSProcedures = null;
    this._methodStatementObject.MSSafetyResponsibilities = null;
    this._methodStatementObject.PlantEquipments = null;
    this._methodStatementObject.Site = null;
    if (!isNullOrUndefined(this._methodStatementObject.MSRiskAssessmentMap)) {
      this._methodStatementObject.MSRiskAssessmentMap.forEach(res => {
        res.Documents = null;
        res.RiskAssessmentSectors = null;
        res.RiskAssessmentWorkspaceTypes = null;
        res.RAAdditionalControls = null;
        res.RAControls = null;
        res.RAHazards = null;
        res.RAProcedures = null
        res.RASubstances = null;
        res.Site = null;
        res.RiskAssessmentType = null;
      });
    }
    this._savingMethodStatementObject.emit(this._methodStatementObject);
  }
  // End of private methods

  // Public properties
  // End of Public properties

  // Public methods
  public showSliderState() {
    return this._showLibrarySlideOut || this._showComputerSlideOut ? 'expanded' : 'collapsed';
  }
  public showSlider() {
    return this._showLibrarySlideOut || this._showComputerSlideOut;
  }
  public getSlideoutAnimateState(): boolean {
    return this._showLibrarySlideOut || this._showComputerSlideOut;
  }
  public sliderClosed($event: any) {
    this._showLibrarySlideOut = false;
    this._showComputerSlideOut = false;
  }
  public sliderClosedOtherRA($event: any) {
    this._showLibrarySlideOut = false;
    this._showComputerSlideOut = false;
  }
  onMSOtherRASubmit(data: MSOtherRiskAssessments[]) {
    if (!isNullOrUndefined(data) && data.length > 0) {
      this._store.dispatch(new AddMSOtherRAAction(data));
    }
    this._showComputerSlideOut = false;
  }
  public onAeSelectList(data: RiskAssessment[]) {
    this._methodStatementObject.MSRiskAssessmentMap = data;
    this._submitData();
    if (this._isModified) {
      this._aeSelectmethodStatement.emit(this._methodStatementObject);

    }
  }

  selectedIdList(selectedList: Array<string>) {
    this._selectedList = selectedList;
  }

  getSelectedList() {
    return this._selectedList;
  }

  onSplitBtnClick($event: any) {

  }

  public submitData() {
    this._submitData();
  }
  // End of public methods


  ngOnInit() {

    this._initForm();
    this._setActions();

    this._msRiskAssessmentsList$ = this._store.let(fromRoot.getMSRiskAssessments);
    this._recordsCount$ = this._store.let(fromRoot.getMSRiskAssessmentsTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getMSRiskAssessmentsDataTableOptions);

    this._msSelectedRiskAssessmentSubscription = this._store.let(fromRoot.getMSRiskAssessmentMap).subscribe(savedRA => {
      this._msSelectedRiskAssessments = [];
      if (!isNullOrUndefined(savedRA)) {
        savedRA.forEach(c => {
          let riskAssessment: RiskAssessment = new RiskAssessment();
          riskAssessment.Name = c.Name;
          riskAssessment.ReferenceNumber = c.ReferenceNumber;
          riskAssessment.Id = c.Id;
          this._msSelectedRiskAssessments.push(riskAssessment);
        });
        ;
      }
    });

    this._addFromLibraryCommand.subscribe(() => {
      this._showLibrarySlideOut = true;
    });
    this._addFromComputerCommand.subscribe(() => {
      this._showComputerSlideOut = true;
    });

    this._deleteActionSubscription = this._removeAction.subscribe(obj => {
      this._selectedRecord = <MSRiskAssessment>obj;
      this._showRemoveDialog = true;
    });

    this._deleteStatusSubscription = this._store.let(fromRoot.getMSRiskassessmentDeleteStatus).subscribe(result => {
      if (result === true) {
        this._store.dispatch(new LoadMethodStatementByIdAction({ Id: this._methodStatementObject.Id, IsExample: this._methodStatementObject.IsExample })); // as of now sending is example false
      }
    });
  }
  ngOnDestroy() {
    if (!isNullOrUndefined(this._deleteStatusSubscription)) {
      this._deleteStatusSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._deleteActionSubscription)) {
      this._deleteActionSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._msSelectedRiskAssessmentSubscription)) {
      this._msSelectedRiskAssessmentSubscription.unsubscribe();
    }
  }

  initLoadMSRiskAssessments() {
    this._store.dispatch(new LoadMSRiskAssessmentsPagingSortingAction(this._actionApiRequest));
  }

  private onPageChange($event) {
    this._actionApiRequest.PageNumber = $event.pageNumber;
    this._actionApiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadMSRiskAssessmentsPagingSortingAction(this._actionApiRequest));
  }

  private onSort($event) {
    this._actionApiRequest.PageNumber = $event.pageNumber;
    this._actionApiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadMSRiskAssessmentsPagingSortingAction(this._actionApiRequest));
  }

  private _setActions(): void {
    this._actions = Immutable.List([
      new AeDataTableAction("Remove", this._removeAction, false)
    ]);
  }

  modalClosed(option) {
    if (option == 'yes') {
      // library
      if (!isNullOrUndefined(this._methodStatementObject.MSRiskAssessmentMap)) {
        this._methodStatementObject.MSRiskAssessmentMap.forEach((entity) => {
          if (entity.Id == this._selectedRecord.Id) {
            this._methodStatementObject.MSRiskAssessmentMap = this._methodStatementObject.MSRiskAssessmentMap.filter(p => p.Id !== entity.Id);

            this._submitData();
            this._aeSelectmethodStatement.emit(this._methodStatementObject);
          }
        });
      }

      //other
      if (!isNullOrUndefined(this._methodStatementObject.MSOtherRiskAssessments)) {
        this._methodStatementObject.MSOtherRiskAssessments.forEach((entity) => {
          if (entity.Id == this._selectedRecord.Id) {
            this._methodStatementObject.MSOtherRiskAssessments = this._methodStatementObject.MSOtherRiskAssessments.filter(p => p.Id !== entity.Id);

            this._store.dispatch(new DeleteMSOtherRiskAssessmentAction({ Id: this.selectedRecord.Id }));
          }
        });
      }
    }
    this._showRemoveDialog = false;
    this._selectedRecord = null;
  }

}
