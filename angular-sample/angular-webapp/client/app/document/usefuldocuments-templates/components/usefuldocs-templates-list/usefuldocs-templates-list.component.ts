import { getCateoryNames, getServiceNames } from '../../../document-details/common/document-details-extract-helper';
import { DocumentCategory } from '../../../models/document-category';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { NavigationExtras, Router } from '@angular/router';
import { AePageChangeEventModel } from './../../../../atlas-elements/common/models/ae-page-change-event-model';
import { LoadUsefulDocsListAction } from './../../actions/usefuldocs.actions';
import { AtlasApiRequestWithParams } from './../../../../shared/models/atlas-api-response';
import { mapSharedCategoryDataToAeSelectItems } from '../../../common/document-extract-helper';
import { isNullOrUndefined } from 'util';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { AeSortModel } from '../../../../atlas-elements/common/models/ae-sort-model';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import * as Immutable from 'immutable';
import * as fromRoot from './../../../../shared/reducers';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { sharedDocument } from './../../models/sharedDocument';
import { AdditionalService } from './../../../../shared/models/lookup.models';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Country } from ".././../../../shared/models/lookup.models";
import { FormGroup, FormBuilder, Validator } from '@angular/forms';
import { AeDatasourceType } from './../../../../atlas-elements/common/ae-datasource-type';
import { addOrUpdateAtlasParamValue, getAtlasParamValueByKey } from './../../../../root-module/common/extract-helpers';
import { DocumentDetailsService } from "../../../../document/document-details/services/document-details.service";
import { DocumentDetailsType } from "../../../../document/document-details/models/document-details-model";
import { Tristate } from "../../../../atlas-elements/common/tristate.enum";

