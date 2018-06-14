import { appUrl } from './../../../../shared/app.constants';
import { CommonHelpers } from './../../../../shared/helpers/common-helpers';
import { Company } from './../../../../company/models/company';
import { CompanyLoadAction } from './../../../../company/actions/company.actions';
import { CopyMethodStatementAction } from './../../../actions/methodstatements.actions';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams } from './../../../../shared/models/atlas-api-response';
import { RouteParams } from './../../../../shared/services/route-params';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, ElementRef, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { MethodStatement, MSSupportingDocuments, MSPPE, MSProcedure, MSSafetyRespAssigned } from "../../../models/method-statement";
import { Subscription, Observable } from "rxjs/Rx";
import { isNullOrUndefined } from "util";
import { LoadSitesAction, LoadSitesWithAddressAction } from '../../../../shared/actions/company.actions';
import { Site } from "../../../../calendar/model/calendar-models";
import { AeImageAvatarSize } from "../../../../atlas-elements/common/ae-image-avatar-size.enum";
import { LoadSupportingDocumentsByIdAction, UpdateMethodStatementStatusAction, GetMethodStatementAttachmentAction, ClearMethodStatementDocumentId, SaveMethodStatementPreviewAction, LoadMethodStatementByIdAction } from "../../actions/manage-methodstatement.actions";
import { DatePipe } from "@angular/common";
import { RiskAssessment } from "../../../../risk-assessment/models/risk-assessment";
import { ObjectHelper } from '../../../../atlas-shared/helpers/object-helper';
import { LoadProcedureGroupAction } from "../../../../shared/actions/lookup.actions";
import { Address } from '../../../../employee/models/employee.model';
import { AeSelectItem } from "../../../../atlas-elements/common/models/ae-select-item";
import { ObjectHelper as objHelper } from '../../../../shared/helpers/object-helper';
import { MessengerService } from "../../../../shared/services/messenger.service";
import { DocumentCategoryEnum, DocumentChangesEnum } from "../../../../document/models/document-category-enum";
import { GUID } from "../../../../shared/helpers/guid-helper";
import { Http, URLSearchParams, Response, Headers, ResponseContentType, RequestOptions } from '@angular/http';
import { EmailModel } from "../../../../email-shared/models/email.model";
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { AeLoaderType } from "../../../../atlas-elements/common/ae-loader-type.enum";
import { BreadcrumbGroup } from './../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeIconSize } from "../../../../atlas-elements/common/ae-icon-size.enum";
import { StringHelper } from "../../../../shared/helpers/string-helper";
import { AddCQCProDetailsAction } from "../../../../document/document-details/actions/document-export-to-cqc.actions";
import { DocumentDetailsService } from "../../../../document/document-details/services/document-details.service";
import { DocumentDetails } from "../../../../document/document-details/models/document-details-model";
import { Document } from '../../../../document/models/document';
@Component({
  selector: 'preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PreviewComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _showMSCopySlideOut: boolean = false;
  private _copyMSAcess: boolean = false;
  private _methodStatementsApiRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, []);
  private _methodStatement: MethodStatement;
  private _methodStatementSubscription: Subscription;
  private _siteOrCompanyLogoUrl: string;
  private _sitesSubscription: Subscription;
  private _routeParamsSubscription: Subscription;
  private _routeSubscription: Subscription;
  private _methodStatementId: string;
  private _isExample: boolean = false;
  private _msSupportingDocs: MSSupportingDocuments[];
  private _msSupportingDocsSubscription: Subscription;
  private _procedureGroupSubscription: Subscription;
  private _msAttachmentSubscription: Subscription;
  private _msUpdateStatusSubscription: Subscription;
  private _msDocIdSubscription: Subscription;
  private _saftyprocedureGroupId: string;
  private _soeprocedureGroupId: string;
  private _headOfficeAddress: Address;
  private _hasHeadOffice: boolean = false;
  private _headOfficeSitePostcode: string;
  private _companyName: string;
  private _msPPE: MSPPE[];
  private _msSafetyProc: MSProcedure[];
  private _msSequenceOfEvents: MSProcedure[];
  private _msSafetyRespAssigned: MSSafetyRespAssigned[];
  private _msRiskAssessments: RiskAssessment[];
  private _authorName: string;
  private _approvedByName: string;
  private _showOtherSiteAddress: boolean;
  private _attachmentsOptions: Immutable.List<AeSelectItem<string>>;
  private _modalHeader: string;
  private _showExportOrPrintOptionsModal: boolean = false;
  private _selectedOption: string;
  private _attachmentId: string;
  private _generatePDFSubscription: Subscription;
  private _printSubscription: Subscription;
  private _msAttachmentIds: string[] = [];
  private _modalInfo: string;
  private _emailSlideOut: boolean;
  private _emailModel: EmailModel;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _routeUrlSubscription: Subscription;
  private _showBanner: boolean;
  private _showLoader: boolean;
  private _loaderBars: AeLoaderType = AeLoaderType.Bars;
  private _isIndependantPreview: boolean;
  private _iconMedium: AeIconSize = AeIconSize.medium;
  private _checkMSType: boolean = false;
  private _showDocumentExportToCQCProSlideOut: boolean;
  private _cqcpruchaseDetailsLoadedSubscription: Subscription;
  private _cqcPruchased$: Observable<boolean>;
  private _documentDetails: DocumentDetails;
  private _cqcFlag: boolean = false;
  private _companyDetailsSubscription: Subscription;
  private _company: Company;
  // End of Private Fields

  // Public properties
  get Company(): Company {
    return this._company;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.MethodStatements;
  }

  get ModalHeader() {
    return this._modalHeader;
  }

  get MethodStatementDetails() {
    return this._methodStatement;
  }

  get MSRiskAssessments() {
    return this._msRiskAssessments;
  }

  get checkMSType() {
    return this._checkMSType;
  }

  get MSPPE() {

    return this._msPPE;
  }

  get MSSafetyResponsibilities() {
    return this._msSafetyRespAssigned;
  }

  get MSSafetyProcs() {
    if (!isNullOrUndefined(this._msSafetyProc))
      return CommonHelpers.sortArrayByIndex(this._msSafetyProc, 'OrderIndex', SortDirection.Ascending);
    return [];
  }

  get MSSOE() {
    if (!isNullOrUndefined(this._msSequenceOfEvents))
      return CommonHelpers.sortArrayByIndex(this._msSequenceOfEvents, 'OrderIndex', SortDirection.Ascending);
    return [];
  }

  get SiteOrCompanyLogo() {
    return this._siteOrCompanyLogoUrl;
  }

  get ShowOtherSiteAddress() {
    return this._showOtherSiteAddress;
  }

  get companyFullName() {
    return this._companyName;
  }
  get companySiteUrl() {
    return this._claimsHelper.getCompanySiteUrl();
  }

  get AuthorName() {
    return this._authorName;
  }
  get ApprovedByName() {
    return this._approvedByName;
  }

  get MSSDDocuments() {
    return this._msSupportingDocs;
  }
  get headOfficeAddress() {
    return this._headOfficeAddress;
  }
  set headOfficeAddress(val: Address) {
    this._headOfficeAddress = val;
  }
  get headOfficeSitePostcode() {
    return this._headOfficeSitePostcode;
  }
  get hasHeadOfficeSite() {
    return this._hasHeadOffice;
  }
  set hasHeadOfficeSite(val: boolean) {
    this._hasHeadOffice = val;
  }

  get getImageSize(): AeImageAvatarSize {
    return AeImageAvatarSize.small;
  }

  get enableApproveButton() {
    return this.canApproveMS() && !this._isExample && isNullOrUndefined(this._approvedByName) && this._methodStatement.StatusId != 1;
  }

  get attachmentsOptions() {
    return this._attachmentsOptions;
  }

  get showExportOrPrintOptionsModal() {
    return this._showExportOrPrintOptionsModal;
  }

  get ShowEmailSlideOut() {
    return this._emailSlideOut;
  }

  get emailSlideoutState() {
    return this._emailSlideOut ? 'expanded' : 'collapsed';
  }

  get EmailModel() {
    return this._emailModel;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get modalInfo() {
    return this._modalInfo;
  }
  get bannerCanBeShown(): boolean {
    return this._isIndependantPreview;
  }
  getMethodStatementBannerTitle(): string {
    if (this._methodStatement) {
      return this._methodStatement.Name;
    } else {
      return '';
    }
  }

  get showBanner(): boolean {
    return this._showBanner;
  }

  get ShowLoader() {
    return this._showLoader;
  }
  get loaderType() {
    return this._loaderBars;
  }

  get showMSCopySlideOut() {
    return this._showMSCopySlideOut;
  }
  get copyMSAcess() {
    return this._copyMSAcess;
  }
  get showDocumentExportToCQCProSlideOut(): boolean {
    return this._showDocumentExportToCQCProSlideOut;
  }
  get cqcPruchased$(): Observable<boolean> {
    return this._cqcPruchased$;
  }

  get isExample() {
    return this._isExample;
  }

  get selectedOption() {
    return this._selectedOption;
  }

  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(_localeService: LocaleService
    , _translationService: TranslationService
    , _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _mainrouter: Router
    , private _router: ActivatedRoute
    , private _elemRef: ElementRef
    , private _http: Http
    , private _routeParamsService: RouteParams
    , private _documentDetailsService: DocumentDetailsService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._headOfficeAddress = new Address();
    this._methodStatement = new MethodStatement();
    this._showLoader = true;
    this._documentDetails = new DocumentDetails();
  }
  // End of constructor

  // Private methods 

  private _msSafetyProcs() {
    if (!isNullOrUndefined(this._methodStatement.MSProcedures)) {
      this._methodStatement.MSProcedures = this._methodStatement.MSProcedures.filter(x => {
        return x.IsDeleted == false;
      })
      this._msSequenceOfEvents = this._methodStatement.MSProcedures.filter(x => x.ProcedureGroupId == this._soeprocedureGroupId).sort((a, b) => {
        if (isNullOrUndefined(a['OrderIndex'])) {
          return 1;
        }
        if (isNullOrUndefined(b['OrderIndex'])) {
          return 0;
        }
        return a.OrderIndex.toString().localeCompare(b.OrderIndex.toString())
      });
      this._msSafetyProc = this._methodStatement.MSProcedures.filter(x => x.ProcedureGroupId == this._saftyprocedureGroupId).sort((a, b) => {
        if (isNullOrUndefined(a['OrderIndex'])) {
          return 1;
        }
        if (isNullOrUndefined(b['OrderIndex'])) {
          return 0;
        }
        return a.OrderIndex.toString().localeCompare(b.OrderIndex.toString())
      });
    }
  }

  public canApproveMS() {
    return this._claimsHelper.canApproveAndArchiveMethodStatements();
  }

  public getPPELogoUrl(ppeItem: MSPPE): string {
    return ppeItem.LogoUrl;
  }
  public getLogoUrl(logoId: string, isShared: boolean = false) {
    //cid should be passed through although it does not exists in the query string since the images will not work
    let baseURL = window.location.protocol + "//" + window.location.host;

    if (this._methodStatement.IsExample) {
      return baseURL + '/assets/images/atlas-logo-bg-light.png';
    }
    if (isShared) {
      return logoId && logoId != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + logoId + '&isSystem=true' : baseURL + "/assets/images/default-icon-32x32.png";
    } else {
      return logoId && logoId != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + logoId + "&cid=" + this._methodStatement.CompanyId : baseURL + "/assets/images/default-icon-32x32.png";
    }
  }

  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${docId}`;
  }

  public onFileDownLoad(docId: string) {
    window.open(this._getDownloadUrl(docId));
  }

  copyMS() {
    this._showMSCopySlideOut = true;
  }

  onCopied(data: any) {
    // here need to raise on copied...  
    this._store.dispatch(new CopyMethodStatementAction({ model: data, AtlasApiRequestWithParams: this._methodStatementsApiRequest, copyToDiffCompany: data.copyToDifferentCompany, IsExample: this._isExample }));
    this._showMSCopySlideOut = false;
  }

  closeMSSlideOut($event) {
    this._showMSCopySlideOut = false;
  }

  getMSCopySlideoutState() {
    return this._showMSCopySlideOut ? 'expand' : 'collapse';
  }

  public setApproved() {
    this._store.dispatch(new UpdateMethodStatementStatusAction({
      IsExample: this._isExample, Data: {
        ApprovedBy: this._claimsHelper.getUserId(), MethodStatementId: this._methodStatementId, StatusId: 1
      }
    }));
  }

  updateNav() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    if (this._isExample) {
      this._mainrouter.navigate(['/method-statement/edit/example/' + this._methodStatementId], navigationExtras);
    } else {
      this._mainrouter.navigate(['/method-statement/edit/' + this._methodStatementId], navigationExtras);
    }
  }


  private _mssSafetyResp() {
    if (!isNullOrUndefined(this._methodStatement.MSSafetyResponsibilities)) {

      this._methodStatement.MSSafetyResponsibilities = this._methodStatement.MSSafetyResponsibilities.filter(item => {
        return item.IsDeleted == false;
      });

      this._methodStatement.MSSafetyResponsibilities.forEach(itm => {
        itm.CombinedName = itm.NameOfResponsible ? itm.NameOfResponsible : (itm.ResponsiblePerson ? itm.ResponsiblePerson.FullName : '');
        let respNames = (itm.Responsibilities.filter(obj => obj.Name.toLowerCase() != 'other').map(p => { if (p.Name.toLowerCase() != 'other') return p.Name }).join(',')); //ObjectHelper.pluck(itm.Responsibilities, 'Name');
        itm.SubItemText = respNames;
        if (!StringHelper.isNullOrUndefinedOrEmpty(itm.OtherResponsibilityValue)) {
          if (StringHelper.isNullOrUndefinedOrEmpty(itm.SubItemText)) {
            itm.SubItemText = itm.OtherResponsibilityValue;
          } else {
            itm.SubItemText = itm.SubItemText + ', ' + itm.OtherResponsibilityValue;
          }
        }

      });

      this._msSafetyRespAssigned = this._methodStatement.MSSafetyResponsibilities.sort((a, b) => a.CombinedName.localeCompare(b.CombinedName));
    }
  }

  private _mapMsRiskAssessments() {
    this._msRiskAssessments = Array.from(this._methodStatement.MSRiskAssessmentMap ? this._methodStatement.MSRiskAssessmentMap : []);
    if (!isNullOrUndefined(this._methodStatement.MSOtherRiskAssessments)) {
      this._methodStatement.MSOtherRiskAssessments.forEach(x => {
        let newRA: RiskAssessment = new RiskAssessment();
        newRA.Name = x.Name;
        newRA.ReferenceNumber = x.ReferenceNumber;
        this._msRiskAssessments.push(newRA);
      });
      this._msRiskAssessments = this._msRiskAssessments.sort((a, b) => a.ReferenceNumber.localeCompare(b.ReferenceNumber));
    }
  }

  private mapMsPPE() {
    if (!isNullOrUndefined(this._methodStatement.MSPPE)) {

      let MSPPEOther = this._methodStatement.MSPPE.filter(item => {
        return item.PPECategory.Name.toLowerCase() == 'other';
      });
      let MSPPE = this._methodStatement.MSPPE.filter(item => {
        return item.PPECategory.Name.toLowerCase() != 'other'
      });
      MSPPE.forEach(item => {
        if (item.PPECategory) {
          item.PPECategoryName = item.PPECategory && item.PPECategory.Name.toLowerCase() != 'other' ? item.PPECategory.Name : item.PPEOtherCategoryValue
          item.LogoUrl = this.getLogoUrl(item.PPECategory.LogoId ? item.PPECategory.LogoId : (item.PPECategory.PPECategoryGroup ? item.PPECategory.PPECategoryGroup.LogoId : null), true);
        }
      });

      MSPPEOther.forEach(item => {
        if (!isNullOrUndefined(item.PPECategory) &&
          !StringHelper.isNullOrUndefinedOrEmpty(item.PPEOtherCategoryValue)) {
          var otherItems = item.PPEOtherCategoryValue.split(';');
          otherItems.forEach(otherItem => {
            if (otherItem != '') {
              let otherItemObj: any = new Object();
              otherItemObj.PPECategoryId = item.PPECategoryId;
              otherItemObj.PPECategoryName = otherItem.trim();
              otherItemObj.LogoUrl = this.getLogoUrl(item.PPECategory.LogoId ? item.PPECategory.LogoId : (item.PPECategory.PPECategoryGroup ? item.PPECategory.PPECategoryGroup.LogoId : null), true);
              MSPPE.push(otherItemObj);
            }
          });
        }
      })
      this._msPPE = MSPPE.sort((a, b) => a.PPECategoryName.localeCompare(b.PPECategoryName));
    }
  }

  OnEmailslideCancel(e) {
    this._emailSlideOut = false;
  }

  public onExport(event) {
    this._modalHeader = "Export options";
    this._modalInfo = "MANAGE_METHOD_STM.PREVIEW.Dialog.Export_Info";
    this._selectedOption = "false";
    this._showExportOrPrintOptionsModal = true;
  }
  public onPrint(event) {
    this._modalHeader = "Print options";
    this._modalInfo = "MANAGE_METHOD_STM.PREVIEW.Dialog.Print_Info";
    this._showExportOrPrintOptionsModal = true;
    this._selectedOption = "false";

  }
  public OnEmail(event) {
    this._modalHeader = "Email options";
    this._modalInfo = "MANAGE_METHOD_STM.PREVIEW.Dialog.Email_Info";
    this._showExportOrPrintOptionsModal = true;
    this._selectedOption = "false";
  }

  public onAttachmentsOptionsChange($event: any) {
    this._selectedOption = $event.SelectedValue
  }

  public modalClosed($event) {
    this._showExportOrPrintOptionsModal = false;
    if ($event == 'yes') {
      this._exportMSPreview();
    }
  }
  private _exportMSPreview() {
    let preview = (<HTMLElement>this._elemRef.nativeElement).getElementsByClassName('ms-preview').item(0);
    if (!isNullOrUndefined(preview)) {
      if (this._modalHeader == "Print options") {
        window.print();
        this.downloadAttachments();
      }
      else {
        let html: string = preview.innerHTML;
        this._printSubscription = this.getTemplateForPrintandPDF(html).subscribe((content) => {
          if (this._modalHeader == "Export options") {
            this._saveToAtlas(content);
            this.downloadAttachments();
          }
          else {
            this._saveToAtlas(content);
          }
        });
      }
    }
  }

  get documentDetails() {
    return this._documentDetails;
  }

  getDocumentExportToCQCSlideoutState() {
    return this._showDocumentExportToCQCProSlideOut ? 'expanded' : 'collapsed';
  }

  onCQCCancel($event) {
    this._showDocumentExportToCQCProSlideOut = false;
  }

  onCQCSubmit(cqcData: any) {
    this._store.dispatch(new AddCQCProDetailsAction(cqcData));
    this._showDocumentExportToCQCProSlideOut = false;
  }

  onExportToCQC(e: any) {
    this._modalHeader = 'cqcPro';
    if (!isNullOrUndefined(this._attachmentId)) {
      this._showDocumentExportToCQCProSlideOut = true;
    } else {
      this._exportMSPreview();
    }
  }

  private _extractDocumentDetails(document: Document) {
    this._documentDetails.FileName = (!isNullOrUndefined(document.FileNameAndTitle) && document.FileNameAndTitle != '') ? document.FileNameAndTitle : document.FileName;
    this._documentDetails.Description = isNullOrUndefined(document.Description) ? 'Not Mentioned' : document.Description;
    this._documentDetails.Title = document.Title;
    this._documentDetails.UsageName = document.UsageName;
    this._documentDetails.RegardingObjectId = document.RegardingObject && document.RegardingObject.Otc != 3 ? document.RegardingObject.Id : null;
    this._documentDetails.SiteId = document.RegardingObject && document.RegardingObject.Otc == 3 ? document.RegardingObject.Id : null; // object type ==3 for site
    this._documentDetails.FileStorageIdentifier = document.FileStorageIdentifier;
    this._documentDetails.Category = document.Category;
    this._documentDetails.Id = document.Id;
    return this._documentDetails;
  }

  private _prepareEmailModel() {
    let model = new EmailModel();
    model.TemplateId = '90F21C95-BD7C-4A04-852C-FA262617BF8D';
    model.Attachments.push({ DocumentId: this._attachmentId, IsExample: false, FileName: "" });
    model.References.push({ Id: this._claimsHelper.getUserId(), Name: 'User', Otc: null });
    if (this._selectedOption == "true") {
      this._msSupportingDocs.forEach(x => {
        model.Attachments.push({ DocumentId: x.Id, IsExample: this._isExample, FileName: "" });
      });
      this._msAttachmentIds.forEach(id => {
        model.Attachments.push({ DocumentId: id, IsExample: false, FileName: "" });
      });
    }
    model.Type = "Method Statement";
    return model;
  }

  public downloadAttachments() {
    if (this._selectedOption == "true") {
      this._msSupportingDocs.forEach(x => {
        this._downloadDocument(x.Id);
      });
      this._msAttachmentIds.forEach(id => {
        this._downloadDocument(id);
      });
    }
  }

  public getTemplateForPrintandPDF(html: string) {
    return this._http.get('./assets/templates/method-statement/method-statement-preview.html')
      .map(templateResponse => {
        let template = templateResponse.text();
        let data = template.replace('{{bodyContent}}', html);
        return data;
      });
  }

  private _saveToAtlas(html: string) {
    if (!isNullOrUndefined(this._attachmentId)) {
      if (this._modalHeader == "Export options") {
        this._downloadDocument(this._attachmentId);
        return;
      }
      else {
        this._emailModel = this._prepareEmailModel();
        this._emailSlideOut = true;
        this._cdRef.markForCheck();
        return;
      }
    }
    let model: any = new Object();
    model.AttachTo = { Id: this._methodStatementId, ObjectTypeCode: 600 }
    model.Id = this._methodStatementId;
    model.ObjectTypeCode = 600;
    model.Category = DocumentCategoryEnum.MethodStatements;
    model.Content = html;
    model.DocumentId = GUID.toString();
    model.FileName = this._methodStatement.Name + ".pdf";
    model.RegardingObject = { Id: this._methodStatementId, ObjectTypeCode: 600 }
    model.Title = this._methodStatement.Name;
    model.Usage = 1;
    model.Version = "1.0";
    model.LastChange = DocumentChangesEnum.ContentChanged;
    this._store.dispatch(new SaveMethodStatementPreviewAction(model));
  }

  private _downloadDocument(docId: string) {
    let url = this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${docId}`;
    window.open(url);
  }

  private _bindPreviewData() {
    this.mapMsPPE();
    this._mssSafetyResp();
    this._mapMsRiskAssessments();
    this._msSafetyProcs();
    this._approvedByName = this._methodStatement.ApprovedUser ? this._methodStatement.ApprovedUser.FullName : null;
    this._authorName = this._methodStatement.Author ? this._methodStatement.Author.FullName : '';
    this._showOtherSiteAddress = isNullOrUndefined(this._methodStatement.Site) ? true : false;

    if (this._methodStatement.Site) {
      this._siteOrCompanyLogoUrl = this._methodStatement.Site.LogoId ? this.getLogoUrl(this._methodStatement.Site.LogoId) : this.getLogoUrl(this._methodStatement.Site.Logo)
    }
    else {
      this._siteOrCompanyLogoUrl = this.getLogoUrl(this._methodStatement.CompanyLogoId);
    }
    this._store.dispatch(new LoadSupportingDocumentsByIdAction({ Id: this._methodStatementId, IsExample: this._isExample }));
    this._store.dispatch(new GetMethodStatementAttachmentAction({ IsExample: this._isExample, Id: this._methodStatementId }));
  }
  // End of private methods

  // Public methods
  ngOnInit() {

    this._routeParamsSubscription = this._router.params.subscribe(params => {
      if (isNullOrUndefined(params['id'])) {
        this._methodStatementId = '';
      }
      else {
        this._methodStatementId = params['id'];
      }
      if (isNullOrUndefined(params['isExample'])) {
        this._isExample = false;
      }
      else {
        this._isExample = true;
      }

      if (!this._isExample && !isNullOrUndefined(params['status']) && params['status'] == 'example') {
        this._isExample = true;
      }
      else {
        this._isExample = false;
      }

      //despatch the action to get the method statement by id action
      if (this._methodStatementId && !isNullOrUndefined(params['status'])) {
        this._store.dispatch(new LoadMethodStatementByIdAction({ Id: this._methodStatementId, IsExample: this._isExample }));
        this._isIndependantPreview = true;
      }

    });

    this._routeUrlSubscription = this._router.url.takeUntil(this._destructor$).subscribe((url) => {
      if (url.find(segment => segment.path === 'example')) {
        this._methodStatement.IsExample = true;
        if (this._claimsHelper.canCreateExampleMS()) {
          this._checkMSType = true;
        }
      } else if (url.find(segment => segment.path === 'pending')) {
        this._checkMSType = true;
      } else {
        this._checkMSType = false;
      }
      if (url.find(segment => segment.path === 'example' || segment.path === 'pending' || segment.path === 'live' || segment.path === 'completed')) {
        this._copyMSAcess = true;
      } else {
        this._copyMSAcess = false;
      }
      this._showBanner = url.find(segment => segment.path === 'add' || segment.path === 'edit') ? false : true;
    })

    this._procedureGroupSubscription = this._store.let(fromRoot.getProcedureGroupListData).subscribe((groups) => {
      if (isNullOrUndefined(groups)) {
        this._store.dispatch(new LoadProcedureGroupAction());
      }
      else {
        groups.forEach(x => {
          if (x.Name == 'Sequence of Events') {
            this._soeprocedureGroupId = x.Id;
          }
          else {
            this._saftyprocedureGroupId = x.Id
          }
        });
        this._msSafetyProcs();
      }
    });


    this._attachmentsOptions = Immutable.List([new AeSelectItem<string>('No', ''),
    new AeSelectItem<string>('Yes', 'true')]);

    this._cqcpruchaseDetailsLoadedSubscription = this._documentDetailsService.getCQCPurchaseDetailsLoadingStatus().subscribe(status => {
      if (!status) {
        this._documentDetailsService.getCQCPurchaseStatusByCompanyId();
      }
    });
    this._cqcPruchased$ = this._store.let(fromRoot.getCQCPurchaseStatus);

    this._methodStatementSubscription = this._store.let(fromRoot.getManageMethodStatementData).subscribe(msData => {
      if (!isNullOrUndefined(msData)) {
        this._methodStatement = msData;
        this._isExample = this._methodStatement.IsExample;
        this._methodStatementId = this._methodStatement.Id;
        this._bindPreviewData();
        this._showLoader = false;
        this._cdRef.markForCheck();
      }
    });

    this._msSupportingDocsSubscription = this._store.let(fromRoot.getMSSupportingDocs).subscribe(docs => {
      if (!isNullOrUndefined(docs)) {
        this._msSupportingDocs = docs;
        this._msSupportingDocs.forEach(x => {
          x.PictureUrl = this.getLogoUrl(x.Id);
        })
        this._cdRef.markForCheck();
      }
    });

    this._sitesSubscription = this._store.let(fromRoot.getSiteWithAddressData).subscribe((sites) => {
      if (isNullOrUndefined(sites)) {
        this._store.dispatch(new LoadSitesWithAddressAction());
      }
      else {
        let headOfficeSite = sites.filter(x => x.IsHeadOffice == true)[0];
        if (!isNullOrUndefined(headOfficeSite)) {

          this.headOfficeAddress = headOfficeSite.Address;
          this._headOfficeSitePostcode = headOfficeSite.Address.Postcode;
          this.hasHeadOfficeSite = true;
        }
        else {
          this.hasHeadOfficeSite = false;
        }
        this._cdRef.markForCheck();

      }
    });

    this._msAttachmentSubscription = this._store.let(fromRoot.getMSAttachmentIds).subscribe(docIds => {
      if (!isNullOrUndefined(docIds)) {
        if (docIds.length > 0) {
          this._msAttachmentIds = docIds;
          this._cdRef.markForCheck();
        }
      }
    });


    this._msUpdateStatusSubscription = this._store.let(fromRoot.getMethodStatementStatusUpdate).subscribe(status => {
      if (status) {
        this._approvedByName = this._claimsHelper.getUserFullName();
        this._methodStatement.ApprovedDate = new Date();
        this._cdRef.markForCheck();
      }
    });

    this._msDocIdSubscription = this._store.let(fromRoot.getMSDocument).subscribe(doc => {
      if (!isNullOrUndefined(doc)) {
        this._attachmentId = doc.Id;
        if (this._modalHeader == "Email options") {
          this._emailModel = this._prepareEmailModel();
          this._emailSlideOut = true;
          this._cdRef.markForCheck();
        }
        else if (this._modalHeader == "cqcPro") {
          this._documentDetails = this._extractDocumentDetails(doc);
          this._showDocumentExportToCQCProSlideOut = true;
        }
        else {
          this._downloadDocument(doc.Id);
        }
        this._cdRef.markForCheck();
        this._store.dispatch(new ClearMethodStatementDocumentId(true));
      }
    });

    this._companyDetailsSubscription = this._store.let(fromRoot.getCurrentCompanyDetails).subscribe(company => {
      if (!isNullOrUndefined(company)) {
        this._company = company;
        this._companyName = company.CompanyName;        
        this._cdRef.markForCheck();
      }
      else {
        this._store.dispatch(new CompanyLoadAction(this._claimsHelper.getCompanyId())); // when cid exists then definetly getcurrentCompanyDetails will be available
      }
    });

  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this._companyDetailsSubscription) {
      this._companyDetailsSubscription.unsubscribe();
    }
    if (this._msDocIdSubscription)
      this._msDocIdSubscription.unsubscribe();
    if (this._msSupportingDocsSubscription)
      this._msSupportingDocsSubscription.unsubscribe();
    if (this._methodStatementSubscription)
      this._methodStatementSubscription.unsubscribe();
    if (this._msAttachmentSubscription)
      this._msAttachmentSubscription.unsubscribe();
    if (this._msUpdateStatusSubscription)
      this._msUpdateStatusSubscription.unsubscribe();
    if (this._printSubscription)
      this._printSubscription.unsubscribe();
  }
  getFileDownloadUrl(pictureUrl: string) {
    return pictureUrl;
  }
  // End of public methods

}
