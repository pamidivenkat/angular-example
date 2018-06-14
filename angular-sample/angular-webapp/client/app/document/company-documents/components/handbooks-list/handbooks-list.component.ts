import { RouteParams } from './../../../../shared/services/route-params';
import { Router } from '@angular/router';
import { NavigationExtras } from '@angular/router';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { AePageChangeEventModel } from './../../../../atlas-elements/common/models/ae-page-change-event-model';
import { isNullOrUndefined } from 'util';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AtlasParams, AtlasApiRequestWithParams } from './../../../../shared/models/atlas-api-response';
import { SortDirection, AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { Subscription, Observable, Subject, BehaviorSubject } from 'rxjs/Rx';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { LoadHandbooksListAction } from './../../actions/handbooks.actions';
import { Document } from './../../../models/document';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { addOrUpdateAtlasParamValue, getAtlasParamValueByKey } from './../../../../root-module/common/extract-helpers';
import { DocumentDetails, DistributedDocument, DocumentDetailsType } from "../../../document-details/models/document-details-model";
import { DistributeDocumentAction } from "../../../document-details/actions/document-distribute.actions";
import { DocumentDetailsService } from "../../../document-details/services/document-details.service";
import { Tristate } from "../../../../atlas-elements/common/tristate.enum";

@Component({
  selector: 'handbooks-list',
  templateUrl: './handbooks-list.component.html',
  styleUrls: ['./handbooks-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HandbooksListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _handbooksListLoadedSubscription: Subscription;

  private _handbooksListLoaded$: Observable<boolean>;
  private _handbooksListDataTableOptions$: Observable<DataTableOptions>;
  private _handbooksListTotalCount$: Observable<number>;
  private _handbooksRequest$: Observable<Immutable.List<Document>>;

  private _keys = Immutable.List(['FileNameAndTitle', 'SiteName', 'CategoryName', 'Version', 'Type', 'ModifiedOn', 'Status']);
  private _status: Immutable.List<AeSelectItem<string>>;

  private _sitesSubscription: Subscription;
  private _sites$: Observable<AeSelectItem<string>[]>;
  private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _handbooksListForm: FormGroup;
  private _handbooksApiRequest: AtlasApiRequestWithParams;
  private _onDemandDataLoad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _initialLoad: boolean = true;
  private _handbooksApiRequestSubscription: Subscription;
  private _actions: Immutable.List<AeDataTableAction>;
  private _viewDocumentCommand = new Subject();
  private _viewDocumentCommandSub: Subscription;
  private _downloadActionCommand = new Subject();
  private _downloadActionCommandSub: Subscription;
  private _distributeActionCommand = new Subject();
  private _distributeActionCommandSub: Subscription;
  private _showRemoveDocumentDistributeSelectSlideOut: boolean;
  private _documentDetails$: Observable<DocumentDetails>;

  // End of Private Fields

  // Public properties
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get handbooksListForm(): FormGroup {
    return this._handbooksListForm;
  }
  get sites$(): Observable<AeSelectItem<string>[]> {
    return this._sites$;
  }
  get localDataSourceType(): AeDatasourceType {
    return this._localDataSourceType;
  }
  get handbooksListLoaded$(): Observable<boolean> {
    return this._handbooksListLoaded$;
  }
  get handbooksListDataTableOptions$(): Observable<DataTableOptions> {
    return this._handbooksListDataTableOptions$;
  }
  get handbooksListTotalCount$(): Observable<number> {
    return this._handbooksListTotalCount$;
  }
  get handbooksRequest$(): Observable<Immutable.List<Document>> {
    return this._handbooksRequest$
  }

  get keys(): Immutable.List<string> {
    return this._keys;
  }
  get showRemoveDocumentDistributeSelectSlideOut(): boolean {
    return this._showRemoveDocumentDistributeSelectSlideOut;
  }

  get documentType(): DocumentDetailsType {
    return DocumentDetailsType.Document;
  }

  get documentDetails$(): Observable<DocumentDetails> {
    return this._documentDetails$;
  }

  get handbooksApiRequest(): AtlasApiRequestWithParams {
    return this._handbooksApiRequest;
  }

  // End of Public properties

  // Public Input bindings

  // End of Public Input bindings

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _documentDetailsService: DocumentDetailsService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);

    this._status = Immutable.List([
      new AeSelectItem('Draft', '0'),
      new AeSelectItem('Accepted', '1'),
      new AeSelectItem('Reviewing', '2'),
      new AeSelectItem('Returned', '3'),
      new AeSelectItem('Document Upload', '4'),
      new AeSelectItem('Preparing', '5'),
      new AeSelectItem('Published', '6')
    ]);
    this.id='handbook-list';
    this.name='handbook-list';
  }
  // End of constructor

  // Private methods
  private _setActions() {
    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewDocumentCommand, false),
      new AeDataTableAction("Download", this._downloadActionCommand, false),
      new AeDataTableAction("Distribute", this._distributeActionCommand, false, (item) => { return this._showDistributeDocumentAction(item) })
    ]);
  }

  private _showDistributeDocumentAction(item: Document): Tristate {
    return this._claimsHelper.canDistributeAnyDocument ? Tristate.True : Tristate.False;
  }

  private _initForm(site) {
    this._handbooksListForm = this._fb.group({
      site: [{ value: '', disabled: false }],
    });
  }

  // End of private methods

  // Public methods
  public onGridPaging(paginginfo: AePageChangeEventModel) {
    this._handbooksApiRequest.PageNumber = paginginfo.pageNumber;
    this._handbooksApiRequest.PageSize = paginginfo.noOfRows;
    this._store.dispatch(new LoadHandbooksListAction(this._handbooksApiRequest));
  }

  public onGridSorting(sortingInfo: AeSortModel) {
    this._handbooksApiRequest.SortBy.SortField = sortingInfo.SortField;
    this._handbooksApiRequest.SortBy.Direction = sortingInfo.Direction;
    this._store.dispatch(new LoadHandbooksListAction(this._handbooksApiRequest));
  }

  public getStatusName(status) {
    let statusArray = this._status.toArray();
    return statusArray.find(select => select.Value === String(status)).Text;

  }

  ngOnInit() {

    if (isNullOrUndefined(this._handbooksApiRequest))
      this._handbooksApiRequest = <AtlasApiRequestWithParams>{};

    this._handbooksListLoaded$ = this._store.let(fromRoot.getHandbooksLoadingState);
    this._handbooksRequest$ = this._store.let(fromRoot.getHandbooksData);
    this._handbooksListTotalCount$ = this._store.let(fromRoot.getHandbooksListTotalCount);
    this._handbooksListDataTableOptions$ = this._store.let(fromRoot.getHandbooksDataTableOptions);

    this._handbooksListLoadedSubscription = this._store.let(fromRoot.getHandbooksData).subscribe(handbookLoaded => {
      if (!handbookLoaded) {
        let params: AtlasParams[] = new Array();
        this._handbooksApiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, params);
        this._store.dispatch(new LoadHandbooksListAction(this._handbooksApiRequest));
      }
    });
    this._sites$ = this._store.let(fromRoot.getsitesClientsForMultiSelectData);
    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });

    this._initForm('');

    this._handbooksApiRequestSubscription = this._store.let(fromRoot.getHandbooksDocsApiRequestData).subscribe((values) => {
      if (!isNullOrUndefined(values)) {
        this._handbooksApiRequest = values;
        let site: string = '';

        if (this._initialLoad && this._handbooksApiRequest) {
          this._initialLoad = false;

          if (getAtlasParamValueByKey(this._handbooksApiRequest.Params, 'site')) {
            site = getAtlasParamValueByKey(this._handbooksApiRequest.Params, 'site');
          }

          this._initForm(site);
          this._onDemandDataLoad.next(false);
        }
      }
    });



    this._handbooksListForm.valueChanges.subscribe(data => {
      this._handbooksApiRequest.PageNumber = 1;
      if (this._handbooksListForm.valid) {
        this._handbooksApiRequest.Params = addOrUpdateAtlasParamValue(this._handbooksApiRequest.Params, 'site', data.site);
      }
      this._store.dispatch(new LoadHandbooksListAction(this._handbooksApiRequest));
    });

    this._setActions();

    this._viewDocumentCommandSub = this._viewDocumentCommand.subscribe(document => {
      let doc = document as Document;
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      let url = 'document/document-details/' + doc.Id
      this._router.navigate([url], navigationExtras);
    });

    this._distributeActionCommandSub = this._distributeActionCommand.subscribe(document => {
      let doc = document as Document;
      this._documentDetailsService.dispatchDocumentDetails(doc.Id, DocumentDetailsType.Document);
      this._showRemoveDocumentDistributeSelectSlideOut = true;
      this._documentDetails$ = this._documentDetailsService.loadDocumentDetails();
    });

    this._downloadActionCommandSub = this._downloadActionCommand.subscribe(document => {
      let doc = document as Document;
      if (!isNullOrUndefined(doc.Id)) {
        let url = this._routeParamsService.Cid ? `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.Version}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.Version}`
        window.open(url);
      }
    });

  }

  getDocDistributeSlideoutState() {
    return this._showRemoveDocumentDistributeSelectSlideOut ? 'expanded' : 'collapsed';
  }

  onDocumentDistribute(distributedDoc: DistributedDocument) {
    //here we need to despatch the action based on the model we recied with document or shared document
    this._store.dispatch(new DistributeDocumentAction(distributedDoc));
    this._showRemoveDocumentDistributeSelectSlideOut = false;
  }

  onAeCancel($event) {
    this._showRemoveDocumentDistributeSelectSlideOut = false;
  }

  ngOnDestroy() {
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe();
    if (this._handbooksListLoadedSubscription)
      this._handbooksListLoadedSubscription.unsubscribe();
    if (this._handbooksApiRequestSubscription)
      this._handbooksApiRequestSubscription.unsubscribe();
    if (this._viewDocumentCommandSub)
      this._viewDocumentCommandSub.unsubscribe();
    if (this._downloadActionCommandSub)
      this._downloadActionCommandSub.unsubscribe();
    if (this._distributeActionCommandSub)
      this._distributeActionCommandSub.unsubscribe();

  }
  // End of public methods

}