import { AeIconSize } from '../../../../atlas-elements/common/ae-icon-size.enum';
import { appUrl } from './../../../../shared/app.constants';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleDatePipe, LocaleService, TranslationService } from 'angular-l10n';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { isNullOrUndefined } from 'util';

import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import {
  IncidentDetailsGetAction,
  IncidentDetailsUpdateAction,
  IncidentLoadApplicableSectionsAction,
} from '../../../incident/actions/incident-formal-investigation.actions';
import { IncidentFormField } from '../../../incident/models/incident-form-field';
import { AnswerType, InvQuestion } from '../../../incident/models/incident-inv-question';
import { InvSection } from '../../../incident/models/incident-inv-section';
import { Incident } from '../../../incident/models/incident.model';
import { IncidentKeyFieldsValidationService } from '../../../incident/services/incident-key-fields-validation.service';
import { IncidentLogService } from '../../../incident/services/incident-log.service';
import { IncidentStatus } from '../../../models/incident-status.enum';
import { IncidentPreviewService } from '../../services/incident-preview.service';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { IncidentTypeLoadAction } from './../../../../shared/actions/lookup.actions';
import { BaseComponent } from './../../../../shared/base-component';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { CommonHelpers } from './../../../../shared/helpers/common-helpers';
import { ObjectHelper } from './../../../../shared/helpers/object-helper';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { IncidentType } from './../../../../shared/models/lookup.models';
import * as fromRoot from './../../../../shared/reducers';
import { MessengerService } from './../../../../shared/services/messenger.service';
import { RouteParams } from './../../../../shared/services/route-params';
import { IncidentPreviewVM } from './../../models/incident-preview.model';
import { Witness } from '../../models/incident-about-incident';

