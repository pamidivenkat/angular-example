import { appUrl } from './../../../shared/app.constants';
import { RouteParams } from './../../../shared/services/route-params';
import { IBreadcrumb } from './../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ElementRef, ViewEncapsulation } from "@angular/core";
import { BaseComponent } from "../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { Store } from "@ngrx/store";
import { ActivatedRoute, Router } from "@angular/router";
import { BreadcrumbService } from "../../../atlas-elements/common/services/breadcrumb-service";
import * as fromRoot from './../../../shared/reducers';
import { Subscription, Observable } from "rxjs/Rx";
import { isNullOrUndefined } from "util";
import { LoadCPPByIdAction, SaveCPPtoAtlasAction } from "../../manage-construction-plan/actions/manage-cpp.actions";
import { ConstructionPhasePlan } from "./../../models/construction-phase-plans";
import { Company } from "../../../company/models/company";
import { CompanyLoadAction } from "./../../../company/actions/company.actions";
import { AeClassStyle } from "./../../../atlas-elements/common/ae-class-style.enum";
import { DocumentCategoryEnum } from "./../../../document/models/document-category-enum";
import { Http, Response, Headers, ResponseContentType, RequestOptions } from '@angular/http';
import { RiskAssessmentStatus } from "./../../../risk-assessment/common/risk-assessment-status.enum";
import { CPPApproveAction } from "../../actions/construction-phase-plans.actions";
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeLoaderType } from "./../../../atlas-elements/common/ae-loader-type.enum";
import { EmailModel, EmailAttachment } from "./../../../email-shared/models/email.model";
import { User } from "./../../../shared/models/user";
import { AssignUser } from "./../../../task/models/assign-user";
import { StringHelper } from './../../../shared/helpers/string-helper';
@Component({
  selector: "construction-plan-view",
  templateUrl: "./construction-plan-view.component.html",
  styleUrls: ["./construction-plan-view.component.scss", "./../../../atlas-elements/ae-datatable/ae-datatable.component.scss"],

  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class ConstructionPlanViewComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _attachmentId: string;
  private _cppDocIdSubscription: Subscription;
  private _pictureId: string;
  private _companyDetailsSubscription: Subscription;
  private _cppSubscription: Subscription;
  private _routeParamsSubscription: Subscription;
  private _cppId: string;
  private _isExample: boolean;
  private _constructionPhasePlan: ConstructionPhasePlan;
  private _constructionPhasePlan$: Observable<ConstructionPhasePlan>;
  private _isConstruction: boolean;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _printSubscription: Subscription;
  private _isApproved: boolean;
  private _cppApproveStatusSubvscription: Subscription;
  private _loaderBars: AeLoaderType = AeLoaderType.Bars;
  private _action: string;
  private _emailSlideOut: boolean;
  private _emailModel: EmailModel;

  // End of Private Fields

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: ActivatedRoute
    , private _route: Router
    , private _breadcrumbService: BreadcrumbService
    , private _elemRef: ElementRef
    , private _http: Http
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._constructionPhasePlan = new ConstructionPhasePlan();
    this._isApproved = true;
  }

  // Public properties
  get ConstructionPhasePlan() {
    return this._constructionPhasePlan;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.CPP;
  }

  getLogoUrl(isShared: boolean = false): string {
    //cid should be company id whether cid exists or not in route params 
    let baseURL = window.location.protocol + "//" + window.location.host;
    if (this._constructionPhasePlan.IsExample) {
      return baseURL + '/assets/images/atlas-logo-bg-light.svg';
    } else if (isShared) {
      return this._pictureId != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + this._pictureId + '&isSystem=true' : baseURL + "/assets/images/default-icon-32x32.png";
    } else {
      return this._pictureId != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + this._pictureId + "&cid=" + this._constructionPhasePlan.CompanyId : baseURL + "/assets/images/default-icon-32x32.png";
    }

  }

  get IsConstruction() {
    return this._isConstruction;
  }

  get NeedToHideReviewDate() {
    return !isNullOrUndefined(this._constructionPhasePlan.ReviewDate) || this._isExample;
  }

  get EnableApproveButton() {
    return this._isApproved;
  }

  get loaderBars(): AeLoaderType {
    return this._loaderBars;
  }

  get ShowEmailSlideOut() {
    return this._emailSlideOut;
  }

  get GetEmailSlideoutState() {
    return this._emailSlideOut ? 'expanded' : 'collapsed';
  }

  get EmailModel() {
    return this._emailModel;
  }


  // End of Public properties

  // private methods

  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${docId}`;
  }

  private getTemplateForPrintandPDF(html: string) {
    return this._http.get('./assets/templates/construction-plan-view/construction-plan-preview.html')
      .map(templateResponse => {
        let template = templateResponse.text();
        let data = template.replace('{{bodyContent}}', html);
        return data;
      });
  }

  private _saveToAtlas() {
    let preview = (<HTMLElement>this._elemRef.nativeElement).getElementsByClassName('construction-plan-preview').item(0);
    if (!isNullOrUndefined(preview)) {
      let html: string = preview.innerHTML;
      this._printSubscription = this.getTemplateForPrintandPDF(html).subscribe((content) => {
        let model: any = new Object();
        model.AttachTo = { Id: this._cppId, ObjectTypeCode: 42 }
        model.Category = DocumentCategoryEnum.ConstructionPhasePlans;
        model.Content = content;
        model.FileName = this._constructionPhasePlan.Name + ".pdf";
        model.Title = this._constructionPhasePlan.Name;
        this._store.dispatch(new SaveCPPtoAtlasAction(model));
      });
    }

  }

  private _prepareEmailModel() {
    let model = new EmailModel();
    model.TemplateId = "8FA4BCF6-9D38-120C-3469-40155561AE2F";
    model.Attachments.push({ DocumentId: this._attachmentId, IsExample: this._isExample, FileName: "" });
    model.References.push({ Id: this._cppId, Name: 'constructionphaseplan', Otc: null }, { Id: this._claimsHelper.getUserId(), Name: 'User', Otc: null });
    model.Type = "Construction phase plan";
    return model;
  }

  // end of private methods

  // public methods

  public onFileDownLoad(docId: string) {
    window.open(this._getDownloadUrl(docId));
  }

  public OnPreviousClick() {
    let url: string = 'construction-phase-plan';
    this._route.navigate([url]);
  }


  public OnPrint() {
    window.print();
  }

  public OnEmail() {
    this._action = "Email";
    if (!isNullOrUndefined(this._attachmentId)) {
      this._emailModel = this._prepareEmailModel();
      this._emailSlideOut = true;
    }
    else {
      this._saveToAtlas();
    }

  }

  public OnExport() {
    if (!isNullOrUndefined(this._attachmentId)) {
      this.onFileDownLoad(this._attachmentId);
      return;
    }
    this._action = "Export";
    this._saveToAtlas();
  }

  OnCancel(e) {
    this._emailSlideOut = false;
  }

  public SetApproved() {
    this._store.dispatch(new CPPApproveAction({
      IsExample: this._isExample,
      Id: this._cppId
    }));
  }

  getFileDownloadUrl(attachmentId: string) {
    return this._constructionPhasePlan.CompanyId ? appUrl + '/filedownload?documentId=' + attachmentId + '&cid=' + this._constructionPhasePlan.CompanyId : appUrl + '/filedownload?documentId=' + attachmentId;
  }
  downLoadFile(event: any, attachmentId: string) {
    window.open(this.getFileDownloadUrl(attachmentId));
  }
  ngOnInit() {

    this._routeParamsSubscription = this._router.params.subscribe(params => {
      if (isNullOrUndefined(params['id'])) {
        this._cppId = '';
      }
      else {
        this._cppId = params['id'];
      }
      if (isNullOrUndefined(params['isExample'])) {
        this._isExample = false;
      }
      else {
        this._isExample = true;
      }
    });
    this._constructionPhasePlan$ = this._store.let(fromRoot.getCPPData);

    this._cppSubscription = this._store.let(fromRoot.getCPPData).subscribe(cpp => {
      if (!isNullOrUndefined(cpp)) {
        this._constructionPhasePlan = cpp;
        this._constructionPhasePlan.CPPEvents = this._constructionPhasePlan.CPPEvents.sort(function (a, b) { return a.Index - b.Index; });
        if (!isNullOrUndefined(this._constructionPhasePlan.CPPAdditionalInfo) &&
          !isNullOrUndefined(this._constructionPhasePlan.CPPAdditionalInfo.Contractors) &&
          this._constructionPhasePlan.CPPAdditionalInfo.Contractors.length > 0) {
          this._constructionPhasePlan.CPPAdditionalInfo.Contractors =
            this._constructionPhasePlan.CPPAdditionalInfo.Contractors.sort(function (a, b) { return a.PositionIndex - b.PositionIndex; });
        }
        if (this._constructionPhasePlan.StatusId != RiskAssessmentStatus.Pending) {
          this._isApproved = false;
        }
        this._isConstruction = this._claimsHelper.getSectorName() == "Construction" ? true : false;
        this._cdRef.markForCheck();

        let bcItem = new IBreadcrumb(this._constructionPhasePlan.Name, '', BreadcrumbGroup.CPP);
        this._breadcrumbService.add(bcItem);
      }
      else {
        this._store.dispatch(new LoadCPPByIdAction({ Id: this._cppId, IsExample: false })); // as of now sending is example false
      }
    });
    this._companyDetailsSubscription = this._store.let(fromRoot.getCurrentCompanyDetails).subscribe(company => {
      if (!isNullOrUndefined(company)) {
        this._pictureId = company.PictureId || "00000000-0000-0000-0000-000000000000";
        this._cdRef.markForCheck();
      }
      else {
        this._store.dispatch(new CompanyLoadAction(this._claimsHelper.getCompanyId()));
      }
    });

    this._cppDocIdSubscription = this._store.let(fromRoot.getCPPDocumentId).subscribe(docId => {
      if (!isNullOrUndefined(docId)) {
        this._attachmentId = docId;
        if (this._action == "Export") {
          this.onFileDownLoad(this._attachmentId);
        }
        else {
          this._emailModel = this._prepareEmailModel();
          this._emailSlideOut = true;
          this._cdRef.markForCheck();
        }
      }
    });

    this._cppApproveStatusSubvscription = this._store.let(fromRoot.getConstructionPhasePlanApproveStatus).subscribe(status => {
      if (status) {
        this._isApproved = false;
        this._cdRef.markForCheck();
      }
    });
  }

  getEmergencyRespUser() {
    if (!isNullOrUndefined(this.ConstructionPhasePlan) &&
      !isNullOrUndefined(this.ConstructionPhasePlan.CPPSafetyPrecautions)) {
      if (!isNullOrUndefined(this.ConstructionPhasePlan.CPPSafetyPrecautions.EmergencyRespUser)) {
        return this.ConstructionPhasePlan.CPPSafetyPrecautions.EmergencyRespUser.FullName;
      } else if (!StringHelper.isNullOrUndefinedOrEmpty(this.ConstructionPhasePlan.CPPSafetyPrecautions.EmergencyRespOtherUser)) {
        return this.ConstructionPhasePlan.CPPSafetyPrecautions.EmergencyRespOtherUser;
      }
    }
    return 'NA';
  }

  getFireRespUser() {
    if (!isNullOrUndefined(this.ConstructionPhasePlan) &&
      !isNullOrUndefined(this.ConstructionPhasePlan.CPPSafetyPrecautions)) {
      if (!isNullOrUndefined(this.ConstructionPhasePlan.CPPSafetyPrecautions.FireRespUser)) {
        return this.ConstructionPhasePlan.CPPSafetyPrecautions.FireRespUser.FullName;
      } else if (!StringHelper.isNullOrUndefinedOrEmpty(this.ConstructionPhasePlan.CPPSafetyPrecautions.FireRespOtherUser)) {
        return this.ConstructionPhasePlan.CPPSafetyPrecautions.FireRespOtherUser;
      }
    }
    return 'NA';
  }

  getFireAidRespUser() {
    if (!isNullOrUndefined(this.ConstructionPhasePlan) &&
      !isNullOrUndefined(this.ConstructionPhasePlan.CPPSafetyPrecautions)) {
      if (!isNullOrUndefined(this.ConstructionPhasePlan.CPPSafetyPrecautions.FirstAidRespUser)) {
        return this.ConstructionPhasePlan.CPPSafetyPrecautions.FirstAidRespUser.FullName;
      } else if (!StringHelper.isNullOrUndefinedOrEmpty(this.ConstructionPhasePlan.CPPSafetyPrecautions.FirstAidRespOtherUser)) {
        return this.ConstructionPhasePlan.CPPSafetyPrecautions.FirstAidRespOtherUser;
      }
    }
    return 'NA';
  }

  getAccidentAidRespUser() {
    if (!isNullOrUndefined(this.ConstructionPhasePlan) &&
      !isNullOrUndefined(this.ConstructionPhasePlan.CPPSafetyPrecautions)) {
      if (!isNullOrUndefined(this.ConstructionPhasePlan.CPPSafetyPrecautions.AccidentRespUser)) {
        return this.ConstructionPhasePlan.CPPSafetyPrecautions.AccidentRespUser.FullName;
      } else if (!StringHelper.isNullOrUndefinedOrEmpty(this.ConstructionPhasePlan.CPPSafetyPrecautions.AccidentRespOtherUser)) {
        return this.ConstructionPhasePlan.CPPSafetyPrecautions.AccidentRespOtherUser;
      }
    }
    return 'NA';
  }

  ngOnDestroy() {
    if (this._cppDocIdSubscription)
      this._cppDocIdSubscription.unsubscribe();
    if (this._cppSubscription)
      this._cppSubscription.unsubscribe();
    if (this._companyDetailsSubscription)
      this._companyDetailsSubscription.unsubscribe();
    if (this._cppApproveStatusSubvscription)
      this._cppApproveStatusSubvscription.unsubscribe();
    if (this._printSubscription)
      this._printSubscription.unsubscribe();
  }
  // End of public methods
}
