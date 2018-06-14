import { IFormFieldWrapper } from './../../../shared/models/iform-builder-vm';
import { TaskActivity } from '../../../task/models/task-activity';
import { createSelectOptionFromArrayList } from '../../../employee/common/extract-helpers';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { isNullOrUndefined } from 'util';
import { RaTaskForm } from '../../models/ra-task-form';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { BehaviorSubject } from 'rxjs/Rx';
import { IFormBuilderVM } from '../../../shared/models/iform-builder-vm';
import { FormGroup, AbstractControl } from '@angular/forms';
import { AeDataActionTypes } from '../../../employee/models/action-types.enum';
import * as fromRoot from '../../../shared/reducers';
import { Store } from '@ngrx/store';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { ActivatedRoute } from '@angular/router';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import * as Immutable from 'immutable';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'further-control-measures-add-update',
  templateUrl: './further-control-measures-add-update.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FurtherControlMeasuresAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  private _selectedTask: TaskActivity;
  private _action: string;
  private _raTaskForm: FormGroup;
  private _raTaskFormVM: IFormBuilderVM;
  private _isFormSubmitted: boolean = false;
  private _formName: string;
  private _selectedCourseVisibility: BehaviorSubject<boolean>;
  private _individualToTrainVisibility: BehaviorSubject<boolean>;
  private _raHazardOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _assignedUserOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _subActionTypeOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _selectedCourseOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _selectedCourseFieldVisibility: BehaviorSubject<boolean>;
  private _individualToTrainFieldVisibility: BehaviorSubject<boolean>;
  private _dueDateValidity: BehaviorSubject<boolean>;
  private _raHazardsList: Array<any>;
  private _usersList: Array<any>;
  private _trainingCoursesList: Array<any>;
  private _formFields: Array<IFormFieldWrapper<any>>;

  @Input('selectedTask')
  set selectedTask(val: TaskActivity) {
    this._selectedTask = val;
  }
  get selectedTask() {
    return this._selectedTask;
  }

  @Input('action')
  set action(val: string) {
    this._action = val;
  }
  get action() {
    return this._action;
  }


  @Input('raHazards')
  set raHazards(val: any) {
    this._raHazardsList = val;
  }
  get raHazards() {
    return this._raHazardsList;
  }


  @Input('usersList')
  set usersList(val: any) {
    this._usersList = val;
  }
  get usersList() {
    return this._usersList;
  }


  @Input('trainingCourses')
  set trainingCourses(val: any) {
    this._trainingCoursesList = val;
  }
  get trainingCourses() {
    return this._trainingCoursesList;
  }

  get taskFormVM() {
    return this._raTaskFormVM;
  }

  get raTaskForm() {
    return this._raTaskForm;
  }

  get raHazardOptions() {
    return this._raHazardOptions$;
  }

  get assignedUserOptions() {
    return this._assignedUserOptions$;
  }
  get formFields() {
    return this._formFields;
  }


  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output('addUpdateRATaskSubmit')
  _addUpdateRATaskSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();


  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _activatedRoute: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilderService
    , private _riskAssessmentService: RiskAssessmentService
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  ngOnInit() {
    this._formName = 'raTaskForm';
    this._raTaskFormVM = new RaTaskForm(this._formName);
    this._formFields = this._raTaskFormVM.init();
    let _selectedRAHazardField = this._formFields.find(f => f.field.name === 'SelectedRAHazard');
    if (!isNullOrUndefined(_selectedRAHazardField)) {
      this._raHazardOptions$ = _selectedRAHazardField.context.getContextData().get('options');
      if (!isNullOrUndefined(this._raHazardsList)) {
        let hazardsList = createSelectOptionFromArrayList(this._raHazardsList, "Id", "Name");
        this._raHazardOptions$.next(Immutable.List(hazardsList));
      } else {
        this._raHazardOptions$.next(Immutable.List([]));
      }

    }

    let _assignedUserField = this._formFields.find(f => f.field.name === 'AssignedUser');
    if (!isNullOrUndefined(_assignedUserField)) {
      this._assignedUserOptions$ = _assignedUserField.context.getContextData().get('options');
      if (!isNullOrUndefined(this._usersList)) {
        this._assignedUserOptions$.next(Immutable.List(this._usersList));
      } else {
        this._assignedUserOptions$.next(Immutable.List([]));
      }
    }

    let _subActionTypeField = this._formFields.find(f => f.field.name === 'SubActionType');
    if (!isNullOrUndefined(_subActionTypeField)) {
      let _subActionTypes = [];
      _subActionTypes.push(new AeSelectItem<string>('Yes', 'true'));
      _subActionTypes.push(new AeSelectItem<string>('No', 'false'));
      this._subActionTypeOptions$ = _subActionTypeField.context.getContextData().get('options');
      this._subActionTypeOptions$.next(Immutable.List<AeSelectItem<string>>(_subActionTypes));
    }


  }

  onFormInit(fg: FormGroup) {
    this._raTaskForm = fg;

    let _selectedCourseField = this._formFields.find(f => f.field.name === 'SelectedCourse');
    if (!isNullOrUndefined(_selectedCourseField)) {
      let _trainingCourses = createSelectOptionFromArrayList(this._trainingCoursesList, "Id", "Title");
      this._selectedCourseOptions$ = _selectedCourseField.context.getContextData().get('options');
      this._selectedCourseOptions$.next(Immutable.List(_trainingCourses));
    }
    this._selectedCourseFieldVisibility = <BehaviorSubject<boolean>>_selectedCourseField.context.getContextData().get('propertyValue');

    let _individualToTrainField = this._formFields.find(f => f.field.name === 'IndividualToTrain');
    this._individualToTrainFieldVisibility = <BehaviorSubject<boolean>>_individualToTrainField.context.getContextData().get('propertyValue');

    let _dueDateField = this._formFields.find(f => f.field.name === 'DueDate');
    if (!isNullOrUndefined(_dueDateField)) {
      <EventEmitter<boolean>>_dueDateField.context.getContextData().get('onBlur').subscribe((val) => {
        if (!isNullOrUndefined(val) && val == false) {
          let control = this._raTaskForm.get('DueDate');
          control.setValue(null);
          this._resetControl(control);
          (<EventEmitter<boolean>>_dueDateField.context.getContextData().get('onBlur')).next(null);
          this._cdRef.markForCheck();
        }
      });
    }

    if (this._action === AeDataActionTypes.Update) {
      this._raTaskForm.get('Title').setValue(this._selectedTask.Title);
      this._raTaskForm.get('Description').setValue(this._selectedTask.Description);
      this._raTaskForm.get('AssignedUser').setValue(this._selectedTask.AssignedTo);
      if (!isNullOrUndefined(this._selectedTask.TaskSubAction)) {
        this._raTaskForm.get('SelectedRAHazard').setValue(this._selectedTask.TaskSubAction.SubObjectId);
        this._raTaskForm.get('SubActionType').setValue(this._selectedTask.TaskSubAction.SubActionType.toString());
        if (this._selectedTask.TaskSubAction.SubActionType) {
          this._raTaskForm.get('SubActionType').setValue('true');
          this._selectedCourseFieldVisibility.next(true);
          this._individualToTrainFieldVisibility.next(true);
          this._raTaskForm.get('SelectedCourse').setValue(this._selectedTask.TaskSubAction.CourseId);
          this._raTaskForm.get('IndividualToTrain').setValue(this._selectedTask.TaskSubAction.IndividualToTrain);
        } else {
          this._raTaskForm.get('SubActionType').setValue('false');
        }
      }
      if (!isNullOrUndefined(this._selectedTask.DueDate)) {
        this._raTaskForm.get('DueDate').setValue(new Date(this._selectedTask.DueDate));
      }
    } else {
      this._raTaskForm.get('SubActionType').setValue('false');
    }

    this._raTaskForm.get('SubActionType').valueChanges.subscribe((value) => {
      if (value === 'true') {
        this._selectedCourseFieldVisibility.next(true);
        this._individualToTrainFieldVisibility.next(true);
      } else {
        this._selectedCourseFieldVisibility.next(false);
        this._individualToTrainFieldVisibility.next(false);
      }
    });
  }

  isAddForm() {
    return this._action == AeDataActionTypes.Add;
  }

  isUpdateForm() {
    return this._action == AeDataActionTypes.Update;
  }

  onUpdateFormSubmit() {
    this._isFormSubmitted = true;
    if (this._raTaskForm.valid) {
      this._addUpdateRATaskSubmit.emit(this._raTaskForm.value);
    }
  }

  onUpdateFormClosed() {
    this._slideOutClose.emit(false);
  }


  footerBtnText() {
    return { Submit: this.isAddForm() ? 'Add' : 'Update', Cancel: 'Close' }
  }

  private _resetControl(control: AbstractControl) {
    if (!isNullOrUndefined(control)) {
      control.reset(null);
      control.clearValidators();
      control.markAsPristine();
      control.markAsUntouched();
      control.updateValueAndValidity();
    }
  }
}
