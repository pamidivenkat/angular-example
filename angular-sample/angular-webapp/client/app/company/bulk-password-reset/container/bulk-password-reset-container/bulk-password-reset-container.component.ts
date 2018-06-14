import { Router } from '@angular/router';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { ResetPasswordVM } from './../../models/reset-password-vm.model';
import { submitPasswordResetAction, submitPasswordResetWithoutEmailAction } from './../../actions/bulk-password-reset.actions';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeBannerTheme } from '../../../../atlas-elements/common/ae-banner-theme.enum';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
  selector: 'bulk-password-reset-container',
  templateUrl: './bulk-password-reset-container.component.html',
  styleUrls: ['./bulk-password-reset-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BulkPasswordResetContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  private _showSubmitConfirmDialog: boolean = false;
  private _isEmailUser: number = 1;
  private _selectedUserList: Array<any> = [];
  private _selectedWithoutEmailUserList: Array<any> = [];
  private _showAtLeastOneUserDialog: boolean = false;
  private _showBulkPasswordResetForm: boolean = false;
  private lightClass: AeClassStyle = AeClassStyle.Light;
  private _selectAll:boolean = false;
  aeBannerTheme = AeBannerTheme.Default;

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Users;
  }
  get showBulkPasswordResetForm() {
    return this._showBulkPasswordResetForm;
  }

  get selectAll(){
    return this._selectAll;
  }

  get showAtLeastOneUserDialog() {
    return this._showAtLeastOneUserDialog;
  }

  get showSubmitConfirmDialog() {
    return this._showSubmitConfirmDialog;
  }

  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _breadcrumbService: BreadcrumbService
    , private _store: Store<fromRoot.State>
    , private _router: Router
  ) {
    super(_localeService, _translationService, _changeDetector);

    const bcRootItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Users, label: 'Users', url: '/company/user' };
    this._breadcrumbService.add(bcRootItem);

    const bcItem: IBreadcrumb = new IBreadcrumb('Bulk reset password', this._router.url, BreadcrumbGroup.Users);
    this._breadcrumbService.add(bcItem);
  }
  ngOnInit() {
  }

  atLeastOneUserModalClosed($event: any) {
    this._showAtLeastOneUserDialog = false;
  }

  submitConfirmModalClosed($event: any) {
    this._showSubmitConfirmDialog = false;
  }

  submitPasswordResetRequest($event: any) {    
    this._store.dispatch(new submitPasswordResetAction({ "LoginModels": this._selectedUserList, "IsFirstTimeLogin": false }));
    this._selectAll=true;
    this._showSubmitConfirmDialog = false;

  }

  private _onResetPasswordComplete($event: any) {
    this._showBulkPasswordResetForm = false;
    this._selectedWithoutEmailUserList = [];
  }

  private _submitFormForNoEmail($event) {
  }

  onManualResetPwd(data: ResetPasswordVM) {
    data.ids = this._selectedWithoutEmailUserList;
    this._store.dispatch(new submitPasswordResetWithoutEmailAction(data));
    this._selectAll=true;
    this._showBulkPasswordResetForm = false;
    this._selectedUserList = [];
  }
  getBulkPasswordResetSlideoutState() {
    return this._showBulkPasswordResetForm ? 'expanded' : 'collapsed';
  }

  closeBulkPasswordResetForm($event) {
    this._showBulkPasswordResetForm = false;
  }

  usersWithEmailSelected($event) {
    this._selectedUserList = $event;
  }
  usersWithoutEmailSelected($event) {
    this._selectedWithoutEmailUserList = $event;
  }

  userFilterChanged($event) {
    this._isEmailUser = $event;
  }

  onResetClick(e) {
    this._selectAll=false;
    if (this._isEmailUser == 1) {
      if (this._selectedUserList.length > 0) {
        this._showSubmitConfirmDialog = true;
      } else {
        this._showAtLeastOneUserDialog = true;
      }
    } else if (this._isEmailUser == 0) {
      if (this._selectedWithoutEmailUserList.length > 0) {
        this._showBulkPasswordResetForm = true;
      } else {
        this._showAtLeastOneUserDialog = true;
      }
    }
  }
  ngOnDestroy() {

  }
}