@Component({
  selector: 'usefuldocs-templates-list',
  templateUrl: './usefuldocs-templates-list.component.html',
  styleUrls: ['./usefuldocs-templates-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UsefuldocsTemplatesListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields  
  private _usefulDocsRequestLoaded$: Observable<boolean>;
  private _usefulDocsRequest$: Observable<Immutable.List<sharedDocument>>;
  private _keys = Immutable.List(['Title', 'Service Name', 'Categories', 'Keywords', 'Upload date']);
  private _usefulDocsListDataTableOptions$: Observable<DataTableOptions>;
  private _usefulDocsListTotalCount$: Observable<number>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _viewActionCommand = new Subject();
  private _additionalServiceList: AdditionalService[];
  private _additionalService: Array<any>;
  private _country: Country[];
  private _countrySelectList: Array<any>;
  private _categoryList: sharedDocument[];
  private _docCategoryList: Array<AeSelectItem<string>>;
  private _usefulDocumentForm: FormGroup;
  private _dataSouceType: AeDatasourceType;
  private _usefulDocApiRequest: AtlasApiRequestWithParams;
  private _viewActionCommandSub: Subscription;
  private _initialLoad: boolean = true;
  private _onDemandDataLoad: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _serviceStatusFIlter: Array<any>;
  private _downloadActionCommand = new Subject();
  private _downloadActionCommandSub: Subscription;
  private _distributeActionCommand = new Subject();
  private _distributeActionCommandSub: Subscription;
  // End of Private Fields

  // Public properties

  get usefulDocumentForm(): FormGroup {
    return this._usefulDocumentForm;
  }

  get serviceStatusFIlter(): Array<any> {
    return this._serviceStatusFIlter;
  }

  get additionalService(): Array<any> {
    return this._additionalService;
  }

  get dataSouceType(): AeDatasourceType {
    return this._dataSouceType;
  }

  get docCategoryList(): Array<AeSelectItem<string>> {
    return this._docCategoryList;
  }

  get countrySelectList(): Array<any> {
    return this._countrySelectList;
  }

  get usefulDocsRequest$(): Observable<Immutable.List<sharedDocument>> {
    return this._usefulDocsRequest$;
  }

  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }

  get usefulDocsListTotalCount$(): Observable<number> {
    return this._usefulDocsListTotalCount$;
  }

  get usefulDocsListDataTableOptions$(): Observable<DataTableOptions> {
    return this._usefulDocsListDataTableOptions$;
  }

  get usefulDocsRequestLoaded$(): Observable<boolean> {
    return this._usefulDocsRequestLoaded$;
  }

  get keys(): Immutable.List<string> {
    return this._keys;
  }

  // End of Public properties
  //Input Bindings

  @Input('usefulDocApiRequest')
  set usefulDocApiRequest(val: AtlasApiRequestWithParams) {
    this._usefulDocApiRequest = val;
  }
  get usefulDocApiRequest() {
    return this._usefulDocApiRequest;
  }


  @Input('additionalServiceList')
  get additionalServiceList() {
    return this._additionalServiceList;
  }
  set additionalServiceList(val: any[]) {
    this._additionalServiceList = val;
    if (!isNullOrUndefined(val)) {
      val.sort(function (a, b) { return a.Title < b.Title ? 0 : 1; });
      this._additionalService = val;
    }
  }

  @Input('country')
  set country(value: Country[]) {
    this._country = value;
    if (!isNullOrUndefined(value)) {
      value.sort(function (a, b) { return a.Name < b.Name ? 0 : 1; });
      this._countrySelectList = value;
    }
  }
  get country(): Country[] {
    return this._country;
  }


  @Input('categoryList')
  set categoryList(value: Array<sharedDocument>) {
    this._categoryList = value;
    if (value) {
      this._docCategoryList = mapSharedCategoryDataToAeSelectItems(this._categoryList, this._additionalService);
    }
  }
  get categoryList(): Array<sharedDocument> {
    return this._categoryList;
  }



  // Public output bindings
  @Output('docDistribute') _docDistribute: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Public output bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , protected _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _documentDetailsService: DocumentDetailsService
  ) {
    super(_localeService, _translationService, _cdRef);

    // Actions
    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewActionCommand, false),
      new AeDataTableAction("Download", this._downloadActionCommand, false),
      new AeDataTableAction("Distribute", this._distributeActionCommand, false, (item) => { return this._showDistributeDocumentAction(item) })
    ]);
    // Actions Ends
    this._dataSouceType = AeDatasourceType.Local;
    this.id = 'usefuldocs-templates-list';
    this.name = 'usefuldocs-templates-list';
  }

  // End of constructor

  // Private methods

  private _showDistributeDocumentAction(item: Document): Tristate {
    return this._claimsHelper.canDistributeAnySharedDocument ? Tristate.True : Tristate.False;
  }

  private _initForm(additionalService, category, country, search) {
    this._usefulDocumentForm = this._fb.group({
      additionalService: [{ value: additionalService, disabled: false }],
      category: [{ value: category, disabled: false }],
      country: [{ value: country, disabled: false }],
      search: [{ value: search, disabled: false }],

    });
  }

  // End of private methods

  // Public methods
  onGridPageChange(paginginfo: AePageChangeEventModel) {
    this._usefulDocApiRequest.PageNumber = paginginfo.pageNumber;
    this._usefulDocApiRequest.PageSize = paginginfo.noOfRows;
    this._store.dispatch(new LoadUsefulDocsListAction(this._usefulDocApiRequest));
  }

  onGridSortChange(sortingInfo: AeSortModel) {
    this._usefulDocApiRequest.SortBy.SortField = sortingInfo.SortField;
    this._usefulDocApiRequest.SortBy.Direction = sortingInfo.Direction;
    this._store.dispatch(new LoadUsefulDocsListAction(this._usefulDocApiRequest));
  }

  onServiceFilterCleared($event: any) {
    this._usefulDocumentForm.get('category').setValue([]);
    this._docCategoryList = mapSharedCategoryDataToAeSelectItems(this._categoryList, this._additionalService);
  }

  onServiceFilterChanged(datachange: any) {
    let aeSelectarr = [];
    if (!isNullOrUndefined(datachange)) {
      datachange.map((selectItem) => {
        let selection = this._additionalService.filter(sc =>
          (sc.Code === selectItem.Entity.Code)
        );
        aeSelectarr = aeSelectarr.concat(selection);

      });
    }
    if (aeSelectarr.length == 0) {
      aeSelectarr = this._additionalService;
    }
    this._usefulDocumentForm.get('category').setValue([]);
    this._docCategoryList = mapSharedCategoryDataToAeSelectItems(this._categoryList, aeSelectarr);
  }
  ngOnInit() {
    if (isNullOrUndefined(this._usefulDocApiRequest))
      this._usefulDocApiRequest = <AtlasApiRequestWithParams>{};

    this._usefulDocsRequestLoaded$ = this._store.let(fromRoot.getUsefulDocsLoadingState);
    this._usefulDocsRequest$ = this._store.let(fromRoot.getUsefulDocsData);
    this._usefulDocsListTotalCount$ = this._store.let(fromRoot.getUsefulDocsListTotalCount);
    this._usefulDocsListDataTableOptions$ = this._store.let(fromRoot.getUsefulDocsDataTableOptions);

    this._store.let(fromRoot.getUsefulDocsApiRequesttData).subscribe((values) => {
      if (!isNullOrUndefined(values)) {

        this._usefulDocApiRequest = values;
        let additionalService = [];
        let category: Immutable.List<AeSelectItem<string>>;
        let country = [];
        let search: string = '';

        if (this._initialLoad && this._usefulDocApiRequest) {
          this._initialLoad = false;
          if (getAtlasParamValueByKey(this._usefulDocApiRequest.Params, 'additionalService')) {
            let additionalServiceId = getAtlasParamValueByKey(this._usefulDocApiRequest.Params, 'additionalService');
            additionalServiceId.map((selectItem) => {
              let selection = this._additionalService.filter(sc =>
                (sc.Id === selectItem)
              );
              additionalService = additionalService.concat(selection);
            });
            this._docCategoryList = mapSharedCategoryDataToAeSelectItems(this._categoryList, additionalService);
          }

          if (getAtlasParamValueByKey(this._usefulDocApiRequest.Params, 'category')) {
            category = getAtlasParamValueByKey(this._usefulDocApiRequest.Params, 'category');
          }
          if (getAtlasParamValueByKey(this._usefulDocApiRequest.Params, 'country')) {
            let countryIds = getAtlasParamValueByKey(this._usefulDocApiRequest.Params, 'country');
            countryIds.map((selectCountry) => {
              let selectionCountry = this._countrySelectList.filter(ct =>
                (ct.Id === selectCountry)
              );
              country = country.concat(selectionCountry);
            });
          }
          if (getAtlasParamValueByKey(this._usefulDocApiRequest.Params, 'search')) {
            search = getAtlasParamValueByKey(this._usefulDocApiRequest.Params, 'search');
          }

          this._initForm(additionalService, category, country, search);
          this._onDemandDataLoad.next(false);
        }
      }
    });



    this._usefulDocumentForm.valueChanges.subscribe(data => {
      this._usefulDocApiRequest.PageNumber = 1;
      if (this._usefulDocumentForm.valid) {
        if (!isNullOrUndefined(data.additionalService) && !StringHelper.isNullOrUndefinedOrEmpty(String(data.additionalService))) {
          if (!isNullOrUndefined(data.additionalService[0].Id)) {
            let additionalServiceObj = [];
            data.additionalService.map((selectItem) => {
              additionalServiceObj.push(selectItem.Id);
            });
            data.additionalService = additionalServiceObj;
          }
          this._store.let(fromRoot.getAdditionalServiceData).subscribe(serviceData => {
            if (data.additionalService.length != serviceData.length) {
              this._usefulDocApiRequest.Params = addOrUpdateAtlasParamValue(this._usefulDocApiRequest.Params, 'additionalService', data.additionalService);
            }
          });
        } else {
          this._usefulDocApiRequest.Params = addOrUpdateAtlasParamValue(this._usefulDocApiRequest.Params, 'additionalService', '');
        }

        let selectedCategories = !isNullOrUndefined(data.category) ? data.category.join() : null;
        this._usefulDocApiRequest.Params = addOrUpdateAtlasParamValue(this._usefulDocApiRequest.Params, 'category', selectedCategories);
        if (!isNullOrUndefined(data.country) && !StringHelper.isNullOrUndefinedOrEmpty(String(data.country))) {
          if (!isNullOrUndefined(data.country[0].Id)) {
            let countryObj = [];
            data.country.map((c) => {
              countryObj.push(c.Id);
            });
            data.country = countryObj;
          }
          this._store.let(fromRoot.getCountryData).subscribe(countryData => {
            if (data.country.length != countryData.length) {
              this._usefulDocApiRequest.Params = addOrUpdateAtlasParamValue(this._usefulDocApiRequest.Params, 'country', data.country);
            }
          });
        } else {
          this._usefulDocApiRequest.Params = addOrUpdateAtlasParamValue(this._usefulDocApiRequest.Params, 'country', '');
        }

        this._usefulDocApiRequest.Params = addOrUpdateAtlasParamValue(this._usefulDocApiRequest.Params, 'search', data.search);
      }
      this._store.dispatch(new LoadUsefulDocsListAction(this._usefulDocApiRequest));

    });



    this._viewActionCommandSub = this._viewActionCommand.subscribe(document => {
      let doc = document as sharedDocument;
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      let url = 'document/shared-document-details/' + doc.Id
      this._router.navigate([url], navigationExtras);
    });

    this._distributeActionCommandSub = this._distributeActionCommand.subscribe(document => {
      let doc = document as sharedDocument;
      this._documentDetailsService.dispatchDocumentDetails(doc.Id, DocumentDetailsType.SharedDocument);
      this._docDistribute.emit(true);
    });

    this._downloadActionCommandSub = this._downloadActionCommand.subscribe(document => {
      let doc = document as sharedDocument;
      if (!isNullOrUndefined(doc.Id)) {
        window.open(`/filedownload?sharedDocumentId=${doc.Id}&?isShared=true`);
      }
    });

  }

  ngOnDestroy() {
    if (this._viewActionCommandSub)
      this._viewActionCommandSub.unsubscribe();
    if (this._downloadActionCommandSub)
      this._downloadActionCommandSub.unsubscribe();
    if (this._distributeActionCommandSub)
      this._distributeActionCommandSub.unsubscribe();
  }

  getCategoryName(categories: sharedDocument[]): string {
    return getCateoryNames(categories);
  }

  getServiceNames(categories: sharedDocument[]): string {
    return getServiceNames(categories);
  }
  // End of public methods
}
