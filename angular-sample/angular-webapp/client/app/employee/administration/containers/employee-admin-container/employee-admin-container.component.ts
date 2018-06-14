import { LoadUserProfilesAction } from './../../../../shared/actions/company.actions';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
import * as fromRoot from '../../../../shared/reducers';
import { User } from '../../../../shared/models/user';
import { Subscription } from "rxjs/Rx";
import { isNullOrUndefined } from "util";
import { LoadEmployeeAdministrationDetailsAction, ManualResetPasswordAction, EmployeeOptionsUpdateAction } from '../../../../employee/actions/employee.actions';
import { Observable } from "rxjs/Observable";
import { EmployeeInformation } from '../../../../employee/models/employee-information';
import { UserAdminDetails, ResetPasswordVM, AdminOptions } from '../../../../employee/administration/models/user-admin-details.model';
import { UserProfile } from '../../../../shared/models/lookup.models';
import { UserProfileLoadAction } from '../../../../shared/actions/lookup.actions';
import { Router, NavigationExtras } from '@angular/router';
import { DateTimeHelper } from '../../../../shared/helpers/datetime-helper';


@Component({
  selector: 'employee-admin-container',
  templateUrl: './employee-admin-container.component.html',
  styleUrls: ['./employee-admin-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeAdminContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // private fields
  private _showResetPasswordSlideOut: boolean = false;
  private _employeeAdminDetails: UserAdminDetails;
  private _employeeAdminDetailsSubscription: Subscription;
  private _empInfo: EmployeeInformation;
  private _empInfoSubscription: Subscription;
  private _userProfiles$: Observable<UserProfile[]>;
  private _userProfiles: UserProfile[];
  private _userProfilesLoaded$: Observable<boolean>
  private _userProfilesLoadedSubscription: Subscription;
  private _isLeaver: boolean = false;
  private _employeeInformation: EmployeeInformation;
  private _updateOptionsCompleteSubscription: Subscription;

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router) {
    super(_localeService, _translationService, _cdRef);
  }

  get ShowResetPasswordSlideOut() {
    return this._showResetPasswordSlideOut;
  }
  get EmployeeAdminDetails() {
    return this._employeeAdminDetails;
  }
  get EmployeeInformationDetails() {
    return this._employeeInformation;
  }
  get IsLeaver() {
    return this._isLeaver;
  }
  get UserProfiles() {
    return this._userProfiles;
  }
  ngOnInit() {
    //  get user profiles

    this._userProfilesLoadedSubscription = this._store.let(fromRoot.getUserProfilesData).subscribe(profiles => {
      if (isNullOrUndefined(profiles)) {
        this._store.dispatch(new LoadUserProfilesAction(true));
      } else {
        this._userProfiles = profiles;        
      }
    });

    // Get employee 

    this._empInfoSubscription = this._store.let(fromRoot.getEmployeeInformationData).combineLatest(this._store.let(fromRoot.getEmployeePersonalData)).subscribe(result => {
      let res = result[0];
      let personalLoaded: boolean = !isNullOrUndefined(result[1]) && !StringHelper.isNullOrUndefinedOrEmpty(result[1].FirstName) ? true : false;
      if (res && personalLoaded) {
        this._employeeInformation = res;
        this._isLeaver = res.IsLeaver;
        this._store.dispatch(new LoadEmployeeAdministrationDetailsAction());
        this._cdRef.markForCheck();
      }
    });

    this._employeeAdminDetailsSubscription =
      Observable.combineLatest(this._store.let(fromRoot.getEmployeeAdminDetails),
        this._store.let(fromRoot.getEmployeeLeaverEventDetails)).subscribe((vals) => {
          let adminDetails = vals[0];
          let leaverDetails = vals[1];
          if (!isNullOrUndefined(adminDetails)) {
            if (!isNullOrUndefined(leaverDetails) &&
              leaverDetails.length > 0 &&
              (DateTimeHelper.getDatePart(leaverDetails[0]['LeaverTerminationDate']) <
                DateTimeHelper.getDatePart(new Date()))) {
              adminDetails.IsLeaver = true;
              let hasUser = !StringHelper.isNullOrUndefinedOrEmpty(adminDetails.UserName) ||
                !StringHelper.isNullOrUndefinedOrEmpty(adminDetails.Email);
              if (hasUser) {
                adminDetails.IsActive = false;
              }
            }
            this._employeeAdminDetails = Object.assign({}, adminDetails);
            this._cdRef.markForCheck();
          }
        });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._employeeAdminDetailsSubscription)) {
      this._employeeAdminDetailsSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._userProfilesLoadedSubscription)) {
      this._userProfilesLoadedSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._empInfoSubscription)) {
      this._empInfoSubscription.unsubscribe();
    }

  }

  getSlideoutState(): string {
    return this._showResetPasswordSlideOut ? 'expanded' : 'collapsed';
  }

  onResetPassword(resetPasswordData: ResetPasswordVM) {
    if (resetPasswordData.IsEmailUser && !isNullOrUndefined(resetPasswordData)) {
      this._store.dispatch(new ManualResetPasswordAction(resetPasswordData));

    } else {
      this._showResetPasswordSlideOut = true;
    }

  }
  /*
  * Action : Cancle Reset password
  */
  onResetPasswordCancle(data: any) {
    this._showResetPasswordSlideOut = data;
  }
  /*
   * Action : Update Reset password
   */
  onResetPasswordComplete(resetModel: ResetPasswordVM) {
    this._showResetPasswordSlideOut = false;
    this._store.dispatch(new ManualResetPasswordAction(resetModel));
  }

  optionsModalToSave(e: AdminOptions) {
    if (!isNullOrUndefined(e))
      this._dispatchSaveOptions(e);
  }

  private _dispatchSaveOptions(model: AdminOptions) {
    this._store.dispatch(new EmployeeOptionsUpdateAction({ adminOptions: model, empId: this._employeeInformation.Id }));

    this._updateOptionsCompleteSubscription = this._store.let(fromRoot.getEmployeeOptionsProgressStatus).subscribe(status => {
      if (status) {
        let navigationExtras: NavigationExtras = {
          queryParamsHandling: 'merge'
        };
        let navigateUrl = "/employee/manage";
        this._router.navigate([navigateUrl], navigationExtras);
        if (this._updateOptionsCompleteSubscription) {
          this._updateOptionsCompleteSubscription.unsubscribe();
        }
      }
    });
  }

}