@Component({
  selector: 'incident-preview',
  templateUrl: './incident-preview.component.html',
  styleUrls: ['./incident-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IncidentPreviewComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private variables - start
  private _incidentId: string;
  private _incidentPreviewVM: IncidentPreviewVM;
  private _context: any;
  private _onComplete: Subject<boolean>;
  private _canShowApproveButton: boolean = false;
  private _isRiddorRequired: boolean = false;
  private _isInvestigationRequired: boolean = false;
  private _formKeyFields: Array<string> = [];
  private _showKeyFieldsNotification: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _commentsFormGroup: FormGroup;
  private _incidentDetails: Incident;
  private _isApproveClicked: boolean = false;
  private _loaderBars: AeLoaderType = AeLoaderType.Spinner;
  private _incidentTypeData: Array<IncidentType> = [];
  private _aboutIncidentKeyFields: Array<string> = [];
  private _invSections: InvSection[];
  private _invSections$: Observable<InvSection[]>;
  private _defaultLocale: string;
  private _incidentInvSectionsSubscription: Subscription;
  private _incidentTypeSubscription: Subscription;
  private _incidentDetailsToUpdateSubscription: Subscription;
  private _showValidation: boolean = false;
  private _signature: string;
  private _isDataLoading: boolean = true;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _iconMedium: AeIconSize = AeIconSize.medium;
  private _validationInProgress: boolean = false;
  private _aboutIncidentFields: Array<string> = [];
  private _hasWitness: boolean;

  // Private variables - end

  // Getters
  get isApproveClicked(): boolean {
    return this._isApproveClicked;
  }

  get iconMedium(): AeIconSize {
    return this._iconMedium;
  }

  get incidentPreviewVM() {
    return this._incidentPreviewVM;
  }

  get canShowApproveButton() {
    return this._canShowApproveButton;
  }

  get isRiddorRequired() {
    return this._isRiddorRequired;
  }

  get isInvestigationRequired() {
    return this._isInvestigationRequired;
  }
  get commentsFormGroup(): FormGroup {
    return this._commentsFormGroup;
  }

  get loaderBars(): AeLoaderType {
    return this._loaderBars;
  }

  get invSections(): Observable<InvSection[]> {
    return this._invSections$;
  }

  get investigationSections(): InvSection[] {
    return this._invSections;
  }

  get showValidation() {
    return this._showValidation;
  }
  get Signature() {
    return this._signature;
  }

  get isDataLoading() {
    return this._isDataLoading;
  }

  get loaderType() {
    return this._loaderType;
  }

  get hasWitness() {
    return this._hasWitness;
  }
  // End of Getters

  // Public properties - start
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  @Input('onComplete')
  set onComplete(val: Subject<boolean>) {
    this._onComplete = val;
  }
  get onComplete() {
    return this._onComplete;
  }


  get showKeyFieldsPopUp() {
    return this._showKeyFieldsNotification;
  }

  get lightClass() {
    return this._lightClass;
  }

  get validationInProgress() {
    return this._validationInProgress;
  }

  @ViewChild('incidentPreviewPanel')
  incidentPreviewPanel: ElementRef;

  @Output('onApprove')
  private _approve: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Public properties - end

  // constructor - start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _router: ActivatedRoute
    , private _route: Router
    , private _messenger: MessengerService
    , private _incidentPreviewService: IncidentPreviewService
    , private _routeParamsService: RouteParams
    , private _incidentLogService: IncidentLogService
    , private _fb: FormBuilder
    , private _incidentKeyFieldsValidationService: IncidentKeyFieldsValidationService
    , private _localeDatePipe: LocaleDatePipe
  ) {
    super(_localeService, _translationService, _cdRef);
    this.id = 'incident_preview';
    this.name = 'incident_preview';
  }
  // constructor - end

  //Private methods
  private _extractAnswerFromOptions(question: InvQuestion, value: any) {
    let selectedOption = question.Options.find(o => o.Id == value);
    if (!isNullOrUndefined(selectedOption)) return selectedOption.Text;
  }
  private _extractAnswerFromCheckboxOptions(question: InvQuestion, value: any) {
    let answer = '';
    let options = question.Options.sort((a, b) => {
      if (a.OrderIndex < b.OrderIndex) return -1;
      if (a.OrderIndex > b.OrderIndex) return 1;
      return 0;
    });

    let selectedValues = value.split(',');
    if (selectedValues.length > 0) {
      selectedValues.forEach((val, index) => {
        if (index != 0) {
          answer = answer + ',';
        }
        let selectedIndex = Number(val) - 1;
        if (!isNullOrUndefined(options[selectedIndex])) {
          answer = answer + options[selectedIndex].Text
        }
      });
    }
    return answer;
  }

  private _extractAboutIncidentFields(data: IncidentType[]) {
    if (!isNullOrUndefined(data)) {
      this._incidentTypeData = data;
      let selectedIncidentType = this._incidentTypeData.find(i => i.Id.toLowerCase() === this._incidentPreviewVM.AboutIncidentIncidentTypeId.toLowerCase());
      if (!isNullOrUndefined(selectedIncidentType)) {
        (<Array<IncidentFormField>>JSON.parse(selectedIncidentType.IncidentCategory.Fields)).forEach(x => {
          this._aboutIncidentFields.push(x.Name);
        });
      }
    }
    else {
      this._store.dispatch(new IncidentTypeLoadAction());
    }

  }
  //End of Private methods

  // Public methods - start
  public canReasonForNonCompletionShown(): boolean {
    return !isNullOrUndefined(this._incidentPreviewVM) && !isNullOrUndefined(this._incidentPreviewVM.Comments);
  }

  ngOnInit() {
    this._incidentPreviewVM = new IncidentPreviewVM();

    this._router.params.takeUntil(this._destructor$).subscribe(params => {
      if (isNullOrUndefined(params['id'])) {
        this._incidentId = '';
      }
      else {
        this._incidentId = params['id'];
      }
    });

    this._defaultLocale = this._localeService.getDefaultLocale();
    this._localeService.defaultLocaleChanged.subscribe(
      (locale) => { this._defaultLocale = locale }
    );
    this._store.let(fromRoot.getIncidentId).takeUntil(this._destructor$).subscribe(incidentId => {
      if (!isNullOrUndefined(incidentId)) {
        this._incidentId = incidentId;
      }
    });

    this._invSections$ = this._store.let(fromRoot.getIncidentInvSections);
    this._incidentInvSectionsSubscription = this._invSections$.subscribe((res) => {
      this._invSections = res;
    });

    this._commentsFormGroup = this._fb.group(
      { keyFieldsComment: [{ value: '', disabled: false }, Validators.required] }
    );


    Observable.combineLatest(this._incidentPreviewService.getIncidentPreviewDetails(this._incidentId),
      this._store.let(fromRoot.getIncidentTypeData))
      .subscribe((data) => {
        let previewData = data[0];
        this._incidentPreviewVM = previewData;
        this._extractAboutIncidentFields(data[1]);
        this._hasWitness = false;
        if (isNullOrUndefined(previewData.AboutIncidentDetails)) {
          this._hasWitness = false;
        }
        else {
          this._hasWitness = (Number(previewData.AboutIncidentDetails.HasWitness) == 0) ? true : false;
        }
        let baseURL = window.location.protocol + "//" + window.location.host;
        this._signature = this._incidentPreviewVM.Signature && this._incidentPreviewVM.Signature != "00000000-0000-0000-0000-000000000000" ? baseURL + "/filedownload?documentId=" + this._incidentPreviewVM.Signature + (this._incidentPreviewVM.AuthorCompanyId.toUpperCase() === '89504E36-557B-4691-8F1B-7E86F9CF95EA' ? '&isSystem=true' : "&cid=" + this._incidentPreviewVM.AuthorCompanyId) : null;
        this._isDataLoading = false;
        this._canShowApproveButton = previewData.IncidentStatus == IncidentStatus.Pending;
        this._isRiddorRequired = previewData.ReportedToIsRIDDORRequired;
        this._isInvestigationRequired = previewData.IsInvestigationRequired;
        this._commentsFormGroup.controls['keyFieldsComment'].setValue(this._incidentPreviewVM.Comments);
        if (this._isInvestigationRequired && (isNullOrUndefined(this._invSections) || this._invSections.length === 0)) {
          this._store.dispatch(new IncidentLoadApplicableSectionsAction(this._incidentPreviewVM.Id));

        }
        this._cdRef.markForCheck();
      });

    if (isNullOrUndefined(this._incidentLogService.getIncidentDetails())) {
      this._store.dispatch(new IncidentDetailsGetAction(this._incidentId));
    }

    this._incidentDetailsToUpdateSubscription = this._store.let(fromRoot.getIncidentDetails).subscribe(incidentDetails => {
      if (!isNullOrUndefined(incidentDetails)) {
        this._incidentDetails = incidentDetails;
      }
    });

    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };

    this._onComplete.takeUntil(this._destructor$).subscribe(val => {
      if (val) {
        if (this._incidentPreviewVM.IncidentStatus == 1) {
          this._incidentPreviewService.approveIncident(this._incidentId).takeUntil(this._destructor$).subscribe((approveData) => {

          });
        }
      }
    });

    this._commentsFormGroup.controls['keyFieldsComment'].valueChanges.subscribe((value) => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(value)) {
        this._showValidation = false;
      }
      else {
        this._showValidation = true;
      }
    });
  }
  public saveIncidentToAtlas($event) {
    this._validateIncidentOnClick();
  }
  public saveIncidentToAtlasOnConfirmation() {
    this._showKeyFieldsNotification = false;
    let incidentPreviewElement = (<HTMLElement>this.incidentPreviewPanel.nativeElement);
    if (!isNullOrUndefined(incidentPreviewElement)) {
      let html: string = incidentPreviewElement.innerHTML;

      let vm = ObjectHelper.operationInProgressSnackbarMessage('Saving incident to Atlas ...');
      this._messenger.publish('snackbar', vm);
      this._incidentPreviewService.generatePDF(html, incidentPreviewElement.getBoundingClientRect().width, this._incidentId, this._incidentPreviewVM)
        .takeUntil(this._destructor$)
        .subscribe((documentId) => {
          if (!StringHelper.isNullOrUndefinedOrEmpty(documentId)) {
            vm = ObjectHelper.operationCompleteSnackbarMessage('Document saved successfully. PDF version can be found in Company Document Library.');
            this._messenger.publish('snackbar', vm);
            if (this._isApproveClicked) {
              this._isApproveClicked = false;
              let navigateUrl = "/incident";
              let navigationExtras: NavigationExtras = {
                queryParamsHandling: 'merge'
              };
              this._route.navigate([navigateUrl], navigationExtras);
            }
          }
        });
    }
  }


  public generatePDF($event) {
    let incidentPreviewElement = (<HTMLElement>this.incidentPreviewPanel.nativeElement);
    if (!isNullOrUndefined(incidentPreviewElement)) {
      let html: string = incidentPreviewElement.innerHTML;

      this._incidentPreviewService
        .generatePDF(html, incidentPreviewElement
          .getBoundingClientRect().width, this._incidentId, this._incidentPreviewVM)
        .takeUntil(this._destructor$)
        .subscribe((documentId) => {
          if (!StringHelper.isNullOrUndefinedOrEmpty(documentId)) {
            let url = this._routeParamsService.Cid ? `/filedownload?documentId=${documentId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${documentId}`;
            window.open(url);
          }
        });
    }
  }

  public showApproveIncident(): boolean {
    return this._claimsHelper.canApproveIncident() || this._claimsHelper.canManageIncidents();
  }

  public approveIncident($event) {
    this._isApproveClicked = true;
    if (!isNullOrUndefined(this._incidentPreviewVM.AboutIncidentIncidentTypeId) && this._aboutIncidentKeyFields.length < 1) {
      let selectedIncidentType = this._incidentTypeData.find(i => i.Id.toLowerCase() === this._incidentPreviewVM.AboutIncidentIncidentTypeId.toLowerCase());
      if (!isNullOrUndefined(selectedIncidentType)) {
        (<Array<IncidentFormField>>JSON.parse(selectedIncidentType.IncidentCategory.Fields)).filter(x => x.KeyField).forEach(x => {
          this._aboutIncidentKeyFields.push(x.Name);
        });
      }
    }
    this._validateIncidentOnClick();
  }

  keyFieldsModalClosed() {
    return this._showKeyFieldsNotification = false;
  }
  keyFieldsOnConfirmation() {
    if (!StringHelper.isNullOrUndefinedOrEmpty(this._commentsFormGroup.controls['keyFieldsComment'].value)) {
      if (this._isApproveClicked) {
        this._canShowApproveButton = false;
      }
      this._showKeyFieldsNotification = false;
      this._incidentPreviewVM.Comments = this._commentsFormGroup.controls['keyFieldsComment'].value;
      this._cdRef.detectChanges();
      this._saveComments();
      this.saveIncidentToAtlasOnConfirmation();
    }
    else {
      this._showValidation = true;
    }
  }


  private _validateIncidentOnClick() {
    this._validationInProgress = true;
    this._incidentKeyFieldsValidationService.validateIncidentKeyFields(this._incidentPreviewVM, this._aboutIncidentKeyFields, this._invSections).then((res) => {
      this._validationInProgress = false;
      if (!res) {
        this._showKeyFieldsNotification = true;
        this._showValidation = false;
      }
      else {
        if (this._isApproveClicked) {
          this._canShowApproveButton = false;
          this._approve.emit(true);
          this.saveIncidentToAtlasOnConfirmation();
        }
        else {
          this.saveIncidentToAtlasOnConfirmation();
        }
      }
    });
  }

  private _saveComments() {
    if (!isNullOrUndefined(this._incidentDetails)) {
      if (StringHelper.isNullOrUndefinedOrEmpty(this._incidentDetails.Comments)) {
        this._incidentDetails.IsKeyFieldsNotificationRequired = true;
      }
      this._incidentDetails.Comments = this._commentsFormGroup.controls['keyFieldsComment'].value;
      this._incidentDetails.CompanyId = this._claimsHelper.getCompanyId();
      this._incidentDetails.IncidentReportedBy = null;
      this._incidentDetails.ModifiedBy = this._claimsHelper.getUserId();
      this._incidentDetails.ModifiedOn = new Date();
      this._incidentDetails.Modifier = null;
      this._incidentDetails.Author = null;
      if (this._isApproveClicked) {
        this._incidentDetails.ApprovedDate = new Date();
        this._incidentDetails.ApprovedBy = this._claimsHelper.getUserId();
        this._incidentDetails.StatusId = 2;
      }
      this._store.dispatch(new IncidentDetailsUpdateAction(this._incidentDetails));
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this._incidentInvSectionsSubscription) {
      this._incidentInvSectionsSubscription.unsubscribe();
    }
    if (this._incidentTypeSubscription) {
      this._incidentTypeSubscription.unsubscribe();
    }

    if (this._incidentDetailsToUpdateSubscription) {
      this._incidentDetailsToUpdateSubscription.unsubscribe();
    }
  }

  hasQuestions(section: InvSection) {
    return (isNullOrUndefined(section) || isNullOrUndefined(section.InvQuestions) || (section.InvQuestions.length === 0)) ? false : true;
  }

  isUploadFileQuestionType(question: InvQuestion) {
    return <AnswerType>question.AnswerType == AnswerType.UploadDocument;
  }

  getFileDownloadUrl(attachmentId: string) {
    return this._incidentPreviewVM.CompanyId ? appUrl + '/filedownload?documentId=' + attachmentId + '&cid=' + this._incidentPreviewVM.CompanyId : appUrl + '/filedownload?documentId=' + attachmentId;
  }

  downLoadFile(e: any, attachmentId: string) {
    window.open(this.getFileDownloadUrl(attachmentId));
  }

  getAnswer(question: InvQuestion) {
    let answer = question.Value;
    if (isNullOrUndefined(answer)) return '';
    let answerType = <AnswerType>question.AnswerType;
    switch (answerType) {
      case AnswerType.RadioButton:
      case AnswerType.DropDown:
        if (!isNullOrUndefined(question.Options))
          answer = this._extractAnswerFromOptions(question, answer);
        break;
      case AnswerType.Date:
        answer = this._localeDatePipe.transform(answer, this._defaultLocale, 'dd/MM/yyyy');
        break;
      case AnswerType.DateTime:
        answer = this._localeDatePipe.transform(answer, this._defaultLocale, 'dd/MM/yyyy') + ' ' + this._localeDatePipe.transform(answer, this._defaultLocale, 'jms');
        break;
      case AnswerType.CheckBox:
        if (!isNullOrUndefined(question.Options)) {
          answer = this._extractAnswerFromCheckboxOptions(question, answer);
        }
        break;
    }
    return answer;
  }

  public getAboutIncidentFieldsVisibility(fieldName) {
    let visible = this._aboutIncidentFields.findIndex(x => x == fieldName) !== -1;
    return visible;
  }

  // Public methods - end
}
