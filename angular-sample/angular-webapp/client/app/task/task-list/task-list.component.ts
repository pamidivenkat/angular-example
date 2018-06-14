import { Department } from '../../calendar/model/calendar-models';
import { Employee } from '../../employee/models/employee.model';
import { LoadDeptEmployeesAction } from '../../shared/actions/user.actions';
import { getEmployeesData } from '../../shared/reducers';
import { UserService } from '../../shared/services/user-services';
import { createSelectOptionFromArrayList } from '../../employee/common/extract-helpers';
import { LoadSitesAction } from '../../shared/actions/company.actions';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { ActivatedRoute } from '@angular/router';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessageEvent, MessageStatus } from '../../atlas-elements/common/models/message-event.enum';
import { SnackbarMessageVM } from '../../shared/models/snackbar-message-vm';
import { MessageType } from '../../atlas-elements/common/ae-message.enum';
import { MessengerService } from '../../shared/services/messenger.service';
import { AeClassStyle } from '../../atlas-elements/common/ae-class-style.enum';
import { isNullOrUndefined } from 'util';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { TaskCategory } from '../models/task-categoy';
import { TaskCategoryService } from '../services/task-category.service';
import { TaskService } from '../services/task-service';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { AeDatasourceType } from '../../atlas-elements/common/ae-datasource-type';
import {
  LoadSelectedTaskAction,
  LoadTasksAction,
  LoadTasksOnFilterChangeAction,
  LoadTasksOnPageChangeAction,
  LoadTasksOnSortAction,
  SetDefaultFiltersAction
} from '../actions/task.list.actions';
import { TaskViewType } from '../models/task-view-type';
import { any } from 'codelyzer/util/function';
import { AeFilterControlType } from '../../atlas-elements/common/ae-filter-controltype.enum';
import { Title } from '@angular/platform-browser';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { AeFilterItem } from '../../atlas-elements/common/models/ae-filter-item';
import { AeFilterSearchMode } from '../../atlas-elements/common/ae-filter-searchmode.enum';
import { Priority } from '../models/task-priority';
import { AeDataTableAction } from '../../atlas-elements/common/models/ae-data-table-action';
import { TaskStatus } from '../models/task-status';
import { AeDatatableComponent } from '../../atlas-elements/ae-datatable/ae-datatable.component';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../shared/base-component';
import { TasksView } from '../models/task';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../shared/reducers/index';
import { UpdateTaskAction } from "../actions/task-update.actions";
import { Tristate } from "../../atlas-elements/common/tristate.enum";
import { LoadApplicableSitesAction } from '../../shared/actions/user.actions';

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class TaskListComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _tasks$: Observable<Immutable.List<TasksView>>;
  private _totalRecords$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _tasksLoading$: Observable<boolean>;
  private _keys = Immutable.List(['Id', 'Title', 'Status', 'Priority', 'TaskCategoryName', 'DueDate', 'CreatedByUserName', 'AssignedUserName']);
  private _isSiteFilter: boolean = false;

  private _viewTypeOptions: Immutable.List<AeSelectItem<TaskViewType>>;
  private _dueFilterOptions: Immutable.List<AeSelectItem<string>>;
  private _siteOptionList: Immutable.List<AeSelectItem<string>>;
  private _priorityOptions: Array<any>;
  private _statusOptions: Array<any>;
  private _actions: Immutable.List<AeDataTableAction>
  private _todoActionCommand = new Subject();
  private _inProgressActionCommand = new Subject();
  private _completeActionCommand = new Subject();
  private _updateTaskCommand = new Subject();
  private _removeTaskCommand = new Subject();
  private _taskViewFilter: TaskViewType;
  private _taskStatusFIlter: Array<any>;
  private _taskCategoryFilter: Array<any>;
  private _taskPriorityFlter: Array<any>;
  private _dataSouceType: AeDatasourceType;
  private _pagingInfo: PagingInfo;
  private _filters: Map<string, string>;
  private _taskCategories: TaskCategory[];
  private _taskCategoryOptions: Array<any>;
  private _todoActionSubsription: Subscription;
  private _inProgressActionSubsription: Subscription;
  private _completeActionSubscription: Subscription;
  private _updateTaskSubscription: Subscription;
  private _removeTaskSubscription: Subscription;
  private _siteStatusSubscription: Subscription;
  private _removableTask: TasksView;
  private _showRemoveDialog: boolean = false;
  private _taskViewDueFilter: string;
  private _defaultViewType: TaskViewType;
  // private _taskListSubscription: Subscription;
  private _taskCategoriesSubscription: Subscription;
  private isAdd: boolean = false;
  private isUpdate: boolean = false;
  private isDetails: boolean = false;
  private _objectType: string;
  private _taskCompleteWarningMessage: string;
  private _siteFilterDefaultValue: string;
  private _areTeamTasksSelected: boolean = false;
  private _departmentsListSubscription: Subscription;
  private _departmentsList: Immutable.List<AeSelectItem<Department>>;
  private _selectedDepartment: string = '';
  private _employeesListSubscription: Subscription;
  private _employeesList: Array<Employee>;
  private _selectedEmployee: Array<any>;
  private _taskCategoriesLoadTrigger: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _taskCategoriesLoadSubscription: Subscription;

  /**
     * Subscription
     * 
     * @private
     * @type {Subscription}
     * @memberOf TaskUpdateComponent
     */
  private _updateTaskCompleteSubscription: Subscription;
  // End of Private Fields

  // Public properties

  get viewTypeOptions(): Immutable.List<AeSelectItem<TaskViewType>> {
    return this._viewTypeOptions;
  }

  get taskPriorityFlter(): Array<any> {
    return this._taskPriorityFlter;
  }

  get taskViewFilter(): TaskViewType {
    return this._taskViewFilter;
  }

  get priorityOptions(): Array<any> {
    return this._priorityOptions;
  }

  get dataSouceType(): AeDatasourceType {
    return this._dataSouceType;
  }

  get taskStatusFIlter(): Array<any> {
    return this._taskStatusFIlter;
  }

  get statusOptions(): Array<any> {
    return this._statusOptions;
  }

  get dueFilterOptions(): Immutable.List<AeSelectItem<string>> {
    return this._dueFilterOptions;
  }

  get taskViewDueFilter(): string {
    return this._taskViewDueFilter;
  }

  get taskCategoryFilter(): Array<any> {
    return this._taskCategoryFilter;
  }

  get taskCategories(): TaskCategory[] {
    return this._taskCategories;
  }

  get areTeamTasksSelected(): boolean {
    return this._areTeamTasksSelected;
  }

  get departmentsList(): Immutable.List<AeSelectItem<Department>> {
    return this._departmentsList;
  }

  get selectedDepartment(): string {
    return this._selectedDepartment;
  }

  get selectedEmployee(): Array<any> {
    return this._selectedEmployee;
  }

  get employeesList(): Array<Employee> {
    return this._employeesList;
  }

  get isSiteFilter(): boolean {
    return this._isSiteFilter;
  }

  get siteOptionList(): Immutable.List<AeSelectItem<string>> {
    return this._siteOptionList;
  }

  get siteFilterDefaultValue(): string {
    return this._siteFilterDefaultValue;
  }

  get tasks$(): Observable<Immutable.List<TasksView>> {
    return this._tasks$;
  }

  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }

  get totalRecords$(): Observable<number> {
    return this._totalRecords$;
  }

  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }

  get tasksLoading$(): Observable<boolean> {
    return this._tasksLoading$;
  }

  get keys(): any {
    return this._keys;
  }

  get showRemoveDialog(): boolean {
    return this._showRemoveDialog;
  }

  get removableTask(): TasksView {
    return this._removableTask;
  }

  get taskCompleteWarningMessage(): string {
    return this._taskCompleteWarningMessage;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor

  constructor(_localeService: LocaleService,
    _translationService: TranslationService,
    _cdRef: ChangeDetectorRef,
    private _store: Store<fromRoot.State>,
    private _taskCategoryService: TaskCategoryService,
    private _taskService: TaskService,
    private _messenger: MessengerService,
    private _route: ActivatedRoute
    , private _claimshelper: ClaimsHelperService
    , private _userService: UserService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._taskViewFilter = TaskViewType.MyTasks;
    this._defaultViewType = TaskViewType.MyTasks;
    this._taskViewDueFilter = '';
    this._siteFilterDefaultValue = 'all';
    this._taskStatusFIlter = [{ name: 'In Progress', id: TaskStatus.InProgress }, { name: 'To Do', id: TaskStatus.ToDo }];
    this._dataSouceType = AeDatasourceType.Local;
    //Drop down data
    let optionsList = Immutable.List(
      [new AeSelectItem<TaskViewType>('My Tasks', TaskViewType.MyTasks, false),
      new AeSelectItem<TaskViewType>('Tasks I have assigned to others', TaskViewType.AssignedToOthers, false)
      ]);

    if (this._claimshelper.isHolidayAuthorizerOrManager()) {
      optionsList = optionsList.push(new AeSelectItem<TaskViewType>('My Team Tasks', TaskViewType.MyTeamTasks, false))
    }

    if (this._claimshelper.canViewCompanyAllTasks() || this._claimshelper.isAdministrator()) {
      optionsList = optionsList.push(new AeSelectItem<TaskViewType>('All Tasks', TaskViewType.All, false))
    }
    if (this._claimshelper.canViewUnassignedTasks()) {
      optionsList = optionsList.push(new AeSelectItem<TaskViewType>('Unassigned Tasks', TaskViewType.Unassigned, false));
    }

    this._viewTypeOptions = optionsList.sort((a, b) => { return a.Text > b.Text ? 1 : -1 }).toList();

    this._priorityOptions = [{ name: 'Immediate', id: Priority.Immediate }, { name: 'High', id: Priority.High }, { name: 'Medium', id: Priority.Medium }, { name: 'Low', id: Priority.Low }];
    this._statusOptions = [{ name: 'Complete', id: TaskStatus.Complete }, { name: 'In Progress', id: TaskStatus.InProgress }, { name: 'To Do', id: TaskStatus.ToDo }];
    this._dueFilterOptions = Immutable.List([
      new AeSelectItem<string>('All', '', false)
      , new AeSelectItem<string>('New tasks', '11', false)
      , new AeSelectItem<string>('Overdue tasks', '12', false)
      , new AeSelectItem<string>('Incomplete tasks', '13', false)
      , new AeSelectItem<string>('Due today', '14', false)
      , new AeSelectItem<string>('Due this week', '15', false)
      , new AeSelectItem<string>('Due next week', '16', false)
      , new AeSelectItem<string>('Unscheduled tasks', '58', false)
    ]);
    //End of drop data


    //Setting default filters
    this._filters = new Map<string, string>();
    this._filters.set('filterTaskView', TaskViewType.MyTasks.toString());
    this._filters.set('filterTaskStatus', TaskStatus.ToDo.toString() + ',' + TaskStatus.InProgress.toString());
    this._filters.set('TaskPriorityFilter', '');
    this._filters.set('filterTasksByDeadLine', this._taskViewDueFilter);

    //End of default filters



    //Action buttons
    this._actions = Immutable.List([
      new AeDataTableAction("To do", this._todoActionCommand),
      new AeDataTableAction("In progress", this._inProgressActionCommand),
      new AeDataTableAction("Complete", this._completeActionCommand, true),
      new AeDataTableAction("Update", this._updateTaskCommand),
      new AeDataTableAction("Remove", this._removeTaskCommand, false)
    ]);
    //End of action buittons
  }
  // End of constructor

  //Life cycle hooks

  ngOnInit(): void {
    this._tasksLoading$ = this._store.let(fromRoot.getTasksListLoadingData);
    this._taskService._setDefaultFitlers(this._filters);

    let taskCategories = this._store.let(fromRoot.getTaskCategoriesData);
    let params = this._route.params;
    let queryParams = this._route.queryParams;

    this._taskCategoriesLoadSubscription = taskCategories.subscribe((cats) => {
      this._taskCategories = cats;
      if (!isNullOrUndefined(cats) && !this._taskCategoriesLoadTrigger.getValue()) {
        this._taskCategoriesLoadTrigger.next(true);
      }
    });

    let combine = Observable.combineLatest(params, this._taskCategoriesLoadTrigger, queryParams, (params, catLoaded, queryParam) => {
      if (!isNullOrUndefined(params) && catLoaded) {
        let filterBy = params['filterBy'];
        let filterValue = params['filterValue'];
        if (filterBy == "category") {
          let categoryName = filterValue;
          let category = this._taskCategories.find(c => c.Name.toLowerCase() == categoryName.toLowerCase());
          let categoryId = "All";
          if (!isNullOrUndefined(category)) {
            categoryId = category.Id;
            this._taskViewDueFilter = AeInformationBarItemType.DueThisWeekTasks.toString();
            this._taskCategoryFilter = [{ Name: category.Name, Id: category.Id }];
            this._filters.set('filterTasksByDeadLine', this._taskViewDueFilter);
            if (category.Name.toLowerCase() == 'site visit') {
              //if site visit category is selected sites fitler should be visible
              this._isSiteFilter = true;
              if (!this._siteOptionList) {
                this._store.dispatch(new LoadApplicableSitesAction(true));
              }
            }
          }
          this._setFilters('filterTaskCategory', categoryId);
        }
        else if (filterBy == "view") {
          //let viewBy =  
          let filterCategory = params['filterCategory'];
          let dueFilter = queryParam['due'];
          //  NewTasks = 11, OverdueTasks = 12,IncompleteTasks = 13, DueTodayTask = 14, DueThisWeekTasks = 15,
          if (!isNullOrUndefined(dueFilter)) {
            if (dueFilter == '14') {
              this._taskViewDueFilter = AeInformationBarItemType.DueTodayTask.toString();
              this._filters.set('filterTasksByDeadLine', this._taskViewDueFilter);
            } else if (dueFilter == '15') {
              this._taskViewDueFilter = AeInformationBarItemType.DueThisWeekTasks.toString();
              this._filters.set('filterTasksByDeadLine', this._taskViewDueFilter);
            }
          }
          if (!isNullOrUndefined(filterCategory)) {
            let category = this._taskCategories.find(c => c.Name.toLowerCase() == filterCategory.toLowerCase());
            this._taskCategoryFilter = [{ Name: category.Name, Id: category.Id }];
            this._filters.set('filterTaskCategory', category.Id);
          }
          this._taskViewFilter = this._getViewFilterByName(filterValue);
          if (this._taskViewFilter === TaskViewType.MyTeamTasks) {
            this._areTeamTasksSelected = true;
            //Load all applicable departments
            if (isNullOrUndefined(this._departmentsList)) {
              this._userService._getDepartmentList();
            }

          }
          this._setFilters('filterTaskView', this._taskViewFilter.toString());
        }
        else {
          this._taskService._loadTasks();
        }
      }
    });
    this._taskCategoriesSubscription = combine.subscribe();


    this._taskCategoryService.getTaskCategories();

    //Subscription to get Site Location Option Data, using existing effect
    this._store.let(fromRoot.getApplicableSitesData).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        let _defualtOptions = [{ Id: "all", SiteNameAndPostcode: "All" }];
        let siteOptions = _defualtOptions.concat(res);
        this._siteOptionList = Immutable.List<AeSelectItem<string>>(createSelectOptionFromArrayList(siteOptions, "Id", "SiteNameAndPostcode"));
        this._cdRef.markForCheck();
      }
    });

    this._tasks$ = this._store.let(fromRoot.getTasksListData);
    this._totalRecords$ = this._store.let(fromRoot.getTasksListTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getTasksListDataTableOptions);

    this._todoActionSubsription = this._todoActionCommand.subscribe(task => {
      task = Object.assign({}, task, { Status: TaskStatus.ToDo });
      this._taskService._changeTaskStatus(task as TasksView)
    }
    );
    this._inProgressActionSubsription = this._inProgressActionCommand.subscribe(task => {
      task = Object.assign({}, task, { Status: TaskStatus.InProgress });
      this._taskService._changeTaskStatus(task as TasksView)
    });
    this._completeActionSubscription = this._completeActionCommand.subscribe(task => {
      task = Object.assign({}, task, { Status: TaskStatus.Complete });
      let taskView = task as TasksView;
      if (taskView.TaskCategoryName === 'Site Visit' && taskView.PercentageCompleted !== '100') {
        this._taskCompleteWarningMessage = 'ADD_TASK_FORM.SITEVISIT_TASK_COMPLETE_MESSAGE';
        this.isUpdate = true;
        let selectedTask = task as TasksView;
        this._onTaskSelect(selectedTask.Id);
      } else {
        this._taskService._changeTaskStatus(task as TasksView)
      }

    });
    this._updateTaskSubscription = this._updateTaskCommand.subscribe(task => {
      this.isUpdate = true;
      let selectedTask = task as TasksView;
      this._onTaskSelect(selectedTask.Id);
    });
    this._removeTaskSubscription = this._removeTaskCommand.subscribe(task => {
      if (!isNullOrUndefined(task)) {
        this._removableTask = task as TasksView;
        this._showRemoveDialog = true;
      }
    });


    this._departmentsListSubscription = this._store.let(fromRoot.getApplicableDepartmentsData).subscribe((departments) => {
      if (!isNullOrUndefined(departments)) {
        let deptList = new Array();

        departments.map((department) => {
          let selectItem = new AeSelectItem(department.Name, department.Id, false);
          deptList.push(selectItem);
        });

        this._departmentsList = Immutable.List(deptList);
        this._getEmployeesByDept(departments)
      }

    });

    this._employeesListSubscription = this._store.let(fromRoot.getDeptByEmployees).subscribe((employees) => {
      if (!isNullOrUndefined(employees)) {
        let empList = new Array();
        employees.map((employee) => {
          employee.FullName = employee.FirstName + ' ' + employee.Surname;
        });
        this._employeesList = employees;
      }
    })
    //getEmployeesData
  }

  private _getEmployeesByDept(departments: Department[]) {
    //Load all employees from all applicable/selected departments
    let deptIds = departments.map(department => department.Id).join(",")
    this._store.dispatch(new LoadDeptEmployeesAction(deptIds));
  }


  private _getViewFilterByName(viewName: string): TaskViewType {
    switch (viewName.toLowerCase()) {
      case 'mine':
        return TaskViewType.MyTasks
      case 'all':
        return TaskViewType.All
      case 'assignedtoothers':
        return TaskViewType.AssignedToOthers
      case 'myteam':
        return TaskViewType.MyTeamTasks
      default:
        return TaskViewType.MyTasks
    }
  }
  //End of life cycle hooks

  //Private methods 

  /**
   * method to return the task status
   * @param {number} status 
   * @returns 
   * 
   * @memberOf TaskListComponent
   */
  getStatus(status: number) {
    return this._taskService._getStatus(status);
  }

  /**
   * method to return the priority
   * @param {number} priority 
   * @returns 
   * 
   * @memberOf TaskListComponent
   */
  getPriority(priority: number) {
    switch (priority) {
      case Priority.Immediate:
        return 'Immediate';
      case Priority.High:
        return 'High';
      case Priority.Medium:
        return 'Medium';
      case Priority.Low:
        return 'Low';
    }
  }



  /**
   * method to remove the task and close the modal
   * @param {*} event 
   * 
   * @memberOf TaskListComponent
   */
  modalClosed(event: any) {
    if (event == 'yes') {
      this._taskService._removeTask(this._removableTask);
    }
    this._showRemoveDialog = false;
  }


  ngOnDestroy() {
    super.ngOnDestroy();
    this._todoActionSubsription.unsubscribe();
    this._inProgressActionSubsription.unsubscribe();
    this._completeActionSubscription.unsubscribe();
    this._updateTaskSubscription.unsubscribe();
    this._removeTaskSubscription.unsubscribe();
    this._taskCategoriesSubscription.unsubscribe();
    if (!isNullOrUndefined(this._updateTaskCompleteSubscription)) {
      this._updateTaskCompleteSubscription.unsubscribe();
    }
    if (this._siteStatusSubscription)
      this._siteStatusSubscription.unsubscribe();
    if (this._employeesListSubscription) {
      this._employeesListSubscription.unsubscribe();
    }
    if (this._departmentsListSubscription) {
      this._departmentsListSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._taskCategoriesLoadSubscription)) {
      this._taskCategoriesLoadSubscription.unsubscribe();
    }
  }


  /**
   * fires on page change
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskListComponent
   */
  onPageChange($event: any) {
    this._store.dispatch(new LoadTasksOnPageChangeAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
  }



  onSort($event: AeSortModel) {
    this._store.dispatch(new LoadTasksOnSortAction({ SortField: $event.SortField, Direction: $event.Direction }));
  }


  /**
   * task filter by task view type
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskListComponent
   */
  onViewTypeChange($event: any) {
    this._defaultViewType = $event.SelectedValue.toString();
    this._setFilters('filterTaskView', $event.SelectedValue.toString());
    this._areTeamTasksSelected = ($event.SelectedValue === TaskViewType.MyTeamTasks.toString());
    //Load all applicable departments
    if (this._areTeamTasksSelected) {
      if (isNullOrUndefined(this._departmentsList)) {
        this._userService._getDepartmentList();
      }
      //this._taskService.getUsersList();
    } else {
      //if team task is not selected then we should clear the department and task fitlers which are already there
      this._updateFilter('filterTasksByDept', '');
      this._updateFilter('filterTasksByDeptEmployee', '');
      this._dispatchTaskLoadAction();
    }
  }

  /**
   *  fires on priority filter change
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskListComponent
   */
  onPriorityFilterChanged($event: any) {
    const priorityFilterValues = $event.map((selectItem => selectItem.Value));
    if (!isNullOrUndefined(priorityFilterValues)) {
      this._setFilters('TaskPriorityFilter', priorityFilterValues.toString());
    }
  }

  /**
   * fires on priority filter clear
   * 
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskListComponent
   */
  onPriorityFilterCleared($event: any) {
    this._setFilters('TaskPriorityFilter', '');
  }

  /** 
   * Due filter change event
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskListComponent
   */
  onDueFilterChange($event: any) {
    this._setFilters('filterTasksByDeadLine', $event.SelectedValue.toString());
  }

  onSiteFilterChange($event: any) {
    if ($event.SelectedValue === 'all') {
      //in case of all, remove key from filter query param
      this._filters.delete('TaskSiteFilter');
      this._store.dispatch(new LoadTasksOnFilterChangeAction(this._filters));
    } else {
      this._setFilters('TaskSiteFilter', $event.SelectedValue.toString());
    }
  }



  /**
   * Category filter change event
   * 
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskListComponent
   */
  onCategoryFilterChanged($event: any) {
    const categoryFilterValues = $event.map((selectItem => selectItem.Value));
    if (!isNullOrUndefined(categoryFilterValues)) {

      //check for Site Visit categoy.
      if ($event.filter(selectItem => selectItem.Text == 'Site Visit').length > 0) {
        this._isSiteFilter = true;
        if (!this._siteOptionList) {
          this._store.dispatch(new LoadApplicableSitesAction(true));
        }
      } else {
        this._isSiteFilter = false;
      }

      this._setFilters('filterTaskCategory', categoryFilterValues.toString());
    }
    else {
      this._setFilters('filterTaskCategory', '');
    }
  }


  /**
   * Fires on category filter clear
   * 
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskListComponent
   */
  onCategoryFilterCleared($event: any) {
    this._setFilters('filterTaskCategory', 'All');
    this._isSiteFilter = false;
  }

  /**
   * Status filter change event
   * 
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskListComponent
   */
  onStatusFilterChanged($event: any) {
    const statusFilterValues = $event.map((selectItem => selectItem.Value));
    if (!isNullOrUndefined(statusFilterValues)) {
      this._setFilters('filterTaskStatus', statusFilterValues.toString());
    }
    else {
      this._setFilters('filterTaskStatus', '');
    }
  }


  /**
   * Fires on status filter clear
   * 
   * @private
   * @param {*} $event 
   * 
   * @memberOf TaskListComponent
   */
  onStatusFilterCleared($event: any) {
    this._setFilters('filterTaskStatus', '');

  }

  onDepartmentFilterChange($event: any) {
    if (!isNullOrUndefined($event.SelectedValue) && $event.SelectedValue != "") {
      this._setFilters('filterTasksByDept', $event.SelectedValue.toString());
    }
    else {
      this._setFilters('filterTasksByDept', null);
    }
    let department = new Department();
    department.Id = $event.SelectedValue;

    this._getEmployeesByDept(new Array(department));
    this._setFilters('filterTasksByDeptEmployee', '');
    this._selectedEmployee = [];
  }

  private _onDepartmentFilterCleared($event: any) {
    this._setFilters('filterTasksByDept', '');
  }

  onEmployeeFilterChange($event: any) {
    const employeeFilterValues = $event.map((employee => employee.Value));

    if (!isNullOrUndefined(employeeFilterValues)) {
      this._setFilters('filterTasksByDeptEmployee', employeeFilterValues.join(','));
    }
    else {
      this._setFilters('filterTasksByDeptEmployee', '');
    }
  }

  onEmployeeFilterCleared($event: any) {
    this._setFilters('filterTasksByDeptEmployee', '');
  }

  /**
   * Method to check if selected view type is 'Assigned TO Others'
   * 
   * @private
   * @returns 
   * 
   * @memberOf TaskListComponent
   */
  isAssignedToOthers() {
    return (this._defaultViewType.toString() === "2");
  }


  private _updateFilter(key: string, value: string) {
    if (this._filters === null) {
      this._filters = new Map<string, string>();
    }
    if (this._filters.has(key)) {
      this._filters.delete(key);
    }
    this._filters.set(key, value);
  }
  private _dispatchTaskLoadAction() {
    this._store.dispatch(new LoadTasksOnFilterChangeAction(this._filters));
  }
  /**
     * Method to set filters
     * 
     * @private
     * @param {string} key 
     * @param {string} value 
     * 
     * @memberOf TaskListComponent
     */
  private _setFilters(key: string, value: string) {
    this._updateFilter(key, value);
    this._dispatchTaskLoadAction();
  }

  /**
   * method to selected task
   * @param {string} taskId 
   * 
   * @memberOf TaskListComponent
   */
  _onTaskSelect(taskId: string) {
    this._taskService._onTaskSelect(taskId);
  }


  /**
   * to show task details slide out
   * 
   * @returns {boolean} 
   * 
   * @memberOf TaskListComponent
   */
  showDetailsSlideOut(): boolean {
    return this.isDetails;
  }


  /**
   * to show update task slide out
   * @returns {boolean} 
   * 
   * @memberOf TaskListComponent
   */
  showUpdateSlideOut(): boolean {
    return this.isUpdate;
  }

  /**
   * to show add task slide out
   * @returns {boolean} 
   * 
   * @memberOf TaskListComponent
   */
  showAddSlideOut(): boolean {
    return this.isAdd;
  }


  /**
   * on task information item click
   * @param {number} itemType 
   * 
   * @memberOf TaskListComponent
   */
  taskComponentItemClick(itemType: number) {
    this._taskViewDueFilter = itemType.toString();
    this._taskCategoryFilter = [];
    this._filters.set('filterTaskView', TaskViewType.MyTasks.toString());
    this._filters.set('filterTaskStatus', TaskStatus.ToDo.toString() + ',' + TaskStatus.InProgress.toString());
    this._filters.set('TaskPriorityFilter', '');
    this._filters.set('filterTaskCategory', '');
    this._filters.set('filterTasksByDeadLine', itemType.toString());
    this._setFilters('filterTaskCategory', '');
  }

  /**
   * to select task
   * @param {string} taskId 
   * 
   * @memberOf TaskListComponent
   */
  onTaskDetails(taskId: string) {
    this.isDetails = true;
    this._onTaskSelect(taskId)
  }


  /**
   * to update task
   * 
   * 
   * @memberOf TaskListComponent
   */
  onUpdate($event) {
    this.isUpdate = true;
    this._onTaskSelect($event);
  }

  /**
     * State of slide out
     * 
     * @private
     * @returns {string} 
     * 
     * @memberOf TaskUpdateComponent
     */
  getSlideoutState(): string {
    return this.isDetails || this.isAdd || this.isUpdate ? 'expanded' : 'collapsed';
  }

  /**
   * Event on cancel click
   * 
   * @private
   * @param {any} e 
   * 
   * @memberOf TaskUpdateComponent
   */
  onTaskCancel(event: any) {
    this.isDetails = false;
    this.isAdd = false;
    this.isUpdate = false;
    this._taskCompleteWarningMessage = null;
    //this._slideoutState = false;
  }

  /**
    * on task add click
    * @private
    * 
    * @memberOf TaskListComponent
    */
  private _onTaskAddClick() {
    this.isAdd = true;
  }

  onFormSubmit($event: TasksView) {
    this._store.dispatch(new UpdateTaskAction($event));
    this._taskCompleteWarningMessage = null;
    this._updateTaskCompleteSubscription = this._store.let(fromRoot.getTaskUpdateStatus).subscribe(res => {
      if (res.updated) {
        this._taskService._loadTasks();
        this.isDetails = false;
        this.isAdd = false;
        this.isUpdate = false;
        this._updateTaskCompleteSubscription.unsubscribe();
      }
    });
  }

  onAddTaskComplete($event: boolean) {
    if ($event === true) {
      this._taskService._loadTasks();
    }
    this.isDetails = false;
    this.isAdd = false;
    this.isUpdate = false;
  }
  /**
     * Slide out animation
     * 
     * @private
     * @returns {boolean} 
     * 
     * @memberOf TaskUpdateComponent
     */
  getSlideoutAnimateState(): boolean {
    return this.isDetails || this.isAdd || this.isUpdate ? true : false;
  }

  taskAddClick($event) {
    this.isAdd = true;
  }
  // End of private methods

  // Public methods
  // End of public methods
  lightClass: AeClassStyle = AeClassStyle.Light;
  darkClass: AeClassStyle = AeClassStyle.Dark;
  taskLegendOptions = [{ Text: "Immediate", Class: "indicator--Immediate" }, { Text: "High", Class: "indicator--High" }, { Text: "Medium", Class: "indicator--Medium" }, { Text: "Low", Class: "indicator--Low" }];
}