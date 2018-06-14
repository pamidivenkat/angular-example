import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { MessageType } from '../../../atlas-elements/common/ae-message.enum';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import * as fromRoot from '../../../shared/reducers/index';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { AssignUser } from '../../models/assign-user';
import { TasksView } from '../../models/task';
import { User } from '../../models/task-activity';
import { TaskForm } from '../../models/task-form';
import { Priority } from '../../models/task-priority';
import { TaskStatus } from '../../models/task-status';
import { TaskService } from './../../services/task-service';

@Component({
  selector: 'task-update',
  templateUrl: './task-update.component.html',
  styleUrls: ['./task-update.component.scss'],
  providers: [CurrencyPipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  //private members

  /**
   * Form group
   * 
   * @private
   * @type {FormGroup}
   * @memberOf TaskUpdateComponent
   */
  private _updateTaskForm: FormGroup;

  /**
   * Task to update 
   * 
   * @private
   * @type {TasksView}
   * @memberOf TaskUpdateComponent
   */
  private _task: TasksView;

  /**
   * List of categories
   * 
   * @private
   * @type {Immutable.List<AeSelectItem<string>>}
   * @memberOf TaskUpdateComponent
   */
  private _categoryList: Immutable.List<AeSelectItem<string>>;

  private _assignUsersOptions$: Observable<AssignUser[]>;

  /**
   * Task Priorities
   * 
   * @private
   * @type {Immutable.List<AeSelectItem<string>>}
   * @memberOf TaskUpdateComponent
   */
  private _taskPriorities: Immutable.List<AeSelectItem<string>>;

  /**
   * Task Status
   * 
   * @private
   * @type {Immutable.List<AeSelectItem<string>>}
   * @memberOf TaskUpdateComponent
   */
  private _taskStatus: Immutable.List<AeSelectItem<string>>;

  /**
   * Member to determine whether it is site visit category or not
   * 
   * @private
   * @type {boolean}
   * @memberOf TaskUpdateComponent
   */
  private _siteVisitCategory: boolean = false;
  private _isAssignToMeBtnDisabled: boolean = false;

  /**
   * Logged in user id
   * 
   * @private
   * @type {string}
   * @memberOf TaskUpdateComponent
   */
  private _loggedInUserId: string;

  private _loggedInUserFullName: string;

  /**
   * 
   * 
   * @private
   * @type {boolean}
   * @memberOf TaskUpdateComponent
   */
  /**
   * 
   * 
   * @private
   * @type {boolean}
   * @memberOf TaskUpdateComponent
   */
  private _assignToAll: boolean = false;

  /**
   * 
   * 
   * @private
   * @type {boolean}
   * @memberOf TaskUpdateComponent
   */
  private _assignToMe: boolean = false;

  /**
   * 
   * 
   * @private
   * @type {boolean}
   * @memberOf TaskUpdateComponent
   */
  private _sendEmailNotification: boolean = false;

  /**
   * 
   * 
   * @private
   * @type {Date}
   * @memberOf TaskUpdateComponent
   */
  private _minDate: Date;


  /**
   * 
   * 
   * @private
   * @type {AeInputType}
   * @memberOf TaskUpdateComponent
   */
  private _ctrlType: AeInputType = AeInputType.number;

  /**
   * 
   * 
   * @private
   * @type {boolean}
   * @memberOf TaskUpdateComponent
   */
  private _isDateValid: boolean = true;

  private _dataSouceType: AeDatasourceType;
  private _selectedTaskDataSubscription: Subscription;
  private _taskCategoriesSubscription: Subscription;
  private _updateTaskMessage: string;
  private _messagetType = MessageType.Info;
  private _percentageSubscription: Subscription;
  private _statusSubscription: Subscription;

  private _submitted: boolean;

  get messagetType(): any {
    return this._messagetType;
  }
  //End of  private members
  @Input('message')
  get message(): string {
    return this._updateTaskMessage;
  }
  set message(val: string) {
    this._updateTaskMessage = val;
  }

  get updateTaskForm(): FormGroup {
    return this._updateTaskForm;
  }

  get categoryList(): Immutable.List<AeSelectItem<string>> {
    return this._categoryList;
  }

  get siteVisitCategory(): boolean {
    return this._siteVisitCategory;
  }

  get ctrlType(): AeInputType {
    return this._ctrlType;
  }

  get taskStatus(): Immutable.List<AeSelectItem<string>> {
    return this._taskStatus;
  }

  get taskPriorities(): Immutable.List<AeSelectItem<string>> {
    return this._taskPriorities;
  }

  get minDate(): Date {
    return this._minDate;
  }

  get isDateValid(): boolean {
    return this._isDateValid;
  }

  get assignUsersOptions$(): Observable<AssignUser[]> {
    return this._assignUsersOptions$;
  }

  get dataSouceType(): AeDatasourceType {
    return this._dataSouceType;
  }

  get isAssignToMeBtnDisabled(): boolean {
    return this._isAssignToMeBtnDisabled;
  }

  get assignToAll(): boolean {
    return this._assignToAll;
  }

  get sendEmailNotification(): boolean {
    return this._sendEmailNotification;
  }

  get lightClass() {
    return this._lightClass;
  }

  get task(): TasksView {
    return this._task;
  }
  //Input bindings

  //End of input bindings

  //Output bindings  
  @Output() onFormSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Output('onCancel') _onCancel: EventEmitter<string> = new EventEmitter<string>();
  //End of output bindings


  //constructor
  constructor(
    _localeService: LocaleService,
    _translationService: TranslationService,
    _cdRef: ChangeDetectorRef,
    private _fb: FormBuilderService,
    private _store: Store<fromRoot.State>,
    private _claimsHelper: ClaimsHelperService,
    private _currencyPipe: CurrencyPipe,
    private _taskService: TaskService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._loggedInUserId = this._claimsHelper.getUserId();
    this._loggedInUserFullName = this._claimsHelper.getUserFullName();
    this._dataSouceType = AeDatasourceType.Local;
    this._minDate = new Date();
    this._submitted = false;
  }
  //End of constructor


  //OnInit
  ngOnInit() {
    this._updateTaskForm = this._fb.build(new TaskForm("taskUpdate"));
    this._selectedTaskDataSubscription = this._store.let(fromRoot.getSelectedTaskData).subscribe(selectedTask => {
      if (!isNullOrUndefined(selectedTask)) {
        this._task = selectedTask;
        this._task.AssignedUsersList = new Array<User>();
        if (!isNullOrUndefined(this._task.AssignedTo)) {
          this._task.AssignedUsersList.push({ Id: this._task.AssignedTo, FullName: this._task.AssignedUserName });
        }
        this._updateTaskForm.get('AssignedUsers').setValue(this._task.AssignedUsersList);
        this._siteVisitCategory = this._task.TaskCategoryName.toLowerCase() === 'site visit';
        this._updateTaskForm.get('TaskCategoryId').setValue(this._task.TaskCategoryId.toString());
        this._updateTaskForm.get('Title').setValue(this._task.Title);
        this._updateTaskForm.get('Description').setValue(StringHelper.getPlainText(this._task.Description));
        this._updateTaskForm.get('Priority').setValue(this._task.Priority.toString());
        if (!isNullOrUndefined(this._task.DueDate)) {
          this._updateTaskForm.get('DueDate').setValue(new Date(this._task.DueDate));
        }else{
          this._updateTaskForm.get('DueDate').setValue(null);
        }
        this._updateTaskForm.get('SendNotification').setValue(this._sendEmailNotification);
        this._updateTaskForm.get('CostOfRectification').setValue(this._task.CostOfRectification);
        this._updateTaskForm.get('PercentageCompleted').setValue(this._task.PercentageCompleted);
        this._updateTaskForm.get('CorrectActionTaken').setValue(this._task.CorrectiveActionTaken);
        this._updateTaskForm.get('Status').setValue(this._task.Status.toString());
        this._updateTaskForm.get('AssignToAll').setValue(this._assignToAll);
        this._cdRef.markForCheck();
      }
    });

    //Subscriptions
    if (!this._claimsHelper.IsPublicUser()) {
      this._taskService._populateUserAutocompleteList(); //dispach an action to load User autocomplet options
      this._assignUsersOptions$ = this._store.let(fromRoot.getAssignUsersData);
    }

    this._taskCategoriesSubscription = this._store.let(fromRoot.getTaskCategorySelectItems).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._categoryList = Immutable.List(res);;
        this._cdRef.markForCheck();
      }
    });
    //End of subscriptions

    //Drop down data
    this._taskPriorities = Immutable.List([new AeSelectItem<string>('Immediate', Priority.Immediate.toString(), false), new AeSelectItem<string>('High', Priority.High.toString(), false), new AeSelectItem<string>('Medium', Priority.Medium.toString(), false), new AeSelectItem<string>('Low', Priority.Low.toString(), false)]);
    this._taskStatus = Immutable.List([new AeSelectItem<string>('To Do', TaskStatus.ToDo.toString(), false), new AeSelectItem<string>('In Progress', TaskStatus.InProgress.toString(), false), new AeSelectItem<string>('Complete', TaskStatus.Complete.toString(), false)]);
    //End of drop down data

    this._percentageSubscription = this._updateTaskForm.get('PercentageCompleted').valueChanges.takeUntil(this._destructor$).subscribe((val) => {
      if (this._siteVisitCategory && !isNullOrUndefined(val)) {
        let status: string = this._updateTaskForm.get('Status').value;
        let percentageCompleted = this._updateTaskForm.get('PercentageCompleted').value ? this._updateTaskForm.get('PercentageCompleted').value : 0;
        if (this._siteVisitCategory && !isNullOrUndefined(status) && (status !== TaskStatus.Complete.toString()) && Number(percentageCompleted) === 100) {
          this._updateTaskForm.get('Status').setValue(TaskStatus.Complete.toString());
        }
      }
    });
    this._statusSubscription = this._updateTaskForm.get('Status').valueChanges.takeUntil(this._destructor$).subscribe((val) => {
      if (this._siteVisitCategory && !isNullOrUndefined(val)) {
        let status: string = this._updateTaskForm.get('Status').value;
        let percentageCompleted = this._updateTaskForm.get('PercentageCompleted').value ? this._updateTaskForm.get('PercentageCompleted').value : 0;
        if (this._siteVisitCategory && !isNullOrUndefined(status) && (status === TaskStatus.Complete.toString()) && Number(percentageCompleted) !== 100) {
          this._updateTaskForm.get('PercentageCompleted').setValue(100);
        }
      }
    });
  }
  //End of OnInit

  //Private methods

  /**
   * cancel event emit
   * 
   * @memberOf TaskUpdateComponent
   */
  onTaskCancel() {
    this._onCancel.emit('update');
  }

  /**
   * Event on AssignToMe click
   * 
   * @private
   * @param {any} e 
   * @returns 
   * 
   * @memberOf TaskUpdateComponent
   */

  onClickAssignToME(e) {
    if (this._isAssignToMeBtnDisabled) {
      return false;
    }
    this._isAssignToMeBtnDisabled = true; //disable btn _assignToMe
    this._assignToMe = true;
    this._task.AssignToAll = false; //uncheck assignToAll checkbox
    this._updateTaskForm.get('AssignToAll').setValue(false);
    if (isNullOrUndefined(this._task.AssignedUsersList)) {
      this._task.AssignedUsersList = new Array<User>();
    }
    this._task.AssignedUsersList = [];
    this._task.AssignedUsersList.push(new User(this._loggedInUserId, this._loggedInUserFullName));
    this._updateTaskForm.get('AssignedUsers').setValue(this._task.AssignedUsersList);
    this._cdRef.markForCheck();
  }


  /**
   * On date selection
   * 
   * @private
   * 
   * @memberOf TaskUpdateComponent
   */
  // private _onDateSelect = (val: Date) => {
  //   this._updateTaskForm.get('DueDate').setValue(val);
  // }


  /**
   * Date Validation
   * 
   * @private
   * 
   * @memberOf TaskUpdateComponent
   */
  private _isValidDate (val: boolean) {
    this._isDateValid = val;
    if (!this._isDateValid) {
      let control = this._updateTaskForm.get('DueDate');
      this._resetControl(control);
    }
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

  /**
   * On update task event
   * 
   * @private
   * @param {any} e 
   * @returns 
   * 
   * @memberOf TaskUpdateComponent
   */
  onUpdateFormSubmit(e) {
    this._submitted = true;
    if (this._updateTaskForm.valid) {
      if (this._siteVisitCategory && (this.isNotComplete() || this.isComplete()))
        return false;

      let _taskToSave: TasksView = Object.assign({}, this._task, <TasksView>this._updateTaskForm.value);
      this.onFormSubmit.emit(_taskToSave);
    }
    return false;
  }


  /**
   * Required errors
   * 
   * @private
   * @param {string} fieldName 
   * @returns {boolean} 
   * 
   * @memberOf TaskUpdateComponent
   */
  fieldHasRequiredError(fieldName: string): boolean {
    return this._updateTaskForm.get(fieldName).hasError('required');
  }


  /**
   * Min validation
   * 
   * @private
   * @param {string} fieldName 
   * @returns {boolean} 
   * 
   * @memberOf TaskUpdateComponent
   */
  fieldHasMinError(fieldName: string): boolean {
    return this._updateTaskForm.get(fieldName).hasError('min');
  }



  /**
   * Max validation
   * 
   * @private
   * @param {string} fieldName 
   * @returns {boolean} 
   * 
   * @memberOf TaskUpdateComponent
   */
  fieldHasMaxError(fieldName: string): boolean {
    return this._updateTaskForm.get(fieldName).hasError('max');
  }


  /**
   * Method to validate field
   * 
   * @private
   * @param {string} fieldName 
   * @returns {boolean} 
   * 
   * @memberOf TaskUpdateComponent
   */
  private _isFieldValid(fieldName: string): boolean {
    return this._updateTaskForm.get(fieldName).valid;
  }


  /**
   * to konw field has involved name
   * 
   * @private
   * @param {string} fieldName 
   * @returns {boolean} 
   * 
   * @memberOf TaskUpdateComponent
   */
  private _fieldHasInvalidName(fieldName: string): boolean {
    return this._updateTaskForm.get(fieldName).getError('validName') == false;
  }


  /**
   * Field has max length error
   * 
   * @private
   * @param {string} fieldName 
   * @returns {boolean} 
   * 
   * @memberOf TaskUpdateComponent
   */
  fieldHasMaxLengthError(fieldName: string): boolean {
    return this._updateTaskForm.get(fieldName).invalid;
  }

  /**
 *  On change User auto-complete value
 *  keep adding multiple option for user autocomplete
 * @private
 * @param {*} $event 
 * 
 * @memberOf TaskAddComponent
 */
  onAssignUserChanged($event: any) {
    this._task.AssignedUsersList = [];
    $event.map((selectItem => this._task.AssignedUsersList.push(new User(selectItem.Value, selectItem.Text))));
    this._updateTaskForm.get('AssignedUsers').setValue(this._task.AssignedUsersList);
    this._updateTaskForm.get('AssignToAll').setValue(false);
    this._assignToMe = false;
    this._task.AssignToAll = false;
    this._isAssignToMeBtnDisabled = false;
  }

  /**
   * On selection clear
   * 
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskUpdateComponent
   */
  onClearselected($event: any) {
    this._task.AssignedUsersList = [];
    this._updateTaskForm.get('AssignToAll').setValue(false);
    this._assignToMe = false;
    this._task.AssignToAll = false;
    this._isAssignToMeBtnDisabled = false;
  }


  /**
   * Category change event
   * 
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskUpdateComponent
   */
  onCategoryChange($event: any) {
    this._siteVisitCategory = false;
    if ($event.SelectedItem.Text.toLowerCase() == "site visit") {
      this._siteVisitCategory = true;
    }
  }

  /**
   * Assign to All
   * 
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskUpdateComponent
   */
  onChangeAllCheckbox($event: any) {

    this._task.AssignToAll = this._updateTaskForm.get('AssignToAll').value;
    if (this._task.AssignToAll) {
      this._task.AssignedUsersList = new Array<AssignUser>();
      this._isAssignToMeBtnDisabled = false;
      this._assignToMe = true;
      this._updateTaskForm.get('AssignedUsers').reset();
      this._updateTaskForm.get('AssignedUsers').clearValidators();
      this._updateTaskForm.get('AssignedUsers').setValue(this._task.AssignedUsersList);
    } else {
      this._assignToMe = false;
    }
    this.isTaskAssigned();
  }

  /**
   * Send email notification
   * 
   * @private
   * @param {any} e 
   * 
   * @memberOf TaskUpdateComponent
   */
  onChangeSendEmailNotification(e) {
    this._sendEmailNotification = this._updateTaskForm.get('SendNotification').value;
  }

  /**
   * TO know the task is complete
   * 
   * @private
   * @returns {boolean} 
   * 
   * @memberOf TaskUpdateComponent
   */
  isNotComplete(): boolean {
    if (!isNullOrUndefined(this._task)) {
      let status: string = this._updateTaskForm.get('Status').value;
      let percentageCompleted = this._updateTaskForm.get('PercentageCompleted').value ? this._updateTaskForm.get('PercentageCompleted').value : 0;
      if (this._siteVisitCategory && !isNullOrUndefined(status) && (status === TaskStatus.Complete.toString()) && Number(percentageCompleted) !== 100) {
        return true;
      }
    }
    return false;
  }
  isComplete(): boolean {
    if (!isNullOrUndefined(this._task)) {
      let status: string = this._updateTaskForm.get('Status').value;
      let percentageCompleted = this._updateTaskForm.get('PercentageCompleted').value ? this._updateTaskForm.get('PercentageCompleted').value : 0;
      if (this._siteVisitCategory && !isNullOrUndefined(status) && (status !== TaskStatus.Complete.toString()) && Number(percentageCompleted) === 100) {
        return true;
      }
    }
    return false;
  }

  showMessage(): boolean {
    return !isNullOrUndefined(this._updateTaskMessage);
  }

  hideMessage() {
    this._updateTaskMessage = null;
  }

  isTaskAssigned(): boolean {
    var userAssigned = false;
    if (!isNullOrUndefined(this._task)) {
      if (!isNullOrUndefined(this._task.AssignedUsersList) && this._task.AssignedUsersList.length > 0) {
        userAssigned = true;
      } else {
        userAssigned = ((this._assignToMe === true) || (this._task.AssignToAll === true));
      }
    }
    if (!userAssigned) {
      this._updateTaskForm.get('SendNotification').setValue(false);
    }
    return userAssigned;
  }

  //End of private methods

  //OnDestroy
  public canAssignToAllBeShown(): boolean {
    return !this._claimsHelper.IsPublicUser();
  }

  ngOnDestroy(): void {
    this._taskCategoriesSubscription.unsubscribe();
    this._selectedTaskDataSubscription.unsubscribe();
    super.ngOnDestroy();
  }
  //End of OnDestroy

}
