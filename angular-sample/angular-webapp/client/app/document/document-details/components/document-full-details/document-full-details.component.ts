import { extractDocumentCategorySelectItems } from '../../../company-documents/common/company-document-extract-helper';
import { DocumentArea } from '../../../models/document-area';
import { AeSelectItem } from './../../../../atlas-elements/common/Models/ae-select-item';
import { RemoveCompanyDocumentAction, ResetDeleteStatusAction, UpdateCompanyDocumentAction } from './../../../company-documents/actions/company-documents.actions';
import { Document } from './../../../models/document';
import { DocumentCategoryService } from './../../../services/document-category-service';
import { RouteParams } from './../../../../shared/services/route-params';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../../shared/reducers';
import { DocumentDetails, DocumentDetailsType } from '../../../../document/document-details/models/document-details-model';
import { Observable, Subscription, BehaviorSubject } from "rxjs/Rx";
import { isNullOrUndefined } from "util";
import { DocumentConstants } from '../../../../document/document-constants';
import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import { DocumentCategoryEnum } from "../../../../document/models/document-category-enum";
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { IncidentAboutIncidentDetailsGetAction } from './../../../../incident-log/incident/actions/incident-about-injury.actions';
import { Location } from '@angular/common';
import * as Immutable from 'immutable';
import { AeClassStyle } from "./../../../../atlas-elements/common/ae-class-style.enum";

