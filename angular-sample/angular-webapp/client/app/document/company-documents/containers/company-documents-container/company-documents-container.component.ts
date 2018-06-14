import { LoadContractsTemplateCountAction, LoadPersonalContractsCountAction } from '../../actions/contracts.actions';
import { LoadHandbooksDocsCountAction } from './../../actions/handbooks.actions';
import { Subscribable } from 'rxjs/Observable';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { DocumentFolderStat } from './../../../models/document';
import { DocumentsFolder } from '../../../models/document';
import { LoadCompanyDocumentsStatAction } from './../../actions/company-documents.actions';
import { DocumentConstants } from './../../../document-constants'
import { Subscription } from 'rxjs/Subscription';
import { AeIconSize } from './../../../../atlas-elements/common/ae-icon-size.enum';
import { InformationBarService } from './../../../services/information-bar-service';
import { AeInformationBarItem } from './../../../../atlas-elements/common/models/ae-informationbar-item';
import { Observable } from 'rxjs/Rx';
import { ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import { ActionTypes } from './../../../actions/information-bar-actions';
import { FileUploadService } from './../../../../shared/services/file-upload.service';
import { LoadUsefulDocsCountAction } from "./../../../usefuldocuments-templates/actions/usefuldocs.actions";




@Component({
  selector: 'company-documents-container',
  templateUrl: './company-documents-container.component.html',
  styleUrls: ['./company-documents-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CompanyDocumentsContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  private _contractsAndHandbooks: string = DocumentConstants.Routes.ContractsAndHandbooks;
  private _hsDocumentsUrl: string = DocumentConstants.Routes.HSDocuments;
  private _handbookAndPoliciesUrl: string = DocumentConstants.Routes.HandBooksAndPolicies;
  private _handbookUrl: string = DocumentConstants.Routes.HandBooks;
  private _employeeDocumentsUrl: string = DocumentConstants.Routes.EmployeeDocuments;
  private _pendingDocumentsToReviewUrl: string = DocumentConstants.Routes.ReviewPending;
  private _otherDocumentsUrl: string = DocumentConstants.Routes.Other;
  private _usefulDocumentsAndTemplatesUrl: string = DocumentConstants.Routes.UsefulDocumentsAndTemplates;
  private _appraisalReviews: string = DocumentConstants.Routes.HREmployeeDocuments;// + "/" + DocumentConstants.Routes.AppraisalReivews;
  private _companyPolicies: string = DocumentConstants.Routes.CompanyPolicies;
  private _hsDocumentsCount$: Observable<DocumentFolderStat>;
  private _hrEmployeeDocumentsCount$: Observable<DocumentFolderStat>;
  private _companyPoliciesCount$: Observable<DocumentFolderStat>;
  private _otherDocumentsCount$: Observable<DocumentFolderStat>;
  private _documentStatsLoadedSub: Subscription;
  private _usefulDocsCount: Subscription;
  private _handbookDocsCount: Subscription;
  private _contractDocsCount: Subscription;
  private _personalContractCount: Subscription;

  private _usefulDocsListTotalCount: number;
  private _contractHandbooksTotalCount: number = 0;
  private _handbookcountLoad: boolean = true;
  private _contractcountLoad: boolean = true;
  private _personalcountLoad: boolean = true;

  //public properties
  get hsDocumentsCount$(): Observable<DocumentFolderStat> {
    return this._hsDocumentsCount$;
  }
  get contractHandbooksTotalCount(): number {
    return this._contractHandbooksTotalCount;
  }
  get appraisalReviews(): string {
    return this._appraisalReviews;
  }
  get companyPolicies(): string {
    return this._companyPolicies;
  }
  get hrEmployeeDocumentsCount$(): Observable<DocumentFolderStat> {
    return this._hrEmployeeDocumentsCount$;
  }
  get companyPoliciesCount$(): Observable<DocumentFolderStat> {
    return this._companyPoliciesCount$;
  }
  get otherDocumentsCount$(): Observable<DocumentFolderStat> {
    return this._otherDocumentsCount$;
  }
  get usefulDocsListTotalCount(): number {
    return this._usefulDocsListTotalCount;
  }
  //end of public properties
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _informationBarService: InformationBarService
    , private _fileUploadService: FileUploadService) {
    super(_localeService, _translationService, _cdRef);

  }
  //public methods
  public isAuthorizedToViewFolder(): boolean {
    return false;
  }
  public canViewHSDocuments() {
    return this._claimsHelper.canViewHSDocuments();
  }
  public canViewHandbooksAndContracts() {
    return this._claimsHelper.canCreateContracts();
  }
  public canViewUsefulDocumentsAndTemplates() {
    return this._claimsHelper.canDistributeAnySharedDocument;
  }
  public canViewELOrHSDocuments() {
    return this.canViewELDocuments() || this.canViewHSDocuments();
  }
  public canViewELDocuments() {
    return this._claimsHelper.canViewELDocuments();
  }
  public getContractHandbooksUrl(): string {
    return this._contractsAndHandbooks; // + "/" + this._handbookUrl;; // this is spoiling the route highlight, need to find other solution
  }

  public getHsDocumentsUrl(): string {
    return this._hsDocumentsUrl;// + "/" + this._handbookAndPoliciesUrl;
  }
  public getEmployeeDocumentsUrl(): string {
    return this._employeeDocumentsUrl;
  }
  public getPendingDocumentsToReviewUrl(): string {
    return this._pendingDocumentsToReviewUrl;
  }
  public getOtherDocumentsUrl(): string {
    return this._otherDocumentsUrl;
  }
  public getUsefulDocumentsAndTemplatesUrl(): string {
    return this._usefulDocumentsAndTemplatesUrl;
  }


  ngOnInit() {
    //here we need to despatch the action to get the document stats related to company documents
    // we should load the stats only if logged in user is authorized to see any of the folders which has counts
    this._documentStatsLoadedSub = this._store.let(fromRoot.getCompanyDocumentStatsLoadedData).subscribe((loaded) => {
      if (!loaded && (this.canViewHSDocuments() || this.canViewHandbooksAndContracts() || this.canViewELOrHSDocuments())) {
        this._store.dispatch(new LoadCompanyDocumentsStatAction());
      }
    });
    this._hsDocumentsCount$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.HealthAndSafetyDocuments));
    this._hrEmployeeDocumentsCount$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.HREmployeeDocuments));
    this._companyPoliciesCount$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.CompanyPolicies));
    this._otherDocumentsCount$ = this._store.let(fromRoot.getCompanyDocumentStatsByFolder(DocumentsFolder.Others));

    this._usefulDocsCount = this._store.let(fromRoot.getUsefulDocsCount).subscribe((dataCount) => {
      if (!dataCount) {
        this._store.dispatch(new LoadUsefulDocsCountAction(true));
      } else {
        this._usefulDocsListTotalCount = dataCount;
      }
    })

    this._handbookDocsCount = this._store.let(fromRoot.getHandbooksDocsCount).subscribe((handbookCount) => {
      if (!handbookCount) {
        this._store.dispatch(new LoadHandbooksDocsCountAction(true));
      } else {
        if (this._handbookcountLoad) {
          this._handbookcountLoad = false;
          this._contractHandbooksTotalCount = this._contractHandbooksTotalCount + handbookCount;
          this._cdRef.markForCheck();
        }
      }
    })

    this._contractDocsCount = this._store.let(fromRoot.getContractsTemplateCount).subscribe((contractCount) => {
      if (!contractCount) {
        this._store.dispatch(new LoadContractsTemplateCountAction(true));
      } else {
        if (this._contractcountLoad) {
          this._contractcountLoad = false;
          this._contractHandbooksTotalCount = this._contractHandbooksTotalCount + contractCount;
          this._cdRef.markForCheck();
        }
      }
    })

    this._personalContractCount = this._store.let(fromRoot.getPersonalContractsCount).subscribe((personalCount) => {
      if (!personalCount) {
        this._store.dispatch(new LoadPersonalContractsCountAction(true));
      } else {
        if (this._personalcountLoad) {
          this._personalcountLoad = false;
          this._contractHandbooksTotalCount = this._contractHandbooksTotalCount + personalCount;
          this._cdRef.markForCheck();
        }
      }
    })


  }
  ngOnDestroy() {
    if (this._documentStatsLoadedSub) {
      this._documentStatsLoadedSub.unsubscribe();
    }
    if (this._usefulDocsCount) {
      this._usefulDocsCount.unsubscribe();
    }
    if (this._handbookDocsCount) {
      this._handbookDocsCount.unsubscribe();
    }
    if (this._contractDocsCount) {
      this._contractDocsCount.unsubscribe();
    }
    if (this._personalContractCount) {
      this._personalContractCount.unsubscribe();
    }
  }
  //end of public methods
}