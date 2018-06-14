import { User } from '../../../../shared/models/user';
import { AeSplitButtonOption } from '../../../../atlas-elements/common/models/ae-split-button-options';
import { TrainingCourse } from '../../../models/training-course';
import { getAeSelectItemsFromEnum } from '../../../../employee/common/extract-helpers';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { TrainingStatus } from '../../../models/training-status';
import { TrainingCourseUserModule } from '../../../models/training-course-user-module';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { Store } from '@ngrx/store';
import { AePageChangeEventModel } from '../../../../atlas-elements/common/models/ae-page-change-event-model';
import { TrainingCourseService } from '../../services/training-courses.service';
import { AeSortModel, SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { isNullOrUndefined } from 'util';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, EventEmitter, ViewEncapsulation } from '@angular/core';
import * as fromRoot from '../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { BreadcrumbService } from "../../../../atlas-elements/common/services/breadcrumb-service";
import { IBreadcrumb } from "../../../../atlas-elements/common/models/ae-ibreadcrumb.model";

@Component({
  selector: 'training-course-invite',
  templateUrl: './training-course-invite.component.html',
  styleUrls: ['./training-course-invite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TrainingCourseInviteComponent extends BaseComponent implements OnInit, OnDestroy {

  //private fields start here
  private _routeSubscription: Subscription;
  private _courseId: string;
  private _example: boolean = false;
  private _trainingCourseUserModuleApiRequestParams: AtlasApiRequestWithParams;
  private _selectedTrainingCourseApiRequestParams: AtlasApiRequestWithParams;
  private _totalRecords$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _loadingStatus$: Observable<boolean>;
  private _trainingCourseUserModuleData$: Observable<Immutable.List<TrainingCourseUserModule>>;
  private _keys = Immutable.List(['Email', 'FirstName', 'Id', 'IsModuleDeleted', 'LastName', 'PassDate', 'StartDate', 'Status', 'Title', 'UserName', 'HasEmail']);
  private _trainingUsercourseModuleSubscription: Subscription;
  private _statusTypes: Immutable.List<AeSelectItem<number>>;
  private _statusTypesList: Immutable.List<AeSelectItem<number>>;
  private _defaultOptions: Immutable.List<AeSelectItem<number>>;
  private _selectedStatus: string;
  private _selectedCourseData: TrainingCourse;
  private _selectedCourseModuleSubscription: Subscription;
  private _showAssignTraineesSlideOut: boolean = false;
  private _action: string;
  private _assignTraineesCommand = new Subject<boolean>();
  private _invitePublicUsersCommand = new Subject<boolean>();
  private _splitButtonOptions: any[] = [
    new AeSplitButtonOption<boolean>('Assign Trainees', this._assignTraineesCommand, false),
    new AeSplitButtonOption<boolean>('Invite public user', this._invitePublicUsersCommand, false),
  ];
  private _assignedUserInviteStatusSubscription: Subscription;
  private _publicUserSubscription: Subscription;
  private _actions: Immutable.List<AeDataTableAction>;
  private _removeCommand = new Subject();
  private _reInviteCommand = new Subject();
  private _userRemovalSubscription: Subscription;
  private _userReInviteSubscription: Subscription;
  private _selectedUser: User;
  private _removeUserPopup: boolean = false;
  private _removeOrReInviteStatusSubscription: Subscription;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  //private fields end here

  get splitButtonOptions(): any[] {
    return this._splitButtonOptions;
  }

  get statusTypes(): Immutable.List<AeSelectItem<number>> {
    return this._statusTypes;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Training;
  }

  get selectedStatus(): string {
    return this._selectedStatus;
  }

  get trainingCourseUserModuleData$(): Observable<Immutable.List<TrainingCourseUserModule>> {
    return this._trainingCourseUserModuleData$;
  }

  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }

  get totalRecords$(): Observable<number> {
    return this._totalRecords$;
  }

  get loadingStatus$(): Observable<boolean> {
    return this._loadingStatus$;
  }

  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }

  get keys(): any {
    return this._keys;
  }

  get showAssignTraineesSlideOut(): boolean {
    return this._showAssignTraineesSlideOut;
  }

  get courseId(): string {
    return this._courseId;
  }

  get selectedCourseData(): TrainingCourse {
    return this._selectedCourseData;
  }

  get action(): string {
    return this._action;
  }

  get removeUserPopup(): boolean {
    return this._removeUserPopup;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get SelectedUserName() {
    return this._selectedUser.FirstName + ' ' + this._selectedUser.LastName;
  }
  //constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _route: ActivatedRoute
    , private _TrainingCourseService: TrainingCourseService
    , private _store: Store<fromRoot.State>
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    this._defaultOptions = Immutable.List([
      new AeSelectItem<number>('All statuses', null, false),
    ]);
    this._actions = Immutable.List([
      new AeDataTableAction("Re-invite", this._reInviteCommand, false),
      new AeDataTableAction("Remove", this._removeCommand, false)
    ]);

    const bcItem: IBreadcrumb = { isGroupRoot: false, group: BreadcrumbGroup.Training, label: 'Invite', url: '' };
    this._breadcrumbService.add(bcItem);
  }
  //constructor end here
  //init start
  ngOnInit() {
    let queryParams = this._route.queryParams;
    let params = this._route.params;
    let routeParamsCombine = Observable.combineLatest(params, queryParams, (param, queryParam) => {
      if (!isNullOrUndefined(param['id'])) {
        this._courseId = param['id'];
        let example = queryParam['example'];
        if (example === "true") {
          this._example = true;
        }
        this._loadTrainingUserModules();
        this._loadselectedTrainingCourse();
      }
    });
    this._routeSubscription = routeParamsCombine.subscribe();
    this._statusTypesList = getAeSelectItemsFromEnum(TrainingStatus);
    this._statusTypes = Immutable.List(this._defaultOptions.toArray().concat(this._statusTypesList.toArray()));
    this._selectedCourseModuleSubscription = this._store.let(fromRoot.getTrainingSelectedModuleData).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        this._selectedCourseData = res;
      }
    });
    this._trainingCourseUserModuleData$ = this._store.let(fromRoot.getTrainingCourseUserModulesData);
    this._loadingStatus$ = this._store.let(fromRoot.getTrainingCourseUserModulesDataLoading);
    this._totalRecords$ = this._store.let(fromRoot.getTrainingCourseUserModulesTotalRecords);
    this._dataTableOptions$ = this._store.let(fromRoot.getTrainingCourseUserModulesDataTableoptions);
    this._assignedUserInviteStatusSubscription = this._store.let(fromRoot.getAssignedUsersInviteStatus).subscribe((value) => {
      if (value) {
        this._loadTrainingUserModules();
      }
    });
    this._publicUserSubscription = this._store.let(fromRoot.getPublicUserInviteStatus).subscribe((value) => {
      if (value) {
        this._loadTrainingUserModules();
      }
    });
    this._assignTraineesCommand.subscribe(() => {
      this._showAssignTraineesSlideOut = true;
      this._action = "AssignUsers";
    });
    this._invitePublicUsersCommand.subscribe(() => {
      this._showAssignTraineesSlideOut = true;
      this._action = "InvitePublicUser";
    });
    this._userRemovalSubscription = this._removeCommand.subscribe(user => {
      this._selectedUser = user as User;
      this._removeUserPopup = true;
    });
    this._userReInviteSubscription = this._reInviteCommand.subscribe(user => {
      this._selectedUser = user as User;
      let userArray: Array<any> = [];
      userArray.push(this._selectedUser);
      userArray.push("reinvite");
      this._TrainingCourseService.removeOrReInviteAssignedUser(userArray);
    });
    this._removeOrReInviteStatusSubscription = this._store.let(fromRoot.getRemoveOrReInviteStatus).subscribe((value) => {
      if (value) {
        this._loadTrainingUserModules();
      }
    });
  }
  //init ends
  //private method start
  private _loadTrainingUserModules() {
    this._trainingCourseUserModuleApiRequestParams = <AtlasApiRequestWithParams>{};
    this._trainingCourseUserModuleApiRequestParams.PageNumber = 1;
    this._trainingCourseUserModuleApiRequestParams.PageSize = 10;
    this._trainingCourseUserModuleApiRequestParams.SortBy = <AeSortModel>{};
    this._trainingCourseUserModuleApiRequestParams.SortBy.Direction = SortDirection.Ascending;
    this._trainingCourseUserModuleApiRequestParams.SortBy.SortField = 'StartDate';
    this._trainingCourseUserModuleApiRequestParams.Params = [];
    this._trainingCourseUserModuleApiRequestParams.Params.push(new AtlasParams('CourseInviteesFilter', this._courseId));
    this._trainingCourseUserModuleApiRequestParams.Params.push(new AtlasParams('CourseInviteesNameFilter', null));
    this._trainingCourseUserModuleApiRequestParams.Params.push(new AtlasParams('CourseInviteesStatusFilter', null));
    this._trainingCourseUserModuleApiRequestParams.Params.push(new AtlasParams('fields', 'Id,AssignedUser.FirstName,AssignedUser.LastName,AssignedUser.Email,AssignedUser.HasEmail,AssignedUser.UserName,SelectedModule.Title,StartDate,PassDate,Status,SelectedModule.IsDeleted as IsModuleDeleted'));
    this._TrainingCourseService.LoadTrainingCourseUserModule(this._trainingCourseUserModuleApiRequestParams);
  }

  private _loadselectedTrainingCourse() {
    this._selectedTrainingCourseApiRequestParams = <AtlasApiRequestWithParams>{};
    this._selectedTrainingCourseApiRequestParams.Params = [];
    this._selectedTrainingCourseApiRequestParams.Params.push(new AtlasParams('CourseId', this._courseId));
    if (!isNullOrUndefined(this._example))
      this._selectedTrainingCourseApiRequestParams.Params.push(new AtlasParams('example', this._example));
    this._TrainingCourseService.LoadTrainingCourseSelectedModules(this._selectedTrainingCourseApiRequestParams);
  }
  //private method end here
  //public methods start
  public onPageChange(pagingInfo: AePageChangeEventModel) {
    this._trainingCourseUserModuleApiRequestParams.PageNumber = pagingInfo.pageNumber;
    this._trainingCourseUserModuleApiRequestParams.PageSize = pagingInfo.noOfRows;
    this._TrainingCourseService.LoadTrainingCourseUserModule(this._trainingCourseUserModuleApiRequestParams);
  }
  public onPageSort(sortModel: AeSortModel) {
    this._trainingCourseUserModuleApiRequestParams.SortBy = sortModel;
    this._TrainingCourseService.LoadTrainingCourseUserModule(this._trainingCourseUserModuleApiRequestParams);
  }
  public getStatusText(status: TrainingStatus): string {
    switch (status) {
      case TrainingStatus.Passed:
        return 'Passed';
      case TrainingStatus.Pending:
        return 'Pending';
      case TrainingStatus.Failed:
        return 'Failed';
      case TrainingStatus.Complete:
        return 'Complete';
      case TrainingStatus.Incomplete:
        return 'Incomplete';
    }
    return '';
  }
  public onChangeStatus($event: any) {
    this._selectedStatus = $event.SelectedValue;
    this._trainingCourseUserModuleApiRequestParams.Params.forEach((element) => {
      if (element.Key == 'CourseInviteesStatusFilter') {
        element.Value = this._selectedStatus;
      }
    })
    this._TrainingCourseService.LoadTrainingCourseUserModule(this._trainingCourseUserModuleApiRequestParams);
  }
  public onTariningCourseFilterChange($event: any) {
    this._trainingCourseUserModuleApiRequestParams.Params.forEach((element) => {
      if (element.Key == 'CourseInviteesNameFilter') {
        element.Value = $event.event.target.value;
      }
    })
    this._TrainingCourseService.LoadTrainingCourseUserModule(this._trainingCourseUserModuleApiRequestParams);
  }
  public getSlideoutState() {
    return this._showAssignTraineesSlideOut ? 'expanded' : 'collapsed';;
  }
  public getSlideoutAnimateState(): boolean {
    return this._showAssignTraineesSlideOut;
  }
  public onCancel() {
    this._showAssignTraineesSlideOut = false;
  }
  public onSubmit() {
    this._showAssignTraineesSlideOut = false;
  }
  public onSplitBtnClick(event: any) {
  }
  public onRemove() {
    this._removeUserPopup = false;
    let userArray: Array<any> = [];
    userArray.push(this._selectedUser);
    userArray.push("delete");
    this._TrainingCourseService.removeOrReInviteAssignedUser(userArray);
  }
  public modalClosed($event: any) {
    this._removeUserPopup = false;
  }
  getEmailStatus(status: boolean): string {
    return status ? "Yes" : "No";
  }
  //public method end here
  ngOnDestroy() {
    if (this._routeSubscription)
      this._routeSubscription.unsubscribe();
    if (this._selectedCourseModuleSubscription)
      this._selectedCourseModuleSubscription.unsubscribe();
    if (this._trainingUsercourseModuleSubscription)
      this._trainingUsercourseModuleSubscription.unsubscribe();
    if (this._assignTraineesCommand)
      this._assignTraineesCommand.unsubscribe();
    if (this._invitePublicUsersCommand)
      this._invitePublicUsersCommand.unsubscribe();
    if (this._assignedUserInviteStatusSubscription)
      this._assignedUserInviteStatusSubscription.unsubscribe();
    if (this._publicUserSubscription)
      this._publicUserSubscription.unsubscribe();
    if (this._userRemovalSubscription)
      this._userRemovalSubscription.unsubscribe();
    if (this._userReInviteSubscription)
      this._userReInviteSubscription.unsubscribe();
    if (this._removeOrReInviteStatusSubscription)
      this._removeOrReInviteStatusSubscription.unsubscribe();
  }
}
