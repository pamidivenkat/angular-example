import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
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
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers/index';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { extractTaskCategorySelectItems } from '../../common/task-extract-helper';
import { AssignUser } from '../../models/assign-user';
import { TasksView } from '../../models/task';
import { User } from '../../models/task-activity';
import { TaskForm } from '../../models/task-form';
import { Priority } from '../../models/task-priority';
import { TaskStatus } from '../../models/task-status';
import { TaskCategoryService } from '../../services/task-category.service';
import { TaskService } from '../../services/task-service';

@Component({
  selector: 'task-add',
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TaskAddComponent extends BaseComponent implements OnInit, OnDestroy {
  private _addTaskForm: FormGroup;
  private _task: TasksView;
  private _categoryList: Immutable.List<AeSelectItem<string>>;
  private _taskPriorities: Immutable.List<AeSelectItem<string>>;
  private _dataSouceType: AeDatasourceType;
  private _assignUsersOptions$: Observable<AssignUser[]>;
  private _assignToMe: boolean = false;
  private _isAssignToMeBtnDisabled: boolean = false;
  private _siteVisitCategory: boolean = false;
  private _submitted: boolean = false;
  private taskCategoriesSubscription: Subscription;
  private _minDate: Date;
  private _isDateValid: boolean = true;
  private _loggedInUserId: string;
  private _loggedInUserFullName: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get addTaskForm(): FormGroup {
    return this._addTaskForm;
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
    return this._dataSouceType
  }

  get isAssignToMeBtnDisabled(): boolean {
    return this._isAssignToMeBtnDisabled;
  }

  @Output('onCancel') _onCancel: EventEmitter<string>;
  @Output('OnAddComplete') _OnAddComplete: EventEmitter<boolean>;

  constructor(
    _localeService: LocaleService,
    _translationService: TranslationService,
    _cdRef: ChangeDetectorRef,
    private _fb: FormBuilderService,
    private _taskCategoryService: TaskCategoryService,
    private _store: Store<fromRoot.State>,
    private _claimsHelper: ClaimsHelperService,
    private _taskService: TaskService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._dataSouceType = AeDatasourceType.Local;
    this._onCancel = new EventEmitter<string>();
    this._OnAddComplete = new EventEmitter<boolean>();
    this._task = new TasksView();
    this._task.CompanyId = this._claimsHelper.getCompanyId();
    this._task.Status = TaskStatus.ToDo;
    this._minDate = new Date();
    this._loggedInUserId = this._claimsHelper.getUserId();
    this._loggedInUserFullName = this._claimsHelper.getUserFullName();
  }
  public canAssignToAllBeShown(): boolean {
    return !this._claimsHelper.IsPublicUser();
  }
  ngOnInit() {
    this._loggedInUserId = this._claimsHelper.getUserId();
    this._loggedInUserFullName = this._claimsHelper.getUserFullName();
    if (!this._claimsHelper.IsPublicUser()) {
      this._taskService._populateUserAutocompleteList(); //dispach an action to load User autocomplet options
    }
    this._addTaskForm = this._fb.build(new TaskForm("taskAdd"));
    this._taskPriorities = Immutable.List([new AeSelectItem<string>('Please select', '', false), new AeSelectItem<string>('Immediate', Priority.Immediate.toString(), false), new AeSelectItem<string>('High', Priority.High.toString(), false), new AeSelectItem<string>('Medium', Priority.Medium.toString(), false), new AeSelectItem<string>('Low', Priority.Low.toString(), false)]);
    this._taskCategoryService.getTaskCategories();
    this.taskCategoriesSubscription = this._store.let(fromRoot.getTaskCategoriesData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        let taskCategories = extractTaskCategorySelectItems(res);
        this._categoryList = Immutable.List(taskCategories);
        const defaultCategory = taskCategories.find(selectItem => selectItem.Text.toLowerCase() === "general");
        const defaultPriority = this._taskPriorities.find(selectItem => selectItem.Value === "");
        this._addTaskForm.get('Priority').setValue(defaultPriority.Value);
        this._addTaskForm.get('TaskCategoryId').setValue(defaultCategory.Value);
        this._addTaskForm.get('DueDate').setValue(new Date());
        this._cdRef.markForCheck();
      }
    });

    this._assignUsersOptions$ = this._store.let(fromRoot.getAssignUsersData);
  }

  ngOnDestroy() {
    this.taskCategoriesSubscription.unsubscribe();
  }
  /**
   * on task cancel
   * @private
   * @param {any} e
   *
   * @memberOf TaskAddComponent
   */
  onTaskCancel(e) {
    this._onCancel.emit('add');
    this._addTaskForm.reset(); //clear form.
  }

  /**
   * date validation method
   * @private
   *
   * @memberOf TaskAddComponent
   */
  isValidDate(val: boolean) {
    this._isDateValid = val;
    if (!this._isDateValid) {
      let control = this._addTaskForm.get('DueDate');
      this._resetControl(control);
    }
  }


  /**
   *
   *
   * @private
   * @type {AeInputType}
   * @memberOf TaskUpdateComponent
   */
  private _ctrlType: AeInputType = AeInputType.number;

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
    this._addTaskForm.get('AssignToAll').setValue(false);
    this._addTaskForm.get('AssignedUsers').setValue(this._task.AssignedUsersList);
    this._assignToMe = false;
    this._task.AssignToAll = false;
    this._isAssignToMeBtnDisabled = false;
  }

  onClearselected($event: any) {
    this._task.AssignedUsersList = [];
    this._addTaskForm.get('AssignToAll').setValue(false);
    this._assignToMe = false;
    this._task.AssignToAll = false;
    this._isAssignToMeBtnDisabled = false;
  }


  /**
   * On category change
   *
   * @param {*} $event
   *
   * @memberOf TaskAddComponent
   */
  onCategoryChange($event: any) {
    this._siteVisitCategory = false;
    if ($event.SelectedItem.Text.toLowerCase() == "site visit") {
      this._siteVisitCategory = true;
    }
  }

  /**
   * assign to me click
   *
   * @param {any} e
   * @returns
   *
   * @memberOf TaskAddComponent
   */
  onClickAssignToME(e) {
    if (this._isAssignToMeBtnDisabled) {
      return false;
    }
    this._isAssignToMeBtnDisabled = true; //disable btn _assignToMe
    this._assignToMe = true;
    this._task.AssignToAll = false; //uncheck assignToAll checkbox
    this._addTaskForm.get('AssignToAll').setValue(false);
    if (isNullOrUndefined(this._task.AssignedUsersList)) {
      this._task.AssignedUsersList = new Array<User>();
    }
    this._task.AssignedUsersList = [];
    this._task.AssignedUsersList.push(new User(this._loggedInUserId, this._loggedInUserFullName));
    this._addTaskForm.get('AssignedUsers').setValue(this._task.AssignedUsersList);
    this._cdRef.markForCheck();
  }


  /**
   *
   * @param {any} e
   *
   * @memberOf TaskAddComponent
   */
  onChangeSendEmailNotification(e) {
    this._task.SendEmailNotification = this._addTaskForm.get('SendNotification').value;
  }

  /**
   *
   * change all check box
   * @param {any} e
   *
   * @memberOf TaskAddComponent
   */
  onChangeAllCheckbox(e) {
    this._task.AssignToAll = this._addTaskForm.get('AssignToAll').value;
    if (this._task.AssignToAll) {
      this._task.AssignedUsersList = new Array<User>();
      this._isAssignToMeBtnDisabled = false;
      this._assignToMe = true;
      this._addTaskForm.get('AssignedUsers').setValue(this._task.AssignedUsersList);
      this._addTaskForm.get('AssignedUsers').clearValidators();
    }
    else {
      this._assignToMe = false;
    }
    this.isTaskAssigned();
    this._addTaskForm.get('AssignedUsers').updateValueAndValidity();
  }


  /**
   * add form submission
   * @private
   * @param {any} e
   *
   * @memberOf TaskAddComponent
   */
  onAddFormSubmit(e) {
    this._submitted = true;
    if (this._addTaskForm.valid) {
      // dispatch an action to save form
      let _taskToSave: TasksView = Object.assign({}, this._task, <TasksView>this._addTaskForm.value);
      _taskToSave.CompanyId = this._claimsHelper.getCompanyId();
      _taskToSave.Status = TaskStatus.ToDo;
      this._taskService._addNewTask(_taskToSave); //save task action
      this._OnAddComplete.emit(true);
      this._addTaskForm.reset(); //clear form.
    }
  }


  /**
   * validation error function
   * @private
   * @param {string} fieldName
   * @returns {boolean}
   *
   * @memberOf TaskAddComponent
   */
  fieldHasRequiredError(fieldName: string): boolean {
    if (this._addTaskForm.get(fieldName) && this._addTaskForm.get(fieldName).hasError('required') && (!this._addTaskForm.get(fieldName).pristine || this._submitted)) {
      if (fieldName == "AssignedUsers" && this._addTaskForm.get('AssignToAll').value) {
        return false;
      }
      return true;
    }
    return false;
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
    return this._addTaskForm.get(fieldName).hasError('min');
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
    return this._addTaskForm.get(fieldName).hasError('max');
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
    return this._addTaskForm.get(fieldName).valid;
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
    return this._addTaskForm.get(fieldName).getError('validName') == false;
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
  private _fieldHasMaxLengthError(fieldName: string): boolean {
    return this._addTaskForm.get(fieldName).invalid;
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
   * Check if Assign to field has value.
   *
   * @private
   * @returns {boolean}
   *
   * @memberOf TaskAddComponent
   */

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
      this._addTaskForm.get('SendNotification').setValue(false);
    }
    return userAssigned;
  }
}