import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { ChartData } from '../../../atlas-elements/common/ae-chart-data';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { AeIndicatorStyle } from '../../../atlas-elements/common/ae-indicator-style.enum';
import { AeSortModel, SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AddCQCProDetailsAction } from '../../../document/document-details/actions/document-export-to-cqc.actions';
import { DocumentDetails } from '../../../document/document-details/models/document-details-model';
import { DocumentDetailsService } from '../../../document/document-details/services/document-details.service';
import { Document } from '../../../document/models/document';
import { DocumentCategoryEnum, DocumentChangesEnum } from '../../../document/models/document-category-enum';
import { EmailModel } from '../../../email-shared/models/email.model';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { TaskActivity } from '../../../task/models/task-activity';
import {
  LoadRaControlsCategoryText,
  LoadRaHazardCategoryText,
  LoadRiskAssessmentAction,
  LoadRiskAssessmentTasksAction,
} from '../../actions/risk-assessment-actions';
import { ControlsCategory } from '../../common/controls-category-enum';
import { RiskAssessmentStatus } from '../../common/risk-assessment-status.enum';
import { RAControlsCategoryText } from '../../models/ra-controls-category-text';
import { RAHazardCategoryText } from '../../models/ra-hazard-category-text';
import { RiskAssessment } from '../../models/risk-assessment';
import { RAAdditionalControl } from '../../models/risk-assessment-additionalcontrols';
import { RiskAssessmentControl } from '../../models/risk-assessment-control';
import { RiskAssessmentHazard } from '../../models/risk-assessment-hazard';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { RouteParams } from './../../../shared/services/route-params';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';

