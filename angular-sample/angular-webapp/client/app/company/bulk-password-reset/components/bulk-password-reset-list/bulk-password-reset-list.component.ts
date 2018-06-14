import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { EmailStatus } from '../../models/has-email-filter-options';
import { UserStateOptions } from '../../models/user-status-filter-option';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { _iterableDiffersFactory } from '@angular/core/src/application_module';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import {
    UserLoadWithEmailAction,
    submitPasswordResetAction,
    submitPasswordResetWithoutEmailAction
} from '../../actions/bulk-password-reset.actions';
import { isNullOrUndefined } from 'util';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Component, OnDestroy, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers/index';
import { AeSortModel } from '../../../../atlas-elements/common/models/ae-sort-model';
import { User } from '../../models/bulk-password-reset.model';
import { ResetPasswordVM } from '../../models/reset-password-vm.model';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
    selector: 'bulk-password-reset-list',
    templateUrl: './bulk-password-reset-list.component.html',
    styleUrls: ['./bulk-password-reset-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BulkPasswordResetListComponent extends BaseComponent implements OnInit, OnDestroy {
    private _users: BehaviorSubject<Immutable.List<User>>;
    private _usersList: Immutable.List<User>;
    private _usersLoading$: Observable<boolean>;
    private _keys = Immutable.List(['Email', 'FullName', 'Id', 'UserName', 'FirstName', 'LastName', 'IsSelect']);
    private _totalRecords: Observable<number>;
    private _emailStatusFilter: number;
    private _isEmailUser: number = 1;
    private _selectedUserList: Array<any> = [];
    private _selectedWithoutEmailUserList: Array<any> = [];
    private _dataTableOptions$: Observable<DataTableOptions>;
    private _filters: Map<string, string>;
    private _emailStatusOptions: Immutable.List<AeSelectItem<EmailStatus>>;
    private _ctrlType: AeInputType = AeInputType.search;
    private _userIds: Array<any>;
    private _saveBtnClass: AeClassStyle;
    private _inputType: AeInputType = AeInputType.password;
    private _initialRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'FirstName', SortDirection.Ascending, [new AtlasParams('UserHasEmailFilter', '1')]);
    private _getIsSubmittedUsersListDataSub: Subscription;
    private _isAllSelected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _usersListSub: Subscription;
    private _selectAll: boolean;

    constructor(
        protected _localeService: LocaleService,
        protected _translationService: TranslationService,
        protected _cdRef: ChangeDetectorRef,
        private _fb: FormBuilder,
        private _store: Store<fromRoot.State>,
    ) {
        super(_localeService, _translationService, _cdRef);

        this._users = new BehaviorSubject(Immutable.List<User>([]));
        this._emailStatusOptions = Immutable.List([
            new AeSelectItem<EmailStatus>('Users with email', EmailStatus.UsersWithEmail, false),
            new AeSelectItem<EmailStatus>('Users without email', EmailStatus.UsersWithoutEmail, false)
        ]);
        this._emailStatusFilter = EmailStatus.UsersWithEmail;
        //Setting default filters
        this._filters = new Map<string, string>();
        this._filters.set('UserHasEmailFilter', UserStateOptions.Active.toString());
        this._filters.set('filterViewByUserNameOrEmail', '');

        //End of default filters

    }
    // Public properties
    @Input('selectAll')
    get selectAll() {
        return this._selectAll;
    }
    set selectAll(val: boolean) {
        if (val) {
            this._isAllSelected.next(false);
            this._cdRef.markForCheck();
            this.onSelectAllUserToBulkReset(false);
        }
        this._selectAll = val;
    }

    // Public Output bindings   
    @Output()
    onUserWithEmailSelect: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onUserWithoutEmailSelect: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    onUserFilterChange: EventEmitter<number> = new EventEmitter<number>();
    // End of Public Output bindings

    get ctrlType() {
        return this._ctrlType;
    }

    get emailStatusFilter() {
        return this._emailStatusFilter;
    }

    get emailStatusOptions() {
        return this._emailStatusOptions;
    }

    get dataTableOptions$() {
        return this._dataTableOptions$;
    }

    get users(): Observable<Immutable.List<User>> {
        return this._users;
    }

    get totalRecords() {
        return this._totalRecords;
    }

    get usersLoading$() {
        return this._usersLoading$;
    }

    get keys() {
        return this._keys;
    }

    get isEmailUser() {
        return this._isEmailUser;
    }

    get isAllSelected() {
        return this._isAllSelected;
    }    

    ngOnInit() {
        this._usersLoading$ = this._store.let(fromRoot.getUserListDataLoadingWithEmail);
        this._store.dispatch(new UserLoadWithEmailAction(this._initialRequest));
        
        this._usersListSub = this._store.let(fromRoot.getUserListingDataWithEmail).subscribe((list) => {
            this._usersList = list;
            this._users.next(list);
        });
        this._getIsSubmittedUsersListDataSub = this._store.let(fromRoot.getIsSubmittedUsersListData).subscribe((val) => {
            if (val) {
                this._selectedUserList = [];
                this._selectedWithoutEmailUserList = [];
            }
        });

        this._totalRecords = this._store.let(fromRoot.getUserTotalRecords);
        this._dataTableOptions$ = this._store.let(fromRoot.getBprUserListDataTableOptions);

        //Setting default filters
        this._filters = new Map<string, string>();
        this._filters.set('UserHasEmailFilter', UserStateOptions.Active.toString());
        //End of default filters

        this._saveBtnClass = AeClassStyle.Light;
    }

    onPageChange($event) {
        this._initialRequest.PageNumber = $event.pageNumber;
        this._initialRequest.PageSize = $event.noOfRows;
        this._store.dispatch(new UserLoadWithEmailAction(this._initialRequest));
    }
    onSort($event: AeSortModel) {
        this._initialRequest.SortBy.SortField = $event.SortField;
        this._initialRequest.SortBy.Direction = $event.Direction;
        this._store.dispatch(new UserLoadWithEmailAction(this._initialRequest));
    }

    onEmailStatusFilterChange($event: any) {
        this._setFilters('UserHasEmailFilter', $event.SelectedValue.toString());
        this._isEmailUser = $event.SelectedValue.toString();
        this.onUserFilterChange.emit(this._isEmailUser);
        this._isAllSelected.next(false);
    }
    onUserNameFilterChange($event: any) {
        this._setFilters('filterViewByUserNameOrEmail', $event.event.target.value);
    }

    checkStatus(context) {
        let selectUser = false;
        let contracts = this._selectedUserList.filter(x => x.UserId == context.Id)
        if (contracts.length > 0)
        selectUser = true;
        return context.IsSelect || selectUser;
      }

    onSelectAllUserToBulkReset($event: boolean) {
        if ($event) {
            this._selectedUserList = [];
            this._selectedWithoutEmailUserList = [];
            this._isAllSelected.next(true);// now buid all grid checkbox ids to the list and emit the list
            
            this._usersList.forEach(user => {
                user.IsSelect = true;
                let object = {
                    "UserName": user.UserName,
                    "UserId": user.Id
                }
                this._selectedUserList.push(object);
                this._selectedWithoutEmailUserList.push(object);
            });

        } else {            
            this._usersList.forEach((usr) => {
                let index = -1;
                if (this._isEmailUser == 1) {
                    index = this._selectedUserList.findIndex(x => x.UserId == usr.Id);
                } else {
                    index = this._selectedWithoutEmailUserList.findIndex(x => x.UserId == usr.Id)
                }                
                if (index > -1) {
                  usr.IsSelect = false;
                }
            });
            this._selectedUserList = [];
            this._selectedWithoutEmailUserList = [];
            this._isAllSelected.next(false);
        }
        this._users.next(this._usersList);
        this._cdRef.markForCheck();
        if (this._isEmailUser == 1) {
            this.onUserWithEmailSelect.emit(this._selectedUserList);
        }
        else {
            this.onUserWithoutEmailSelect.emit(this._selectedWithoutEmailUserList);
        }
    }

    onSelectUserToBulkReset($event: any, item: User) {
        if (this._isEmailUser == 1) {
            let list = this._selectedUserList.length;
            if ($event) {
                let object = {
                    "UserName": item.UserName,
                    "UserId": item.Id
                }
                this._selectedUserList.push(object);
                if (this._selectedUserList.length == this._usersList.count()) {
                    this._isAllSelected.next(true);
                }
            } else {
                this._isAllSelected.next(false);
                for (let i = 0; i < list; i++) {
                    if (this._selectedUserList[i] && item.Id === this._selectedUserList[i].UserId) {
                        this._selectedUserList.splice(i, 1);
                    }
                }
            }
            this._cdRef.markForCheck();
            this.onUserWithEmailSelect.emit(this._selectedUserList);
        } else if (this._isEmailUser == 0) {

            let noEmaillist = this._selectedWithoutEmailUserList.length;
            if ($event) {
                let obj = {
                    "UserName": item.UserName,
                    "UserId": item.Id
                }
                this._selectedWithoutEmailUserList.push(obj);
                if (this._selectedWithoutEmailUserList.length == this._usersList.count()) {
                    this._isAllSelected.next(true);
                }
                this._userIds = this._selectedWithoutEmailUserList.map(function (obj) {
                    return obj.UserId;
                });
            } else {
                this._isAllSelected.next(false);
                for (let j = 0; j < noEmaillist; j++) {
                    if (this._selectedWithoutEmailUserList[j] && item.Id === this._selectedWithoutEmailUserList[j].UserId) {
                        this._selectedWithoutEmailUserList.splice(j, 1);
                    }
                }
            }
            this.onUserWithoutEmailSelect.emit(this._selectedWithoutEmailUserList);
        }
    }


    //filter change functiion end 


    /**
     * Method to set filters
     * 
     * @private
     * @param {string} key 
     * @param {string} value 
     * 
     * @memberOf BulkPasswordResetListComponent
     */
    private _setFilters(key: string, value: string) {
        if (this._filters === null) {
            this._filters = new Map<string, string>();
        }
        if (this._filters.has(key)) {
            this._filters.delete(key);
        }
        this._filters.set(key, value);
        this._initialRequest.Params = addOrUpdateAtlasParamValue(this._initialRequest.Params, key, value);
        this._store.dispatch(new UserLoadWithEmailAction(this._initialRequest));
    }

    ngOnDestroy(): void {
        if (this._getIsSubmittedUsersListDataSub)
            this._getIsSubmittedUsersListDataSub.unsubscribe();

        if (this._usersListSub)
            this._usersListSub.unsubscribe();
    }


}
