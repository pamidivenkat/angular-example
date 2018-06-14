import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { Tristate } from '../../../atlas-elements/common/tristate.enum';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import {
    EmployeeGroupsLoad,
    LoadEmployeeGroupsOnPageChangeAction,
    LoadEmployeeGroupsOnSortAction,
    AssociateEmployeesToEmployeeGroupAction
} from '../actions/employee-group.actions';
import { isNullOrUndefined } from 'util';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { EmployeeGroup } from '../../../shared/models/company.models';
import * as Immutable from 'immutable';
import { EmployeeGroupService } from '../services/employee-group.service';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers/index';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { Site } from '../../../calendar/model/calendar-models';
import { LoadSitesAction, LoadSitesCompleteAction } from '../../../shared/actions/company.actions';
import { LoadApplicableSitesAction } from '../../../shared/actions/user.actions';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
    templateUrl: './employee-group.component.html',
    styleUrls: ['./employee-group.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class EmployeeGroupContainerComponent extends BaseComponent implements OnInit, OnDestroy {
    private _groups: Observable<Immutable.List<EmployeeGroup>>;
    private _employeeGroupLoading$: Observable<boolean>;
    private _keys = Immutable.List(['Id', 'Name', 'IsContractualGroup']);
    private _totalRecords: Observable<number>;
    private _objectType: string;
    private _actions: Immutable.List<AeDataTableAction>;
    private _updateEmployeeGroupCommand = new Subject();
    private _removeEmployeeGroupCommand = new Subject();
    private _associateEmployeesToEmployeeGroupCommand = new Subject();
    private _updateEmployeeGroupSubscription: Subscription;
    private _removeEmployeeGroupSubscription: Subscription;
    private _associateEmployeesToEmployeeGroupSubscription: Subscription;
    private _selectedEmployeeGroup: EmployeeGroup;
    private _isAdd: boolean = false;
    private _isUpdate: boolean = false;
    private _showEmployeeAssociationSlideOut: boolean = false;
    private _addOrUpdateActionType: String = "";
    private _showDeleteConfirmDialog: boolean;
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _dataTableOptions$: Observable<DataTableOptions>;

    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _claimsHelperService: ClaimsHelperService
        , private _messenger: MessengerService
        , private _employeeGroupService: EmployeeGroupService) {
        super(_localeService, _translationService, _cdRef);

        this._actions = Immutable.List([
            new AeDataTableAction("Update", this._updateEmployeeGroupCommand, false, (item) => { return this._showUpdateEmployeeGroupAction(item) }),
            new AeDataTableAction("Remove", this._removeEmployeeGroupCommand, false, (item) => { return this._showRemoveEmployeeGroupAction(item) }),
            new AeDataTableAction("Associate Employees", this._associateEmployeesToEmployeeGroupCommand, false, (item) => { return this._showAssociateEmployeesToEmployeeGroupAction(item) })
        ]);

        //End of action buittons
    }
    ngOnInit() {
        this._employeeGroupLoading$ = this._store.let(fromRoot.getEmployeeGroupListDataLoading);
        this._employeeGroupService.LoadEmployeeGroups();
        this._groups = this._store.let(fromRoot.getEmployeeGroupList);
        this._totalRecords = this._store.let(fromRoot.GetEmployeeGroupTotalRecords);
        this._dataTableOptions$ = this._store.let(fromRoot.getEmployeeGroupListDataTableOptions);
        this._store.dispatch(new LoadApplicableSitesAction(true));

        //Subscription for update Item
        this._updateEmployeeGroupSubscription = this._updateEmployeeGroupCommand.subscribe(empGroup => {
            this._isUpdate = true;
            this._addOrUpdateActionType = 'UPDATE';
            this._selectedEmployeeGroup = empGroup as EmployeeGroup;
        });

        //Subscription for delete Item
        this._removeEmployeeGroupSubscription = this._removeEmployeeGroupCommand.subscribe(empGroup => {
            if (!isNullOrUndefined(empGroup)) {
                this._selectedEmployeeGroup = empGroup as EmployeeGroup;
                this._showDeleteConfirmDialog = true;
            }
        });

        //subscription for associating employees
        this._associateEmployeesToEmployeeGroupSubscription = this._associateEmployeesToEmployeeGroupCommand.subscribe(empGroup => {
            if (!isNullOrUndefined(empGroup)) {
                this._selectedEmployeeGroup = empGroup as EmployeeGroup;
                this._showEmployeeAssociationSlideOut = true;
            }
        });
    }

    /**
    *  to show/hide update button for absence request
    * @private
    * @param {MyAbsence} item 
    * @returns 
    * 
    * @memberOf HolidaysListComponent
    */
    private _showUpdateEmployeeGroupAction(item: EmployeeGroup): Tristate {
        if (item.IsContractualGroup) {
            return this._claimsHelperService.manageEmployeeGroup() ? Tristate.True : Tristate.False;
        }
        return Tristate.True;
    }
    private _showRemoveEmployeeGroupAction(item: EmployeeGroup): Tristate {
        if (item.IsContractualGroup) {
            return this._claimsHelperService.manageEmployeeGroup() ? Tristate.True : Tristate.False;
        }
        return Tristate.True;
    }
    private _showAssociateEmployeesToEmployeeGroupAction(item: EmployeeGroup): Tristate {
        return Tristate.True;
    }

    /**
   * Delete pop-up close event
   * 
   * @private
   * @param {*} event
   * 
   * @memberOf EmployeeGroupContainerComponent
   */
    deleteConfirmModalClosed(event: any) {
        this._showDeleteConfirmDialog = false;
    }

    /**
 * Delete pop-up confirm event
 * 
 * @private
 * @param {*} event
 * 
 * @memberOf EmployeeGroupContainerComponent
 */
    deleteEmployeeGroup(event: any) {
        this._employeeGroupService._onEmployeeGroupDelete(this._selectedEmployeeGroup); //dispatch an event to delete
        this._showDeleteConfirmDialog = false; //close the confirm popup
    }
    /**
       * Event on cancel click
       * 
       * @private
       * @param {any} e 
       * 
       * @memberOf EmployeeGroupContainerComponent
       */
    onEmployeeGroupFormCancel(event: any) {
        this._isAdd = false;
        this._isUpdate = false;
        this._addOrUpdateActionType = "";
        this._showEmployeeAssociationSlideOut = false;
        //this._slideoutState = false;
    }
    /**
       * Event on cancel click
       * 
       * @private
       * @param {any} e 
       * 
       * @memberOf EmployeeGroupContainerComponent
       */
    onEmployeeAssociationGroupFormCancel(event: any) {
        this._isAdd = false;
        this._isUpdate = false;
        this._addOrUpdateActionType = "";
        this._showEmployeeAssociationSlideOut = false;
        //this._slideoutState = false;
    }


    onEmployeeGroupFormSaveComplete($event: boolean) {
        this._isAdd = false;
        this._isUpdate = false;
        this._addOrUpdateActionType = "";
        this._showEmployeeAssociationSlideOut = false;
    }

    onEmployeeAssociationGroupFormSaveComplete(event: any) {
        this._showEmployeeAssociationSlideOut = false;
        this._store.dispatch(new AssociateEmployeesToEmployeeGroupAction(event));
    }

    /**
       * State of slide out
       * 
       * @private
       * @returns {string} 
       * 
       * @memberOf EmployeeGroupContainerComponent
       */
    getEmployeeAssociationSlideoutState(): string {
        return this._showEmployeeAssociationSlideOut ? 'expanded' : 'collapsed';
    }

    /**
   * to show update form slide out
   * @returns {boolean} 
   * 
   * @memberOf EmployeeGroupContainerComponent
   */
    _showUpdateSlideOut(): boolean {
        return this._isUpdate;
    }

    /**
     * to show add form slide out
     * @returns {boolean} 
     * 
     * @memberOf EmployeeGroupContainerComponent
     */
    showSlideOut(): boolean {
        return this._isAdd || this._isUpdate;
    }

    ngOnDestroy() {
        if (this._updateEmployeeGroupSubscription)
            this._updateEmployeeGroupSubscription.unsubscribe()
        if (this._removeEmployeeGroupSubscription)
            this._removeEmployeeGroupSubscription.unsubscribe()
        if (this._associateEmployeesToEmployeeGroupSubscription)
            this._associateEmployeesToEmployeeGroupSubscription.unsubscribe()
    }

    // public methods
    employeeGroupAddClick($event) {
        this._isAdd = true;
        this._addOrUpdateActionType = 'ADD';
    }

    /**
      * fires on page change
      * @public
      * @param {*} $event 
      * 
      * @memberOf TaskListComponent
      */
    onPageChange($event: any) {
        this._store.dispatch(new LoadEmployeeGroupsOnPageChangeAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
    }

    onSort($event: AeSortModel) {
        this._store.dispatch(new LoadEmployeeGroupsOnSortAction({ SortField: $event.SortField, Direction: $event.Direction }));
    }

    /**
       * State of slide out
       * 
       * @public
       * @returns {string} 
       * 
       * @memberOf EmployeeGroupContainerComponent
       */
    getSlideoutState(): string {
        return this._isAdd || this._isUpdate ? 'expanded' : 'collapsed';
    }

    /**
   * Slide out animation
   * 
   * @public
   * @returns {boolean} 
   * 
   * @memberOf EmployeeGroupContainerComponent
   */
    getSlideoutAnimateState(): boolean {
        return this._isAdd || this._isUpdate ? true : false;
    }

    get dataTableOptions(): Observable<DataTableOptions> {
        return this._dataTableOptions$;
    }

    get groups(): Observable<Immutable.List<EmployeeGroup>> {
        return this._groups;
    }

    get actions(): Immutable.List<AeDataTableAction> {
        return this._actions;
    }

    get totalRecords(): Observable<number> {
        return this._totalRecords;
    }

    get employeeGroupLoading(): Observable<boolean> {
        return this._employeeGroupLoading$;
    }

    get selectedEmployeeGroup(): EmployeeGroup {
        return this._selectedEmployeeGroup;
    }

    get addOrUpdateActionType(): String {
        return this._addOrUpdateActionType;
    }

    get showDeleteConfirmDialog(): boolean {
        return this._showDeleteConfirmDialog;
    }

    get lightClass(): AeClassStyle {
        return this._lightClass;
    }

    get keys(): any {
        return this._keys;
    }

    get showEmployeeAssociationSlideOut(): boolean {
        return this._showEmployeeAssociationSlideOut;
    }

    get bcGroup(): BreadcrumbGroup {
        return BreadcrumbGroup.Employees;
    }
    // end of public methods
}