import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { IFormBuilderVM, IFormFieldWrapper, FormFieldType } from './../../../../shared/models/iform-builder-vm';
import { Subscription, BehaviorSubject } from 'rxjs/Rx';
import { isNullOrUndefined } from "util";
import { IncidentDetailsGetAction, IncidentDetailsUpdateAction, IncidentLoadApplicableSectionsAction, IncidentUpdateSections, ClearIncidentDetailsUpdateStatusAction } from './../../actions/incident-formal-investigation.actions';
import { Incident } from './../../models/incident.model';
import { IncidentFormalInvestigationForm, IncidentFormalInvestigationFormField, IncidentFormalInvestigationFormFieldModel, IncidentFormalInvestigationFormFieldWrapper } from './../../models/incident-formal-investigation.form';
import { FormGroup, Validators } from "@angular/forms";
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { InvSection } from "./../../models/incident-inv-section";
import { AnswerType, InvQuestion, AttachObjectType } from "./../../models/incident-inv-question";
import { InvAnswer } from "./../../models/incident-inv-answer";
import { ValidationType } from "./../../models/validation-type";
import { FileResult } from "./../../../../atlas-elements/common/models/file-result";
import { FileUploadService } from "./../../../../shared/services/file-upload.service";
import { Document } from './../../../../document/models/document';
import { IncidentLogService } from "./../../services/incident-log.service";
import { RouteParams } from "./../../../../shared/services/route-params";
import { AeAutoCompleteModel } from "./../../../../atlas-elements/common/models/ae-autocomplete-model";
import { environment } from './../../../../../environments/environment';
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { AeLoaderType } from "../../../../atlas-elements/common/ae-loader-type.enum";
@Component({
  selector: 'incident-formal-investigation',
  templateUrl: './incident-formal-investigation.component.html',
  styleUrls: ['./incident-formal-investigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IncidentFormalInvestigationComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private variables - start
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _incidentFormalInvestigationFormVM: IFormBuilderVM;
  private _incidentFormalInvestigationForm: FormGroup;
  private _context: any;
  private _routeParamsSubscription: Subscription;
  private _incidentIdSubscription: Subscription;
  private _incidentDetailsToUpdateSubscription: Subscription;
  private _submitEventSubscription: Subscription;
  private _incidentId: string;
  private _incidentDetails: Incident;
  private _invSectionsSubscription: Subscription;
  private _invSections: Array<InvSection>;
  private _fields: Array<IncidentFormalInvestigationFormFieldModel<any>>;
  private _isInvestigationRequired: boolean = false;
  private _questions: Array<InvQuestion>;
  private _formKeyFields: Array<string> = [];
  private _showNotification: boolean = false;;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _incidentUpdateStatusSubscription: Subscription;
  private _submitted: boolean = false;
  private _isFormalInvestigationRequiredChanged: boolean = true;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _initComplete: BehaviorSubject<boolean>;
  private _initCompleteSubscription: Subscription;
  private _initSectionsComplete: boolean = false;
  private _loadRiskAssessments: boolean = false;
  private _loadMethodStatements: boolean = false;
  // Private variables - end

  // Input properties - start
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }
  get showPopUp() {
    return this._showNotification;
  }

  get lightClass() {
    return this._lightClass;
  }
  get loaderType() {
    return this._loaderType;
  }
  // Input properties - end

  // constructor - start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _router: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _fileUpload: FileUploadService
    , private _incidentLogService: IncidentLogService
    , private _routeParams: RouteParams) {
    super(_localeService, _translationService, _cdRef);
    this._fields = new Array<IncidentFormalInvestigationFormFieldModel<any>>();
    this._formName = 'IncidentFormalInvestigationForm';
    this._initComplete = new BehaviorSubject<boolean>(false);
  }
  // constructor - end

  // Public methods - start  
  ngOnInit() {
    this._routeParamsSubscription = this._router.params.subscribe(params => {
      if (isNullOrUndefined(params['id'])) {
        this._incidentId = '';
      }
      else {
        this._incidentId = params['id'];
        this._store.dispatch(new IncidentDetailsGetAction(this._incidentId));
        this._store.dispatch(new IncidentLoadApplicableSectionsAction(this._incidentId));
      }
    });

    this._incidentIdSubscription = this._store.let(fromRoot.getIncidentId).subscribe(incidentId => {
      if (!isNullOrUndefined(incidentId)) {
        this._incidentId = incidentId;
        this._store.dispatch(new IncidentDetailsGetAction(this._incidentId));
        this._store.dispatch(new IncidentLoadApplicableSectionsAction(this._incidentId));
      }
    });

    this._incidentDetailsToUpdateSubscription = this._store.let(fromRoot.getIncidentDetails).subscribe(incidentDetails => {
      if (!isNullOrUndefined(incidentDetails)) {
        this._incidentDetails = incidentDetails;
        this._incidentLogService.setIncidentDetails(incidentDetails);
        this._isInvestigationRequired = this._incidentDetails.IsInvestigationRequired;
        this._initForm();
      }
    });
    this._invSectionsSubscription = this._store.let(fromRoot.getIncidentInvSections).subscribe((sections) => {
      if (!isNullOrUndefined(sections)) {
        this._invSections = sections;
        if (this._initComplete.getValue() && !this._initSectionsComplete) {
          this._initSectionsComplete = true;
          this._initForm();
        }
      }
    });
    this._submitEventSubscription = this._context.submitEvent.subscribe((value) => {
      if (value) {
        this._onFormalInvestigationFormSubmit();
      }
    });
    this._store.let(fromRoot.getRiskAssessments).takeUntil(this._destructor$).subscribe(val => {
      if (!isNullOrUndefined(val) && (this._loadRiskAssessments === true)) {
        this._incidentLogService.setRiskAssessments(val);
        this._bindAutoCompleteData();
      }
    });
    this._store.let(fromRoot.getMethodStatements).takeUntil(this._destructor$).subscribe(val => {
      if (!isNullOrUndefined(val) && (this._loadMethodStatements === true)) {
        this._incidentLogService.setMethodStatements(val);
        this._bindAutoCompleteData();
      }
    });
    this._incidentUpdateStatusSubscription = this._store.let(fromRoot.getIncidentUpdateStatus).subscribe(status => {
      if (status) {
        this._context.waitEvent.next(true);
        this._store.dispatch(new ClearIncidentDetailsUpdateStatusAction());
      }
    });
    this._initCompleteSubscription = this._initComplete.subscribe(val => {
      if (val === true && !this._initSectionsComplete && !isNullOrUndefined(this._invSections)) {
        this._initSectionsComplete = true;
        this._initForm();
      }
    });
  }

  ngOnDestroy() {
    if (this._routeParamsSubscription)
      this._routeParamsSubscription.unsubscribe();
    if (this._incidentIdSubscription)
      this._incidentIdSubscription.unsubscribe();
    if (this._incidentDetailsToUpdateSubscription)
      this._incidentDetailsToUpdateSubscription.unsubscribe();
    if (this._submitEventSubscription)
      this._submitEventSubscription.unsubscribe();
    if (this._invSectionsSubscription) {
      this._invSectionsSubscription.unsubscribe();
    }
    if (this._incidentUpdateStatusSubscription)
      this._incidentUpdateStatusSubscription.unsubscribe();
    if (this._initCompleteSubscription) {
      this._initCompleteSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }
  public get incidentFormalInvestigationFormVM() {
    return this._incidentFormalInvestigationFormVM;
  }

  public onFormInit(fg: FormGroup) {
    this._incidentFormalInvestigationForm = fg;
    this.onFormValidityChange(this._incidentFormalInvestigationForm.valid);
    this._bindIncidentFormalInvestigationForm();
    if (this._loadRiskAssessments === true) {
      this._incidentLogService.loadRiskAssessments();
    }
    if (this._loadMethodStatements === true) {
      this._incidentLogService.loadMethodStatements();
    }
    this._incidentFormalInvestigationForm.get('IsInvestigationRequired').valueChanges.subscribe(val => {
      if (val !== this._isInvestigationRequired) {
        this._isInvestigationRequired = val;
        this._initForm();
      }
    });

    this._formFields.forEach(formField => {
      if (this._isGroupField(formField)) {
        let sectionFields = this._getGroupedFields(formField);
        if (!isNullOrUndefined(sectionFields)) {
          sectionFields.forEach(field => {
            let sfield = <IncidentFormalInvestigationFormFieldWrapper<any>>field;
            if (field.field.type === FormFieldType.FileUpload) {
              let fileUploadContext = <EventEmitter<any>>sfield.context.getContextData().get('uploadedFileData');
              this._getFileUploadSubscription(fileUploadContext);
              let fileDownloadContext = <EventEmitter<any>>sfield.context.getContextData().get('downloadFileData');
              if (!isNullOrUndefined(fileDownloadContext)) {
                this._getDownloadFileSubscription(fileDownloadContext);
              }
            }

            if (field.field.type === FormFieldType.AutoComplete) {
              let anchorClickContext = <EventEmitter<any>>sfield.context.getContextData().get('onAnchorClick');
              let question = this._questions.find(q => q.Id === sfield.field.name);
              if (!isNullOrUndefined(anchorClickContext)) {
                anchorClickContext.subscribe(val => {
                  if (!isNullOrUndefined(question)) {
                    window.open(this._getNavigationUrl(question));
                  }
                });
              }
            }
          });
        }
      } else {
        let field = <IncidentFormalInvestigationFormField<any>>formField.field;
        if (field.type === FormFieldType.FileUpload) {
          let fileUploadContext = <EventEmitter<any>>formField.context.getContextData().get('uploadedFileData');
          this._getFileUploadSubscription(fileUploadContext);
          let fileDownloadContext = <EventEmitter<any>>formField.context.getContextData().get('downloadFileData');
          if (!isNullOrUndefined(fileDownloadContext)) {
            this._getDownloadFileSubscription(fileDownloadContext);
          }
        }
      }
    });

  }

  public onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  modalClosed() {
    this._context.clearEvent.next(true);
    return this._showNotification = false;
  }
  onConfirmation() {
    this._showNotification = false;
    this._saveFormalInvestigationData();
  }
  isFormalInvestigationRequiredChanged() {
    return this._isFormalInvestigationRequiredChanged;
  }

  // Public methods - end

  // Private methods - start
  private _isGroupField(field: any) {
    return !isNullOrUndefined(field.field.isGroup) && (field.field.isGroup === true);
  }
  private _getGroupedFields(field: any) {
    let fields;
    if (this._isGroupField(field)) {
      fields = (field.field).getFields();
    }
    return fields;
  }

  private _bindAutoCompleteData() {
    if (!isNullOrUndefined(this._incidentFormalInvestigationForm)) {
      this._formFields.forEach(formField => {
        if (this._isGroupField(formField)) {
          let sectionFields = this._getGroupedFields(formField);
          if (!isNullOrUndefined(sectionFields)) {
            sectionFields.forEach(field => {
              let sfield = <IncidentFormalInvestigationFormFieldWrapper<any>>field;
              let question = this._questions.find(q => q.Id === sfield.field.name);
              if (field.field.type === FormFieldType.AutoComplete) {
                let dataContext = <EventEmitter<any>>sfield.context.getContextData().get('items');
                let selectedDataContext = <EventEmitter<any>>sfield.context.getContextData().get('onSelectEvent');
                let displayValueContext = <EventEmitter<any>>sfield.context.getContextData().get('displayValue');
                if (!isNullOrUndefined(dataContext)) {
                  if (!isNullOrUndefined(question)) {
                    if (question.AttachObjectType === AttachObjectType.RiskAssessment) {
                      if (!isNullOrUndefined(this._incidentLogService.getRiskAssessments())) {
                        dataContext.next(this._incidentLogService.getRiskAssessments());
                        if (!StringHelper.isNullOrUndefinedOrEmpty(question.AttachedObjectId)) {
                          let selectedRiskAssessments = this._incidentLogService.getRiskAssessments().filter(m => m.Id === question.AttachedObjectId);
                          this._incidentFormalInvestigationForm.get(question.Id).setValue(selectedRiskAssessments);
                        }
                      }

                    } else {
                      if (!isNullOrUndefined(this._incidentLogService.getMethodStatements())) {
                        dataContext.next(this._incidentLogService.getMethodStatements());
                        if (!StringHelper.isNullOrUndefinedOrEmpty(question.AttachedObjectId)) {
                          let selectedMethodStatements = this._incidentLogService.getMethodStatements().filter(m => m.Id === question.AttachedObjectId);
                          this._incidentFormalInvestigationForm.get(question.Id).setValue(selectedMethodStatements);
                        }
                      }

                    }
                    if (!isNullOrUndefined(displayValueContext)) {
                      displayValueContext.next(question.AttachedObjectName);
                    }
                  }
                }
                if (!isNullOrUndefined(selectedDataContext)) {
                  selectedDataContext.subscribe((val) => {
                    if (!isNullOrUndefined(val)) {
                      let selectedValue = <AeAutoCompleteModel<any>>val[0];
                      this._updateAttachedObjectDetails(question.Id, selectedValue.Value, selectedValue.Text);
                      if (!isNullOrUndefined(displayValueContext)) {
                        displayValueContext.next(selectedValue.Text);
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
  }

  private _getNavigationUrl(question: InvQuestion) {
    let url: string = environment.appUrl;
    switch (question.AttachObjectType) {
      case AttachObjectType.RiskAssessment:
        url = url + '/' + 'risk-assessment';
        break;
      case AttachObjectType.ConstructionPhasePlan:
        url = url + '/' + '/construction-phase-plan/preview';
        break;
    }
    let updatedQuestion = this._getQuestion(question.InvSectionId, question.Id);
    if (!isNullOrUndefined(updatedQuestion)) {
      url = url + '/' + updatedQuestion.AttachedObjectId;
    }
    if (this._routeParams.Cid) {
      url = url + '?Cid=' + this._routeParams.Cid;
    }
    return url;
  }



  private _getFileUploadSubscription(fileUploadContext: EventEmitter<any>) {
    fileUploadContext.subscribe(fileUploadData => {
      if (!isNullOrUndefined(fileUploadData)) {
        let fieldname = fileUploadData['fieldName'];
        let selectedFile = <FileResult>fileUploadData['eventData'][0];
        if (!isNullOrUndefined(selectedFile)) {
          this._uploadFile(fieldname, selectedFile);
        }
      }
    });
  }

  private _getDownloadFileSubscription(fileDownloadContext: EventEmitter<any>) {
    fileDownloadContext.subscribe(qId => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(qId) && !isNullOrUndefined(this._invSections)) {
        let question: InvQuestion;
        this._invSections.forEach(section => {
          let index = section.InvQuestions.findIndex(q => q.Id === qId);
          if (index !== -1) {
            question = section.InvQuestions[index];
            return;
          }
        });
        if (!isNullOrUndefined(question) && !StringHelper.isNullOrUndefinedOrEmpty(question.AttachedObjectId)) {
          let url = this._routeParams.Cid ? `/filedownload?documentId=${question.AttachedObjectId}&cid=${this._routeParams.Cid}` : `/filedownload?documentId=${question.AttachedObjectId}`;
          window.open(url);
        }
      }
    });
  }

  private _uploadFile(fieldName: string, selectedFile: FileResult) {
    let document = new Document();
    let file = selectedFile.file;
    document.FileName = file.name;
    this._fileUpload.Upload(document, file).then((response: any) => {
      this._incidentFormalInvestigationForm.get(fieldName).setValue(response.FileName);
      this._incidentFormalInvestigationForm.markAsDirty();
      this._updateAttachedObjectDetails(fieldName, response.Id, response.FileName);
    });
  }

  private _getQuestion(sId: string, qId: string) {
    let sIndex = this._invSections.findIndex(s => s.Id === sId);
    if (sIndex !== -1) {
      return this._invSections[sIndex].InvQuestions.find(q => q.Id === qId);
    }
    return null;
  }
  private _updateAttachedObjectDetails(qId: string, objId, objName) {
    if (!isNullOrUndefined(this._questions) && !isNullOrUndefined(this._invSections)) {
      let qIndex = this._questions.findIndex(q => q.Id === qId);
      if (qIndex !== -1) {
        let sIndex = this._invSections.findIndex(s => s.Id === this._questions[qIndex].InvSectionId);
        let invqIndex = this._invSections[sIndex].InvQuestions.findIndex(q => q.Id === qId);
        if (sIndex !== -1) {
          this._invSections[sIndex].InvQuestions[invqIndex].AttachedObjectId = objId;
          this._invSections[sIndex].InvQuestions[invqIndex].AttachedObjectName = objName;
        }
      }
    }
  }

  private _bindIncidentFormalInvestigationForm() {
    this._incidentFormalInvestigationForm.patchValue({
      IsInvestigationRequired: this._isInvestigationRequired
    });
  }

  private _onFormalInvestigationFormSubmit() {
    if (!this._submitted) {
      this._submitted = true;
      if (!isNullOrUndefined(this._incidentDetails)) {
        let isInvestigationRequiredChanged = this._incidentDetails.IsInvestigationRequired !== this._isInvestigationRequired;
        if (!isNullOrUndefined(this._incidentFormalInvestigationForm) && this._incidentFormalInvestigationForm.valid && (!this._incidentFormalInvestigationForm.pristine || isInvestigationRequiredChanged)) {
          if (!this._validateFormKeyFields()) {
            this._saveFormalInvestigationData();
          }
          else {
            this._submitted = false;
          }
        }
        else {
          if (!this._validateFormKeyFields()) {
            this._context.waitEvent.next(true);
          }
          else {
            this._submitted = false;
          }
        }
        this._cdRef.markForCheck();
      }
    }
  }

  private _validateFormKeyFields() {
    this._formKeyFields = [];
    this._formFields.forEach(formField => {
      let sectionFields = this._getGroupedFields(formField);
      if (!isNullOrUndefined(sectionFields)) {
        sectionFields.filter(field => field.context.getContextData().get('required')).forEach(x => {
          this._formKeyFields.push(x.field.name);
        });
      }
    });

    for (var item of this._formKeyFields) {
      if (isNullOrUndefined(this._incidentFormalInvestigationForm.get(item).value) || this._incidentFormalInvestigationForm.get(item).value == "") {
        this._showNotification = true;
      }
    }
    return this._showNotification;
  }

  private _saveFormalInvestigationData() {
    var _incidentDetailsToUpdate = this._incidentFormalInvestigationForm.value;
    //APB-19576 - Email should be sent only when riddor is set to yes not investigation is set to yes
    // if (_incidentDetailsToUpdate.IsInvestigationRequired) {
    //   this._incidentDetails.IsNotificationRequired = this._incidentDetails.IsInvestigationRequired ? false : true;
    // }
    // else {
    //   this._incidentDetails.IsNotificationRequired = false;
    // }

    this._incidentDetails.IsInvestigationRequired = _incidentDetailsToUpdate.IsInvestigationRequired
    this._incidentDetails.CompanyId = this._claimsHelper.getCompanyId();
    this._incidentDetails.IncidentReportedBy = null;
    this._incidentDetails.ModifiedBy = this._claimsHelper.getUserId();
    this._incidentDetails.ModifiedOn = new Date();
    this._incidentDetails.Modifier = null;
    this._incidentDetails.Author = null;
    this._store.dispatch(new IncidentDetailsUpdateAction(this._incidentDetails));
    if (!isNullOrUndefined(this._invSections)) {
      let answers = new Array<InvAnswer>();
      this._invSections.forEach(section => {
        let sectionId = section.Id;
        section.InvQuestions.forEach(question => {
          answers.push(this._prepareAnswer(question, sectionId, _incidentDetailsToUpdate));
        });
      });
      if (answers.length > 0) {
        this._store.dispatch(new IncidentUpdateSections({ data: answers, incidentId: this._incidentDetails.Id }));
      }
    }
  }


  private _prepareAnswer(question: InvQuestion, sectionId: string, _incidentDetailsToUpdate: any) {
    let answer = new InvAnswer();
    answer.CreatedOn = question.InvAnswerCreatedOn ? question.InvAnswerCreatedOn : new Date();
    answer.CreatedBy = question.CreatedBy;
    answer.ModifiedOn = new Date();
    answer.Id = question.InvAnswerId;
    answer.CompanyId = this._incidentDetails.CompanyId;
    answer.Incident = new Incident();
    answer.Incident.Id = this._incidentDetails.Id;
    answer.Incident.IsInvestigationRequired = this._incidentDetails.IsInvestigationRequired;
    answer.IncidentId = this._incidentDetails.Id;
    answer.InvSectionId = sectionId;
    answer.InvQuestionId = question.Id;
    answer.Value = _incidentDetailsToUpdate[question.Id];
    answer.AttachedObjectId = question.AttachedObjectId;
    answer.AttachedObjectTypeCode = question.AttachedObjectTypeCode;
    answer.AttachedObjectName = question.AttachedObjectName;
    if (question.AnswerType === AnswerType.HyperLink) {
      answer.Value = question.AttachedObjectName;
    }
    return answer;
  }

  private _getFormFieldType(question: InvQuestion): FormFieldType {
    let fieldType = <number>question.AnswerType;
    let hasOPtions = !isNullOrUndefined(question.Options) && (question.Options.length > 0);
    switch (fieldType) {
      case 1:
        if (hasOPtions)
          return FormFieldType.RadioGroup;
        return FormFieldType.Radio;
      case 2:
        return FormFieldType.InputString;
      case 3:
        return FormFieldType.Select;
      case 4:
        return FormFieldType.InputNumber;
      case 5:
        return FormFieldType.Date;
      case 6:
        return FormFieldType.DateWithTime;
      case 7:
        if (hasOPtions)
          return FormFieldType.CheckBoxGroup;
        return FormFieldType.CheckBox;
      case 10:
        return FormFieldType.TextArea;
      case 11:
        switch (question.AttachObjectType) {
          case AttachObjectType.RiskAssessment:
            this._loadRiskAssessments = true;
            break;
          case AttachObjectType.ConstructionPhasePlan:
            this._loadMethodStatements = true;
            break;
        }

        return FormFieldType.AutoComplete;
      case 12:
        return FormFieldType.FileUpload;
      default:
        return FormFieldType.InputString;
    }
  }


  private _getIncidentCategoryFields() {
    if (!isNullOrUndefined(this._invSections)) {
      this._fields = new Array<IncidentFormalInvestigationFormFieldModel<any>>();
      this._questions = new Array<InvQuestion>();
      this._invSections.forEach(section => {
        section.InvQuestions.forEach((question) => {
          if (!question.IsDeleted) {
            let field = new IncidentFormalInvestigationFormFieldModel<any>(
              question.Id
              , this._getFormFieldType(question)
              , question.Question
              , this._getValue(question)
              , question.Validations
              , section.SectionName
              , question.Options
            );
            this._fields.push(field);
            this._questions.push(question);
          }
        });
      });
    }
  }

  private _getValue(question: InvQuestion) {
    if (StringHelper.isNullOrUndefinedOrEmpty(question.Value)
      && (question.AnswerType === AnswerType.CheckBox
        || question.AnswerType === AnswerType.RadioButton
        || question.AnswerType === AnswerType.DropDown)) {
      if (!isNullOrUndefined(question.Options) && question.Options.length > 0) {
        let defaultValue = question.Options.find(o => o.IsDefault);
        if (!isNullOrUndefined(defaultValue)) {
          if (question.AnswerType === AnswerType.CheckBox) {
            return defaultValue.OrderIndex.toString();
          }
          return defaultValue.Id;
        }
      }
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(question.Value)
      && (question.AnswerType === AnswerType.Date || question.AnswerType === AnswerType.DateTime)) {
      return new Date(question.Value);
    }
    return question.Value;
  }


  private _initForm() {
    this._isFormalInvestigationRequiredChanged = true;
    this._getIncidentCategoryFields();
    let showSections = this._isInvestigationRequired && !isNullOrUndefined(this._fields);
    this._incidentFormalInvestigationFormVM = new IncidentFormalInvestigationForm(this._formName, showSections ? this._fields : []);
    this._formFields = this._incidentFormalInvestigationFormVM.init();
    this._cdRef.markForCheck();
    setTimeout(() => {
      this._isFormalInvestigationRequiredChanged = false;
      this._cdRef.markForCheck();
      if (!this._initSectionsComplete)
        this._initComplete.next(true);
    }, 500);
  }

  // Private methods - end

}
