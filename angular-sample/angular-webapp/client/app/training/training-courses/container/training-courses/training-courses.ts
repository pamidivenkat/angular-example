import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Tristate } from '../../../../atlas-elements/common/tristate.enum';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { isNullOrUndefined } from 'util';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { AePageChangeEventModel } from '../../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeSortModel } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { TrainingCourse, TrainingModule } from '../../..//models/training-course';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import {
    TrainingCoursesLoad
} from '../../actions/training-courses.actions';
import { AeInformationBarItem } from '../../../../atlas-elements/common/models/ae-informationbar-item';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import * as fromRoot from '../../../../shared/reducers';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromConstants from '../../../../shared/app.constants';
import { TrainingCourseService } from '../../services/training-courses.service';
import { Router, NavigationExtras } from '@angular/router';
import { RouteParams } from '../../../../shared/services/route-params';
import { StringHelper } from '../../../../shared/helpers/string-helper';

@Component({
    selector: 'training-courses',
    templateUrl: './training-courses.html',
    styleUrls: ['./training-courses.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingCoursesComponent extends BaseComponent implements OnInit, OnDestroy {
    // Private Fields
    private _totalRecords$: Observable<number>;
    private _dataTableOptions$: Observable<DataTableOptions>;
    private _actions: Immutable.List<AeDataTableAction>;
    private _courses$: Observable<Immutable.List<TrainingCourse>>;
    private _loadingStatus$: Observable<boolean>;
    private _archiveTrainingCourseCommand = new Subject();
    private _reinstateTrainingCourseCommand = new Subject();
    private _removeTrainingCourseCommand = new Subject();
    private _updateTrainingCourseCommand = new Subject();
    private _archiveTrainingCourseSubscription: Subscription;
    private _reinstateTrainingCourseSubscription: Subscription;
    private _removeTrainingCourseSubscription: Subscription;
    private _updateTrainingCourseSubscription: Subscription;
    private _selectedTainingCourse: TrainingCourse;
    private _isArchive: boolean = false;
    private _isReinstate: boolean = false;
    private _isRemove: boolean = false;
    private _isAdd: boolean = false;
    private _isUpdate: boolean = false;
    private _actionType: String = "";
    private _trainingModules: TrainingModule[]
    private _getTrainingModuleSubscription$: Subscription;
    private _getSelectedTrainingModuleSubscription$: Subscription;
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _inviteTrainingCourseCommand = new Subject();
    private _inviteTrainingCourseSubscription: Subscription;
    private _selectedTrainingCourseApiRequestParams: AtlasApiRequestWithParams;

    get actions(): Immutable.List<AeDataTableAction> {
        return this._actions;
    }

    get totalRecords$(): Observable<number> {
        return this._totalRecords$;
    }

    get courses$(): Observable<Immutable.List<TrainingCourse>> {
        return this._courses$;
    }

    get dataTableOptions$(): Observable<DataTableOptions> {
        return this._dataTableOptions$;
    }

    get lightClass(): AeClassStyle {
        return this._lightClass;
    }

    get isArchive(): boolean {
        return this._isArchive;
    }

    get isRemove(): boolean {
        return this._isRemove;
    }

    get isReinstate(): boolean {
        return this._isReinstate;
    }

    get loadingStatus$(): Observable<boolean> {
        return this._loadingStatus$;
    }

    get addOrUpdate(): boolean {
        return this._isAdd || this._isUpdate;
    }

    get selectedTainingCourse(): TrainingCourse {
        return this._selectedTainingCourse;
    }

    get trainingModules(): TrainingModule[] {
        return this._trainingModules;
    }

    get actionType(): String {
        return this._actionType;
    }

    get isStandardOrCustomised(): string {
        if (this._selectedTainingCourse.IsExample)
            return "standard";
        else
            return "customised";
    }

    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , private _claimsHelper: ClaimsHelperService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>, private _TrainingCourseService: TrainingCourseService
        , private _breadcrumbService: BreadcrumbService
        , private _router: Router
        , private _routeParamsService: RouteParams
    ) {
        super(_localeService, _translationService, _cdRef);
        // const bcItem: IBreadcrumb = { label: 'Training courses', url: '/trainingCourse' };
        // this._breadcrumbService.add(bcItem);
    }
    private _inviteTrainingCourseSubscriptionevent(item: TrainingCourse): Tristate {
        if (!isNullOrUndefined(item)) {
            if (!item.IsCompleted)
                return Tristate.True;
            else
                return Tristate.False;
        }
    }

    private _removeTrainingCourseSubscriptionevent(item: TrainingCourse): Tristate {
        if (!isNullOrUndefined(item))
            if (item.IsExample && !this._canAddStandardCourse()) return Tristate.False;
        return Tristate.True;
    }

    private _updateTrainingCourseSubscriptionevent(item: TrainingCourse): Tristate {
        if (!isNullOrUndefined(item))
            if (item.IsExample && !this._canAddStandardCourse()) return Tristate.False;
        return Tristate.True;
    }

    private _archiveTrainingCourseSubscriptionevent(item: TrainingCourse): Tristate {
        if (!isNullOrUndefined(item)) {
            if (item.IsExample && !this._canAddStandardCourse()) return Tristate.False;
            if (!item.IsCompleted)
                return Tristate.True;
            else
                return Tristate.False;
        }
    }
    private _reinstateTrainingCourseSubscriptionevent(item: TrainingCourse): Tristate {
        if (!isNullOrUndefined(item)) {
            if (item.IsExample && !this._canAddStandardCourse()) return Tristate.False;
            if (item.IsCompleted)
                return Tristate.True;
            else
                return Tristate.False;
        }
    }

    onPageSort(sortModel: AeSortModel) {
        this._TrainingCourseService.LoadTrainingCoursesOnSort(sortModel);
    }


    private _canAddStandardCourse(): boolean {
        return this._claimsHelper.CanManageExamples();
    }

    onPageChanged($event: AePageChangeEventModel) {
        this._TrainingCourseService.LoadTrainingCoursesOnPageChange($event);
    }


    removeConfirmModalClosed(event: any) {
        this._isRemove = false;
    }

    archiveConfirmModalClosed(event: any) {
        this._isArchive = false;
    }

    reinstateConfirmModalClosed(event: any) {
        this._isReinstate = false;
    }

    removeTrainingCourses(event: any) {
        this._isRemove = false;
        this._TrainingCourseService._removeTrainingCourse(this._selectedTainingCourse);
    }

    deleteTrainingCoursesReinstate(event: any) {
        this._isReinstate = false;
        this._selectedTainingCourse.IsCompleted = false;
        this._TrainingCourseService._updateStautsTrainingCourse(this._selectedTainingCourse);
    }

    deleteTrainingCoursesArchive(event: any) {
        this._isArchive = false;
        this._selectedTainingCourse.IsCompleted = true;
        this._TrainingCourseService._updateStautsTrainingCourse(this._selectedTainingCourse);
    }

    onTrainingCourseFormCancel(event: any) {
        if (event == 'add')
            this._isAdd = false;
        else
            this._isUpdate = false;
        this._actionType = '';
    }

    onTrainingCourseFormSaveComplete(event: any) {
        if (event == 'add')
            this._isAdd = false;
        else
            this._isUpdate = false;
        this._actionType = '';
    }
    // Public methods
    ngOnInit() {
        this._actions = Immutable.List([
            new AeDataTableAction("Invite", this._inviteTrainingCourseCommand, false, (item) => { return this._inviteTrainingCourseSubscriptionevent(item) }),
            new AeDataTableAction("Update", this._updateTrainingCourseCommand, false, (item) => { return this._updateTrainingCourseSubscriptionevent(item) }),
            new AeDataTableAction("Archive", this._archiveTrainingCourseCommand, false, (item) => { return this._archiveTrainingCourseSubscriptionevent(item) }),
            new AeDataTableAction("Reinstate", this._reinstateTrainingCourseCommand, false, (item) => { return this._reinstateTrainingCourseSubscriptionevent(item) }),
            new AeDataTableAction("Remove", this._removeTrainingCourseCommand, false, (item) => { return this._removeTrainingCourseSubscriptionevent(item) })
        ]);

        this._getTrainingModuleSubscription$ = this._store.let(fromRoot.getTrainingModuleData).subscribe(trainingModules => {
            if (isNullOrUndefined(trainingModules)) {
                this._TrainingCourseService.LoadTrainingCourseModules(this._claimsHelper.getCompanyIdOrCid());
            }
            else {
                this._trainingModules = trainingModules;
            }
        });

        this._loadingStatus$ = this._store.let(fromRoot.getTrainingCourseFromTrainingListDataLoading);
        this._courses$ = this._store.let(fromRoot.getTrainingCourseFromTrainingList);
        this._totalRecords$ = this._store.let(fromRoot.GetTrainingCourseFromTrainingTotalRecords);
        this._dataTableOptions$ = this._store.let(fromRoot.getTrainingCourseFromTrainingListDataTableOptions);
        //Subscriptions
        this._archiveTrainingCourseSubscription = this._archiveTrainingCourseCommand.subscribe(trainingCourse => {
            this._isArchive = true;
            this._actionType = 'ARCHIVE';
            this._selectedTainingCourse = trainingCourse as TrainingCourse;
        });
        this._reinstateTrainingCourseSubscription = this._reinstateTrainingCourseCommand.subscribe(trainingCourse => {
            this._isReinstate = true;
            this._actionType = 'REINSTATE';
            this._selectedTainingCourse = trainingCourse as TrainingCourse;
        });
        this._removeTrainingCourseSubscription = this._removeTrainingCourseCommand.subscribe(trainingCourse => {
            this._isRemove = true;
            this._actionType = 'REMOVE';
            this._selectedTainingCourse = trainingCourse as TrainingCourse;
        });

        this._updateTrainingCourseSubscription = this._updateTrainingCourseCommand.subscribe(trainingCourse => {
            var course = trainingCourse as TrainingCourse;
            this._selectedTrainingCourseApiRequestParams = <AtlasApiRequestWithParams>{};
            this._selectedTrainingCourseApiRequestParams.Params = [];
            this._selectedTrainingCourseApiRequestParams.Params.push(new AtlasParams('CourseId', course.Id));
            this._selectedTrainingCourseApiRequestParams.Params.push(new AtlasParams('isExample', course.IsExample));
            this._TrainingCourseService.LoadTrainingCourseSelectedModules(this._selectedTrainingCourseApiRequestParams);
            this._isUpdate = true;
            this._actionType = 'UPDATE';
        });

        this._inviteTrainingCourseSubscription = this._inviteTrainingCourseCommand.subscribe(trainingCourse => {
            let courseId = (trainingCourse as TrainingCourse).Id;
            let courseType = (trainingCourse as TrainingCourse).IsExample;
            this._actionType = 'INVITE';
            let navigationExtras: NavigationExtras = {
                queryParams: {
                    "example": courseType
                }
            };
            let cid = this._routeParamsService.Cid;
            if (!StringHelper.isNullOrUndefinedOrEmpty(cid)) {
                navigationExtras.queryParams['cid'] = cid;
            }
            this._router.navigate(["training/training-course/invitees", courseId], navigationExtras);
        });

    }
    trainingCourseAddClick($event) {
        this._selectedTainingCourse = null;
        this._isAdd = true;
        this._actionType = 'ADD';
    }

    getSlideoutState(): string {
        return this._isAdd || this._isUpdate ? 'expanded' : 'collapsed';
    }

    getSlideoutAnimateState(): boolean {
        return this._isAdd || this._isUpdate ? true : false;
    }

    ngOnDestroy(): void {
        this._archiveTrainingCourseSubscription.unsubscribe();
        this._reinstateTrainingCourseSubscription.unsubscribe();
        this._removeTrainingCourseSubscription.unsubscribe();
        this._updateTrainingCourseSubscription.unsubscribe();
        this._inviteTrainingCourseSubscription.unsubscribe();
    }
    // End of public methods

}