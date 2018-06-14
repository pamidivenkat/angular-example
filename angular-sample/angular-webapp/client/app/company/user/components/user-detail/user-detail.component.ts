import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { User } from "../../models/user.model";
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { BaseComponent } from '../../../../shared/base-component';

@Component({
  selector: 'user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent extends BaseComponent implements OnInit {

  private _user: User;
  private _btnStyle: AeClassStyle;
  private _showDisableButton: boolean = false;
  private _showEnableButton: boolean = false;

  @Output('onCancel') _onCancel: EventEmitter<string> = new EventEmitter<string>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , protected _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _cdRef);

  }


  @Input('vm')
  set user(value: User) {
    this._user = value;
  }
  get user() {
    return this._user;
  }
  
  onFormClosed(e) {
    this._onCancel.emit('close');
  }

  ngOnInit() {
    this._btnStyle = AeClassStyle.Light;
    if (this._user.IsActive) {
      this._showDisableButton = true;
    }
    else
      this._showEnableButton = true;
  }

  get canViewAuditLog(): boolean {
    return this._claimsHelper.CanViewAuditLog();
  }
}
