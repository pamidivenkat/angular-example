import { TaskCategory } from './../../../task/models/task-categoy';
import { LoadTaskCategories } from './../../../task/actions/task.list.actions';
import { RouteParams } from './../../../shared/services/route-params';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AePageChangeEventModel } from '../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { AeSortModel, SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeDataActionTypes } from '../../../employee/models/action-types.enum';
import { BaseComponent } from '../../../shared/base-component';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { TrainingCourse } from '../../../shared/models/training-course.models';
import * as fromRoot from '../../../shared/reducers';
import { TaskActivity, TaskSubAction, User } from '../../../task/models/task-activity';
import { Priority } from '../../../task/models/task-priority';
import { TaskStatus } from '../../../task/models/task-status';
import { RiskAssessmentHazard } from '../../models/risk-assessment-hazard';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { riskAssessmentTaskCategoryName } from './../../../shared/app.constants';

@Component({
  selector: 'further-control-measures',
  templateUrl: './further-control-measures.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FurtherControlMeasuresComponent extends BaseComponent implements OnInit, OnDestroy {
  private _riskAssessmentTasksList$: BehaviorSubject<Immutable.List<TaskActivity>>;
  private _riskAssessmentTasksListSubscription$: Subscription;
  private _currentRiskAssessmentId: string;
  private _currentRiskAssessmentIdSubscription$: Subscription;
  private _currentRiskAssessmentHazards: Array<RiskAssessmentHazard>;
  private _currentRiskAssessmentHazardsSubscription$: Subscription;
  private _totalCount$: Observable<number>;
  private _tasksListTableOptions$: Observable<DataTableOptions>;
  private _actions: Immutable.List<AeDataTableAction>;
  private _tasksListLoading$: Observable<boolean>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _slideOut: boolean;
  private _selectedRATask: TaskActivity;
  private _selectedRATaskSubscription$: Subscription;
  private _actionType: string;
  private _updateActionCommand = new Subject();
  private _removeActionCommand = new Subject();
  private _updateActionCommandSubscription$: Subscription;
  private _removeActionCommandSubscription$: Subscription;
  private _usersList: Immutable.List<AeSelectItem<string>>;
  private _usersListSubscription$: Subscription;
  private _trainingCoursesList: Immutable.List<TrainingCourse>;
  private _trainingCoursesListSubscription$: Subscription;
  private _removeConfirmation: boolean;
  private _apiRequestParams: AtlasApiRequestWithParams;
  private _updateFlag: boolean = false;
  private _keys = ['Id', 'Title', 'DueDate', 'SubObjectId'];
  private _taskCategoriesSub$: Subscription;
  private _taskCategories: TaskCategory[];
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _activatedRoute: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _riskAssessmentService: RiskAssessmentService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  ngOnInit() {
    this._taskCategoriesSub$ = this._store.let(fromRoot.getTaskCategoriesData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._taskCategories = res;
      } else {
        this._store.dispatch(new LoadTaskCategories(true));
      }

    });

    this._currentRiskAssessmentIdSubscription$ = this._store.let(fromRoot.getCurrentRiskAssessmentId).skipWhile(val => isNullOrUndefined(val)).subscribe((res) => {
      this._currentRiskAssessmentId = res;
    });

    this._currentRiskAssessmentHazardsSubscription$ = this._store.let(fromRoot.getRiskAssessmentHazardsData).skipWhile(val => isNullOrUndefined(val)).subscribe((res) => {
      this._currentRiskAssessmentHazards = res;
    });

    this._usersListSubscription$ = this._store.let(fromRoot.getUserListData).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._usersList = Immutable.List<AeSelectItem<string>>(res);
      } else {
        this._riskAssessmentService._loadUsersList();
      }
    })

    this._trainingCoursesListSubscription$ = this._store.let(fromRoot.getAllTrainingCourseList).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._trainingCoursesList = Immutable.List(res);
      } else {
        this._riskAssessmentService._loadTrainingCourses(null); //to load all atlas and non atlas we should send null
      }
    })

    this._riskAssessmentTasksList$ = new BehaviorSubject(Immutable.List([]));

    this._riskAssessmentTasksListSubscription$ = this._store.let(fromRoot.getRiskAssessmentTasksData).subscribe((res) => {
      if (isNullOrUndefined(res)) {
        this._initialLoadRATasks();
      }
      else {
        this._riskAssessmentTasksList$.next(Immutable.List<TaskActivity>(res));
      }
    });

    this._selectedRATaskSubscription$ = this._store.let(fromRoot.getRiskAssessmentTaskById).skipWhile(val => isNullOrUndefined(val)).subscribe((res) => {
      this._selectedRATask = res;
      if (this._updateFlag) {
        this._actionType = AeDataActionTypes.Update;
        this._slideOut = true;
      }
    });

    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateActionCommand, false),
      new AeDataTableAction("Remove", this._removeActionCommand, false)
    ]);

    this._totalCount$ = this._store.let(fromRoot.getRiskAssessmentTasksListTotalCount);
    this._tasksListTableOptions$ = this._store.let(fromRoot.getRiskAssessmentTasksListPageInformation);
    this._tasksListLoading$ = this._store.let(fromRoot.getRiskAssessmentTasksListLoadingStatus);

    this._updateActionCommandSubscription$ = this._updateActionCommand.subscribe(res => {
      let _res = <TaskActivity>res;
      this._updateFlag = true;
      this._riskAssessmentService._loadSelectedRATask(_res.Id);
    })

    this._removeActionCommandSubscription$ = this._removeActionCommand.subscribe(res => {
      this._selectedRATask = res as TaskActivity;
      this._removeConfirmation = true;
    })
  }

  ngOnDestroy() {
    if (this._currentRiskAssessmentIdSubscription$) {
      this._currentRiskAssessmentIdSubscription$.unsubscribe();
    }

    if (this._currentRiskAssessmentHazardsSubscription$) {
      this._currentRiskAssessmentHazardsSubscription$.unsubscribe();
    }

    if (this._usersListSubscription$) {
      this._usersListSubscription$.unsubscribe();
    }

    if (this._updateActionCommandSubscription$) {
      this._updateActionCommandSubscription$.unsubscribe();
    }

    if (this._removeActionCommandSubscription$) {
      this._removeActionCommandSubscription$.unsubscribe();
    }

    if (this._trainingCoursesListSubscription$) {
      this._trainingCoursesListSubscription$.unsubscribe();
    }

    if (this._riskAssessmentTasksListSubscription$) {
      this._riskAssessmentTasksListSubscription$.unsubscribe();
    }

    if (this._selectedRATaskSubscription$) {
      this._selectedRATaskSubscription$.unsubscribe();
    }
  }

  private _initialLoadRATasks() {
    if (isNullOrUndefined(this._apiRequestParams))
      this._apiRequestParams = <AtlasApiRequestWithParams>{};
    this._apiRequestParams.PageNumber = 1;
    this._apiRequestParams.PageSize = 10;
    this._apiRequestParams.SortBy = <AeSortModel>{};
    this._apiRequestParams.SortBy.Direction = SortDirection.Ascending;
    this._apiRequestParams.SortBy.SortField = 'Title';
    this._apiRequestParams.Params = [];
    this._apiRequestParams.Params.push(new AtlasParams('filterByRegObjId', this._currentRiskAssessmentId));
    this._riskAssessmentService._loadRiskAssessmentTasks(this._apiRequestParams);
  }

  addRATask() {
    this._actionType = AeDataActionTypes.Add;
    this._slideOut = true;
  }

  onPageChange(pagingInfo: AePageChangeEventModel) {
    this._apiRequestParams.PageNumber = pagingInfo.pageNumber;
    this._apiRequestParams.PageSize = pagingInfo.noOfRows;
    this._riskAssessmentService._loadRiskAssessmentTasks(this._apiRequestParams);
  }

  onSort(sortModel: AeSortModel) {
    this._apiRequestParams.SortBy = sortModel;
    this._riskAssessmentService._loadRiskAssessmentTasks(this._apiRequestParams);
  }

  saveRATask(_task: any) {
    this._slideOut = false;
    this._updateFlag = false;
    let raTask: TaskActivity = <TaskActivity>{};
    raTask.TaskSubAction = <TaskSubAction>{};
    raTask.AssignedUser = <User>{};
    let _user: AeSelectItem<string> = this._usersList.find(obj => obj.Value === _task.AssignedUser);
    let riskAssessmentTaskCategory: TaskCategory = this._taskCategories.find(obj => obj.Name.toLowerCase() === riskAssessmentTaskCategoryName);
    if (this._actionType === AeDataActionTypes.Add) {
      raTask.Title = _task.Title;
      raTask.Description = _task.Description;
      raTask.AssignedTo = _task.AssignedUser;
      raTask.DueDate = !isNullOrUndefined(_task.DueDate) && _task.DueDate !== '' ? _task.DueDate.toISOString() : null;
      raTask.TaskSubAction.CourseId = _task.SelectedCourse;
      raTask.TaskSubAction.IndividualToTrain = _task.IndividualToTrain;
      raTask.TaskSubAction.SubActionType = _task.SubActionType;
      raTask.TaskSubAction.SubObjectId = _task.SelectedRAHazard ? _task.SelectedRAHazard : 0;
      raTask.IsCancelled = false;
      raTask.Priority = Priority.Medium;
      raTask.Status = TaskStatus.ToDo;
      raTask.RegardingObjectId = this._currentRiskAssessmentId;
      raTask.Constants = { DefaultDateFormat: "dd/MM/yyyy" };
      if (!isNullOrUndefined(_user)) {
        raTask.AssignedUser.Id = _user.Value;
        raTask.AssignedUser.FullName = _user.Text;
      } else {
        raTask.AssignedUser = null
      }

      raTask.TaskCategoryId = !isNullOrUndefined(riskAssessmentTaskCategory) ? riskAssessmentTaskCategory.Id : '';
      raTask.RegardingObjectTypeCode = '30';
      this._riskAssessmentService._createRATask(raTask);
    } else if (this._actionType === AeDataActionTypes.Update) {
      this._selectedRATask.Title = _task.Title;
      this._selectedRATask.Description = _task.Description;
      this._selectedRATask.DueDate = !isNullOrUndefined(_task.DueDate) && _task.DueDate !== '' ? _task.DueDate.toISOString() : null;
      this._selectedRATask.AssignedTo = _task.AssignedUser;
      if (!isNullOrUndefined(this._selectedRATask.TaskSubAction)) {
        this._selectedRATask.TaskSubAction.CourseId = _task.SelectedCourse;
        this._selectedRATask.TaskSubAction.IndividualToTrain = _task.IndividualToTrain;
        this._selectedRATask.TaskSubAction.SubActionType = _task.SubActionType;
        this._selectedRATask.TaskSubAction.SubObjectId = _task.SelectedRAHazard ? _task.SelectedRAHazard : 0;
      }
      else {
        this._selectedRATask.TaskSubAction = null;
      }
      if (!isNullOrUndefined(_user)) {
        if (isNullOrUndefined(this._selectedRATask.AssignedUser)) {
          this._selectedRATask.AssignedUser = <User>{};
        }

        this._selectedRATask.AssignedUser.Id = _user.Value;
        this._selectedRATask.AssignedUser.FullName = _user.Text;
      } else {
        this._selectedRATask.AssignedUser = null;
      }
      this._riskAssessmentService._updateRATask(this._selectedRATask);
    }
  }

  removeRATask(e) {
    this._removeConfirmation = false;
    this._selectedRATask.RegardingObjectId = this._currentRiskAssessmentId;
    this._riskAssessmentService._removeRATask(this._selectedRATask);
  }

  getPictureUrl(subObjectId) {
    if (!isNullOrUndefined(this._currentRiskAssessmentHazards)) {
      let hazard = this._currentRiskAssessmentHazards.find(obj => obj.Id == subObjectId);
      if (!isNullOrUndefined(hazard)) {
        if (!isNullOrUndefined(hazard.PictureId))
          if (hazard.IsSharedPrototype) {
            return ("/filedownload?documentId=" + hazard.PictureId + "&isSystem=true")
          } else {
            return this._routeParamsService.Cid ? ("/filedownload?documentId=" + hazard.PictureId + "$cid=" + this._routeParamsService.Cid) : ("/filedownload?documentId=" + hazard.PictureId);
          }
        else
          return '/assets/images/hazard-default.png';
      }
    }
  }

  getSlideoutState(): string {
    return this._slideOut ? 'expanded' : 'collapsed';
  }

  closeSlideOut(e) {
    this._slideOut = false;
  }

  removeConfirmModalClosed(e) {
    this._removeConfirmation = false;
  }

  get selectedRATask() {
    return this._selectedRATask;
  }

  get raTasksList() {
    return this._riskAssessmentTasksList$;
  }

  get totalCount() {
    return this._totalCount$;
  }

  get tableActions() {
    return this._actions;
  }

  get actionType() {
    return this._actionType;
  }

  get tableOptions() {
    return this._tasksListTableOptions$;
  }

  get dataLoading() {
    return this._tasksListLoading$;
  }

  get keys(): any {
    return this._keys;
  }

  get lightClass() {
    return this._lightClass;
  }

  get slideOut() {
    return this._slideOut;
  }

  get raHazardsList() {
    return this._currentRiskAssessmentHazards;
  }

  get companyUsersList() {
    return this._usersList;
  }

  get trainingCoursesList() {
    return this._trainingCoursesList;
  }

  get removeConfirmation() {
    return this._removeConfirmation;
  }

  get selectedTaskName() {
    return this._selectedRATask.Title;
  }

  get updateActionCommand() {
    return this._updateActionCommand;
  }

  get removeActionCommand() {
    return this._removeActionCommand;
  }

  get updateFlag() {
    return this._updateFlag;
  }
}