@Component({
  selector: 'document-full-details',
  templateUrl: './document-full-details.component.html',
  styleUrls: ['./document-full-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentFullDetailsComponent extends BaseComponent implements OnInit, OnDestroy {

  private _document: DocumentDetails;
  private _documentType: DocumentDetailsType;
  private _changeHistoryUrl: string = DocumentConstants.Routes.DocumentChangeHistory;
  private _distributionHistoryUrl: string = DocumentConstants.Routes.DistributeHistory;
  private _employeeActionStatusUrl: string = DocumentConstants.Routes.EmployeeStatus;
  private _loaderBars: AeLoaderType = AeLoaderType.Spinner;
  private _cqcPruchased$: Observable<boolean>;
  private _canDocumentExportToCQC: boolean;
  private _enum: any;
  private _sitesSubscription: Subscription;
  private _accedentLogSubscription: Subscription;
  private _siteName: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _selectedDocument: Document;
  private _showRemovDocumentConfirm: boolean;
  private _showUpdateDocumentSlideOut: boolean;
  private _documentCategoriesForUpdate: Immutable.List<AeSelectItem<string>>;
  private _documentCategoriesSubscription: Subscription;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  get documentCategoriesForUpdate(): Immutable.List<AeSelectItem<string>> {
    return this._documentCategoriesForUpdate;
  }

  get showUpdateDocumentSlideOut(): boolean {
    return this._showUpdateDocumentSlideOut;
  }

  get selectedDocument(): Document {
    return this._selectedDocument;
  }
  get showRemovDocumentConfirm(): boolean {
    return this._showRemovDocumentConfirm;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  @Input('documentDetails')
  get documentDetails() {
    return this._document;
  }
  set documentDetails(val: DocumentDetails) {
    if (val) {
      this._document = val;
      let bcItem = new IBreadcrumb(this._document.FileName, '/document/document-details/' + this._document.Id, BreadcrumbGroup.Documents);
      this._breadcrumbService.add(bcItem);
      this.canDocExportToCQC();
      this._cdRef.markForCheck();

      if (!isNullOrUndefined(this._document) && !isNullOrUndefined(this._document.RegardingObjectId) && this._document.Category == DocumentCategoryEnum.AccidentLogs) {
        this._store.dispatch(new IncidentAboutIncidentDetailsGetAction(this._document.RegardingObjectId));
      } else {
        this.setSiteName();
      }

    }
  }

  @Input('documentType')
  get documentType() {
    return this._documentType;
  }
  set documentType(val: DocumentDetailsType) {
    this._documentType = val;
  }

  get CanDocumentExportToCQC() {
    return this._canDocumentExportToCQC;
  }

  get document(): DocumentDetails {
    return this._document;
  }

  get cqcPruchased$(): Observable<boolean> {
    return this._cqcPruchased$;
  }

  get enum(): any {
    return this._enum;
  }

  get siteName() {
    return this._siteName;
  }

  get loaderBars(): AeLoaderType {
    return this._loaderBars;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Documents;
  }
  //output bindings
  @Output('docDistribute') _docDistribute: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('docExportToCQC') _docExportToCQC: EventEmitter<boolean> = new EventEmitter<boolean>();
  //end of output bindings

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _breadcrumbService: BreadcrumbService
    , private _claimsHelper: ClaimsHelperService
    , private _location: Location
    , private _routeParamsService: RouteParams
    , private _documentCategoryService: DocumentCategoryService
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  public canDocExportToCQC(): boolean {
    this._canDocumentExportToCQC = this._document.Category == DocumentCategoryEnum.Uploads || this._document.Category == DocumentCategoryEnum.Contract
      || this._document.Category == DocumentCategoryEnum.SiteVisit || this._document.Category == DocumentCategoryEnum.ELHandbook
      || this._document.Category == DocumentCategoryEnum.Handbook || this._document.Category == DocumentCategoryEnum.Policy
      || this._document.Category == DocumentCategoryEnum.SiteVisitQA || this._document.Category == DocumentCategoryEnum.ContractTemplate
      || this._document.Category == DocumentCategoryEnum.RiskAssessment || this._document.Category == DocumentCategoryEnum.EmployeeContract
      || this._document.Category == DocumentCategoryEnum.MethodStatements;
    return this._canDocumentExportToCQC;
  }

  private _getDownloadUrl(doc: DocumentDetails) {
    if (isNullOrUndefined(doc) || isNullOrUndefined(doc.Id))
      return null;
    if (this._documentType == DocumentDetailsType.Document) {
      return this._routeParamsService.Cid ? `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.Version}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.Version}`;
    }
    else
      return `/filedownload?sharedDocumentId=${doc.Id}&?isShared=true`;
  }
  //end of private functions
  public canDistributeButtonShown(): boolean {
    if (this._document.Category == DocumentCategoryEnum.PersonalDocuments) {
      return false;
    }
    if (this._documentType == DocumentDetailsType.Document)
      return this._document.IsDistributable && this._claimsHelper.canDistributeAnyDocument;
    else
      return this._claimsHelper.canDistributeAnySharedDocument;
  }
  ngOnInit() {
    this._store.dispatch(new ResetDeleteStatusAction());
    this._cqcPruchased$ = this._store.let(fromRoot.getCQCPurchaseStatus);
    this._enum = DocumentCategoryEnum.Contract;

    this._accedentLogSubscription = this._store.let(fromRoot.getIncidentAboutIncidentDetails).subscribe(incedent => {
      if (!isNullOrUndefined(incedent) && !isNullOrUndefined(incedent.Site) && !isNullOrUndefined(this._document)) {
        this._document.SiteId = incedent.Site.Id;
        this._siteName.next(incedent.Site.Name);
      }
    });
    this._store.let(fromRoot.getCompanyDocumentDeletedStatusData).subscribe((isDeleted) => {
      if (isDeleted) {
        //now we need to refresh the grid
        this.onPreviousClick('');
      }
    });

    this._documentCategoriesSubscription = this._store.let(fromRoot.getDocumentCategoriesData).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        let documentCategoriesInLibrary = this._documentCategoryService.getDocumentCategoriesByArea(res, DocumentArea.DocumentLibrary);
        this._documentCategoriesForUpdate = Immutable.List(extractDocumentCategorySelectItems(this._documentCategoryService.getDocumentCategoriesForUpdate(documentCategoriesInLibrary)));
      }
      else {
        this._documentCategoryService.loadDocumentCategories();
      }
    });

  }
  public onDocumentUpdateCancel($event) {
    this._showUpdateDocumentSlideOut = false;
  }
  public onDocumentUpdateSubmit(doc: Document) {
    //here we need to despatch action to update the document category and other details
    this._showUpdateDocumentSlideOut = false;
    doc.ShouldReloadList = false;
    this._store.dispatch(new UpdateCompanyDocumentAction(doc));
  }

  getChangeHistoryUrl(): string {
    return this._changeHistoryUrl;
  }
  get getRemoveDocumentConfirmState() {
    return this._showRemovDocumentConfirm ? 'expanded' : 'collapsed';
  }
  getDocUpdateSlideoutState() {
    return this._showUpdateDocumentSlideOut ? 'expanded' : 'collapsed';
  }
  removeButtonCanBeShown(): boolean {
    let doc: Document = new Document();
    doc = Object.assign(doc, this._document);
    doc.FileNameAndTitle = this._document.FileName;
    this._selectedDocument = doc;
    return !this.isSharedDocument() && this._documentCategoryService.getIsDocumentCanbeDeleted(doc, this._claimsHelper, this._routeParamsService);
  }
  updateButtonCanBeShown(): boolean {
    let doc: Document = new Document();
    doc = Object.assign(doc, this._document);
    doc.FileNameAndTitle = doc.FileNameAndTitle ? doc.FileNameAndTitle : this._document.FileName;
    return !this.isSharedDocument() && this._documentCategoryService.getIsDocumentCanBeUpdated(doc, this._claimsHelper);
  }
  public onUpdate($event) {
    this._showUpdateDocumentSlideOut = true;
  }
  public onRemove($event) {
    this._showRemovDocumentConfirm = true;
  }
  public deleteConfirmModalClosed($event) {
    if ($event == 'Yes') {
      this._selectedDocument.ShouldReloadList = false;
      this._store.dispatch(new RemoveCompanyDocumentAction(this._selectedDocument));
    }
    this._showRemovDocumentConfirm = false;
  }
  getDistributionHistoryUrl(): string {
    return this._distributionHistoryUrl;
  }

  getEmployeeActionStatusUrl(): string {
    return this._employeeActionStatusUrl;
  }

  onExportToCQC(e: any) {
    this._docExportToCQC.emit(true);
  }

  onDistribute(e: any) {
    this._docDistribute.emit(true);
  }

  onView(e: any) {
    window.open(this._getDownloadUrl(this._document));
  }

  isSharedDocument(): boolean {
    return this._documentType == 2 ? true : false;
  }

  isPersonalDocument(): boolean {
    return this._document.Category == DocumentCategoryEnum.PersonalDocuments;
  }

  ngOnDestroy() {
    if (this._documentCategoriesSubscription) {
      this._documentCategoriesSubscription.unsubscribe();
    }
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe();
    if (!isNullOrUndefined(this._accedentLogSubscription)) {
      this._accedentLogSubscription.unsubscribe();
    }
  }

  setSiteName() {
    if (!isNullOrUndefined(this._document) && !isNullOrUndefined(this._document.SiteId)) {
      if (this._document.SiteId == '00000000-0000-0000-0000-000000000000') {
        this._siteName.next('All');
      } else {
        this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe((res) => {
          if (!isNullOrUndefined(res)) {
            let siteInfo = res.filter(c => c.Id === this._document.SiteId);
            if (siteInfo && siteInfo.length > 0) {
              this._siteName.next(siteInfo[0].Name);
            }
          } else {
            this._store.dispatch(new LoadSitesAction(false));
          }
        });
      }
    }
  }

  onPreviousClick(e: any) {
    this._location.back();
  }

}
