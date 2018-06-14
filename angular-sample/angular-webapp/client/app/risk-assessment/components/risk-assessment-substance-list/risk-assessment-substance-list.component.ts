import { AeLoaderType } from '../../../atlas-elements/common/ae-loader-type.enum';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ChangeDetectionStrategy, Output, EventEmitter, ViewChild } from '@angular/core';
import { BaseComponent } from "../../../shared/base-component";
import { FileResult } from "../../../atlas-elements/common/models/file-result";
import { LocaleService, TranslationService } from "angular-l10n";
import { FileUploadService } from "../../../shared/services/file-upload.service";
import { isNullOrUndefined } from "util";
import { MessengerService } from "../../../shared/services/messenger.service";
import { ObjectHelper } from "../../../shared/helpers/object-helper";
import { Document } from '../../../document/models/document';
import { AtlasApiError } from "../../../shared/error-handling/atlas-api-error";
import * as errorActions from '../../../shared/actions/error.actions';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { RiskAssessment } from "../../models/risk-assessment";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers';
import { Observable } from "rxjs/Observable";
import { Subscription, Subject } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AeDataTableAction } from "../../../atlas-elements/common/models/ae-data-table-action";
import { AeSortModel, SortDirection } from "../../../atlas-elements/common/models/ae-sort-model";
import { RiskAssessmentService } from "../../services/risk-assessment-service";
import { DocumentService } from "../../../document/services/document-service";
import { RASubstance } from "../../models/risk-assessment-substance";
import { AtlasParams, AtlasApiRequestWithParams } from "../../../shared/models/atlas-api-response";
import { LoadRiskAssessmentSubstancesAction, AddRASubstanceAction, AddRACoshhInventoryAction, UpdateRASubstanceAction, RemoveRASubstanceAction, LoadRiskAssessmentSubstancePaggingAction, LoadRiskAssessmentSubstanceSortAction } from "../../actions/risk-assessment-actions";
import { AePageChangeEventModel } from "../../../atlas-elements/common/models/ae-page-change-event-model";
import { RACoshhInventory } from "../../models/risk-assessment-coshh-inventory";
import { AeClassStyle } from "../../../atlas-elements/common/ae-class-style.enum";
import { AeDatatableComponent } from "../../../atlas-elements/ae-datatable/ae-datatable.component";

