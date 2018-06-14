import { RouteParams } from './../../../../shared/services/route-params';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { ResetPasswordVM } from '../../../../employee/administration/models/user-admin-details.model';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { EmailStatus } from '../../models/has-email-filter-options';
import { UserStateOptions } from '../../models/user-status-filter-option';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { _iterableDiffersFactory } from '@angular/core/src/application_module';
import { UserService } from '../../services/user.service';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import {
  LoadUserOnFilterChangeAction,
  LoadUserOnPageChangeAction,
  LoadUserOnSortAction,
  ResetPasswordAction,
  UserLoadAction,
} from '../../actions/user.actions';
import { isNullOrUndefined } from 'util';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Component, EventEmitter, Output, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers/index';
import { AeSortModel } from '../../../../atlas-elements/common/models/ae-sort-model';
import { User } from '../../models/user.model';
import { Tristate } from "../../../../atlas-elements/common/tristate.enum";
import { Router, NavigationExtras } from "@angular/router";

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent extends BaseComponent implements OnInit, OnDestroy {
  //private properties start
  private _users$: Observable<Immutable.List<User>>;
  private _usersLoading$: Observable<boolean>;
  private _keys = Immutable.List(['Email', 'UserName', 'FullName', 'ACN', 'HasEmail', 'IsActive', 'Id', 'CompanyId']);
  private _totalRecords: Observable<number>;
  private _objectType: string;
  private _actions: Immutable.List<AeDataTableAction>;
  private _updateUserCommand = new Subject();
  private _removeUserCommand = new Subject();
  private _disableUserCommand = new Subject();
  private _updateUserSubscription: Subscription;
  private _removeUserSubscription: Subscription;
  private _disableUserSubscription: Subscription;
  private _enableUserSubscription: Subscription;
  private _selectedUser: User;
  private lightClass: AeClassStyle = AeClassStyle.Light;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _filters: Map<string, string>;
  private _userStatusOptions: Immutable.List<AeSelectItem<string>>;
  private _emailStatusOptions: Immutable.List<AeSelectItem<string>>;
  private _ctrlType: AeInputType = AeInputType.search;
  private _enableUserCommand = new Subject();
  private _detailUserCommand = new Subject();
  private _userDetailSubscription: Subscription;
  private _userStatusFilterDefualtVaule = UserStateOptions.Active.toString();
  private _emailStatusFilterDefualtVaule = '';
  private _userViewPermissionCommand = new Subject();
  private _userUpdatePermissionCommand = new Subject<User>();
  private _userPermissionsSubscription: Subscription;
  private _userUpdatePermissionSubscription: Subscription;
  private _userId: string;
  private _userResetPasswordCommand = new Subject();
  private _userResetPasswordCommandSub: Subscription;
  private _cidExists: boolean;
  //end of private properties
  //public inputs
  //end of public inputs
  //output events to parent container
  @Output() detailUserCommand = new EventEmitter<User>();
  @Output() updateUserCommand = new EventEmitter<User>();
  @Output() disableUserCommand = new EventEmitter<User>();
  @Output() enableUserCommand = new EventEmitter<User>();
  @Output() removeUserCommand = new EventEmitter<User>();
  @Output() userViewPermissionCommand = new EventEmitter<User>();
  @Output() userManualReset = new EventEmitter<User>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _userService: UserService
    , private _router: Router
    , private _claimsHelper: ClaimsHelperService
    , private _routeParams: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);

    this._actions = Immutable.List([
      new AeDataTableAction("Details", this._detailUserCommand, false),
      new AeDataTableAction("Reset Password", this._userResetPasswordCommand, false),
      new AeDataTableAction("Update", this._updateUserCommand, false),
      new AeDataTableAction("Disable", this._disableUserCommand, false, (item) => { return this._showDisableAction(item) }),
      new AeDataTableAction("Enable", this._enableUserCommand, false, (item) => { return this._showEnableAction(item) }),
      new AeDataTableAction("Remove", this._removeUserCommand, false),
      new AeDataTableAction("View Permissions", this._userViewPermissionCommand, false),
      new AeDataTableAction("Update Permissions", this._userUpdatePermissionCommand, false, (item) => { return this._hasPermission() }),
    ]);

    this._userStatusOptions = Immutable.List([
      new AeSelectItem<string>('All', '', false),
      new AeSelectItem<string>('Active', UserStateOptions.Active.toString(), false),
      new AeSelectItem<string>('Inactive', UserStateOptions.Inactive.toString(), false)
    ]);

    this._emailStatusOptions = Immutable.List([
      new AeSelectItem<string>("All types of users", '', false),
      new AeSelectItem<string>('Users with email', EmailStatus.UsersWithEmail.toString(), false),
      new AeSelectItem<string>('Users without email', EmailStatus.UsersWithoutEmail.toString(), false)
    ]);
  }

  ngOnInit() {
    //Setting default filters
    this._filters = new Map<string, string>();
    this._filters.set('filterUsersByStatus', UserStateOptions.Active.toString());
    //End of default filters
    this._usersLoading$ = this._store.let(fromRoot.getUserListDataLoading);
    this._userService.LoadUsers(this._filters); //load list data
    this._users$ = this._store.let(fromRoot.getUserListingData);
    this._totalRecords = this._store.let(fromRoot.getUserTotalRecords);
    this._dataTableOptions$ = this._store.let(fromRoot.getUserListDataTableOptions);

    //Subscription for user permissions details
    this._userPermissionsSubscription = this._userViewPermissionCommand.subscribe(user => {
      this._selectedUser = user as User;
      this.userViewPermissionCommand.emit(this._selectedUser);
    });

    //Subscription for user details
    this._userDetailSubscription = this._detailUserCommand.subscribe(user => {
      this._selectedUser = user as User;
      this.detailUserCommand.emit(this._selectedUser);
    });


    this._userUpdatePermissionSubscription = this._userUpdatePermissionCommand.subscribe((user) => {
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      }
      this._router.navigate(['company/user/updatepermissions', user.Id], navigationExtras);
    });
    //Subscription for update Item
    this._updateUserSubscription = this._updateUserCommand.subscribe(user => {
      this._selectedUser = user as User;
      this.updateUserCommand.emit(this._selectedUser);
    });

    //Subscription for Removing User
    this._removeUserSubscription = this._removeUserCommand.subscribe(user => {
      if (!isNullOrUndefined(user)) {
        this._selectedUser = user as User;
        this.removeUserCommand.emit(this._selectedUser);
      }
    });

    //Subscription for disabling User
    this._disableUserSubscription = this._disableUserCommand.subscribe(user => {
      if (!isNullOrUndefined(user)) {
        this._selectedUser = user as User;
        this.disableUserCommand.emit(this._selectedUser);
      }
    });
    //Subscription for enabling User
    this._enableUserSubscription = this._enableUserCommand.subscribe(user => {
      if (!isNullOrUndefined(user)) {
        this._selectedUser = user as User;
        this.enableUserCommand.emit(this._selectedUser);
      }
    });

    //Subscription for user permissions details
    this._userResetPasswordCommandSub = this._userResetPasswordCommand.subscribe(user => {
      this._selectedUser = user as User;
      if (this._selectedUser.HasEmail) {
        let userPasswordResetModel = new ResetPasswordVM();
        userPasswordResetModel.IsEmailUser = true;
        userPasswordResetModel.Email = this._selectedUser.Email;
        userPasswordResetModel.UserId = this._selectedUser.Id;
        this._store.dispatch(new ResetPasswordAction(userPasswordResetModel));
      } else {
        //need to show manual reset password slide
        this.userManualReset.emit(this._selectedUser);
      }

    });

  }

  private _hasPermission(): Tristate {
    this._cidExists = !(isNullOrUndefined(this._routeParams.Cid));
    if (this._claimsHelper.IsCitationUser) {
      if (this._claimsHelper.isAdministrator() || this._cidExists) {
        return Tristate.True;
      }
      else {
        return Tristate.False;
      }
    } else {
      return Tristate.True;
    }

  }


  private _showDisableAction(item: User): Tristate {
    if (item.IsActive) {
      return Tristate.True;
    }
    else {
      return Tristate.False;
    }
  }

  private _showEnableAction(item: User): Tristate {
    if (!item.IsActive) {
      return Tristate.True;
    }
    else {
      return Tristate.False;
    }
  }


  onPageChange($event: any) {
    this._store.dispatch(new LoadUserOnPageChangeAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
  }

  onSort($event: AeSortModel) {
    this._store.dispatch(new LoadUserOnSortAction({ SortField: $event.SortField, Direction: $event.Direction }));
  }

  //filter change functiion start
  onUserStatusFilterChange($event: any) {
    this._setFilters('filterUsersByStatus', $event.SelectedValue.toString());
  }
  onEmailStatusFilterChange($event: any) {
    this._setFilters('UserHasEmailFilter', $event.SelectedValue.toString());
  }
  onUserNameFilterChange($event: any) {
    this._setFilters('filterViewByUserNameOrEmail', $event.event.target.value);
  }
  //filter change functiion end 


  /**
   * Method to set filters
   * 
   * @private
   * @param {string} key 
   * @param {string} value 
   * 
   * @memberOf UserListComponent
   */
  private _setFilters(key: string, value: string) {
    if (this._filters === null) {
      this._filters = new Map<string, string>();
    }
    if (this._filters.has(key)) {
      this._filters.delete(key);
    }
    //check for empty value
    if (!StringHelper.isNullOrUndefinedOrEmpty(value)) {
      this._filters.set(key, value);
    }

    this._store.dispatch(new LoadUserOnFilterChangeAction(this._filters));
  }

  ngOnDestroy() {
    if (this._userResetPasswordCommandSub) {
      this._userResetPasswordCommandSub.unsubscribe();
    }
    if (this._updateUserSubscription)
      this._updateUserSubscription.unsubscribe();
    if (this._removeUserSubscription)
      this._removeUserSubscription.unsubscribe();
    if (this._disableUserSubscription)
      this._disableUserSubscription.unsubscribe();
    if (this._enableUserSubscription)
      this._enableUserSubscription.unsubscribe();
    if (this._userDetailSubscription)
      this._userDetailSubscription.unsubscribe();
    if (this._userPermissionsSubscription)
      this._userPermissionsSubscription.unsubscribe();
    if (this._userUpdatePermissionSubscription)
      this._userUpdatePermissionSubscription.unsubscribe();
  }

  get keys() {
    return this._keys;
  }

  get usersLoading$() {
    return this._usersLoading$;
  }

  get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  get users$() {
    return this._users$;
  }

  get actions() {
    return this._actions;
  }

  get emailStatusOptions() {
    return this._emailStatusOptions;
  }

  get userStatusOptions() {
    return this._userStatusOptions;
  }

  get emailStatusFilterDefualtVaule() {
    return this._emailStatusFilterDefualtVaule;
  }

  get userStatusFilterDefualtVaule() {
    return this._userStatusFilterDefualtVaule;
  }

  get totalRecords() {
    return this._totalRecords;
  }

  get ctrlType() {
    return this._ctrlType;
  }

}
