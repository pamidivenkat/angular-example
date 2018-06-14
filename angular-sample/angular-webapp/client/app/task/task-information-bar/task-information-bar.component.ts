import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { TasksView } from '../models/task';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { BaseComponent } from '../../shared/base-component';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import * as fromRoot from '../../shared/reducers/index';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { LoadTaskHeadBannerAction } from '../actions/task-information-bar.actions';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';

@Component({
  selector: 'task-information-bar',
  templateUrl: './task-information-bar.component.html',
  styleUrls: ['./task-information-bar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskInformationBarComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  /**
   * Variable to hold the component bar items
   * @private
   * @type {Observable<AeInformationBarItem[]>}
   * @memberOf AeInformationBarItem
   */
  taskInformationBarItems: AeInformationBarItem[];

  /**
   * Variable to hold subscription
   * @private
   * @type {Subscription}
   * @memberOf TaskInformationBarComponent
   */
  private _taskInformationBarItemsSubscription: Subscription;

  private _taskComponentItemClick: EventEmitter<number>;
  private _taskAddClick: EventEmitter<string>;
  // End of Private Fields

  // Public properties
  // End of Public properties

  // Public Output bindings

  @Output('taskComponentItemClick')
  get taskComponentItemClick() {
    return this._taskComponentItemClick;
  }

  @Output('taskAddClick')
  get taskAddClick() {
    return this._taskAddClick;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Tasks;
  }
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings


  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(_localeService: LocaleService,
    _translationService: TranslationService,
    _cdRef: ChangeDetectorRef,
    private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService,
  ) {
    super(_localeService, _translationService, _cdRef);
    this._taskComponentItemClick = new EventEmitter<number>();
    this._taskAddClick = new EventEmitter<string>();
  }
  // End of constructor

  // Private methods
  ngOnInit() {
    this._store.dispatch(new LoadTaskHeadBannerAction(true));
    this._taskInformationBarItemsSubscription = this._store.let(fromRoot.getTaskHeadBannerData).subscribe(data => {
      if (data) {
        this.taskInformationBarItems = data;
        this._cdRef.markForCheck();
      }
    });
  }

  canAddTask(): boolean {
    return !this._claimsHelper.IsPublicUser();
  }
  onAddClick(e) {
    this._taskAddClick.emit('add');
  }

  ngOnDestroy() {
    this._taskInformationBarItemsSubscription.unsubscribe();
  }

  informationItemSelected(aeInformationBarItem: AeInformationBarItem) {
    this._taskComponentItemClick.emit(aeInformationBarItem.Type);
  }
  // End of private methods

  // Public methods
  // End of public methods
}