@Component({
  selector: 'risk-assessment-substance-list',
  templateUrl: './risk-assessment-substance-list.component.html',
  styleUrls: ['./risk-assessment-substance-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentSubstanceListComponent extends BaseComponent implements OnInit, OnDestroy {
  private _currentRiskAssessment: RiskAssessment;
  private _currentRiskAssessmentSubstances: BehaviorSubject<Immutable.List<RASubstance>>;
  private _currentRiskAssessmentSubscription$: Subscription;
  private _keys = Immutable.List(['Substance', 'ReferenceNumber']);
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _totalRecords: Observable<number>;
  private _isUpdateSubstance: boolean;
  private _isSubstanceAttach: boolean;
  private _actions: Immutable.List<AeDataTableAction>;

  private _updateSubstanceCommand = new Subject();
  private _removeSubstanceCommand = new Subject();
  private _updateSubstanceSubscription: Subscription;
  private _removeSubstanceSubscription: Subscription;
  private _selectedSubstance: RASubstance;
  private _substanceRemoveConfirmPopup: boolean = false;
  private _riskAssessmentSubstanceLoadedSubscription: Subscription;
  private _currentRiskAssessmentSubstancesApiRequest: AtlasApiRequestWithParams;
  private _coshhInventoryList: Observable<RACoshhInventory[]>;
  private _currentRASubstances: Immutable.List<RASubstance>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _isRiskAssessmentRetrived$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _loaderBars: AeLoaderType = AeLoaderType.Spinner;
  // End of Private Fields

  // Public properties
  get loaderBars(): AeLoaderType {
    return this._loaderBars;
  }

  get isRiskAssessmentRetrived$(): BehaviorSubject<boolean> {
    return this._isRiskAssessmentRetrived$;
  }

  get lightClass() {
    return this._lightClass;
  }
  get currentRiskAssessmentSubstances(): BehaviorSubject<Immutable.List<RASubstance>> {
    return this._currentRiskAssessmentSubstances;
  }
  get totalRecords(): Observable<number> {
    return this._totalRecords;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get isSubstanceAttach(): boolean {
    return this._isSubstanceAttach;
  }
  get selectedSubstance(): RASubstance {
    return this._selectedSubstance;
  }
  get keys(): any {
    return this._keys;
  }
  get isUpdateSubstance(): boolean {
    return this._isUpdateSubstance;
  }
  get dataTableOptions() {
    return this._dataTableOptions$;
  }
  @ViewChild(AeDatatableComponent)
  dataTable: AeDatatableComponent<any>;
  //output events to parent container
  @Output() updateSubstanceCommand = new EventEmitter<RASubstance>();
  @Output() removeSubstanceCommand = new EventEmitter<RASubstance>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _documentService: DocumentService
    , private _riskAssessmentService: RiskAssessmentService) {
    super(_localeService, _translationService, _cdRef);
    this._isUpdateSubstance = false;
    this._isSubstanceAttach = false;
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateSubstanceCommand, false),
      new AeDataTableAction("Remove", this._removeSubstanceCommand, false)
    ]);
    this._currentRiskAssessmentSubstances = new BehaviorSubject(Immutable.List([]));
  }

  ngOnInit() {


    this._currentRiskAssessmentSubscription$ = this._store.let(fromRoot.getCurrentRiskAssessment).subscribe((CurrentRiskAssessmentData) => {
      this._currentRiskAssessment = CurrentRiskAssessmentData;
      if (!isNullOrUndefined(this._currentRiskAssessment)) {
        this._isRiskAssessmentRetrived$.next(true);
      }
    });



    this._riskAssessmentSubstanceLoadedSubscription = this._store.let(fromRoot.getCurrentRiskAssessmentSubstances).subscribe(currentRiskAssessmentSubstances => {
      if (!isNullOrUndefined(currentRiskAssessmentSubstances)) {
        this._currentRASubstances = currentRiskAssessmentSubstances;
        this._currentRiskAssessmentSubstances.next(this._currentRASubstances);
        this._cdRef.markForCheck();
      }
    });
    this._totalRecords = this._store.let(fromRoot.getCurrentRiskAssessmentSubstancesTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getCurrentRiskAssessmentSubstancesDataTableOptions);

    //Subscription for Update substance
    this._updateSubstanceSubscription = this._updateSubstanceCommand.subscribe(substance => {
      this._selectedSubstance = substance as RASubstance;
      this._updateSubstance();

    });

    //Subscription for Removing substance
    this._removeSubstanceSubscription = this._removeSubstanceCommand.subscribe(substance => {
      if (!isNullOrUndefined(document)) {
        this._selectedSubstance = substance as RASubstance;
        this._removeSubstanceRARemoveConfirmPopup(true)
      }
    });
  }
  getSlideoutAnimateState(): boolean {
    return this._isUpdateSubstance || this._isSubstanceAttach ? true : false;
  }

  getSlideoutState(): string {
    return this._isUpdateSubstance || this._isSubstanceAttach ? 'expanded' : 'collapsed';
  }
  showAddSlideOut() {
    return this._isUpdateSubstance || this._isSubstanceAttach
  }
  closedAddSlideOut(event) {
    return this._isUpdateSubstance = this._isSubstanceAttach = false;
  }
  attachSubstance() {
    this._isSubstanceAttach = true;
  }
  private _updateSubstance() {
    this._isUpdateSubstance = true;
  }

  attachSubstanceRA(attachSubstance: RASubstance) {
    if (!isNullOrUndefined(attachSubstance)) {
      //add substance call
      let substanceToAdd = Object.assign({}, attachSubstance);
      substanceToAdd.Id = null
      substanceToAdd.RiskAssessmentId = this._currentRiskAssessment.Id;
      this._store.dispatch(new AddRASubstanceAction(substanceToAdd));
      this.closedAddSlideOut(true);
    }
  }
  updateSubstanceRA(attachSubstance: RASubstance) {
    this._selectedSubstance.Substance = attachSubstance.Substance;
    this._selectedSubstance.Description = attachSubstance.Description;
    this._selectedSubstance.Manufacturer = attachSubstance.Manufacturer;
    this._selectedSubstance.Quantity = attachSubstance.Quantity;
    this._selectedSubstance.ExposureLimits = attachSubstance.ExposureLimits;
    this._selectedSubstance.ReferenceNumber = attachSubstance.ReferenceNumber;
    this._selectedSubstance.UsedFor = attachSubstance.UsedFor;
    this._selectedSubstance.PeopleAffected = attachSubstance.PeopleAffected;
    this._selectedSubstance.AttachmentId = attachSubstance.AttachmentId;
    this._selectedSubstance.Mig_EmergencyContactNumber = attachSubstance.Mig_EmergencyContactNumber;
    if (!isNullOrUndefined(attachSubstance)) {
      this._store.dispatch(new UpdateRASubstanceAction(this._selectedSubstance));
      this.closedAddSlideOut(true);
    }
  }


  removeSubstanceRA() {
    let substance: RASubstance = this._selectedSubstance;
    if (!isNullOrUndefined(substance)) {
      this._store.dispatch(new RemoveRASubstanceAction(substance.Id));
      this.closedAddSlideOut(true);
    }

  }
  getSubstanceRARemoveConfirmPopup() {
    return this._substanceRemoveConfirmPopup;
  }
  private _removeSubstanceRARemoveConfirmPopup(event) {
    this._substanceRemoveConfirmPopup = true;
  }

  modalClosed() {
    this._substanceRemoveConfirmPopup = false;
  }
  onSort($event: AeSortModel) {

    if (!isNullOrUndefined(this._currentRiskAssessmentSubstances))
      this._store.dispatch(new LoadRiskAssessmentSubstanceSortAction({ SortField: $event.SortField, Direction: $event.Direction, PageSize: this._pageSize }));
  }
  onPageChange(pagingInfo: AePageChangeEventModel) {
    this._pageNumber = pagingInfo.pageNumber;
    this._pageSize = pagingInfo.noOfRows;
    let atlasParams: AtlasParams[] = new Array();
    this._store.dispatch(new LoadRiskAssessmentSubstancePaggingAction(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, "", SortDirection.Descending, atlasParams)));
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._currentRiskAssessmentSubscription$))
      this._currentRiskAssessmentSubscription$.unsubscribe();
    if (!isNullOrUndefined(this._updateSubstanceSubscription))
      this._updateSubstanceSubscription.unsubscribe();
    if (!isNullOrUndefined(this._removeSubstanceSubscription))
      this._removeSubstanceSubscription.unsubscribe();
    if (!isNullOrUndefined(this._riskAssessmentSubstanceLoadedSubscription))
      this._riskAssessmentSubstanceLoadedSubscription.unsubscribe();

  }

}
