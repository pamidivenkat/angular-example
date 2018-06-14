import { RouteParams } from './../../../../shared/services/route-params';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import { FormControlName } from '@angular/forms/src/directives';
import { UserProfile } from '../../../../shared/models/lookup.models';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { LoadUserProfilesAction } from '../../../../shared/actions/company.actions';
import { createSelectOptionFromArrayList } from '../../../../employee/common/extract-helpers';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { UserPermission, UserProfilesViewVm } from '../../models/user-permissions-view-vm';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { UserPermissionsGroup } from '../../models/user-permissions-group';
import { extend } from 'webdriver-js-extender/built/lib';
import {
    ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output,
    ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ElementRef
} from '@angular/core';
import { UserService } from '../../services/user.service';
import { BaseComponent } from '../../../../shared/base-component';
import { isNull, isNullOrUndefined } from 'util';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { Subscribable } from 'rxjs/Observable';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { AeBannerTheme } from '../../../../atlas-elements/common/ae-banner-theme.enum';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { User } from '../../models/user.model';
import { createPopOverVm } from "../../../../atlas-elements/common/models/popover-vm";

@Component({
    selector: 'user-update-permissions',
    templateUrl: './user-update-permissions.component.html',
    styleUrls: ['./user-update-permissions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserUpdatePermissionsComponent extends BaseComponent implements OnInit, OnDestroy {
    private _PermissionSubscription$: Subscription;
    private _userPermissionSubscription$: Subscription;
    private _profileOptionsSubscription: Subscription;
    private _profileList: Array<UserProfile>;
    private _permissionGroups: Array<UserPermissionsGroup>;
    private _permissionCompleteObj: Array<any>;
    private _userProfilesViewVm: UserProfilesViewVm;
    private _userPermissionsList: any;
    private _userVmPermissionIds: Array<string>;
    private _userUpdatePermissionForm: FormGroup;
    private _profileFilterForm: FormGroup;
    private _isFormGroupReady: boolean = false;
    private _dataSouceType: AeDatasourceType;
    private _selectedProfileIds: Array<string>;
    private _selectedProfilePermissionIds: Array<string>;
    private _currentUserPermissionIds: Array<string>;
    private _userProfileAndPermissionsSubscription: Subscription;
    private _routeSubscription: Subscription;
    private _selectedProfileOptions: Array<any>;
    private _loaderType: AeLoaderType = AeLoaderType.Bars;
    private _disabledCheckBoxes: Array<string>;
    private combineUserPrfileAndPermissionsGroupSubscription: Subscription;
    aeBannerTheme = AeBannerTheme.Default;
    private _selectedUser: User = null;
    private _cidExists: boolean;

    get selectedUser(): User {
        return this._selectedUser;
    }
    get bannerTitle(): string {
        return this._selectedUser ? this._selectedUser.FirstName + ' ' + this._selectedUser.LastName : '';
    }
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _fb: FormBuilder
        , private _route: ActivatedRoute
        , private _elemRef: ElementRef
        , private _router: Router
        , private _routeParams: RouteParams
        , private _userService: UserService
        , private _breadcrumbService: BreadcrumbService) {
        super(_localeService, _translationService, _cdRef);
        this._dataSouceType = AeDatasourceType.Local;
        this._selectedProfileIds = [];
        this._selectedProfilePermissionIds = [];
        this._disabledCheckBoxes = new Array<string>();
        let bcItem = new IBreadcrumb('Update permissions', this._router.url, BreadcrumbGroup.Users);
        this._breadcrumbService.add(bcItem);
    }

    ngOnInit() {
        this._routeSubscription = this._route.params.subscribe((params) => {
            let userId = params["id"];
            if (!isNullOrUndefined(userId)) {
                this._userService._getUserPermissions(userId); //get checked  
                this._userService._getUserInfo(userId); //get checked  
            }
        });

        let profileData = this._store.let(fromRoot.getUserProfilesData);
        let selectedUserProfile = this._store.let(fromRoot.getSelectedUserProfile);
        let permissionsGroup = this._store.let(fromRoot.getPermissionGroups);
        let selectedUserInfo = this._store.let(fromRoot.getSelectedUserInfoData);
        let subscriptionDataArry = [];
        let myObservable = Observable.combineLatest(profileData, selectedUserProfile, permissionsGroup, selectedUserInfo, (profile, userProfile, permissionGroup, userInfo) => {
            if (!isNullOrUndefined(profile) && !isNullOrUndefined(userProfile) && !isNullOrUndefined(permissionGroup)) {
                this._permissionGroups = permissionGroup.filter(pg => {
                    return (!isNullOrUndefined(pg.Permissions) && (pg.Permissions.length > 0));
                });
                this._userProfilesViewVm = userProfile;
                this._profileList = profile;
                this._selectedUser = userInfo;
                this._currentUserPermissionIds = this._getCurrentUserPermissionIds(this._userProfilesViewVm.Permissions);
                this._selectedProfileIds = !isNullOrUndefined(this._userProfilesViewVm.UserProfiles) ? this._getCurrentUserSelectedProfileIds(this._userProfilesViewVm.UserProfiles) : [];
                this._selectedProfileOptions = this._getSelectedProfileOptions(this._userProfilesViewVm.UserProfiles);
                this._selectedProfilePermissionIds = this._extractSelectedProfilePermissionIds(this._profileList, this._selectedProfileIds);
                this._initForm(this._selectedProfileIds);
                this._profileFilterForm.get('userProfileFilter').setValue(this._selectedProfileOptions); //populate auto-complete options
                if (!this._selectedUser.HasEmail) {
                    //applicable user profiles are only employee
                    this._profileList = this._profileList.filter(obj => obj.Name.toLocaleLowerCase() == 'employee' || obj.Name.toLocaleLowerCase() == 'publicuserprofile');
                }
                this._cdRef.markForCheck();
            }
        });
        this.combineUserPrfileAndPermissionsGroupSubscription = myObservable.subscribe();
        this._userService._getPermissions(); //dispatch and action to load
        this._store.dispatch(new LoadUserProfilesAction(true));
    }



    private _getCurrentUserPermissionIds(userVmPermissions: Map<string, Array<UserPermission>>): Array<string> {
        let permissionIds = [];
        if (isNullOrUndefined(userVmPermissions)) return permissionIds;
        userVmPermissions.forEach((permissions, key) => {
            permissions.forEach((pItem) => {
                permissionIds.push(pItem.Id);
            });
        });
        return permissionIds
    }


    /**
     * initialize the formGroup
     * 
     * @private
     * @param {any} selectedProfileIds
     * 
     * @memberOf UserUpdatePermissionsComponent
     */
    private _initForm(selectedProfileIds) {
        this._userUpdatePermissionForm = this.generateDynamicFormControls(); //bind dynamic checkbox FormControl
        this._profileFilterForm = this._fb.group({
            userProfileFilter: [{ value: selectedProfileIds, disabled: false }],
        });
        this._isFormGroupReady = true;
        this._cdRef.markForCheck();
    }
    private generateDynamicFormControls() {
        let group: any = {};
        if (isNullOrUndefined(this._permissionGroups)) return group;
        if (!isNullOrUndefined(this._permissionGroups)) {
            this._permissionGroups.forEach((permissionObj, index) => {
                let userPermissionsFromGroup = this._userProfilesViewVm.Permissions.get(permissionObj.Name);
                permissionObj['Permissions'].forEach((permissionItem, index) => {
                    if (!isNullOrUndefined(userPermissionsFromGroup)) {
                        //check for user selected permission
                        let permission = userPermissionsFromGroup.find(p => p.Id === permissionItem.Id);
                        if (this._selectedProfilePermissionIds.indexOf(permissionItem.Id) !== -1) {
                            // group[permissionItem.Id] = new FormControl({ value: true, disabled: true });
                            group[permissionItem.Id] = new FormControl(true);
                            this._disabledCheckBoxes.push(permissionItem.Id); //disable checkbox
                        }
                        else if (!isNullOrUndefined(permission)) {
                            group[permissionItem.Id] = new FormControl(true);
                        } else {
                            group[permissionItem.Id] = new FormControl(false);
                        }
                    } else {
                        group[permissionItem.Id] = new FormControl(false);
                    }
                });
            });
        }

        return new FormGroup(group);
    }


    /**
     * Toggle the permission according profile selection value
     * 
     * @private
     * @param {*} $event
     * 
     * @memberOf UserUpdatePermissionsComponent
     */
    onProfileChanged($event: any) {
        this._selectedProfileIds = [];
        this._selectedProfilePermissionIds = [];
        $event.map((selectItem => this._selectedProfileIds.push(selectItem.Value)));
        this._selectedProfilePermissionIds = this._extractSelectedProfilePermissionIds(this._profileList, this._selectedProfileIds);
        this._updateProfilePermission(this._selectedProfilePermissionIds);
    }


    /**
     * Update form controls as per profile toggle.
     * 
     * @private
     * @param {Array<string>} selectedProfilePermissionIds
     * 
     * @memberOf UserUpdatePermissionsComponent
     */
    private _updateProfilePermission(selectedProfilePermissionIds: Array<string>): void {
        for (let key in this._userUpdatePermissionForm.controls) {
            if (selectedProfilePermissionIds.indexOf(key) !== -1) {
                this._userUpdatePermissionForm.get(key).setValue(true);
                this._disabledCheckBoxes.push(key);

            }
            //preserve explicit permission
            // else if (this._currentUserPermissionIds.indexOf(key) !== -1) {
            //     //current user permission
            //     this._userUpdatePermissionForm.get(key).setValue(true);
            //     // this._userUpdatePermissionForm.get(key).enable();
            //     let elementIndex = this._disabledCheckBoxes.indexOf(key);
            //     if (elementIndex !== -1) {
            //         this._disabledCheckBoxes.splice(elementIndex, 1);
            //     }
            // } 
            else {
                //all permission
                this._userUpdatePermissionForm.get(key).setValue(false);
                // this._userUpdatePermissionForm.get(key).enable();
                let elementIndex = this._disabledCheckBoxes.indexOf(key);
                if (elementIndex !== -1) {
                    this._disabledCheckBoxes.splice(elementIndex, 1);
                }
            }
        }
    }


    /**
     * Get permission id's for selected profile id's
     * 
     * @private
     * @param {Array<UserProfile>} profileList
     * @param {Array<string>} selectedProfileIds
     * @returns {Array<string>}
     * 
     * @memberOf UserUpdatePermissionsComponent
     */
    private _extractSelectedProfilePermissionIds(profileList: Array<UserProfile>, selectedProfileIds: Array<string>): Array<string> {
        let selectedProfilePermissionIds = [];
        if (isNullOrUndefined(profileList)) return selectedProfileIds;
        profileList.forEach((profile, index) => {
            if (selectedProfileIds.indexOf(profile.Id) !== -1) {
                profile.Permissions.forEach((profilePermissionItem, pItemKey) => {
                    if (selectedProfilePermissionIds.indexOf(profilePermissionItem.Id) === -1) {
                        selectedProfilePermissionIds.push(profilePermissionItem.Id);
                    }
                });
            }
        });
        return selectedProfilePermissionIds;
    }


    /**
     * On clear profile auto complete.
     * 
     * @param {*} $event
     * 
     * @memberOf UserUpdatePermissionsComponent
     */
    onClearSelectedProfile($event: any) {
        this._selectedProfileIds = [];
        this._selectedProfilePermissionIds = [];
        this._updateProfilePermission([]);
    }

    getPopOverVm(description: string) {
        if (description)
            return createPopOverVm<any>(null, { Text: description }, null, true);
        return null;
    }
    onPrevious($event) {
        let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'merge'
        }
        this._router.navigate(['company/user'], navigationExtras);
    }

    hasPermission() {
        this._cidExists = !(isNullOrUndefined(this._routeParams.Cid));
        if (this._claimsHelper.IsCitationUser) {
            if (this._claimsHelper.isAdministrator() || this._cidExists) {
                return true;
            }
            else {
                return false;
            }
        } else {
            return true;
        }

    }

    /**
* Submit form(add/update)
* 
* @private
* @param {any} e
* 
* @memberOf UserUpdatePermissionsComponent
*/
    onFormSubmit(e) {
        let payLoadObj = {};
        let selectedProfileObj = [];
        //prepare profile data
        this._profileList.forEach((profile, index) => {
            if (this._selectedProfileIds.indexOf(profile.Id) !== -1) {
                selectedProfileObj.push(profile);
            }
        });
        payLoadObj['UserProfiles'] = selectedProfileObj; //assign profile data

        //prepate permission data
        let selectedPermissionArry = [];
        let allPermissionItems = this._userUpdatePermissionForm.value;
        for (var key in allPermissionItems) {
            if (allPermissionItems.hasOwnProperty(key) && allPermissionItems[key] === true) {
                selectedPermissionArry.push(key);
            }
        }
        payLoadObj['Permissions'] = selectedPermissionArry; //assign Permissions data
        this._userService._updateUserPermission(payLoadObj);
        let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'merge'
        };
        this._router.navigate(['company/user'], navigationExtras);
    }


    /**
     * Create the Array of User profiles Id's
     * 
     * @private
     * @param {Array<UserProfile>} userVmProfile
     * @returns {Array<string>}
     * 
     * @memberOf UserUpdatePermissionsComponent
     */
    private _getCurrentUserSelectedProfileIds(userVmProfile: Array<UserProfile>): Array<string> {
        return userVmProfile.map(userProfile => {
            return userProfile['Id'];
        });
    }

    private _getSelectedProfileOptions(userVmProfile: Array<UserProfile>): Array<any> {
        if (isNullOrUndefined(userVmProfile))
            return [];
        return userVmProfile.map(userProfile => {
            return { Name: userProfile['Name'], Id: userProfile['Id'] };
        });
    }

    isCheckBoxDisabled(elementId: string) {
        let checkbox = this._disabledCheckBoxes.find((id) => elementId === id);
        if (!isNullOrUndefined(checkbox)) {
            return true;
        } else {
            return false;
        }
    }


    ngOnDestroy() {
        if (this._profileOptionsSubscription)
            this._profileOptionsSubscription.unsubscribe();
        if (this._userProfileAndPermissionsSubscription)
            this._userProfileAndPermissionsSubscription.unsubscribe();
        if (this._routeSubscription)
            this._routeSubscription.unsubscribe();
        if (this.combineUserPrfileAndPermissionsGroupSubscription)
            this.combineUserPrfileAndPermissionsGroupSubscription.unsubscribe();
    }

    get profileFilterForm() {
        return this._profileFilterForm;
    }

    get profileList() {
        return this._profileList;
    }

    get loaderType() {
        return this._loaderType;
    }

    get isFormGroupReady() {
        return this._isFormGroupReady;
    }

    get dataSouceType() {
        return this._dataSouceType;
    }

    get userUpdatePermissionForm() {
        return this._userUpdatePermissionForm;
    }

    get bcGroup(): BreadcrumbGroup {
        return BreadcrumbGroup.Users;
    }
}