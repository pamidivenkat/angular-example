import { ResetPasswordVM } from '../../../../employee/administration/models/user-admin-details.model';
import { ResetPasswordAction } from '../../actions/user.actions';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Router, NavigationExtras } from '@angular/router';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';
import { isNullOrUndefined } from 'util';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers/index';
import { User } from '../../models/user.model';
import { Tristate } from "../../../../atlas-elements/common/tristate.enum";
import { UserService } from '../../services/user.service';
import { BreadcrumbService } from "../../../../atlas-elements/common/services/breadcrumb-service";
import { IBreadcrumb } from "../../../../atlas-elements/common/models/ae-ibreadcrumb.model";
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'users-container',
  templateUrl: './users-container.component.html',
  styleUrls: ['./users-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UsersContainerComponent extends BaseComponent implements OnInit {
  private _selectedUser: User;
  private _isAdd: boolean = false;
  private _isUpdate: boolean = false;
  private _addOrUpdateActionType: String = "";
  private _showDeleteConfirmDialog: boolean;
  private _showDisableConfirmDialog: boolean;
  private _showConfirmDialog: boolean;
  private _showEnableConfirmDialog: boolean;
  private _showUserDetails: boolean = false;
  private _showUserPermissions: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _showUserResetPassword: boolean;

  get selectedUser(): User {
    return this._selectedUser;
  }
  get showConfirmDialog(): boolean {
    return this._showConfirmDialog;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Company;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _userService: UserService
    , private _router: Router,
    private _claimsHelper: ClaimsHelperService
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _cdRef);
    let bcItem = new IBreadcrumb('Users', '/company/user', BreadcrumbGroup.Company);
    this._breadcrumbService.add(bcItem);
  }


  ngOnInit() {
  }

  onAddClick(e) {
    this._isAdd = true;
    this._addOrUpdateActionType = 'ADD';
  }

  canBulkResetPwd(): boolean {
    return this._claimsHelper.canBulkResetPwd();
  }

  onBulkResetPwd($event) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(["company/bulk-password-reset"], navigationExtras);
  }
  onResetPasswordCancel($event) {
    this._showUserResetPassword = false;
  }
  onResetPasswordComplete($event: ResetPasswordVM) {
    this._showUserResetPassword = false;
    this._store.dispatch(new ResetPasswordAction($event));
  }
  onShowUserManualReset(user: User) {
    this._selectedUser = user;
    this._showUserResetPassword = true;
  }
  /**
  * Slide out animation
  * 
  * @private
  * @returns {boolean} 
  * 
  * @memberOf UserListComponent
  */
  getSlideoutAnimateState(): boolean {
    return this._isAdd || this._isUpdate || this._showUserDetails || this._showUserPermissions || this._showUserResetPassword ? true : false;
  }

  /**
     * State of slide out
     * 
     * @private
     * @returns {string} 
     * 
     * @memberOf UserListComponent
     */
  getSlideoutState(): string {
    return this._isAdd || this._isUpdate || this._showUserDetails || this._showUserPermissions || this._showUserResetPassword ? 'expanded' : 'collapsed';
  }

  /**
  * to show add form slide out
  * @returns {boolean} 
  * 
  * @memberOf UserListComponent
  */
  _showAddUpdateSlideOut(): boolean {
    return this._isAdd || this._isUpdate;
  }
  _showUserDetailSlideOut(): boolean {
    return this._showUserDetails;
  }

  _showUserPermissionSlideOut(): boolean {
    return this._showUserPermissions;
  }
  showUserResetPasswordSlideOut(): boolean {
    return this._showUserResetPassword;
  }
  /**
      * Event on cancel click
      * 
      * @private
      * @param {any} e 
      * 
      * @memberOf UserListComponent
      */
  _onUserGroupFormCancel(event: any) {
    this._isAdd = false;
    this._isUpdate = false;
    this._showUserDetails = false;
    this._addOrUpdateActionType = "";
    this._showUserPermissions = false;
  }

  /**
 * 
 * 
 * @private
 * @param {boolean} $event
 * 
 * @memberOf UserListComponent
 */
  private _onUserFormSaveComplete($event: boolean) {
    this._isAdd = false;
    this._isUpdate = false;
    this._addOrUpdateActionType = "";
  }
  private _ConfirmModalClosed(event: any) {
    this._showConfirmDialog = false;
    this._showDeleteConfirmDialog = false;
    this._showDisableConfirmDialog = false;
    this._showEnableConfirmDialog = false;
  }
  private _removeUserRecord(event: any) {
    this._userService._onUserDelete(this._selectedUser); //dispatch an event to delete
    this._showConfirmDialog = false;//close the confirm popup
    this._showDeleteConfirmDialog = false;
    this._showUserDetails = false;
  }
  private _disableUserRecord(event: any) {
    this._userService._onUserDisable(this._selectedUser); //dispatch an event to make user disable/enable
    this._showConfirmDialog = false;
    this._showEnableConfirmDialog = false;
    this._showDisableConfirmDialog = false;
    this._showUserDetails = false;
  }

  userViewPermissionCommand(selectedUser: User) {
    this._showUserPermissions = true;
    this._selectedUser = selectedUser;
  }

  _detailUserCommand(selectedUser: User) {
    this._showUserDetails = true;
    this._selectedUser = selectedUser;
  }
  _updateUserCommand(selectedUser: User) {
    this._isUpdate = true;
    this._addOrUpdateActionType = 'UPDATE';
    this._selectedUser = selectedUser;
  }
  _disableUserCommand(selectedUser: User) {
    this._showConfirmDialog = true;
    this._showDisableConfirmDialog = true;
    this._selectedUser = selectedUser;
  }

  enableUserCommand(selectedUser: User) {
    this._showConfirmDialog = true;
    this._showEnableConfirmDialog = true;
    this._selectedUser = selectedUser;
  }
  _removeUserCommand(selectedUser: User) {
    this._showConfirmDialog = true;
    this._showDeleteConfirmDialog = true;
    this._selectedUser = selectedUser;
  }

}
