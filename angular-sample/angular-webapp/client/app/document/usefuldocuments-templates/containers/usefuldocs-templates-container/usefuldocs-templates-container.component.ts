import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { sharedDocument } from './../../models/sharedDocument';
import { LoadAuthorizedSharedDocumentCategories } from './../../../../shared/actions/user.actions';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Rx';
import { ChangeDetectionStrategy, ViewEncapsulation, AfterContentInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import { AtlasApiRequest, AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';
import { LoadUsefulDocsListAction } from './../../actions/usefuldocs.actions';
import { AdditionalService } from './../../../../shared/models/lookup.models';
import { LoadAdditionalServiceAction } from './../../../../shared/actions/lookup.actions';
import { Country } from './../../../../shared/models/lookup.models';
import { CountryLoadAction } from './../../../../shared/actions/lookup.actions';
import * as Immutable from 'immutable';
import { DistributedDocument, DocumentDetailsType, DocumentDetails } from "../../../../document/document-details/models/document-details-model";
import { DistributeDocumentAction } from "../../../../document/document-details/actions/document-distribute.actions";
import { DocumentDetailsService } from "../../../../document/document-details/services/document-details.service";
import { isNullOrUndefined } from 'util';
@Component({
  selector: 'usefuldocs-templates-container',
  templateUrl: './usefuldocs-templates-container.component.html',
  styleUrls: ['./usefuldocs-templates-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UsefuldocsTemplatesContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields

  private _usefulDocsListLoadedSubscription: Subscription;
  private _additionalServiceSubscription: Subscription;
  private _additionalServiceLoaded$: Observable<boolean>;
  private _additionalService$: Observable<AdditionalService[]>;
  private _docCategoryList$: Observable<sharedDocument[]>;
  private _categoryDataLoaded$: Observable<boolean>
  private _categoryDataLoadedSubscription: Subscription;
  private _country$: Observable<Country[]>;
  private _countryDataLoaded$: Observable<boolean>
  private _countryDataLoadedSubscription: Subscription;
  private _additionalServiceList: AdditionalService[];
  private _additionalService: Array<any>;
  private _countrySelectList: Array<any>;
  private _categoryList: sharedDocument[];
  private _docCategoryList: Immutable.List<AeSelectItem<string>>;
  private _usefulDocApiRequest: AtlasApiRequestWithParams;
  private _showRemoveDocumentDistributeSelectSlideOut: boolean;
  private _documentDetails$: Observable<DocumentDetails>;

  // End of Private Fields

  // Public properties
  get usefulDocApiRequest(): AtlasApiRequestWithParams {
    return this._usefulDocApiRequest;
  }

  get country$(): Observable<Country[]> {
    return this._country$;
  }

  get docCategoryList$(): Observable<sharedDocument[]> {
    return this._docCategoryList$;
  }

  get additionalService$(): Observable<AdditionalService[]> {
    return this._additionalService$;
  }

  get showRemoveDocumentDistributeSelectSlideOut(): boolean {
    return this._showRemoveDocumentDistributeSelectSlideOut;
  }

  get documentType(): DocumentDetailsType {
    return DocumentDetailsType.SharedDocument;
  }

  get documentDetails$(): Observable<DocumentDetails> {
    return this._documentDetails$;
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
    , protected _store: Store<fromRoot.State>
    , private _documentDetailsService: DocumentDetailsService

  ) {
    super(_localeService, _translationService, _cdRef);
    this.id = 'usefuldocs-templates-container';
    this.name = 'usefuldocs-templates-container';
  }

  // End of constructor

  // Private methods

  // End of private methods

  // Public methods
  ngOnInit() {
    this._usefulDocsListLoadedSubscription = this._store.let(fromRoot.getUsefulDocsApiRequesttData).subscribe(docsListLoaded => {
      if (isNullOrUndefined(docsListLoaded)) {
        let params: AtlasParams[] = new Array();
        this._usefulDocApiRequest = new AtlasApiRequestWithParams(1, 10, 'Title', SortDirection.Ascending, params);
        this._store.dispatch(new LoadUsefulDocsListAction(this._usefulDocApiRequest));
      }
    });

    this._additionalServiceLoaded$ = this._store.let(fromRoot.getAdditionalServiceLoadStatus);
    this._additionalService$ = this._store.let(fromRoot.getAdditionalServiceData);

    if (!this._additionalServiceSubscription) {
      this._additionalServiceSubscription = this._additionalServiceLoaded$.subscribe(additionalService => {
        if (!additionalService)
          this._store.dispatch(new LoadAdditionalServiceAction(true));
      });
    }

    this._categoryDataLoaded$ = this._store.let(fromRoot.getSharedDocumentCategoriesStatus);
    this._docCategoryList$ = this._store.let(fromRoot.getSharedDocumentCategoriesData);
    this._categoryDataLoadedSubscription = this._categoryDataLoaded$.subscribe(categoryLoaded => {
      if (!categoryLoaded) {
        this._store.dispatch(new LoadAuthorizedSharedDocumentCategories(null));
      }
    });


    this._countryDataLoaded$ = this._store.let(fromRoot.getCountryLoadingState);
    this._country$ = this._store.let(fromRoot.getCountryData);
    this._countryDataLoadedSubscription = this._countryDataLoaded$.subscribe(countryLoaded => {
      if (!countryLoaded)
        this._store.dispatch(new CountryLoadAction(null));
    });

  }

  getDocDistributeSlideoutState() {
    return this._showRemoveDocumentDistributeSelectSlideOut ? 'expanded' : 'collapsed';
  }

  onShowDistribute($event) {
    this._showRemoveDocumentDistributeSelectSlideOut = true;
    this._documentDetails$ = this._documentDetailsService.loadDocumentDetails();
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
    if (this._countryDataLoadedSubscription)
      this._countryDataLoadedSubscription.unsubscribe();
    if (this._categoryDataLoadedSubscription)
      this._categoryDataLoadedSubscription.unsubscribe();
    if (this._additionalServiceSubscription)
      this._additionalServiceSubscription.unsubscribe();
    if (this._usefulDocsListLoadedSubscription)
      this._usefulDocsListLoadedSubscription.unsubscribe();
  }
  // End of public methods

}
