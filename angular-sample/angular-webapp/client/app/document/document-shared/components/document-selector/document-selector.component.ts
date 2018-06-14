import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { EventEmitter, ViewEncapsulation } from '@angular/core';
import { Output } from '@angular/core';
import { AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { AePageChangeEventModel } from './../../../../atlas-elements/common/models/ae-page-change-event-model';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { FormBuilder } from '@angular/forms';
import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isNullOrUndefined } from 'util';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription, Observable } from 'rxjs/Rx';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Input } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { AeDatasourceType } from './../../../../atlas-elements/common/ae-datasource-type';
import { MSRiskAssessment } from './../../../../method-statements/models/method-statement';
import { LoadAuthorizedDocumentCategories } from './../../../../shared/actions/user.actions';
import { mapCategoryDataToAeSelectItems } from './../../../../document/common/document-extract-helper';
import { Document } from './../../../../document/models/document';
import { DocumentCategory } from './../../../../document/models/document-category';
import { DocumentCategoryEnum } from './../../../../document/models/document-category-enum';
import { DocumentCategoryService } from './../../../../document/services/document-category-service';
import { addOrUpdateAtlasParamValue } from './../../../../root-module/common/extract-helpers';
import { LoadCompanyDocumentsAction } from './../../../../document/company-documents/actions/company-documents.actions';


