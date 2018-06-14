import { RouteParams } from './../../../../shared/services/route-params';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import {
  EmployeeTimelineEventDisciplinaryOutcome,
  EmployeeTimelineEventOutcome,
  EmployeeTimelineLoadReasonsForLeaving,
  EmployeeTimelineLoadSubReasons
} from '../../../../shared/actions/lookup.actions';
import { EventTypeCode } from '../../models/event-type-code';
import {
  DisciplinaryOutcome,
  EventType,
  Outcome,
  ReviewType,
  Sensitivity,
  EmployeeLeavingReason,
  EmployeeLeavingSubReason,
} from '../../../models/timeline';
import { UIField } from '../../models/event-form';
import { EmployeeEvent } from '../../models/emloyee-event';
import { isNullOrUndefined } from 'util';
import { Observable, Subscription } from 'rxjs/Rx';
import { DocumentCategoryService } from '../../../../document/services/document-category-service';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import {
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
import * as fromRoot from '../../../../shared/reducers';
@Component({
  selector: 'employee-event-details',
  templateUrl: './employee-event-details.component.html',
  styleUrls: ['./employee-event-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class EmployeeEventDetails extends BaseComponent implements OnInit, OnDestroy {
  private _employeeEventSubscription$: Subscription;
  private _employeeEvent: EmployeeEvent;
  private _dataFields: Array<UIField>;
  private _eventType: EventType;
  private _isDropdownDataLoaded: boolean;
  private _disciplinaryOutcome: Array<DisciplinaryOutcome>;
  private _outcome: Array<Outcome>;
  private _reasons: Array<EmployeeLeavingReason>;
  private _subReasons: Array<EmployeeLeavingSubReason>;
  private _employeeInfoSubscription: Subscription;
  private _empName: string;
  private _outComeSubscription: Subscription;
  private _reasonSubscription: Subscription;

  @Input('EventType')
  get EventType() {
    return this._eventType;
  }
  set EventType(val: EventType) {
    this._eventType = val;
  }

  @Output('onCancel') _onCancel: EventEmitter<string> = new EventEmitter<string>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _documentCategoryService: DocumentCategoryService
    , private _routeParamsService:RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._isDropdownDataLoaded = false;
  }

  get employeeEvent(): EmployeeEvent {
    return this._employeeEvent;
  }
  get dataFields(): Array<UIField> {
    return this._dataFields;
  }


  ngOnInit() {
    this._employeeEventSubscription$ = this._store.let(fromRoot.getSelectedEmployeeEvent).skipWhile(val => isNullOrUndefined(val)).subscribe((event: EmployeeEvent) => {
      this._employeeEvent = event;
      this._dataFields = <Array<UIField>>(JSON.parse(this._eventType.UITemplate));
      if (this._isDropdownDataLoaded === false && (this._eventType.Code === EventTypeCode.Disciplinary || this._eventType.Code === EventTypeCode.Grievance || this._eventType.Code === EventTypeCode.Leaver)) {
        this._loadDropdownData();
      }
      this._cdRef.markForCheck();
    });

    this._employeeInfoSubscription = this._store.let(fromRoot.getEmployeeInformationData).subscribe(employee => {
      if (employee) {
        this._empName = employee.FirstName + ' ' + employee.Surname;
      }
    });
  }

  ngOnDestroy(): void {
    this._employeeEventSubscription$.unsubscribe();
    this._employeeInfoSubscription.unsubscribe();
    if (this._outComeSubscription) {
      this._outComeSubscription.unsubscribe();
    }
    if (this._reasonSubscription) {
      this._reasonSubscription.unsubscribe();
    }
  }

  getValue(fieldName: string) {
    let data = JSON.parse(this._employeeEvent.EventData);
    return data[fieldName] || '';
  }

  getDateValue(fieldName: string) {
    let data = JSON.parse(this._employeeEvent.EventData);
    return data[fieldName];
  }

  getTypeName(): string {
    let sensitivity = this._employeeEvent.Sensitivity;
    switch (sensitivity) {
      case Sensitivity.Basic:
        return 'Basic';
      case Sensitivity.Advance:
        return 'Advanced';
      case Sensitivity.Sensitive:
        return 'Sensitive';
    }
    return '';
  }

  getSelectValue(field: UIField): string {
    let data = JSON.parse(this._employeeEvent.EventData);
    let fieldValue = data[field.name];
    if (field.name === 'ReviewType') {
      let reviewTypeValue = <ReviewType>Number(fieldValue);
      switch (reviewTypeValue) {
        case ReviewType.PerformanceConcerns:
          return 'Performance concerns';
        case ReviewType.PerformanceReview:
          return 'Performance review';
      }
    }
    if (field.name === 'Outcome') {
      if (!isNullOrUndefined(this._outcome) && !StringHelper.isNullOrUndefinedOrEmpty(fieldValue)) {
        let item = this._outcome.find(o => o.Id === fieldValue);
        if (!isNullOrUndefined(item)) {
          return item.Title;
        }
      }
    }
    if ((field.name === 'DisciplinaryOutcome' || field.name === 'AppealOutcome' || field.name === 'GrievanceOutcome') && !StringHelper.isNullOrUndefinedOrEmpty(fieldValue)) {
      if (!isNullOrUndefined(this._disciplinaryOutcome)) {
        let item = this._disciplinaryOutcome.find(o => o.Id === fieldValue);
        if (!isNullOrUndefined(item)) {
          return item.Title;
        }
      }
    }
    if (field.name === 'ReasonForLeaving' && !isNullOrUndefined(this._reasons)) {
      let item = this._reasons.find(o => o.Id === fieldValue);
      if (!isNullOrUndefined(item)) {
        return item.Title;
      }
    }

    if (field.name === 'SubReason' && !isNullOrUndefined(this._subReasons)) {
      let item = this._subReasons.find(o => o.Id === fieldValue);
      if (!isNullOrUndefined(item)) {
        return item.Title;
      }
    }
    return '';
  }

  getYesNoValue(field: UIField): string {
    let data = JSON.parse(this._employeeEvent.EventData);
    let fieldValue = data[field.name];
    if (!isNullOrUndefined(fieldValue))
      return (fieldValue === true) ? 'Yes' : 'No';
    return '';
  }

  getHeaderTitle(): string {
    return 'Employee event details -' + ' ' + this._eventType.Title;
  }
  getEmployeeName(): string {
    return !isNullOrUndefined(this._empName) ? this._empName : '';
  }
  onDetaisCancel(): void {
    this._onCancel.emit('close');
  }

  downloadDocument(docId: string) {
    window.open(this._getDownloadUrl(docId));
  }

  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` :  `/filedownload?documentId=${docId}`;
  }

  private _loadDropdownData() {
    if (this._eventType.Code === EventTypeCode.Disciplinary) {
      this._store.dispatch(new EmployeeTimelineEventDisciplinaryOutcome(true));
      this._store.dispatch(new EmployeeTimelineEventOutcome(true));
      let eventDisciplinaryOutcome = this._store.let(fromRoot.getEmployeeTimelineEventDisciplinayOutcomeList);
      let eventOutcome = this._store.let(fromRoot.getEmployeeTimelineEventOutcomeList);
      let outComeSub = Observable.combineLatest(eventDisciplinaryOutcome, eventOutcome, (dOutCome, eOutCome) => {
        if (!isNullOrUndefined(dOutCome)) {
          this._disciplinaryOutcome = <DisciplinaryOutcome[]>dOutCome;
        }
        if (!isNullOrUndefined(eOutCome)) {
          this._outcome = <Outcome[]>eOutCome;
        }
        if (!isNullOrUndefined(this._disciplinaryOutcome) && !isNullOrUndefined(this._outcome)) {
          this._isDropdownDataLoaded = true;
          this._cdRef.markForCheck();
        }
      });
      this._outComeSubscription = outComeSub.subscribe();
    }
    if (this._eventType.Code === EventTypeCode.Grievance) {
      this._store.dispatch(new EmployeeTimelineEventDisciplinaryOutcome(true));
      let eventDisciplinaryOutcome = this._store.let(fromRoot.getEmployeeTimelineEventDisciplinayOutcomeList).subscribe(data => {
        if (!isNullOrUndefined(data)) {
          this._disciplinaryOutcome = <DisciplinaryOutcome[]>data;
          this._isDropdownDataLoaded = true;
          this._cdRef.markForCheck();
        }
      });

    }

    if (this._eventType.Code === EventTypeCode.Leaver) {
      this._store.dispatch(new EmployeeTimelineLoadReasonsForLeaving(true));
      this._store.dispatch(new EmployeeTimelineLoadSubReasons(true));
      let eventReasonsForLeaving = this._store.let(fromRoot.getEmployeeReasonForLeaving);
      let eventSubReasons = this._store.let(fromRoot.getEmployeeSubReasons);
      let eventDataSub = Observable.combineLatest(eventReasonsForLeaving, eventSubReasons, (eventReasonData, subReasonData) => {
        if (!isNullOrUndefined(eventReasonData)) {

          this._reasons = <EmployeeLeavingReason[]>eventReasonData;
        }
        if (!isNullOrUndefined(subReasonData)) {
          this._subReasons = <EmployeeLeavingSubReason[]>subReasonData;
        }

        if (!isNullOrUndefined(this._reasons) && !isNullOrUndefined(this._subReasons)) {
          this._isDropdownDataLoaded = true;
          this._cdRef.markForCheck();
        }
      });
      this._reasonSubscription = eventDataSub.subscribe();
    }

  }
}

