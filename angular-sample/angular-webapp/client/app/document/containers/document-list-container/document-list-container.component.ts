import { AeInformationBarItemType } from '../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { RouteParams } from './../../../shared/services/route-params';
import { LoadCompanyDocumentsStatAction } from './../../company-documents/actions/company-documents.actions';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { LoadCompanyDocumentsToReview, LoadCompanyUsefulDocumentsToReview } from './../../actions/shared-documents.actions';
import { LoadDocumentInformationBarAction } from './../../actions/information-bar-actions';
import { AtlasApiRequest, AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import { DocumentConstants } from './../../document-constants';
import { Route, Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { InformationBarService } from './../../services/information-bar-service';
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import { Observable } from 'rxjs/Rx';
import { ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import * as InformationBarActions from '../../actions/information-bar-actions';
import * as CompanyDocumentsActions from '../../actions/shared-documents.actions';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { MessengerService } from '../../../shared/services/messenger.service';
import { DocumentService } from '../../services/document-service';
import { BreadcrumbService } from "./../../../atlas-elements/common/services/breadcrumb-service";
import { IBreadcrumb } from "./../../../atlas-elements/common/models/ae-ibreadcrumb.model";
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'document-list-container',
  templateUrl: './document-list-container.component.html',
  styleUrls: ['./document-list-container.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentListContainerComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _documentsInformationBarLoaded$: Observable<boolean>;
  private _documentsInformationItems$: Observable<AeInformationBarItem[]>;
  private _selectedTabIndex: number;
  private _documentsToReviewAndDistributeUrl: string = DocumentConstants.Routes.DocumentsToReviewAndDistribute;
  private _companyDocumentsUrl: string = DocumentConstants.Routes.CompanyDocuments;
  private _distributedDocumentsUrl: string = DocumentConstants.Routes.DistributedDocuments;
  private _personalDocumentsUrl: string = DocumentConstants.Routes.PersonalDocuments;
  private _draftsDocumentsUrl: string = DocumentConstants.Routes.CitationDrafts;
  private _sharedDocumentsUrl: string = DocumentConstants.Routes.SharedDocuments;
  private _hsDocumentsUrl: string = DocumentConstants.Routes.HSDocuments;
  private _handBooksAndPoliciesDocumentsUrl: string = DocumentConstants.Routes.HandBooksAndPolicies;
  private _isAdd: boolean;
  private _canAccessClientLibrary: boolean;
  private _preferredParams: AtlasParams[] = [new AtlasParams('DocumentAction', '1')];
  private _isFirstTimeLoad: boolean = true;
  //private _routerPathSubscription:Subscription;
  // End of Private Fields

  // Public properties
  get DocumentsInformationBarLoaded$(): Observable<boolean> {
    return this._documentsInformationBarLoaded$;
  }
  set DocumentsInformationBarLoaded$(value: Observable<boolean>) {
    this._documentsInformationBarLoaded$ = value;
  }

  get DocumentsInformationItems$(): Observable<AeInformationBarItem[]> {
    return this._documentsInformationItems$;
  }
  set DocumentsInformationItems$(value: Observable<AeInformationBarItem[]>) {
    this._documentsInformationItems$ = value;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Documents;
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
    , private _claimsHelper: ClaimsHelperService
    , private _informationBarService: InformationBarService
    , private _router: Router
    , private _route: ActivatedRoute
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _documentService: DocumentService
    , private _breadcrumbService: BreadcrumbService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._isAdd = false;
    this.id = 'document-list-container';
    this.name = 'document-list-container';
  }

  // End of constructor

  // Private methods
  private _getDraftsUrl(): string {
    return this._draftsDocumentsUrl;
  }
  private _getReivewUrl(): string {
    return this._documentsToReviewAndDistributeUrl;
  }
  private _getCompanyDocsUrl(): string {
    return this._companyDocumentsUrl; //+ "/" + this._hsDocumentsUrl + "/" + this._handBooksAndPoliciesDocumentsUrl
  }

  getPersonalDocsUrl(): string {
    return this._personalDocumentsUrl;
  }

  getSharedDocumentsUrl(): string {
    return this._sharedDocumentsUrl + "/" + this._distributedDocumentsUrl;
  }
  private _onTabChange(tabIndex: number) {
    //Here we need to despatch the action appropriate to change the tab index of documents
    //this._store.dispatch(new EmployeeTabChangeAction(tabIndex + 1));
  }

  private _getTodayIconSize(): AeIconSize {
    return AeIconSize.small;
  }

  //Added for add Document
  getSlideoutAnimateState(): boolean {
    return this._isAdd ? true : false;
  }

  getSlideoutState(): string {
    return this._isAdd ? 'expanded' : 'collapsed';
  }

  showAddSlideOut() {
    return this._isAdd;
  }
  private _addNewDocument() {
    this._isAdd = true;
  }
  public onDocumentAddOrUpdateCancel($event) {
    this._isAdd = false;
  }

  getCanAccessClientLibrary(): boolean {
    return this._canAccessClientLibrary;
  }

  //for add snack bar
  public onDocumentAddOrUpdateSubmit(document) {
    if (this._isAdd) {
      this._isAdd = false;
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Document',
        document._documentsToSubmit._documentToSave.FileName);
      this._messenger.publish('snackbar', vm);
      this._fileUploadService.Upload(document._documentsToSubmit._documentToSave, document._documentsToSubmit.file).then((response: any) => {
        vm = ObjectHelper.createInsertCompleteSnackbarMessage('Document',
          document._documentsToSubmit._documentToSave.FileName);
        this._messenger.publish('snackbar', vm);
        this._store.dispatch(new LoadCompanyDocumentsStatAction());
      })

    } 

  }

  // End of private methods
  onDocumentInformationClick($event) {
    let navExtras: NavigationExtras = {
      queryParamsHandling: "merge"
    };
    let selectedStatistic = <AeInformationBarItem>$event;
    if (selectedStatistic.Type == AeInformationBarItemType.CompanyDocuments) {
      this._preferredParams = [new AtlasParams('DocumentAction', '0')];
      this._store.dispatch(new LoadCompanyDocumentsToReview(new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, this._preferredParams)));
    }
    if (selectedStatistic.Type == AeInformationBarItemType.DocumentsAwaiting) {
      this._preferredParams = [new AtlasParams('DocumentAction', '1')];
      this._store.dispatch(new LoadCompanyDocumentsToReview(new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, this._preferredParams)));
    }
    let navigatedUrl = this._informationBarService.GetTheSelectedTabRoute(selectedStatistic);
    this._router.navigate([navigatedUrl], navExtras);
  }
  canSharedDocumentsShown(): boolean {
    return !this._routeParamsService.Cid;
  }
  canPersonalDocumentsShown(): boolean {
    return !this._routeParamsService.Cid;
  }
  canCompanyDocumentsShown() {
    return this._canDistributeDocuments() || this.canViewHSOrELDocuments() || this._canViewHandbooksAndContracts() || this._claimsHelper.canDistributeAnySharedDocument;
  }
  private _canViewHandbooksAndContracts() {
    return this._claimsHelper.canCreateContracts();
  }

  canViewHSOrELDocuments() {
    return this._claimsHelper.canViewHSDocuments() || this._claimsHelper.canViewELDocuments();
  }
  private _canDistributeDocuments() {
    return this._claimsHelper.canDistributeAnyDocument || this._claimsHelper.canDistributeAnySharedDocument;
  }
  // Public methods

  ngOnInit(): void {
    this._canAccessClientLibrary = this._claimsHelper.canAccessClientLibrary();
    this._documentsInformationBarLoaded$ = this._store.let(fromRoot.getDocumentInformationLoadedData);
    this._documentsInformationItems$ = this._store.let(fromRoot.getDocumentInformationBarData);
    this._store.dispatch(new LoadDocumentInformationBarAction(this._claimsHelper.getEmpIdOrDefault()));

    //Here despatching the API call to get the data required for the first page. so that total count will be available in the state.
    this._store.dispatch(new LoadCompanyDocumentsToReview(new AtlasApiRequestWithParams(1, 10, "DateSent", SortDirection.Descending, this._preferredParams)));
    this._store.dispatch(new LoadCompanyUsefulDocumentsToReview(new AtlasApiRequestWithParams(1, 10, "CreatedOn", SortDirection.Descending, this._preferredParams)));

  }
  navigateAutomatic() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    if (this._router.url === '/document') {
      if (this._claimsHelper.canViewHSDocuments() || this._claimsHelper.canViewELDocuments()) {
        this._router.navigate(['/document/drafts'], navigationExtras);
      } else if (this._claimsHelper.canDistributeAnyDocument || this._claimsHelper.canDistributeAnySharedDocument || this._claimsHelper.canCreateContracts() || this._claimsHelper.canDistributeAnySharedDocument) {
        this._router.navigate(['/document/company'], navigationExtras);
      } else {
        this._router.navigate(['/document/shared/distributed'], navigationExtras);
      }
    } return true;
  }
  ngOnDestroy() {
    super.ngOnDestroy();
  }



  // End of public methods


}
