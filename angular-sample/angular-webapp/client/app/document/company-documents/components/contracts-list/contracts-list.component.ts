import { LoadAssociatedUserVersionDocument } from './../../actions/contracts.actions';
import { Tristate } from '../../../../atlas-elements/common/tristate.enum';
import {
  DocumentBulkDistributionAction
} from '../../../contract-personalisation/actions/contract-personalisation.actions';
import { DistributeModel } from '../../../document-details/models/document-details-model';
import { isNullOrUndefined } from 'util';
import { EnumHelper } from '../../../../shared/helpers/enum-helper';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { ActivatedRoute } from '@angular/router';
import { NavigationExtras, Router } from '@angular/router';
import { AePageChangeEventModel } from './../../../../atlas-elements/common/models/ae-page-change-event-model';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { FormBuilder } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Document, DocumentActionType } from './../../../models/document';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { SaveContractAsPDFAction } from "../../../company-documents/actions/contracts.actions";

@Component({
  selector: 'contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ContractsListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _contractsListLoaded$: Observable<boolean>;
  private _contractsListDataTableOptions$: Observable<DataTableOptions>;
  private _contractsListTotalCount$: Observable<number>;
  private _contractsRequest$: Observable<Immutable.List<Document>>;
  private _keys = Immutable.List(['Title', 'EmployeeGroup', 'Version', 'CreatedOn', 'ModifiedOn', 'EmployeeDetails', 'JobTitle', 'EmployeeName', 'Submitted', 'SourceDocumentId', 'State']);
  private _actions: Immutable.List<AeDataTableAction>;
  private _personalizeDocumentCommand = new Subject();
  private _downloadAsWordCommand = new Subject();
  private _personalizeDocumentCommandSub: Subscription;
  private _downloadAsWordCommandSub: Subscription;
  private _distributeContractCommand = new Subject();
  private _updateContractCommand = new Subject();
  private _saveAsPdfCommand = new Subject();
  private _distributeContractCommandSub: Subscription;
  private _updateContractCommandSub: Subscription;
  private _saveAsPdfCommandSub: Subscription;
  private _cid: string;
  private _routeParamsSub: Subscription;
  private _showHideDocumentActionSlideOut: boolean = false;
  private _actionOptions: Immutable.List<AeSelectItem<number>>;
  private _currentAcionedDocument: Document;
  private _contractsListSubscription: Subscription;
  private _contractsList: Document[];
  private _downloadAsPdfCommand = new Subject();
  private _downloadAsPdfCommandSub: Subscription;
  private _viewCommand = new Subject();
  private _viewCommandSub: Subscription;
  private _needToOpenUserVersion: boolean = false;
  private _selectedUserVersionSub: Subscription;
  private _navigationExtras: NavigationExtras = {
    queryParamsHandling: 'merge'
  };
  private _userVersionLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // End of Private Fields
  // Public Input bindings
  get userVersionLoading$(): BehaviorSubject<boolean> {
    return this._userVersionLoading$;
  }
  @Input('contractsFilter')
  contractsFilter: number = 1;
  get ContractsFilter() {
    return this.contractsFilter;
  }
  set ContractsFilter(val) {
    this.contractsFilter = val;
  }

  get showHideDocumentActionSlideOut(): boolean {
    return this._showHideDocumentActionSlideOut;
  }

  get actionOptions(): Immutable.List<AeSelectItem<number>> {
    return this._actionOptions;
  }

  get documentTitle(): string {
    if (isNullOrUndefined(this._currentAcionedDocument)) {
      return "";
    }
    return this._currentAcionedDocument.Title;
  }

  get employeeGroup(): string {
    if (isNullOrUndefined(this._currentAcionedDocument)) {
      return "";
    }
    return isNullOrUndefined(this._currentAcionedDocument.EmployeeGroup) ? "" : this._currentAcionedDocument.EmployeeGroup.Name;
  }
  get contractsRequest$(): Observable<Immutable.List<Document>> {
    return this._contractsRequest$;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get contractsListTotalCount$(): Observable<number> {
    return this._contractsListTotalCount$;
  }
  get contractsListDataTableOptions$(): Observable<DataTableOptions> {
    return this._contractsListDataTableOptions$;
  }
  get contractsListLoaded$(): Observable<boolean> {
    return this._contractsListLoaded$;
  }
  get keys(): Immutable.List<string> {
    return this._keys;
  }
  get needToOpenUserVersion(): boolean {
    return this._needToOpenUserVersion;
  }

  get downloadAsWordCommand() {
    return this._downloadAsWordCommand;
  }
  // End of Public Input bindings
  // Public Output bindings
  @Output('onGridPaging') _onGridPageChange: EventEmitter<AePageChangeEventModel> = new EventEmitter<AePageChangeEventModel>();
  @Output('onGridSorting') _onGridSorChange: EventEmitter<AeSortModel> = new EventEmitter<AeSortModel>();

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  // Private methods
  private _setActions() {
    if (this.contractsFilter == 1) {
      this._actions = Immutable.List([
        new AeDataTableAction("Personalise", this._personalizeDocumentCommand, false),
        new AeDataTableAction("Download as word", this._downloadAsWordCommand, false),
      ]);
    }
    else if (this.contractsFilter == 2) {
      this._actions = Immutable.List([
        new AeDataTableAction("view", this._viewCommand, false,(item) => { return this._showViewAction(item) }),
        new AeDataTableAction("download pdf", this._downloadAsPdfCommand, false),
        new AeDataTableAction("Distribute", this._distributeContractCommand, false, (item) => { return this._showDistributeAction(item) }),
        new AeDataTableAction("Update", this._updateContractCommand, false),
        new AeDataTableAction("Save as pdf", this._saveAsPdfCommand, false),
      ]);
    }
  }

  private _showDownloadPdfAction(item: Document): Tristate {
    if (item.State === 1) {
      return Tristate.True;
    }
    return Tristate.False;
  }

  private _showDistributeAction(item: Document): Tristate {
    if (item.State === 1) {
      return Tristate.False;
    }
    return Tristate.True;
  }

  private _showViewAction(item: Document): Tristate {
    if (item.State === 1) {
      return Tristate.True;
    }
    return Tristate.False;
  }
  // End of private methods

  // Public methods
  public onGridPaging(pageinfo: AePageChangeEventModel) {
    this._onGridPageChange.emit(pageinfo);
  }
  public onGridSorting(sortInfo: AeSortModel) {
    this._onGridSorChange.emit(sortInfo);
  }

  ngOnInit() {
    let documentActionTypes: Array<AeSelectItem<number>> = EnumHelper.getAeSelectItems(DocumentActionType);
    documentActionTypes.forEach(actionType => {
      actionType.Text = this._translationService.translate(actionType.Text);
    });
    this._actionOptions = Immutable.List(documentActionTypes);

    this._routeParamsSub = this._activatedRoute.params.subscribe((params) => {
      this._cid = params['cid'];
    });
    if (this.contractsFilter == 1) {
      this._contractsListLoaded$ = this._store.let(fromRoot.getContractsLoadingState);
      this._contractsRequest$ = this._store.let(fromRoot.getContractsData);
      this._contractsListDataTableOptions$ = this._store.let(fromRoot.getContractsDataTableOptions);
      this._contractsListTotalCount$ = this._store.let(fromRoot.getContractsListTotalCount);

    } else {
      this._contractsListLoaded$ = this._store.let(fromRoot.getContractsLoadingState);
      this._contractsRequest$ = this._store.let(fromRoot.getPersonalContractsData);
      this._contractsListDataTableOptions$ = this._store.let(fromRoot.getPersonalContractsDataTableOptions);
      this._contractsListTotalCount$ = this._store.let(fromRoot.getPersonalContractsListTotalCount);
    }

    this._contractsListSubscription = this._store.let(fromRoot.getPersonalContractsData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        this._contractsList = data.toArray();
      }
    });

    this._setActions();
    this._selectedUserVersionSub = this._store.let(fromRoot.getAssociatedUserVersionContractData).subscribe((val) => {
      if (val && this._needToOpenUserVersion && this.contractsFilter == 2) {
        let url = 'document/document-details/' + val.Id;
        this._userVersionLoading$.next(false);
        this._router.navigate([url], this._navigationExtras);
      }
    });

    this._personalizeDocumentCommandSub = this._personalizeDocumentCommand.subscribe(document => {
      let doc = document as Document;

      let url = 'document/group-contract-personalisation/' + doc.Id
      this._router.navigate([url], this._navigationExtras);
    });

    this._downloadAsWordCommandSub = this._downloadAsWordCommand.subscribe(document => {
      let doc = document as Document;
      //here we need to write code to download the document as word...
      //download url: http://localhost:8000/documentproducer/downloadword/A159B699-536D-4A13-AC92-EB57931FB925?fileName=anil.docx&cid=5AE84046-482C-4CE3-980B-6A1F6385A8D3
      let fileName = doc.Title + ".docx";
      window.open('/documentproducer/downloadword/' + doc.Id + '?filename=' + fileName + '&cid=' + (this._cid ? this._cid : this._claimsHelper.getCompanyId()));
    });

    this._distributeContractCommandSub = this._distributeContractCommand.subscribe(document => {
      //here we need to write code to distribute the document 
      this._currentAcionedDocument = document as Document;
      this._showHideDocumentActionSlideOut = true;
    });
    this._updateContractCommandSub = this._updateContractCommand.subscribe(document => {
      //here we need to write code to update the contract document 
      let doc = document as Document;
      let navigationExtras: NavigationExtras = {
        queryParams: {
          "distributionType": 2
        }
      };
      this._router.navigate(['document/group-contract-personalisation/contract-update', doc.Id], navigationExtras);
    });
    this._saveAsPdfCommandSub = this._saveAsPdfCommand.subscribe(document => {
      let doc = document as Document;
      doc = this._contractsList.filter(x => x.Id == doc.Id)[0];
      this._store.dispatch(new SaveContractAsPDFAction(doc));
    });
    this._downloadAsPdfCommandSub = this._downloadAsPdfCommand.subscribe(document => {
      let doc = document as Document;
      let fileName = doc.Title + ".pdf";
      window.open('/documentproducer/downloadpdf/' + doc.Id + '?filename=' + fileName + '&cid=' + (this._cid ? this._cid : this._claimsHelper.getCompanyId()));
    });

    this._viewCommandSub = this._viewCommand.subscribe(document => {
      let doc = document as Document;
      if (this.contractsFilter == 2) {
        //Need to get the user version of this contract and open that document details page where we can show distribution history and download option
        this._needToOpenUserVersion = true;
        this._userVersionLoading$.next(true);
        this._store.dispatch(new LoadAssociatedUserVersionDocument(doc.Id));
      } else {
        this._needToOpenUserVersion = false;
      }

    });
  }
  ngOnDestroy() {
    if (this._selectedUserVersionSub) {
      this._selectedUserVersionSub.unsubscribe();
    }
    if (this._personalizeDocumentCommandSub) {
      this._personalizeDocumentCommandSub.unsubscribe();
    }
    if (this._downloadAsWordCommandSub) {
      this._downloadAsWordCommandSub.unsubscribe();
    }
    if (this._distributeContractCommandSub) {
      this._distributeContractCommandSub.unsubscribe();
    }
    if (this._updateContractCommandSub) {
      this._updateContractCommandSub.unsubscribe();
    }
    if (this._saveAsPdfCommandSub) {
      this._saveAsPdfCommandSub.unsubscribe();
    }
    if (this._routeParamsSub) {
      this._routeParamsSub.unsubscribe();
    }
    if (this._downloadAsPdfCommandSub) {
      this._downloadAsPdfCommandSub.unsubscribe();
    }
    if (this._saveAsPdfCommandSub) {
      this._saveAsPdfCommandSub.unsubscribe();
    }
  }


  public onBulkDistributeClick() {
    this._showHideDocumentActionSlideOut = true;
  }

  public onAeCancel($event: any) {
    this._closeSlideOut();
  }

  private _closeSlideOut() {
    this._showHideDocumentActionSlideOut = false;
  }
  public getDocActionSlideoutState() {
    return this._showHideDocumentActionSlideOut ? 'expanded' : 'collapsed';
  }

  documentAction(documentActionType: DocumentActionType) {
    let distributeModel = new DistributeModel();
    distributeModel.CompanyId = this._currentAcionedDocument.CompanyId;
    distributeModel.DocumentAction = documentActionType;
    distributeModel.sourceId = this._currentAcionedDocument.SourceDocumentId;
    distributeModel.EmployeeGroup = isNullOrUndefined(this._currentAcionedDocument.EmployeeGroup) ? "" : this._currentAcionedDocument.EmployeeGroup.Name;
    distributeModel.employees = this._currentAcionedDocument.RegardingObject.Id;
    this._store.dispatch(new DocumentBulkDistributionAction(distributeModel));
    this._closeSlideOut();
  }

  // End of public methods

}