@Component({
  selector: 'preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PreviewComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _currentRiskAssessment: RiskAssessment;
  private _currentRiskAssessmentId: string;
  private _riskLevel: string;
  private _riskClass: string;
  private _hazards: Immutable.List<RiskAssessmentHazard>;
  private _measuresSubscription: Subscription;
  private _measures: Immutable.List<TaskActivity>;
  private _documents: Immutable.List<Document>;
  private _showIndividualAssessments: boolean;
  private _exposures: Immutable.List<RiskAssessmentHazard>;
  private _additionalControls: Map<string, Array<RAAdditionalControl>>;
  private _chartData: Immutable.List<ChartData> = Immutable.List<ChartData>();
  private _showBanner: boolean;
  private _categoryTexts: Map<string, string>;
  private _viewAction = new Subject();
  private _documentsLength: number;
  private _squareIndicator: AeIndicatorStyle = AeIndicatorStyle.Square;
  private _legendVertical: AeIndicatorStyle = AeIndicatorStyle.Vertical;
  private _apiRequestParams: AtlasApiRequestWithParams;
  private _modalHeader: string = '';
  private _attachmentId: string;
  private _emailModel: EmailModel;
  private _isExample: boolean = false;
  private _emailSlideOut: boolean = false;
  private _emailFlag: boolean = false;
  private _showReviewSlideout: boolean = false;
  private _showReviewButton: boolean = false;
  private _showApproveConfirmDialog: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _showApproveButton: boolean = false;
  private _exportPreviewInitiate: string = "Not Initiated";
  private _copyRASlideOut: boolean;
  private _attachment: Document;
  private _isArchived: boolean;
  private _isPending: boolean = false;
  private _iconMedium: AeIconSize = AeIconSize.medium;
  private _translationChangeSub: Subscription;
  private _hazardNotes: RAHazardCategoryText;
  private _ROENotes: RAHazardCategoryText;
  private _controlNotes: RAControlsCategoryText;
  private _showDocumentExportToCQCProSlideOut: boolean;
  private _cqcpruchaseDetailsLoadedSubscription: Subscription;
  private _cqcPruchased$: Observable<boolean>;
  private _documentDetails: DocumentDetails;
  private _cqcFlag: boolean = false;

  // End of Private Fields
  get iconMedium(): AeIconSize {
    return this._iconMedium;
  }

  // End of Private Fields

  legendOptions: Array<{ Text: string, Class: string }> = [];

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _route: ActivatedRoute
    , private _raService: RiskAssessmentService
    , private _claims: ClaimsHelperService
    , private _datePipe: DatePipe
    , private _claimsHelper: ClaimsHelperService
    , private _elemRef: ElementRef
    , private _http: Http
    , private _router: Router
    , private _routeParams: RouteParams
    , private _documentDetailsService: DocumentDetailsService
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._currentRiskAssessment = new RiskAssessment();
    this._documentDetails = new DocumentDetails();
  }
  // End of constructor

  // Private methods
  private _createLegend() {
    return [{ Text: this._translationService.translate('RISK_LEGEND.GREEN'), Class: "cl-green" }
      , { Text: this._translationService.translate('RISK_LEGEND.YELLOW'), Class: "cl-yellow" }
      , { Text: this._translationService.translate('RISK_LEGEND.RED'), Class: "cl-red" }];
  }

  private _prepareEmailModel() {
    let model = new EmailModel();
    model.TemplateId = '8FA4BCF6-9D38-120C-3469-40155571AE2F';
    model.Attachments.push({ DocumentId: this._attachmentId, IsExample: false, FileName: "" });
    model.References.push({ Id: this._claimsHelper.getUserId(), Name: 'User', Otc: null });
    model.Type = "Risk assessment";
    return model;
  }

  private _exportRiskAssessmentPreview() {
    let preview = (<HTMLElement>this._elemRef.nativeElement).getElementsByClassName('export-preview').item(0);
    let header = (<HTMLElement>this._elemRef.nativeElement).getElementsByClassName('export-header').item(0);
    let review = (<HTMLElement>this._elemRef.nativeElement).getElementsByClassName('review-section').item(1);
    let footer = (<HTMLElement>this._elemRef.nativeElement).getElementsByClassName('export-footer').item(0);

    if (!isNullOrUndefined(preview)) {
      let bodyContent: string = preview.innerHTML + (!isNullOrUndefined(review) ? review.innerHTML : '');
      let headerContent: string = header && header.innerHTML;
      let footerContent: string = footer && footer.innerHTML;
      Observable.forkJoin(this.getTemplateForPrintAndPDF(bodyContent), this.getHeaderTemplateForPrintAndPDF(headerContent), this.getFooterTemplateForPrintAndPDF(footerContent)).subscribe((contents) => {
        if (!isNullOrUndefined(contents[0])) {
          if (this._modalHeader === 'print') {
            this._printDocument(contents);
          } else if (this._modalHeader === 'export' || this._modalHeader === 'email' || this._modalHeader === 'cqcPro' || this._modalHeader === 'approve') {
            this._saveToAtlas(contents[0], contents[1], contents[2]);
            if (this._modalHeader === 'approve') {
              this._modalHeader = '';
            }
          }
        }
      });
    }
  }

  private getTemplateForPrintAndPDF(html: string) {
    return this._http.get('./assets/templates/risk-assessment/risk-assessment-preview.html')
      .map(templateResponse => {
        let template = templateResponse.text();
        let data = template.replace('{{bodyContent}}', html);
        return data;
      });
  }

  private getHeaderTemplateForPrintAndPDF(html: string) {
    return this._http.get('./assets/templates/risk-assessment/risk-assessment-header.html')
      .map(templateResponse => {
        let template = templateResponse.text();
        let data = template.replace('{{bodyContent}}', html);
        return data;
      });
  }

  private getFooterTemplateForPrintAndPDF(html: string) {
    return this._http.get('./assets/templates/risk-assessment/risk-assessment-footer.html')
      .map(templateResponse => {
        let template = templateResponse.text();
        let data = template.replace('{{bodyContent}}', html);
        return data;
      });
  }

  private _onResetExportPreview(exportResetValue: string) {
    this._exportPreviewInitiate = exportResetValue;
  }

  downloadDocument(docId: string) {
    let cid = this._routeParams.Cid;
    if (cid) {
      window.open(`/filedownload?documentId=${docId}&cid=${cid}`);
    }
    else {
      window.open(`/filedownload?documentId=${docId}`);
    }
  }

  getFileName(docId: string) {
    let cid = this._routeParams.Cid;
    if (cid) {
      return window.location.protocol + "//" + window.location.host + '/filedownload?documentId=' + docId + '&cid=' + cid;
    }
    else {
      return window.location.protocol + "//" + window.location.host + '/filedownload?documentId=' + docId;
    }
  }

  private _printDocument(contentArray) {
    let popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    if (!isNullOrUndefined(popupWin)) {
      popupWin.document.open();
      popupWin.document.write(contentArray[1]);
      popupWin.document.write(contentArray[0]);
      popupWin.document.write(contentArray[2]);
      popupWin.document.close();
      popupWin.print();
      popupWin.close();
    }
  }

  private _saveToAtlas(body: string, header: string, footer: string) {
    let model: any = new Object();
    model.AttachTo = { Id: this._currentRiskAssessment.Id, ObjectTypeCode: 30 }
    model.RegardingObject = { Id: this._currentRiskAssessment.Id, ObjectTypeCode: 30 }
    model.Category = DocumentCategoryEnum.RiskAssessment;
    model.Title = this._currentRiskAssessment.Name;
    model.FileName = this._currentRiskAssessment.Name + ".pdf";
    model.Content = body;
    model.HeaderContent = header;
    model.FooterContent = footer;
    model.IsLandscape = this.isMigrated() ? false : true;
    model.ExpiryDate = this._currentRiskAssessment.ReviewDate;
    model.Description = this._currentRiskAssessment.Description;
    model.LastChange = DocumentChangesEnum.ContentChanged;
    this._raService.exportRiskAssessmentPreview(model);
  }
  // End of private methods

  // Public methods
  get indicatorType(): AeIndicatorStyle {
    return this._squareIndicator;
  }
  get legendType(): AeIndicatorStyle {
    return this._legendVertical;
  }
  get documentsLength(): number {
    return this._documentsLength;
  }
  get currentRiskAssessment(): RiskAssessment {
    return this._currentRiskAssessment;
  }
  get claims(): ClaimsHelperService {
    return this._claims;
  }
  get hazards(): Immutable.List<RiskAssessmentHazard> {
    if (this._hazards) {
      return this._hazards.filter((p) => p.Category !== 1 && !p.IsDeleted).toList();
    }
    return this._hazards;
  }

  get measures(): Immutable.List<TaskActivity> {
    return this._measures;
  }
  get documents() {
    return this._documents;
  }
  get showIndividualAssessments(): boolean {
    return this._showIndividualAssessments;
  }
  get exposures(): Immutable.List<RiskAssessmentHazard> {
    return this._exposures;
  }
  get additionalControls() {
    return this._additionalControls;
  }
  get showBanner(): boolean {
    return this._showBanner;
  }
  get categoryTexts() {
    return this._categoryTexts;
  }

  get emailSlideOut(): boolean {
    return this._emailSlideOut;
  }
  get emailModel() {
    return this._emailModel;
  }
  get showReviewSlideout(): boolean {
    return this._showReviewSlideout;
  }
  get showReviewButton(): boolean {
    return this._showReviewButton;
  }
  get showApproveConfirmDialog(): boolean {
    return this._showApproveConfirmDialog;
  }
  get copyRASlideOut(): boolean {
    return this._copyRASlideOut;
  }
  get showApproveButton(): boolean {
    return this._showApproveButton;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get isArchived(): boolean {
    return this._isArchived;
  }
  get isPending(): boolean {
    return this._isPending;
  }

  get printedDate() {
    return new Date();
  }

  get hazardNotes(): RAHazardCategoryText {
    return this._hazardNotes;
  }

  get ROENotes(): RAHazardCategoryText {
    return this._ROENotes;
  }

  get controlNotes(): RAControlsCategoryText {
    return this._controlNotes;
  }

  get WorkspaceTypes() {
    if (!isNullOrUndefined(this._currentRiskAssessment) && !isNullOrUndefined(this._currentRiskAssessment.RiskAssessmentWorkspaceTypes)) {
      let list = this._currentRiskAssessment.RiskAssessmentWorkspaceTypes.sort((a, b) => a.Name.localeCompare(b.Name));
      return list;
    }
  }

  isExample(): boolean {
    return this._currentRiskAssessment && this._currentRiskAssessment.IsExample ? true : false;
  }

  getLogoUrl(isSystemDocument: boolean = false): string {
    //This is a special case where we need to append cid to images since it is used in pdf generator and images works only when cid is appened to it..
    let baseURL = window.location.protocol + "//" + window.location.host;
    let id = this._currentRiskAssessment.Site ? (this._currentRiskAssessment.Site.LogoId ? this._currentRiskAssessment.Site.LogoId : this._currentRiskAssessment.Site.Logo) : this._currentRiskAssessment.CompanyLogoId;
    if (this._currentRiskAssessment.IsExample) {
      return baseURL + '/assets/images/atlas-logo-bg-light.png';
    } else if (isSystemDocument) {
      return id != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + id + '&isSystem=true' : baseURL + "/assets/images/default-icon-32x32.png";
    } else {
      return id != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + id + "&cid=" + this._currentRiskAssessment.CompanyId : baseURL + "/assets/images/default-icon-32x32.png";
    }
  }

  getRiskAssessmentType(): string {
    return this._currentRiskAssessment.RiskAssessmentType && this._currentRiskAssessment.RiskAssessmentType.Name;
  }
  getAssessor(): string {
    return this._currentRiskAssessment.Assessor && (this.isMigrated() ? this._currentRiskAssessment.Assessor_Name : this._currentRiskAssessment.Assessor.FullName);
  }
  getApprovedUserName(): string {
    if (!isNullOrUndefined(this._currentRiskAssessment))
      return this._currentRiskAssessment.ApprovedUser && this._currentRiskAssessment.ApprovedUser.FullName;
  }
  getRiskAssessmentName(): string {
    return !isNullOrUndefined(this._currentRiskAssessment) ? this._currentRiskAssessment.Name : 'Risk Assessment';
  }
  canShowDescription(): boolean {
    return !this.isMigratedCOSHH() && this._currentRiskAssessment.RiskAssessmentWorkspaceTypes && this._currentRiskAssessment.RiskAssessmentWorkspaceTypes.length > 0
  }

  getLastReviewedDate() {
    if (!isNullOrUndefined(this._currentRiskAssessment))
      return this._datePipe.transform(this._currentRiskAssessment.AssessmentDate, 'dd/MM/yyyy')
  }

  getSiteLocation(): string {
    let affectedSite: string = '';
    if (!isNullOrUndefined(this._currentRiskAssessment) && this._currentRiskAssessment.Site) {
      affectedSite = this._currentRiskAssessment.Site.SiteNameAndPostcode + ' ';
    }
    if (this._currentRiskAssessment.SiteLocation)
      affectedSite += this._currentRiskAssessment.SiteLocation
    return affectedSite;
  }

  getPictureUrl(pictureId: string, isSystemDocument: boolean = false, isHazard: boolean = false): string {
    //although cid does not exists we should pass to images since it should work in pdf generator we should pass cid to images
    let baseURL = window.location.protocol + "//" + window.location.host;
    if (isSystemDocument) {
      return pictureId && pictureId != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + pictureId + "&isSystem=true" : (isHazard ? baseURL + "/assets/images/hazard-default.png" : baseURL + "/assets/images/default-icon-32x32.png");
    } else {
      return pictureId && pictureId != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + pictureId + "&cid=" + this._currentRiskAssessment.CompanyId : (isHazard ? baseURL + "/assets/images/hazard-default.png" : baseURL + "/assets/images/default-icon-32x32.png");
    }
  }

  getSignaturePictureUrl(pictureId: string): string {
    let baseURL = window.location.protocol + "//" + window.location.host;
    if (isNullOrUndefined(pictureId)) {
      return;
    }
    return pictureId && pictureId != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + pictureId + "&cid=" + this._currentRiskAssessment.Assessor.CompanyId : "";
  }

  isMigratedGeneral(): boolean {
    return this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.generalMigratedRiskAssessmentTypeId;
  }

  isMigratedCOSHH(): boolean {
    return this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.coshhMigratedRiskAssessmentTypeId;
  }

  isCOSHH(): boolean {
    return this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.coshhRiskAssessmentTypeId;
  }

  isMigrated(): boolean {
    return this.isMigratedCOSHH() || this.isMigratedGeneral();
  }

  showOverallRiskRating(): boolean {
    return !isNullOrUndefined(this._currentRiskAssessment.Likelihood) && !isNullOrUndefined(this._currentRiskAssessment.Severity);
  }

  isLive() {
    return this._currentRiskAssessment && this._currentRiskAssessment.StatusId === RiskAssessmentStatus.Live;
  }

  getRiskLevelOrClass(item, checkLevel: boolean = true) {
    if (isNullOrUndefined(item.Likelihood) || isNullOrUndefined(item.Severity)) {
      return '';
    }
    item.Matrix = isNullOrUndefined(item.Matrix) ? this._currentRiskAssessment.Matrix ? this._currentRiskAssessment.Matrix : 2 : item.Matrix;
    let value = item.Likelihood * item.Severity;
    switch (item.Matrix) {
      case 0:
        if (value < 3) {
          return checkLevel ? 'RISK_LEVEL.LOW' : 'RISK_CLASS.GREEN';
        }

        if (value >= 3 && value < 5) {
          return checkLevel ? 'RISK_LEVEL.MEDIUM' : 'RISK_CLASS.YELLOW';
        }
        if (value >= 5) {
          return checkLevel ? 'RISK_LEVEL.HIGH' : 'RISK_CLASS.RED';
        }
      case 1:
        if (value < 4) {
          return checkLevel ? 'RISK_LEVEL.LOW' : 'RISK_CLASS.GREEN';

        }
        if (value >= 4 && value < 10) {
          return checkLevel ? 'RISK_LEVEL.MEDIUM' : 'RISK_CLASS.YELLOW';
        }
        if (value >= 10) {
          return checkLevel ? 'RISK_LEVEL.HIGH' : 'RISK_CLASS.RED';
        }
      case 2:
        if (value < 10) {
          return checkLevel ? 'RISK_LEVEL.LOW' : 'RISK_CLASS.GREEN';
        }
        if (value >= 10 && value < 30) {
          return checkLevel ? 'RISK_LEVEL.MEDIUM' : 'RISK_CLASS.YELLOW';
        }
        if (value >= 30) {
          return checkLevel ? 'RISK_LEVEL.HIGH' : 'RISK_CLASS.RED';
        }
    }
  }

  hasHazards(): boolean {
    return this._hazards && this._hazards.filter((p) => p.Category !== 1 && !p.IsDeleted).count() > 0;
  }

  hasRoutesOfExposure(): boolean {
    return this._hazards && this._hazards.filter((p) => p.Category === 1 && !p.IsDeleted).count() > 0;
  }
  overallRA(Likelihood, Severity) {
    if (Likelihood == 0) {
      Likelihood = 1;
    }
    if (Severity == 0) {
      Severity = 1;
    }
    let overallRA = Likelihood * Severity;
    return overallRA;
  }
  getChartData(hazard: RiskAssessmentHazard): Observable<Array<number>> {
    if (isNullOrUndefined(hazard.Likelihood) && !isNullOrUndefined(hazard.Severity)) {
      hazard.Likelihood = 1
    }
    if (!isNullOrUndefined(hazard.Likelihood) && isNullOrUndefined(hazard.Severity)) {
      hazard.Severity = 1
    }
    if (isNullOrUndefined(hazard.Likelihood) || hazard.Likelihood == 0) {
      hazard.Likelihood = 1
    }
    if (isNullOrUndefined(hazard.Severity) || hazard.Severity == 0) {
      hazard.Severity = 1
    }
    return Observable.of([hazard.Likelihood * hazard.Severity, this._currentRiskAssessment.Matrix]);
  }

  hasSubstances(): boolean {
    if (isNullOrUndefined(this._currentRiskAssessment.RASubstances)) return false;
    let raSubstances = this._currentRiskAssessment.RASubstances.filter(m => !m.IsDeleted);
    return raSubstances && raSubstances.length > 0;
  }

  getRASubstances() {
    return this._currentRiskAssessment.RASubstances.filter(m => !m.IsDeleted);
  }
  showButtonsHeader() {
    return this._currentRiskAssessment.StatusId == 4 ? false : true;
  }
  get riskMatrixHigh(): string {
    return window.location.protocol + "//" + window.location.host + this._translationService.translate('RISK_MATRIX_IMAGE.HIGH');
  }
  get riskMatrixLow(): string {
    return window.location.protocol + "//" + window.location.host + this._translationService.translate('RISK_MATRIX_IMAGE.LOW');
  }
  get riskMatrixMedium(): string {
    return window.location.protocol + "//" + window.location.host + this._translationService.translate('RISK_MATRIX_IMAGE.MEDIUM');
  }
  get showDocumentExportToCQCProSlideOut(): boolean {
    return this._showDocumentExportToCQCProSlideOut;
  }
  get cqcPruchased$(): Observable<boolean> {
    return this._cqcPruchased$;
  }
  openEmailSlideOut() {
    this._modalHeader = 'email';
    if (!isNullOrUndefined(this._attachmentId)) {
      this._emailModel = this._prepareEmailModel();
      this._emailSlideOut = true;
    } else {
      this._emailFlag = true;
      this._exportRiskAssessmentPreview();
    }
  }

  closeEmailSlideOut() {
    this._emailSlideOut = false;
    this._emailFlag = false;
  }

  getEmailSlideoutState(): string {
    return this._emailSlideOut ? 'expanded' : 'collapsed';
  }

  exportRiskAssessmentPreview() {
    this._exportPreviewInitiate = "Initiated";
    this._modalHeader = 'export';
    this._emailFlag = false;
    this._exportRiskAssessmentPreview();
  }

  printRiskAssessmentPreview() {
    this._modalHeader = 'print';
    //this._exportRiskAssessmentPreview();
    window.print();
  }

  onReviewClick() {
    this._showReviewSlideout = true;
  }
  getCopySlideoutState(): string {
    return this._copyRASlideOut ? 'expanded' : 'collapsed';
  }

  getReviewSlideoutState(): string {
    return this._showReviewSlideout ? 'expanded' : 'collapsed';
  }
  getReviewSlideoutAnimateState(): boolean {
    return this._showReviewSlideout ? true : false;
  }
  closeReviewSlideOut() {
    this._showReviewSlideout = false;
  }
  onReviewSubmit() {
    this._showReviewSlideout = false;
    this._showReviewButton = false;
  }
  approveModalClosed(event) {
    this._showApproveConfirmDialog = false;
  }
  approveRiskAssessment() {
    this._raService._approveRiskAssessment(this._currentRiskAssessment);
    this._showApproveConfirmDialog = false;
    this._showApproveButton = false;
    this._modalHeader = 'approve';
  }
  onApprove() {
    this._showApproveConfirmDialog = true;
  }

  openCopyRiskAssessmentSlide() {
    this._copyRASlideOut = true;
  }

  closeCopySlideOut() {
    this._copyRASlideOut = false;
  }

  copyRiskAssessmentSubmit(riskAssessment) {
    this._copyRASlideOut = false;
    this._raService._copyRiskAssessment(riskAssessment);
  }

  hasAnySectorWorkSpaces() {
    return this._currentRiskAssessment.RiskAssessmentWorkspaceTypes.length > 0;
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
      this._cqcFlag = true;
      this._exportRiskAssessmentPreview();
    }
  }

  private _extractDocumentDetails(document: Document) {
    this._documentDetails.FileName = (!isNullOrUndefined(document.FileNameAndTitle) && document.FileNameAndTitle != '') ? document.FileNameAndTitle : document.FileName;
    this._documentDetails.Notes = document.Comment;
    this._documentDetails.Description = isNullOrUndefined(document.Description) ? 'Not Mentioned' : document.Description;
    this._documentDetails.Title = document.Title;
    this._documentDetails.ExpiryDate = document.ExpiryDate;
    this._documentDetails.Usage = document.Usage;
    this._documentDetails.UsageName = document.UsageName;
    this._documentDetails.RegardingObjectId = document.RegardingObject && document.RegardingObject.Otc != 3 ? document.RegardingObject.Id : null;
    this._documentDetails.SiteId = document.RegardingObject && document.RegardingObject.Otc == 3 ? document.RegardingObject.Id : null; // object type ==3 for site
    this._documentDetails.FileStorageIdentifier = document.FileStorageIdentifier;
    this._documentDetails.Category = document.Category;
    this._documentDetails.Id = document.Id;
    return this._documentDetails;
  }

  getControlsByHazard(hazardId: string): RiskAssessmentControl[] {
    let controls: RiskAssessmentControl[] = [];
    controls = this._currentRiskAssessment.RAControls.filter(control => control.RiskAssessmentHazardId === hazardId);
    return controls.sort((a, b) => a.Name.toLocaleLowerCase() > b.Name.toLocaleLowerCase() ? 1 : -1);
  }

  ngOnInit() {
    this._route.params.takeUntil(this._destructor$).subscribe((params) => {
      if (!isNullOrUndefined(params['id'])) {
        this._currentRiskAssessmentId = params['id'];
      }
      this._isExample = params['example'] === "example" ? true : false;
    });
    this._store.let(fromRoot.getCurrentRiskAssessmentDocuments).takeUntil(this._destructor$).subscribe((data) => {
      this._documents = data;
    });
    this._store.let(fromRoot.getCurrentRiskAssessmentDocumentsLength).takeUntil(this._destructor$).subscribe((length) => {
      this._documentsLength = length;
    })
    this._route.url.takeUntil(this._destructor$).subscribe((url) => {
      if (url.find(segment => segment.path === 'example')) {
        this._currentRiskAssessment.IsExample = true;
      }
      this._showBanner = url.find(segment => segment.path === 'add' || segment.path === 'edit') ? false : true;
    })
    this._cqcpruchaseDetailsLoadedSubscription = this._documentDetailsService.getCQCPurchaseDetailsLoadingStatus().subscribe(status => {
      if (!status) {
        this._documentDetailsService.getCQCPurchaseStatusByCompanyId();
      }
    });
    this._cqcPruchased$ = this._store.let(fromRoot.getCQCPurchaseStatus);
    this._store.let(fromRoot.getRiskAssessmentAdditionalControls).takeUntil(this._destructor$).subscribe((controls) => {
      if (!isNullOrUndefined(controls)) {
        this._additionalControls = controls;
        this._cdRef.markForCheck();
      }
    });

    this._store.let(fromRoot.getCurrentRiskAssessment).takeUntil(this._destructor$).subscribe((riskAssessment) => {
      if (!isNullOrUndefined(riskAssessment)) {
        const bcItem = {
          isGroupRoot: false, group: BreadcrumbGroup.RiskAssessments,
          label: riskAssessment.Name, url: '/risk-assessment/' + this._currentRiskAssessmentId
        };
        this._breadcrumbService.add(bcItem);

        this._currentRiskAssessment = riskAssessment;
        this._currentRiskAssessmentId = riskAssessment.Id;
        if (!isNullOrUndefined(this._currentRiskAssessment.RAHazards)) {
          let hazards = this._currentRiskAssessment.RAHazards.filter((hazard) => {

            let affecteds = [];

            hazard.WhoAffecteds.forEach((affected) => {
              if (affected.AffectedText !== 'Other' && !affected.IsDeleted) {
                affecteds.push(this._translationService.translate('AFFECTED_LABEL.' + affected.AffectedText));
              }
            })

            hazard.Affected = affecteds.sort((a, b) => { return a > b ? 1 : -1; }).join(', ');
            return (hazard.CompanyId.toUpperCase() === this._claims.getCompanyId().toUpperCase()
              || (!isNullOrUndefined(this._routeParams.Cid) && hazard.CompanyId.toUpperCase() === this._routeParams.Cid.toUpperCase())
              || hazard.CompanyId.toUpperCase() === '89504E36-557B-4691-8F1B-7E86F9CF95EA')
              && !hazard.IsDeleted
          }).sort((a, b) => {
            return a.Name > b.Name ? 1 : -1;
          });


          if (this.isCOSHH() || this.isMigratedCOSHH()) {
            this._exposures = Immutable.List(hazards.filter((hazard) => { return hazard.Category === 1 && !hazard.IsDeleted; }));
            this._store.dispatch(new LoadRaHazardCategoryText({ id: this._currentRiskAssessmentId }))
            let params = new Array<AtlasParams>();
            params.push(new AtlasParams('AdditionalControlsTextByRAIdFilter', this._currentRiskAssessmentId));
            this._store.dispatch(new LoadRaControlsCategoryText(params))
          }
          let individualAssessments = hazards.filter(hazard => (!isNullOrUndefined(hazard.Likelihood) || !isNullOrUndefined(hazard.Severity)))
          this._showIndividualAssessments = individualAssessments.length > 0;
          this._hazards = Immutable.List(hazards);
        }
        this._raService.loadAdditionalControlCategoryText(this._currentRiskAssessmentId);

        if (this._currentRiskAssessment.StatusId === RiskAssessmentStatus.Live || this._currentRiskAssessment.StatusId === RiskAssessmentStatus.Overdue) {
          this._showReviewButton = true;
          this._showApproveButton = false;
        }
        if (this._currentRiskAssessment.StatusId === RiskAssessmentStatus.Pending) {
          this._showApproveButton = true;
          this._showReviewButton = false;
          this._isPending = true;
        }
        if (this._currentRiskAssessment.StatusId === RiskAssessmentStatus.Archived) {
          this._showApproveButton = false;
          this._showReviewButton = false;
          this._isArchived = true;
        }
        this._cdRef.markForCheck();
        if (this._modalHeader === 'approve') {

          var preview = this;
          setTimeout(function () {
            preview._exportRiskAssessmentPreview();
            let navigationExtras: NavigationExtras = {
              queryParamsHandling: 'merge'
            };
            preview._router.navigate(['/risk-assessment/' + preview._currentRiskAssessment.Id], navigationExtras);
          }, 100)
        }

      } else {
        let apiParams = { id: this._currentRiskAssessmentId, example: this.isExample(), preview: true }
        this._store.dispatch(new LoadRiskAssessmentAction(apiParams))
      }

      this._cdRef.markForCheck();
    });

    this._store.let(fromRoot.getHazardNotes).takeUntil(this._destructor$).subscribe((hazardNotes) => {
      this._hazardNotes = hazardNotes;
    })

    this._store.let(fromRoot.getROENotes).takeUntil(this._destructor$).subscribe((ROENotes) => {
      this._ROENotes = ROENotes;
    })

    this._store.let(fromRoot.getControlsNotes).takeUntil(this._destructor$).subscribe((notes) => {
      this._controlNotes = notes;
    })

    this._store.let(fromRoot.getAdditionalControlsCategoryText).takeUntil(this._destructor$).subscribe((categoryTexts) => {
      if (!isNullOrUndefined(categoryTexts) && categoryTexts.length > 0) {
        let categoryText = new Map<string, string>();
        categoryTexts.map((value, key) => {
          categoryText.set(ControlsCategory[value.Category], value.Text);
        })
        this._categoryTexts = categoryText;
      }
    })

    this._store.let(fromRoot.getRiskAssessmentTasksData).takeUntil(this._destructor$).subscribe((measures) => {
      if (isNullOrUndefined(measures) && !StringHelper.isNullOrUndefinedOrEmpty(this._currentRiskAssessmentId)) {
        if (isNullOrUndefined(this._apiRequestParams))
          this._apiRequestParams = <AtlasApiRequestWithParams>{};
        this._apiRequestParams.PageNumber = 1;
        this._apiRequestParams.PageSize = 999;
        this._apiRequestParams.SortBy = <AeSortModel>{};
        this._apiRequestParams.SortBy.Direction = SortDirection.Ascending;
        this._apiRequestParams.SortBy.SortField = 'Title';
        this._apiRequestParams.Params = [];
        this._apiRequestParams.Params.push(new AtlasParams('filterByRegObjId', this._currentRiskAssessmentId));
        this._store.dispatch(new LoadRiskAssessmentTasksAction(this._apiRequestParams))
      } else {
        if (!isNullOrUndefined(measures)) {
          measures.forEach((measure) => {
            let raHazard = this.currentRiskAssessment.RAHazards.find((hazard) => { return hazard.Id === measure.SubObjectId });
            if (raHazard) {
              measure.HazardImageURL = this.getPictureUrl(raHazard.PictureId, raHazard.IsSharedPrototype, true);
              measure.HazardName = raHazard.Name;
            } else {
              measure.HazardImageURL = '';
              measure.HazardName = '';
            }

          });
          this._measures = Immutable.List(measures);
        }
      }
      this._cdRef.markForCheck();
    });

    this._store.let(fromRoot.getRiskAssessmentDocument).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._attachment = res;
        this._attachmentId = res.Id;
        if (this._emailFlag) {
          this._emailModel = this._prepareEmailModel();
          this._emailSlideOut = true;
        }
        if (this._exportPreviewInitiate == "Initiated") {
          this._onResetExportPreview("Not Initiated");
          this.downloadDocument(this._attachmentId);
        }
        if (this._cqcFlag) {
          this._documentDetails = this._extractDocumentDetails(res);
          this._showDocumentExportToCQCProSlideOut = true;
        }
        this._cdRef.markForCheck();
      }
    });

    this.legendOptions = this._createLegend();


    this._translationChangeSub = this._translationService.translationChanged.subscribe(
      () => {
        this.legendOptions = this._createLegend();
      }

    );
    this._cdRef.markForCheck();
  }

  ngOnDestroy() {
    if (this._translationChangeSub) {
      this._translationChangeSub.unsubscribe();
    }
    super.ngOnDestroy();
  }
  // End of public methods
}
