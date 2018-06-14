import { TodaysOverviewLoadAction } from '../../actions/todays-overview.actions';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { BaseComponent } from '../../../shared/base-component';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { LoadTasksInfoAction } from '../../actions/tasks.actions';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { TasksInfo } from '../../models/tasks-info';
import { Observable, Subject } from 'rxjs/Rx';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { TaskCategories } from '../../common/taskcategories.enum';
@Component({
  selector: 'dashboard-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TaskComponent extends BaseComponent implements OnInit {
  // Private members
  private _tasksInfo$ = new Subject<TasksInfo[]>();
  private _iconSize: AeIconSize = AeIconSize.medium;
  private _tasksList: TasksInfo[];
  private _dataLoaded: boolean;
  private taskAddSlideoutState: boolean;
  private _applyScroll: boolean = true;
  private _maxHeight: string = '20em';
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of private members

  get iconSize(): AeIconSize {
    return this._iconSize;
  }
  get dataLoaded(): boolean {
    return this._dataLoaded;
  }
  get tasksList(): TasksInfo[] {
    return this._tasksList;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  // constructor
  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._dataLoaded = false;
    this._store.dispatch(new LoadTasksInfoAction(true));
    this._store.let(fromRoot.getTasksInfoData).subscribe((res) => {
      this._tasksList = [];
      for (let key in res.entities) {
        this._tasksList.push(new TasksInfo(key, Number(res.entities[key])));
      }
      this._tasksInfo$.next(this._tasksList);
      this._dataLoaded = res.loaded;
      this.taskAddSlideoutState = false;
      this._cdRef.markForCheck();
    });
  }
  // End of constructor

  // Component life cycle evants
  ngOnInit(): void {
    super.ngOnInit();
  }
  // End of component life cycle events

  // private methods
   canAddTask(): boolean {
    return !this._claimsHelper.IsPublicUser();
  }
  private _getTaskIcon(task): string {
    return task.icon;
  }

  indicatorText(count: number): string {
    if (count > 99) {
      return "99+";
    }
    return count.toString();
  }

  addTask(): void {
    this.taskAddSlideoutState = true;;
  }
  getSlideoutState(): string {
    return this.taskAddSlideoutState ? 'expanded' : 'collapsed';
  }

  getSlideoutAnimateState(): boolean {
    return this.taskAddSlideoutState ? true : false;
  }

  onTaskCancel(event: any) {
    this.taskAddSlideoutState = false;
  }


  onAddTaskComplete($event: boolean) {
     this._store.dispatch(new TodaysOverviewLoadAction({ EmployeeId: this._claimsHelper.getEmpIdOrDefault() }));
    this.taskAddSlideoutState = false;
  }

  public canAddTaskBeShown(): boolean {
    return !this._claimsHelper.IsPublicUser();
  }

  getIcon(taskCategory: string): string {
    let _icon: string = '';
    switch (taskCategory) {
      case 'Accident Log':
        _icon = 'icon-accident';
        break;
      case 'Checklist':
        _icon = 'icon-checklist';
        break;
      case 'Documents':
        _icon = 'icon-to-review';
        break;
      case 'General':
        _icon = 'icon-settings';
        break;
      case 'Method Statement':
        _icon = 'icon-processing';
        break;
      case 'Personal':
        _icon = 'icon-person';
        break;
      case 'Risk Assessment':
        _icon = 'icon-alert-triangle';
        break;
      case 'Site Visit':
        _icon = 'icon-house';
        break;
      case 'Training':
        _icon = 'icon-education';
        break;
      default:
        _icon = 'icon-default';
    }
    return _icon;
  }
  // End of private methods
  private getMaxHeight(): string {
    if (this._applyScroll && !StringHelper.isNullOrUndefinedOrEmpty(this._maxHeight)) {
      return this._maxHeight;
    }
    return null;
  }

  hasScroll(): boolean {
    if (this._applyScroll) {
      return true;
    }
    return null;
  }
}
