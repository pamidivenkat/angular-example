import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { AtlasParams, AtlasApiRequestWithParams } from './../../../../shared/models/atlas-api-response';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable, Subscription } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { AeSortModel, SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { DocumentDetailsService } from '../../../../document/document-details/services/document-details.service';
import { DistributionHistoryModel, EmployeeActionStatusModel } from '../../../../document/document-details/models/document-details-model';
import { ActivatedRoute } from "@angular/router";
import { isNullOrUndefined } from "util";
import * as fromRoot from './../../../../shared/reducers';
import { Store } from '@ngrx/store';
import { mapVersionAeSelectItems } from "./../../../common/document-extract-helper";
import { FormGroup, FormBuilder, Validator } from '@angular/forms';
import { DocumentSignatureDetails } from '../../../../document/document-shared/models/document-signature.model';

@Component({
  selector: 'document-employee-actionstatus',
  templateUrl: './document-employee-actionstatus.component.html',
  styleUrls: ['./document-employee-actionstatus.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentEmployeeActionstatusComponent extends BaseComponent implements OnInit, OnDestroy {

  private _employeeActionStatusListLoaded$: Observable<boolean>;
  private _employeeActionStatusList$: Observable<Immutable.List<EmployeeActionStatusModel>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _keys = Immutable.List(['EmployeeName', 'ActionTaken', 'ActionedDate', 'DocumentVersionInfo', 'Signature', 'DocumentName']);
  private _employeeActionStatusListLoadedSubscription: Subscription;
  private _employeeActionStatusList: Subscription;
  private _versionList$: BehaviorSubject<Immutable.List<AeSelectItem<string>>> = new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(null);
  private _status: Immutable.List<AeSelectItem<string>>;
  private _documentActionForm: FormGroup;
  private _actionApiRequest: AtlasApiRequestWithParams;
  private _showSignatureDialog: boolean;
  private _documentSignatureDetails: DocumentSignatureDetails;

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _documentDetailsService: DocumentDetailsService

  ) {
    super(_localeService, _translationService, _cdRef);
    this._documentSignatureDetails = new DocumentSignatureDetails();
  }

  get documentActionForm(): FormGroup {
    return this._documentActionForm;
  }

  get versionList$(): BehaviorSubject<Immutable.List<AeSelectItem<string>>> {
    return this._versionList$;
  }

  get status(): Immutable.List<AeSelectItem<string>> {
    return this._status;
  }

  get employeeActionStatusList$(): Observable<Immutable.List<EmployeeActionStatusModel>> {
    return this._employeeActionStatusList$;
  }

  get recordsCount$(): Observable<number> {
    return this._recordsCount$;
  }

  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }

  get employeeActionStatusListLoaded$(): Observable<boolean> {
    return this._employeeActionStatusListLoaded$;
  }

  get keys(): Immutable.List<string> {
    return this._keys;
  }
  get actionApiRequest() {
    return this._actionApiRequest;
  }

  get documentSignatureDetails() {
    return this._documentSignatureDetails;
  }

  get showSignatureDialog() {
    return this._showSignatureDialog;
  }

  ngOnInit() {

    this._documentActionForm = this._fb.group({
      version: [{ value: '', disabled: false }],
      status: [{ value: '', disabled: false }]
    });

    if (isNullOrUndefined(this._actionApiRequest))
      this._actionApiRequest = <AtlasApiRequestWithParams>{};

    this._status = Immutable.List([new AeSelectItem('Actioned', '1'), new AeSelectItem('To Be Actioned', '0')]);

    this._employeeActionStatusListLoaded$ = this._documentDetailsService.getEmployeeActionStatusLoadStatus();
    this._employeeActionStatusList$ = this._documentDetailsService.loadEmployeeActionStatusList();
    this._recordsCount$ = this._documentDetailsService.loadEmployeeActionStatusTotalCount();
    this._dataTableOptions$ = this._documentDetailsService.loadEmployeeActionStatusDataTableOptions();

    this._employeeActionStatusList = this._store.let(fromRoot.getEmployeeStatusList).subscribe(loadedData => {
      if (loadedData) {
        this._versionList$.next(mapVersionAeSelectItems(loadedData));
      }
    });


    this._employeeActionStatusListLoadedSubscription = this._documentDetailsService.getEmployeeActionStatusLoadStatus().subscribe(loaded => {
      if (loaded) {
        let atlasParams: AtlasParams[] = new Array();
        this._actionApiRequest = new AtlasApiRequestWithParams(1, 10, 'DocumentVersion', SortDirection.Ascending, atlasParams)
        // dispatch client side paging
        this._documentDetailsService.dispatchEmployeeActionStatusPaging(this._actionApiRequest);
      }
    });


    this._documentActionForm.valueChanges.subscribe(data => {
      this._actionApiRequest.PageNumber = 1;
      if (this._documentActionForm.valid) {
        this._actionApiRequest.Params = addOrUpdateAtlasParamValue(this._actionApiRequest.Params, 'DocumentVersionInfo', data.version);
        this._actionApiRequest.Params = addOrUpdateAtlasParamValue(this._actionApiRequest.Params, 'Status', data.status);
      }
      this._documentDetailsService.dispatchEmployeeActionStatusPaging(this._actionApiRequest);
    });

  }

  ngOnDestroy() {

    if (!isNullOrUndefined(this._employeeActionStatusListLoadedSubscription)) {
      this._employeeActionStatusListLoadedSubscription.unsubscribe();
    } if (!isNullOrUndefined(this._employeeActionStatusList)) {
      this._employeeActionStatusList.unsubscribe();
    }

  }

  onGridPageChange($event) {
    this._actionApiRequest.PageNumber = $event.pageNumber;
    this._actionApiRequest.PageSize = $event.noOfRows;
    this._documentDetailsService.dispatchEmployeeActionStatusPaging(this._actionApiRequest);
  }

  onGridSort($event: AeSortModel) {
    this._actionApiRequest.SortBy.SortField = $event.SortField;
    this._actionApiRequest.SortBy.Direction = $event.Direction;
    this._documentDetailsService.dispatchEmployeeActionStatusPaging(this._actionApiRequest);
  }

  getActionStatus(actionId: number) {
    switch (actionId) {
      case 0:
        return 'No Action Required';
      case 1:
        return 'Require Read';
      case 2:
        return 'Require Sign';
      default:
        return '';
    }
  }

  public onActionDateClick(context) {
    this._showSignatureDialog = true;
    this._documentSignatureDetails.Signature = context.Signature;
    this._documentSignatureDetails.SignedBy = context.EmployeeName;
    this._documentSignatureDetails.SignedDate = context.ActionedDate;
    this._documentSignatureDetails.DocumentName = context.DocumentName;
  }

  modalClosed(event: any) {
    this._showSignatureDialog = false;
  }

}
