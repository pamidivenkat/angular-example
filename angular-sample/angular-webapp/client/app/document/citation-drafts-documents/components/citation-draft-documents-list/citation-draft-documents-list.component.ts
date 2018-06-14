import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { Tristate } from '../../../../atlas-elements/common/tristate.enum';
import { AePageChangeEventModel } from './../../../../atlas-elements/common/models/ae-page-change-event-model';
import { DocumentCategory } from '../../../models/document-category';
import { DocumentCategoryEnum } from '../../../models/document-category-enum';
import { DocumentCategoryService } from './../../../services/document-category-service';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { LoadCitationDraftsListAction } from './../../actions/citation-drafts.actions';
import * as Immutable from 'immutable';
import { Document, DocumentsFolder } from './../../../models/document';
import { AtlasApiRequest, AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { SortDirection, AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { FormGroup, FormBuilder, Validator } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { Site } from './../../../../company/sites/models/site.model';
import { mapCategoryDataToAeSelectItems } from './../../../common/document-extract-helper';
import { LoadAuthorizedDocumentCategories } from './../../../../shared/actions/user.actions';
import { addOrUpdateAtlasParamValue, getAtlasParamValueByKey } from './../../../../root-module/common/extract-helpers';
import { DocumentState } from "../../../../document/common/document-state.enum";

@Component({
  selector: 'citation-draft-documents-list',
  templateUrl: './citation-draft-documents-list.component.html',
  styleUrls: ['./citation-draft-documents-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CitationDraftDocumentsListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _citationDraftsListLoaded$: Observable<boolean>;
  private _citationDraftsRequest$: Observable<Immutable.List<Document>>;
  private _citationDraftsListLoadedSubscription: Subscription;
  private _citationDraftsSitesSubscription: Subscription;
  private _citationDraftsCategorySubscription: Subscription;
  private _keys = Immutable.List(['FileNameAndTitle', 'CategoryName', 'Version', 'SiteName', 'EmployeeName', 'ModifiedOn', 'Status']);
  private _citationDraftsListDataTableOptions$: Observable<DataTableOptions>;
  private _citationDraftsListTotalCount$: Observable<number>;
  private _actions: Immutable.List<AeDataTableAction>;

  private _status: Immutable.List<AeSelectItem<string>>;

  private _sites$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _categoryList: Immutable.List<AeSelectItem<string>> = Immutable.List([]);

  private _initialLoad: boolean = true;
  private _updateActionCommand: Subject<Document> = new Subject();
  private _reviewActionCommand: Subject<Document> = new Subject()
  private _draftDocumentForm: FormGroup;
  private sitesApiRequestParams: AtlasApiRequestWithParams;
  private _draftApiRequest: AtlasApiRequestWithParams;
  private _docCategoryList: Array<DocumentCategory>;
  private _reviewActionSubscription: Subscription;
  private _citationDraftsApiRequestSubscription: Subscription;
  private _onDemandDataLoad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // End of Private Fields

  // Public properties
  get draftDocumentForm(): FormGroup {
    return this._draftDocumentForm;
  }
  get status(): Immutable.List<AeSelectItem<string>> {
    return this._status;
  }

  get sites$(): Observable<Immutable.List<AeSelectItem<string>>> {
    return this._sites$;
  }
  get categoryList(): Immutable.List<AeSelectItem<string>> {
    return this._categoryList;
  }

  get citationDraftsListLoaded$(): Observable<boolean> {
    return this._citationDraftsListLoaded$;
  }
  get citationDraftsRequest$(): Observable<Immutable.List<Document>> {
    return this._citationDraftsRequest$;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get citationDraftsListTotalCount$(): Observable<number> {
    return this._citationDraftsListTotalCount$;
  }
  get citationDraftsListDataTableOptions$(): Observable<DataTableOptions> {
    return this._citationDraftsListDataTableOptions$;
  }
  get keys(): Immutable.List<string> {
    return this._keys;
  }
  get reviewActionCommand(){
    return this._reviewActionCommand;
  }
  // End of Public properties

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
    , private _documentCategoryService: DocumentCategoryService
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _route: ActivatedRoute
    , private _router: Router) {
    super(_localeService, _translationService, _cdRef);
    this.id = 'citation-draft-documents-list'
    this.name = 'citation-draft-documents-list'
  }
  // End of constructor

  // Private methods
  private _showReviewAction(item: Document): Tristate {
    if (item.Status === DocumentState.Reviewing)
      return Tristate.True;
    return Tristate.False;
  }

  private _initForm(category, site, documentstatus) {
    this._draftDocumentForm = this._fb.group({
      category: [{ value: category, disabled: false }],
      sites: [{ value: site, disabled: false }],
      status: [{ value: documentstatus, disabled: false }],

    });
  }
  // End of private methods

  // Public methods

  public getStatusName(status) {
    let statusArray = this._status.toArray();
    let statusField = statusArray.find(select => select.Value === String(status));
    if (isNullOrUndefined(statusField)) {
      return '';
    } else {
      return statusField.Text;
    }
  }

  public onGridPaging(paginginfo: AePageChangeEventModel) {
    this._draftApiRequest.PageNumber = paginginfo.pageNumber;
    this._draftApiRequest.PageSize = paginginfo.noOfRows;
    this._store.dispatch(new LoadCitationDraftsListAction(this._draftApiRequest));
  }

  public onGridSorting(sortingInfo: AeSortModel) {
    this._draftApiRequest.SortBy.SortField = sortingInfo.SortField;
    this._draftApiRequest.SortBy.Direction = sortingInfo.Direction;
    this._store.dispatch(new LoadCitationDraftsListAction(this._draftApiRequest));
  }

  ngOnInit() {
    // Actions
    this._actions = Immutable.List([
      new AeDataTableAction("Review", this._reviewActionCommand, false, (item) => { return this._showReviewAction(item) })
    ]);

    this._status = Immutable.List([new AeSelectItem('Returned', '3'), new AeSelectItem('Reviewing', '2')]);
    // Actions Ends

    this._citationDraftsListLoaded$ = this._store.let(fromRoot.getCitationDraftsLoadingState);
    this._citationDraftsRequest$ = this._store.let(fromRoot.getCitationDraftsData);
    this._citationDraftsListTotalCount$ = this._store.let(fromRoot.getCitationDraftsListTotalCount);
    this._citationDraftsListDataTableOptions$ = this._store.let(fromRoot.getCitationDraftsDataTableOptions);

    this._citationDraftsListLoadedSubscription = this._store.let(fromRoot.getCitationDraftsData).subscribe(draftsListLoaded => {
      if (!draftsListLoaded) {
        let params: AtlasParams[] = new Array();
        this._draftApiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, params);
        this._store.dispatch(new LoadCitationDraftsListAction(this._draftApiRequest));
      }
    });

    if (isNullOrUndefined(this._draftApiRequest))
      this._draftApiRequest = <AtlasApiRequestWithParams>{};

    this._citationDraftsApiRequestSubscription = this._store.let(fromRoot.getCitationDraftsApiRequestData).subscribe((values) => {
      if (!isNullOrUndefined(values)) {
        this._draftApiRequest = values;
        let category: string = '';
        let site: string = '';
        let documentstatus: string = '';

        if (this._initialLoad && this._draftApiRequest) {
          this._initialLoad = false;
          if (getAtlasParamValueByKey(this._draftApiRequest.Params, 'category')) {
            category = getAtlasParamValueByKey(this._draftApiRequest.Params, 'category');
          }
          if (getAtlasParamValueByKey(this._draftApiRequest.Params, 'site')) {
            site = getAtlasParamValueByKey(this._draftApiRequest.Params, 'site');
          }
          if (getAtlasParamValueByKey(this._draftApiRequest.Params, 'documentstatus')) {
            documentstatus = getAtlasParamValueByKey(this._draftApiRequest.Params, 'documentstatus');
          }

          this._initForm(category, site, documentstatus);
          this._onDemandDataLoad.next(false);
        }
      }
    });

    this._sites$ = this._store.let(fromRoot.sitesForClientsImmutableData);

    this._citationDraftsSitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });


    this._citationDraftsCategorySubscription = this._store.let(fromRoot.getDocumentCategoriesData).subscribe(res => {
      if (isNullOrUndefined(res)) {
        this._store.dispatch(new LoadAuthorizedDocumentCategories(true));
      }
      else {
        this._docCategoryList = this._documentCategoryService._getUniqueCategories(res.filter(d => d.DocumentArea === 1));
        let folderCategories = this._documentCategoryService.getFolderCategories(DocumentsFolder.CitationDrafts);
        this._docCategoryList = this._docCategoryList.filter((category) => {
          let existingCat = folderCategories.filter(cat => cat == category.Code);
          return existingCat && existingCat.length > 0;
        });
        this._categoryList = mapCategoryDataToAeSelectItems(this._docCategoryList);
      }
    });

    this._draftDocumentForm.valueChanges.subscribe(data => {
      this._draftApiRequest.PageNumber = 1;
      if (this._draftDocumentForm.valid) {
        this._draftApiRequest.Params = addOrUpdateAtlasParamValue(this._draftApiRequest.Params, 'category', data.category);
        this._draftApiRequest.Params = addOrUpdateAtlasParamValue(this._draftApiRequest.Params, 'site', data.sites);
        this._draftApiRequest.Params = addOrUpdateAtlasParamValue(this._draftApiRequest.Params, 'documentstatus', data.status);
      }
      this._store.dispatch(new LoadCitationDraftsListAction(this._draftApiRequest));
    });

    this._reviewActionSubscription = this._reviewActionCommand.subscribe((document) => {
      this._router.navigate(["document/review/" + document.Id]);
    })

  }

  ngOnDestroy() {
    if (this._citationDraftsListLoadedSubscription)
      this._citationDraftsListLoadedSubscription.unsubscribe();
    if (this._citationDraftsSitesSubscription)
      this._citationDraftsSitesSubscription.unsubscribe();
    if (this._citationDraftsCategorySubscription)
      this._citationDraftsCategorySubscription.unsubscribe();
    if (this._reviewActionSubscription) {
      this._reviewActionSubscription.unsubscribe();
    }
    if (this._citationDraftsApiRequestSubscription) {
      this._citationDraftsApiRequestSubscription.unsubscribe();
    }
  }
  // End of public methods

}
