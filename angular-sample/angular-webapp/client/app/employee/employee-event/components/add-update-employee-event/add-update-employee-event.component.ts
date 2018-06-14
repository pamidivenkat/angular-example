import { RouteParams } from './../../../../shared/services/route-params';
import { FileResult } from './../../../../atlas-elements/common/models/file-result';
import { EmployeeEvent, EventAttachment } from './../../../employee-timeline/models/emloyee-event';
import { EnumHelper } from './../../../../shared/helpers/enum-helper';
import { EventTypeCode } from '../../../employee-timeline/models/event-type-code';
import { AppealOutcome } from '../../../employee-timeline/models/appeal-outcome';
import { AtlasApiResponse } from './../../../../shared/models/atlas-api-response';
import { URLSearchParams } from '@angular/http';
import { debug, isNull, isNullOrUndefined } from 'util';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject, Subject, Subscription, Observable } from 'rxjs/Rx';
import { IFormBuilderVM, IFormFieldWrapper, FormFieldType } from './../../../../shared/models/iform-builder-vm';
import { DependsUIField, EventForm, UIField } from '../../../employee-timeline/models/event-form';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from './../../../../shared/base-component';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { RestClientService } from './../../../../shared/data/rest-client.service';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { EventType, Sensitivity, ReviewType, EmployeeLeavingSubReason } from './../../../models/timeline';
import {
  AfterContentInit,
  AfterViewInit,
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
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import {
  EmployeeTimelineEventDisciplinaryOutcome,
  EmployeeTimelineEventOutcome,
  EmployeeTimelineLoadReasonsForLeaving,
  EmployeeTimelineLoadSubReasons
} from './../../../../shared/actions/lookup.actions';
import {
  extractDisciplinaryOutcomeSelectItems,
  extractOutcomeSelectItems,
  getTimelineViewTypeOptionsForAdvance,
  getTimelineViewTypeOptionsForBasic,
  getTimelineViewTypeOptionsForSensitive
} from './../../../common/extract-helpers';
import { ObjectHelper } from './../../../../shared/helpers/object-helper';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import * as fromConstants from './../../../../shared/app.constants';
import { AeInputType } from "./../../../../atlas-elements/common/ae-input-type.enum";
import { DateTimeHelper } from "./../../../../shared/helpers/datetime-helper";
@Component({
  selector: 'add-update-employee-event',
  templateUrl: './add-update-employee-event.component.html',
  styleUrls: ['./add-update-employee-event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AddUpdateEmployeeEventComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  private _action: string;
  private _eventType: EventType;
  private _employeeEventForm: EventForm;
  private _appealOutcome$: BehaviorSubject<any>;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _formGroup: FormGroup;
  private _sensitivityOptions: Immutable.List<AeSelectItem<number>>;
  private _disciplinaryOutcome: Subscription;
  private _disciplinaryOutcomeOptions$: BehaviorSubject<any>;
  private _outcome: Subscription;
  private _outcomeOptions$: BehaviorSubject<any>;
  private _reviewTypeOptions$: BehaviorSubject<Immutable.List<any>>;
  private _today: Date;
  private _commonForm: FormGroup;
  private _formTitle: string;
  private _isSensitivityDisabled: boolean;
  private _selectedFile: FileResult;
  private _showDescriptionAndNotes: boolean;

  private _employeeId: string;
  private _employeeIdToFetch$: Observable<string>;
  private _routeParamsSubscription: Subscription;

  private _employeeEvent: EmployeeEvent;
  private _employeeEventSubscription$: Subscription;
  private _canSeeSensitive: boolean;
  private _canSeeAdvance: boolean;
  private _canManageDeptEmployees: boolean;


  private _reasons$: BehaviorSubject<any>;
  private _subReasons$: BehaviorSubject<any>;
  private _reasonsSubscription: Subscription;
  private _subReasonsSubscription: Subscription;
  private _subReasons: Array<EmployeeLeavingSubReason>;

  private _ctrlType: AeInputType = AeInputType.number;
  private _showReminderInDaysField: boolean;
  private _showErrorMessage: boolean;
  private _errorMessage: string;
  private _isReminderInDaysChecked: boolean;
  private _subscriptionsArray: Subscription[] = [];

  @Input('Action')
  get Action() {
    return this._action;
  }
  set Action(val: string) {
    this._action = val;
  }

  @Input('EventType')
  get EventType() {
    return this._eventType;
  }
  set EventType(val: EventType) {
    this._eventType = val;
  }


  @Output('onSubmit') _onFormSubmitted: EventEmitter<EmployeeEvent> = new EventEmitter<EmployeeEvent>();
  @Output('onCancel') _onFormCancelled: EventEmitter<string> = new EventEmitter<any>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _data: RestClientService
    , private _fb: FormBuilder
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._today = new Date();
    this._canSeeSensitive = this._claimsHelper.canManageEmployeeSensitiveDetails();
    this._canSeeAdvance = this._claimsHelper.CanManageEmployeeAdvanceeDetails();
    this._canManageDeptEmployees = this._claimsHelper.canManageDeptEmps();
  }

  get employeeEventForm(): EventForm {
    return this._employeeEventForm;
  }
  get commonForm(): FormGroup {
    return this._commonForm;
  }
  get isReminderInDaysChecked(): boolean {
    return this._isReminderInDaysChecked;
  }
  get showReminderInDaysField(): boolean {
    return this._showReminderInDaysField;
  }
  get ctrlType(): AeInputType {
    return this._ctrlType;
  }
  get showErrorMessage(): boolean {
    return this._showErrorMessage;
  }
  get errorMessage(): string {
    return this._errorMessage;
  }
  get employeeEvent(): EmployeeEvent {
    return this._employeeEvent;
  }
  get sensitivityOptions(): Immutable.List<AeSelectItem<number>> {
    return this._sensitivityOptions;
  }
  get showDescriptionAndNotes(): boolean {
    return this._showDescriptionAndNotes;
  }
  onFormSubmit($event: any) {
    if (this.showReminderDaysSwitch) {
      this._checkNoOfDays();
    }

    if (this._commonForm.valid && !this._showErrorMessage) {
      if (!isNullOrUndefined($event) &&
        !isNullOrUndefined($event.TerminationDate)) {
        // To get termination date w.r.t to local timezone
        let tzoffset = (new Date()).getTimezoneOffset() * 60000;
        let localISOTime = (new Date($event.TerminationDate - tzoffset)).toISOString().slice(0, -1);
        $event.TerminationDate = localISOTime;
      }
      if (this._action === 'Add') {
        let event: EmployeeEvent = new EmployeeEvent();
        event.EventData = JSON.stringify($event);
        event.EventTypeId = this._eventType.Id;
        event.Sensitivity = <Sensitivity>this._commonForm.get('Sensitivity').value;
        event.Attachment = this._getAttachment();
        this._onFormSubmitted.emit(event);
      }
      else {
        this._employeeEvent.EventData = JSON.stringify($event);
        this._employeeEvent.Attachment = this._getAttachment();
        this._employeeEvent.Sensitivity = <Sensitivity>this._commonForm.get('Sensitivity').value;
        this._onFormSubmitted.emit(this._employeeEvent);
      }
    }

  }

  private _getAttachment(): EventAttachment {
    let attachment: EventAttachment;
    if (!isNullOrUndefined(this._selectedFile) || this.hasDocuments()) {
      let isReminderRequired: boolean;
      let expiryDate: string;
      let reminderInDays: number;
      if (!isNullOrUndefined(this._commonForm.get('IsReminderRequired'))) {
        isReminderRequired = <boolean>this._commonForm.get('IsReminderRequired').value;
        if (isReminderRequired) {
          expiryDate = this._formGroup.get(this._getReminderDaysDependsField(this._eventType.Code)).value;
          reminderInDays = this._commonForm.get('ReminderInDays').value;
        }
      }
      if (!isNullOrUndefined(this._selectedFile)) {
        attachment = new EventAttachment(this._selectedFile, this._commonForm.get('Description').value, this._commonForm.get('Comment').value, isReminderRequired ? expiryDate : null, isReminderRequired ? reminderInDays : null);
      }
      else {
        if (this.hasDocuments()) {
          let documents = this._employeeEvent.Documents;
          if (!isNullOrUndefined(documents) && documents.length > 0) {
            let document = documents[0];
            if (expiryDate !== document.ExpiryDate || reminderInDays !== document.ReminderInDays) {
              attachment = new EventAttachment(null, null, null, isReminderRequired ? expiryDate : null, isReminderRequired ? reminderInDays : null);
            }
          }

        }
      }

    }
    return attachment;
  }


  onFormCancel($event: any) {
    this._onFormCancelled.emit('cancel');
  }

  onFormInit(fg: FormGroup) {
    this._formGroup = fg;
    if (!isNullOrUndefined(this._employeeEventForm.getFormTemplate())) {
      this._employeeEventForm.getFormTemplate().forEach((field: UIField) => {
        if (!isNullOrUndefined(field.depends)) {
          for (let key in field.depends) {
            let dependsUIField = field.depends[key][0];
            let initialValue = this._formGroup.controls[dependsUIField.field].value;
            if (!isNullOrUndefined(dependsUIField)) {
              if (key === 'disableField') {
                let sub = this._formGroup.get(dependsUIField.field).valueChanges.subscribe((newVal) => {
                  this._toggleDisability(newVal, field);
                });
                this._subscriptionsArray.push(sub);
                //first we need to call disability before subscribe to fire function initially..               
                this._toggleDisability(initialValue, field);
              }
              if (key === 'visibility') {
                let sub = this._formGroup.get(dependsUIField.field).valueChanges.subscribe((newVal) => {
                  this._toggleVisibility(newVal, field);
                });
                this._subscriptionsArray.push(sub);
                this._toggleVisibility(initialValue, field);
              }
            }

          }
        }

      });

    }


    if (this._action === 'Add') {
      this._setValue('AddedBy', this._claimsHelper.getUserFullName());

      if (this._eventType.Code === EventTypeCode.General || this._eventType.Code === EventTypeCode.Note) {
        this._setValue('ActionDate', this._today);

      }
      if (this._eventType.Code === EventTypeCode.Performance) {
        this._setValue('ReviewHeld', this._today);
        this._setValue('ReviewType', null);
      }
      if (this._eventType.Code === EventTypeCode.Disciplinary) {
        this._setValue('InvestigationDate', this._today);
      }

      if (this._eventType.Code === EventTypeCode.Grievance) {
        this._setValue('GrievanceRaised', this._today);
        this._setValue('GrievanceMeeting', this._today);
        this._setValue('ReviewHeld', this._today);
      }
      if (this.EventType.Code === EventTypeCode.DBS) {
        this._toggleRequiredValidation('CertificateReceivedDate', false);
        this._toggleRequiredValidation('ConfidentialitySignedDate', false);
        this._toggleRequiredValidation('InterviewHeldDate', false);
        this._setValue('ActionDate', this._today);
      }
    } else {
      this._employeeEventSubscription$ = this._store.let(fromRoot.getSelectedEmployeeEvent).skipWhile(val => isNullOrUndefined(val)).subscribe((event: EmployeeEvent) => {
        if (!isNullOrUndefined(event)) {
          this._employeeEvent = event;
          if (!isNullOrUndefined(this._commonForm.get('Sensitivity'))) {
            this._commonForm.get('Sensitivity').setValue(event.Sensitivity);
          }
          let documents = this._employeeEvent.Documents;
          let _dataFields = <Array<UIField>>(JSON.parse(this._eventType.UITemplate));
          let data = JSON.parse(this._employeeEvent.EventData);
          _dataFields.forEach(field => {
            let fieldName = field.name;
            let value = data[fieldName];
            if (!isNullOrUndefined(this._formGroup.get(fieldName)) && value && !StringHelper.isNullOrUndefinedOrEmpty(String(value))) {
              if (field.displayType === FormFieldType.Date)
                value = new Date(value);
              this._setValue(fieldName, value);
            }
          });
          this._toggleReminderInDays(documents);
        }
      });
    }

    if (this._eventType.Code === EventTypeCode.General) {
      //below is in case of General event
      let nextActionDateField = this._formGroup.get('NextActionDate');
      if (!isNullOrUndefined(nextActionDateField)) {
        let nextActionDateSub = nextActionDateField.valueChanges.subscribe((value: string) => {
          if (!isNullOrUndefined(this._commonForm.get('IsReminderRequired')) && this._commonForm.get('IsReminderRequired').value) {
            this._checkNoOfDays();
          }
        })
        this._subscriptionsArray.push(nextActionDateSub);
      }
    }
    else if (this._eventType.Code === EventTypeCode.Grievance) {
      //below is in case of Grievance event
      let dateOfOutComeField = this._formGroup.get('DateofOutcome');
      if (!isNullOrUndefined(dateOfOutComeField)) {
        let nextActionDateSub = dateOfOutComeField.valueChanges.subscribe((value: string) => {
          if (!isNullOrUndefined(this._commonForm.get('IsReminderRequired')) && this._commonForm.get('IsReminderRequired').value) {
            this._checkNoOfDays();
          }
        })
        this._subscriptionsArray.push(nextActionDateSub);
      }
    }
    else if (this._eventType.Code === EventTypeCode.Performance) {
      //below is in case of Performance event
      let performanceField = this._formGroup.get('NextReviewDate');
      if (!isNullOrUndefined(performanceField)) {
        let nextActionDateSub = performanceField.valueChanges.subscribe((value: string) => {
          if (!isNullOrUndefined(this._commonForm.get('IsReminderRequired')) && this._commonForm.get('IsReminderRequired').value) {
            this._checkNoOfDays();
          }
        })
        this._subscriptionsArray.push(nextActionDateSub);
      }
    }

  }

  private _toggleReminderInDays(documents) {
    if (this._eventType.Code === EventTypeCode.General
      || this._eventType.Code === EventTypeCode.Performance
      || this._eventType.Code === EventTypeCode.Grievance
    ) {
      if (!isNullOrUndefined(documents) && (documents.length > 0)) {
        let document = documents[0];
        if (!isNullOrUndefined(document.ReminderInDays)) {
          this._commonForm.get('ReminderInDays').setValue(document.ReminderInDays);
          this._commonForm.get('IsReminderRequired').setValue(true);
          this._isReminderInDaysChecked = true;
        }
      }
    }
  }

  private _setValue(fieldName: string, value: any) {
    let field = this._formGroup.get(fieldName);
    if (!isNullOrUndefined(field)) {
      this._formGroup.get(fieldName).setValue(value);
    }
  }
  private _toggleRequiredValidation(fieldName: string, required: boolean) {
    let field = this._formGroup.get(fieldName);
    if (!isNullOrUndefined(field)) {
      if (required) {
        field.setValidators(Validators.required);
      } else {
        field.clearValidators();
      }
      field.updateValueAndValidity();
    }
  }
  private _getDefaultSensitivityValue() {
    if (this._canSeeSensitive)
      return Sensitivity.Sensitive;
    if (this._canSeeAdvance || this._canManageDeptEmployees)
      return Sensitivity.Advance;
    return Sensitivity.Basic;
  }

  private _initCommonForm() {
    this._isSensitivityDisabled = (
      (this._eventType.Code === EventTypeCode.Disciplinary
        || this._eventType.Code === EventTypeCode.General
        || this._eventType.Code === EventTypeCode.Note
        || this._eventType.Code === EventTypeCode.Performance)
      && (!this._canSeeSensitive)
    ) ? true : false;
    this._commonForm = this._fb.group({
      Sensitivity: [{ value: this._getDefaultSensitivityValue(), disabled: this._isSensitivityDisabled }, [Validators.required]],
      Description: [{ value: '', disabled: false }, []],
      Comment: [{ value: '', disabled: false }, []],
      IsReminderRequired: [{ value: '', disabled: false }, []],
      ReminderInDays: [{ value: '', disabled: false }, []]
    });
  }

  private _fetchDropdownData() {
    this._employeeEventForm = new EventForm('eventForm', this._eventType.UITemplate);
    this._fields = this._employeeEventForm.init();
    if (this._eventType.Code === EventTypeCode.Disciplinary || this._eventType.Code === EventTypeCode.Grievance) {
      let appealOutcomeField = this._fields.find(field => field.field.name === 'AppealOutcome');
      if (!isNullOrUndefined(appealOutcomeField)) {
        this._appealOutcome$ = appealOutcomeField.context.getContextData().get('options');
      }

      if (this._eventType.Code === EventTypeCode.Disciplinary) {
        let disciplinaryOutcomeField = this._fields.find(field => field.field.name === 'DisciplinaryOutcome');
        if (!isNullOrUndefined(disciplinaryOutcomeField)) {
          this._disciplinaryOutcomeOptions$ = disciplinaryOutcomeField.context.getContextData().get('options');
        }

        let outcomeField = this._fields.find(field => field.field.name === 'Outcome');
        if (!isNullOrUndefined(outcomeField)) {
          this._outcomeOptions$ = outcomeField.context.getContextData().get('options');
        }
      }

      if (this._eventType.Code === EventTypeCode.Grievance) {
        let grievanceOutcomeField = this._fields.find(field => field.field.name === 'GrievanceOutcome');
        if (!isNullOrUndefined(grievanceOutcomeField)) {
          this._disciplinaryOutcomeOptions$ = grievanceOutcomeField.context.getContextData().get('options');
        }
      }

    }
    if (this._eventType.Code === EventTypeCode.Performance) {
      let reviewTypeField = this._fields.find(field => field.field.name === 'ReviewType');
      if (!isNullOrUndefined(reviewTypeField)) {
        this._reviewTypeOptions$ = reviewTypeField.context.getContextData().get('options');
      }
    }

    if (this._eventType.Code === EventTypeCode.Leaver) {
      let reasonForLeavingField = this._fields.find(field => field.field.name === 'ReasonForLeaving');
      if (!isNullOrUndefined(reasonForLeavingField)) {
        this._reasons$ = reasonForLeavingField.context.getContextData().get('options');
      }
      let subReasonField = this._fields.find(field => field.field.name === 'SubReason');
      if (!isNullOrUndefined(subReasonField)) {
        this._subReasons$ = subReasonField.context.getContextData().get('options');
      }
    }

  }

  private _fillDropdownData() {
    if (this._eventType.Code === EventTypeCode.Disciplinary || this._eventType.Code === EventTypeCode.Grievance) {
      this._store.dispatch(new EmployeeTimelineEventDisciplinaryOutcome(true));
      this._disciplinaryOutcome = this._store.let(fromRoot.getEmployeeTimelineEventDisciplinayOutcomeList).subscribe((disOutcomes) => {

        if (!isNullOrUndefined(disOutcomes)) {
          if (!isNullOrUndefined(this._disciplinaryOutcomeOptions$)) {
            let disOutcomeOptions = disOutcomes.filter((disOutcome) => {
              return disOutcome.Code == ((this._eventType.Code === EventTypeCode.Grievance) ? 3 : 1);
            });
            this._disciplinaryOutcomeOptions$.next(Immutable.List(extractDisciplinaryOutcomeSelectItems(disOutcomeOptions)));
          }

          if (!isNullOrUndefined(this._appealOutcome$)) {
            let appealOutcomeOptions = disOutcomes.filter((disOutcome) => {
              return disOutcome.Code == 2;
            });
            this._appealOutcome$.next(Immutable.List<AeSelectItem<string>>(extractDisciplinaryOutcomeSelectItems(appealOutcomeOptions)));
          }
        }
      });

      if (this._eventType.Code === EventTypeCode.Disciplinary) {
        this._store.dispatch(new EmployeeTimelineEventOutcome(true));
        this._disciplinaryOutcome = this._store.let(fromRoot.getEmployeeTimelineEventOutcomeList).subscribe((Outcomes) => {
          if (!isNullOrUndefined(Outcomes) && !isNullOrUndefined(this._outcomeOptions$)) {
            this._outcomeOptions$.next(Immutable.List(extractOutcomeSelectItems(Outcomes)));
          }
        });
      }

    }

    if (this._eventType.Code === EventTypeCode.Performance) {
      if (!isNullOrUndefined(this._reviewTypeOptions$)) {
        let reviewTypeOptions = Immutable.List<any>(EnumHelper.getNamesAndValues(ReviewType).map((enumItem) => {
          let item: AeSelectItem<number> = new AeSelectItem<number>();
          switch (enumItem.value) {
            case ReviewType.PerformanceReview:
              item.Text = 'Performance review';
              break;
            case ReviewType.PerformanceConcerns:
              item.Text = 'Performance concerns';
              break;
          }
          item.Value = enumItem.value;
          return item;
        }));
        this._reviewTypeOptions$.next(reviewTypeOptions);
      }
    }

    if (this._eventType.Code === EventTypeCode.Leaver) {
      this._store.dispatch(new EmployeeTimelineLoadReasonsForLeaving(true));
      this._reasonsSubscription = this._store.let(fromRoot.getEmployeeReasonForLeaving).subscribe((reasons) => {
        if (!isNullOrUndefined(reasons)) {
          this._reasons$.next(Immutable.List(ObjectHelper.extractLeavingReasonsSelectItems(reasons)));
        }
      });

      this._store.dispatch(new EmployeeTimelineLoadSubReasons(true));
      this._subReasonsSubscription = this._store.let(fromRoot.getEmployeeSubReasons).subscribe((subReasons) => {
        if (!isNullOrUndefined(subReasons)) {
          this._subReasons = subReasons;
        }
      });
    }

  }

  getFooterButtonText() {
    let btnText = 'Add';
    if (!StringHelper.isNullOrUndefinedOrEmpty(this._action)) {
      btnText = this._action;
    }
    return { Submit: btnText, Cancel: 'Cancel' };
  }

  private _setSensitivityOptions() {
    if (this._canSeeSensitive) {
      this._sensitivityOptions = getTimelineViewTypeOptionsForSensitive(Sensitivity).filter(Sensitivity => Sensitivity.Text !== "Basic").toList();
    }
    else if (this._canSeeAdvance || this._canManageDeptEmployees) {
      this._sensitivityOptions = getTimelineViewTypeOptionsForAdvance(Sensitivity).filter(Sensitivity => Sensitivity.Text !== "Basic").toList();
    }
    else {
      this._sensitivityOptions = getTimelineViewTypeOptionsForBasic(Sensitivity).filter(Sensitivity => Sensitivity.Text !== "Basic").toList();
    }
    //after assigning the options, if we have only one option then we no need to enable the dropdown box..
    if (this._sensitivityOptions && this._sensitivityOptions.count() == 1) {
      let sensitiveControl = this._commonForm.get('Sensitivity');
      if (!isNullOrUndefined(sensitiveControl)) {
        sensitiveControl.disable({ onlySelf: true, emitEvent: false });
      }
    }

  }

  onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      this._showDescriptionAndNotes = true;
    }
  }

  getTitle(): string {
    if (!isNullOrUndefined(this._action)) {
      return ((this._action === 'Add' ? 'Add' : 'Update') + ' ' + 'employee event details -' + ' ' + this._eventType.Title);
    }
    return '';
  }

  private _init() {
    this._initCommonForm();
    this._fetchDropdownData();
    this._employeeIdToFetch$ = this._store.let(fromRoot.getEmployeeId);
    this._routeParamsSubscription = this._employeeIdToFetch$.subscribe((val) => {
      this._employeeId = val;
    });
    this._setSensitivityOptions();
  }

  canSeeSensitivityText(): boolean {
    return this._canSeeSensitive === true;
  }
  canSeeAdvanceText(): boolean {
    return this._canSeeAdvance === true || this._canManageDeptEmployees === true;
  }

  hasDocuments(): boolean {
    return (!isNullOrUndefined(this._employeeEvent) && (this._employeeEvent.Documents.length > 0));
  }
  downloadDocument(docId: string) {
    window.open(this._getDownloadUrl(docId));
  }
  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${docId}`;
  }

  fieldHasRequiredError(fieldName: string): boolean {
    return this._commonForm.get(fieldName).hasError('required');
  }

  private _toggleVisibility(val: any, field: UIField) {
    let contextPropertyValue = <BehaviorSubject<any>>this._fields.filter(f => f.field.name === field.name)[0].context.getContextData().get('propertyValue');
    if (!isNullOrUndefined(contextPropertyValue)) {
      this._setValue(field.name, (field.displayType === FormFieldType.Select) ? '' : null);
      let dependsUIField = field.depends['visibility'][0];
      if (!isNullOrUndefined(dependsUIField)) {
        let visibility = false;
        let props = dependsUIField['props'];
        if (props.length > 1) {
          let condition = dependsUIField['condition'];
          if (!StringHelper.isNullOrUndefinedOrEmpty(condition)) {
            for (let prop of props) {
              let equality = prop['equality'];
              let propVal = prop['propVal'];
              visibility = this._evaluateMultipleConditions(visibility, condition, this._checkVisibility(equality, val, propVal))
            }
          }
          contextPropertyValue.next(visibility);
        } else {
          let prop = props[0];
          if (!isNullOrUndefined(prop)) {
            let equality = prop['equality'];
            let propVal = prop['propVal'];
            visibility = this._checkVisibility(equality, val, propVal);
          }
        }
        contextPropertyValue.next(visibility);
        if (visibility === true && (field.displayType === FormFieldType.Select)) {
          this._loadDropdowns(field.name, val);
        }
      }
    }
  }

  private _toggleDisability(val: any, field: UIField) {
    if (!isNullOrUndefined(this._formGroup.get(field.name))) {
      let isEnabled = <boolean>val;
      let contextPropertyValue = <BehaviorSubject<boolean>>this._fields.filter(f => f.field.name === field.name)[0].context.getContextData().get('disableFieldValue');
      if (!isNullOrUndefined(contextPropertyValue)) {
        contextPropertyValue.next(!isEnabled);
        this._setValue(this._fields.filter(f => f.field.name === field.name)[0].field.name, null);
      }
      this._toggleRequiredValidation(field.name, isEnabled);
    }
  }

  private _checkVisibility(equality: string, val: any, propertyValue: any) {
    switch (equality) {
      case 'eq':
        return (val === propertyValue);
    }
    return false;
  }

  private _evaluateMultipleConditions(val: boolean, operation: string, newVal: boolean): boolean {
    switch (operation) {
      case 'or':
        return val || newVal;
      case 'and':
        return val && newVal
    }
    return val;
  }

  private _loadDropdowns(fieldName: string, val: any) {
    if (fieldName === 'SubReason') {
      this._extractSubReasons(<string>val);
    }
  }
  private _extractSubReasons(leavingReasonId: string) {
    let subReasons: Array<EmployeeLeavingSubReason> = [];
    if (!isNullOrUndefined(this._subReasons)) {
      subReasons = this._subReasons.filter(m => m.LeavingReasonId === leavingReasonId);
    }
    this._subReasons$.next(Immutable.List(ObjectHelper.extractSubReasonsSelectItems(subReasons)));
  }

  showReminderDaysSwitch(): boolean {
    if (!isNullOrUndefined(this._eventType) && !isNullOrUndefined(this._formGroup)) {
      if (this._eventType.Code === EventTypeCode.General
        || this._eventType.Code === EventTypeCode.Performance
        || this._eventType.Code === EventTypeCode.Grievance) {
        let field = this._formGroup.get(this._getReminderDaysDependsField(this._eventType.Code));
        if (isNullOrUndefined(field)) return false;
        let fieldValue = field.value;
        if (isNullOrUndefined(fieldValue)) return false;
        return !StringHelper.isNullOrUndefinedOrEmpty(String(fieldValue));
      }
    }

    return false;
  }
  disableReminderDaysSwitch(): boolean {
    return (this.hasDocuments() || !isNullOrUndefined(this._selectedFile)) ? false : true;
  }
  getIsNotificationRequiredMessage(): string {
    switch (this._eventType.Code) {
      case EventTypeCode.General:
        return 'EMPLOYEE_TIMELINE.NEXT_ACTION_DATE_NOTIFICATION_REQUIRED_MESSAGE';
      case EventTypeCode.Performance:
        return 'EMPLOYEE_TIMELINE.NEXT_REVIEW_DATE_NOTIFICATION_REQUIRED_MESSAGE';
      case EventTypeCode.Grievance:
        return 'EMPLOYEE_TIMELINE.DATE_OF_OUTCOME_NOTIFICATION_REQUIRED_MESSAGE';
    }
  }

  getReminderNotificationMessage(): string {
    switch (this._eventType.Code) {
      case EventTypeCode.General:
        return 'EMPLOYEE_TIMELINE.NEXT_ACTION_DATE_NOTIFICATION_REMINDER_MESSAGE';
      case EventTypeCode.Performance:
        return 'EMPLOYEE_TIMELINE.NEXT_REVIEW_DATE_NOTIFICATION_REMINDER_MESSAGE';
      case EventTypeCode.Grievance:
        return 'EMPLOYEE_TIMELINE.DATE_OF_OUTCOME_NOTIFICATION_REMINDER_MESSAGE';
    }
  }

  private _getReminderDaysDependsField(code: number): string {
    switch (code) {
      case EventTypeCode.General:
        return 'NextActionDate';

      case EventTypeCode.Performance:
        return 'NextReviewDate';

      case EventTypeCode.Grievance:
        return 'DateofOutcome';
    }
  }


  private _showOrHideReminderDays() {
    if (this._eventType.Code === EventTypeCode.General
      || this._eventType.Code === EventTypeCode.Performance
      || this._eventType.Code === EventTypeCode.Grievance) {
      let sub = this._commonForm.get('IsReminderRequired').valueChanges.subscribe((value: boolean) => {
        this._showReminderInDaysField = value;
        this._showErrorMessage = value;
        this._errorMessage = '';

        if (value === false) {
          this._commonForm.get('ReminderInDays').setValue(null);
        }
        this._checkNoOfDays();

      });

      this._subscriptionsArray.push(sub);
      let sub2 = this._commonForm.get('ReminderInDays').valueChanges.subscribe((value: boolean) => {
        this._checkNoOfDays();
      });
      this._subscriptionsArray.push(sub2);


    }

  }

  private _checkNoOfDays() {
    if (this._showReminderInDaysField === true) {
      this._errorMessage = '';
      this._showErrorMessage = false;
      let oneDay = 24 * 60 * 60 * 1000;
      let today = DateTimeHelper.getDatePart(new Date());
      let nextDate = this._formGroup.get(this._getReminderDaysDependsField(this._eventType.Code)).value;
      nextDate = DateTimeHelper.getDatePart(nextDate);
      let reminderDays = +this._commonForm.get('ReminderInDays').value;
      if (isNullOrUndefined(nextDate)) {
        this._showErrorMessage = true;
        this._errorMessage = "Please select the expiry above date.";
      } else {
        let dateDiff = Math.ceil(((nextDate - today.getTime()) / (oneDay)));
        if (isNullOrUndefined(nextDate) || reminderDays > dateDiff) {
          this._showErrorMessage = true;
          this._errorMessage = "EMPLOYEE_TIMELINE.NOTIFICATION_ERROR_MESSAGE";
        }
      }
    }

  }



  ngOnInit() {
    this._init();
    this._showOrHideReminderDays();
  }

  ngAfterViewInit(): void {
    this._fillDropdownData();
  }

  ngOnDestroy(): void {
    if (this._routeParamsSubscription)
      this._routeParamsSubscription.unsubscribe();
    if (this._disciplinaryOutcome)
      this._disciplinaryOutcome.unsubscribe();
    if (this._reasonsSubscription)
      this._reasonsSubscription.unsubscribe();
    if (this._subReasonsSubscription)
      this._subReasonsSubscription.unsubscribe();
  }

}