@Component({
  selector: 'document-selector',
  templateUrl: './document-selector.component.html',
  styleUrls: ['./document-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentSelectorComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _documentSelectorForm: FormGroup;
  private _sites$: Observable<AeSelectItem<string>[]>;
  private _sitesSubscription: Subscription;
  private _docSelectRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'ModifiedOn', SortDirection.Ascending, [new AtlasParams('Status', '2')]);
  private _documents$: Observable<Immutable.List<Document>>;
  private _documentsSubscription: Subscription;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>
  private _documentsLoaded$: Observable<boolean>;
  private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _keys = Immutable.List(['Id', 'FileNameAndTitle', 'CategoryName', 'SiteName', 'EmployeeName', 'ModifiedOn', 'Status', 'Version']);
  private _selectedDocs: Document[] = [];
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _selectedRows: Map<string, Document> = new Map<string, Document>();
  private _selectedDocuments: Document[];
  private _docCategoryList: Array<DocumentCategory>;
  private _categoryList: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
  private _documentSelectorFormSubscription: Subscription;
  // End of Private Fields

  // Public properties
  get selectedDocs(): Document[] {
    return this._selectedDocs;
  }
  get docSelectRequest(): AtlasApiRequestWithParams {
    return this._docSelectRequest;
  }

  @Input('selectedDocuments')
  get selectedDocuments() {
    return this._selectedDocuments;
  }
  set selectedDocuments(val: any) {
    this._selectedDocuments = val;
  }

  get categoryList() {
    return this._categoryList;
  }
  // End of Public properties   
  // Public Output bindings
  @Output('selectDocuments')
  _selectDocuments: EventEmitter<Document[]> = new EventEmitter<Document[]>();

  @Output('aeClose')
  _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();
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
    , private _fb: FormBuilder
    , private _documentCategoryService: DocumentCategoryService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods
  onDocSelectorFormClosed($event) {
    this._aeClose.emit(true);
  }
  onDocSelectorFormSubmit($event) {

    this._selectDocuments.emit(this._selectedDocs);
    this._aeClose.emit(true);
  }
  private _initForm() {
    this._documentSelectorForm = this._fb.group({
      CategoryId: [{ value: null, disabled: false }],
      Site: [{ value: '', disabled: false }],
      DocumentName: [{ value: '', disabled: false }]
    }
    );
  }
  onPageChange(page: AePageChangeEventModel) {
    this._docSelectRequest.PageNumber = page.pageNumber;
    this._docSelectRequest.PageSize = page.noOfRows;
    this._store.dispatch(new LoadCompanyDocumentsAction(this._docSelectRequest));
  }
  onSort(sort: AeSortModel) {
    this._docSelectRequest.SortBy.SortField = sort.SortField;
    this._docSelectRequest.SortBy.Direction = sort.Direction;
    this._store.dispatch(new LoadCompanyDocumentsAction(this._docSelectRequest));
  }
  // End of private methods

  // Public methods
  get keys() {
    return this._keys;
  }

  get documentsLoaded$() {
    return this._documentsLoaded$;
  }

  get recordsCount$() {
    return this._recordsCount$;
  }

  get documents$() {
    return this._documents$;
  }

  get sites$() {
    return this._sites$;
  }

  get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  get lightClass() {
    return this._lightClass;
  }

  get documentSelectorForm() {
    return this._documentSelectorForm;
  }

  get localDataSourceType() {
    return this._localDataSourceType;
  }

  public onSelectRow(checked: boolean, item: Document) {
    if (checked) {
      this._selectedRows.set(item.Id, item);
    }
    else {
      this._selectedRows.delete(item.Id);
    }
    this.updateSelectedDocuments(this._selectedRows);
  }

  public updateSelectedDocuments(selectedRows: Map<string, Document>) {
    this._selectedDocs = [];//empty the results before preparing new data set
    selectedRows.forEach((value: Document, key: string) => {
      this._selectedDocs.push(value);
    });
  }

  public checkIfSelected(item: any): boolean {
    if (!isNullOrUndefined(item)) {
      if (this._selectedDocs && this._selectedDocs.find(p => p.Id === item.Id)) {
        return true;
      } else if (this._selectedDocuments && this._selectedDocuments.find(p => p.Id === item.Id)) {
        return true;
      } else {
        return false;
      }
    }
  }

  public disableChecklist(item: any): boolean {
    if (!isNullOrUndefined(item)) {
      if (this._selectedDocuments && this._selectedDocuments.find(p => p.Id === item.Id)) {
        return true;
      } else {
        return false;
      }
    }
  }

  ngOnInit(): void {
    this._initForm();
    this._store.let(fromRoot.getDocumentCategoriesData).subscribe(res => {
      if (isNullOrUndefined(res)) {
        this._store.dispatch(new LoadAuthorizedDocumentCategories(true));
      }
      else {
        this._docCategoryList = this._documentCategoryService._getUniqueCategories(res.filter(d => d.DocumentArea === 1));
        this._categoryList = mapCategoryDataToAeSelectItems(this._docCategoryList);
        this._cdRef.markForCheck();
      }
    });

    this._sites$ = this._store.let(fromRoot.getsitesClientsForMultiSelectData);
    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });

    this._documents$ = this._store.let(fromRoot.getCompanyDocumentsData);
    this._documentsLoaded$ = this._store.let(fromRoot.getCompanyDocumentsLoadedData);
    this._dataTableOptions$ = this._store.let(fromRoot.getCompanyDocumentsDataTableOptionsData);
    this._recordsCount$ = this._store.let(fromRoot.getCompanyDocumentsTotalCountData);

    this._documentSelectorFormSubscription = this._documentSelectorForm.valueChanges.subscribe(data => {
      this._docSelectRequest.PageNumber = 1;
      this._docSelectRequest.Params = addOrUpdateAtlasParamValue(this._docSelectRequest.Params, 'DocumentFolder', null);
      this._docSelectRequest.Params = addOrUpdateAtlasParamValue(this._docSelectRequest.Params, 'Site', data.Site && data.Site[0] ? data.Site[0] : null);
      this._docSelectRequest.Params = addOrUpdateAtlasParamValue(this._docSelectRequest.Params, 'DocumentCategory', data.CategoryId);
      this._docSelectRequest.Params = addOrUpdateAtlasParamValue(this._docSelectRequest.Params, 'DocumentNameQuery', data.DocumentName);
      this._store.dispatch(new LoadCompanyDocumentsAction(this._docSelectRequest));
    });

    this._store.dispatch(new LoadCompanyDocumentsAction(this._docSelectRequest));
  }

  ngOnDestroy(): void {
    if (this._sitesSubscription) {
      this._sitesSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._documentsSubscription)) {
      this._documentsSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._documentSelectorFormSubscription)) {
      this._documentSelectorFormSubscription.unsubscribe();
    }
  }
  // End of public methods

}
