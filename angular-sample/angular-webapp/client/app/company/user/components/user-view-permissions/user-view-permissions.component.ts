import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import { UserService } from '../../services/user.service';

import { UserProfilesViewVm } from '../../models/user-permissions-view-vm';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Rx';
import { Subscribable } from 'rxjs/Observable';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { User } from "../../models/user.model";
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers/index';
import { GetUserPermisssionsAction } from "../../actions/user.actions";

@Component({
  selector: 'user-view-permissions',
  templateUrl: './user-view-permissions.component.html',
  styleUrls: ['./user-view-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UserViewPermissionsComponent extends BaseComponent implements OnInit {
  private _user: User;
  private _btnStyle: AeClassStyle;
  private _userProfileSubscription$: Subscription;
  private _userProfilesViewVm: UserProfilesViewVm;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;

  //input and output starts here
  @Input('vm')
  set vm(value: User) {
    this._user = value;
  }
  get vm() {
    return this._user;
  }
 

  @Output('onCancel') _onCancel: EventEmitter<string> = new EventEmitter<string>();
  @Output('onUpdate') _onUpdate: EventEmitter<string> = new EventEmitter<string>();
  //end here
  //constructor starts here
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef, private _store: Store<fromRoot.State>
    , private _userService: UserService) {
    super(_localeService, _translationService, _cdRef);

  }
  //constructor ends

  ngOnInit() {
    this._btnStyle = AeClassStyle.Light;
    this._userService._getUserPermissions(this._user.Id);
    this._userProfileSubscription$ = this._store.let(fromRoot.getSelectedUserProfile).skipWhile(val => isNullOrUndefined(val)).subscribe((profile) => {
      if (!isNullOrUndefined(profile)) {
        this._userProfilesViewVm = profile;
        this._cdRef.markForCheck();
      }
    });
  }
  //private methods start
  getUserPermission(groupName: string) {
    return this._userProfilesViewVm.Permissions.get(groupName);
  }
  isContentLoaded() {
    return !isNullOrUndefined(this._userProfilesViewVm);
  }
  getPermissionGroups() {
    let pGroups: Array<string> = new Array();
    this._userProfilesViewVm.Permissions.forEach((value, key) => {
      pGroups.push(key);
    });
    return pGroups;
  }
  getUserRoles() {
    return this._userProfilesViewVm.UserRoles;
  }

  onFormClosed(e) {
    this._onCancel.emit('close');
  }

  OnDestroy() {
    this._userProfileSubscription$.unsubscribe();
  }

  get loaderType(){
    return this._loaderType;
  }

  get btnStyle(){
    return this._btnStyle;
  }
}
