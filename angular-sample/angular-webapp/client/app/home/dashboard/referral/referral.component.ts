import { IFormBuilderVM } from '../../../shared/models/iform-builder-vm';
import { ReferralService } from '../../services/referral.service';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Referral } from '../../models/referral';
import { ReferralForm } from '../../models/referral-form';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Constructor } from 'make-error';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent extends BaseComponent implements OnInit {
  private _formName: string;
  private _referralForm: FormGroup;
  private _submitted: boolean = false;
  private _referral: Referral;
  private _referralFormVM: IFormBuilderVM;

  get referralFormVM(): IFormBuilderVM {
    return this._referralFormVM;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , private _fb: FormBuilderService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _referralService: ReferralService) {
    super(_localeService, _translationService, _cdRef);
    this._onReferralCancel = new EventEmitter<string>();
    this._onReferralSubmit = new EventEmitter<string>();
    this._referral = new Referral();
    this._referral.CampaignId = 1;
    this._referral.ReferredCompanyName = this._claimsHelper.getCompanyName();
    this._referral.RegardingObjectTypeCode = '';
    this._referral.UserId = this._claimsHelper.getUserId();
  }

  //Output Variables
  @Output('onCancel') _onReferralCancel: EventEmitter<string>;
  @Output('onSubmit') _onReferralSubmit: EventEmitter<any>;

  ngOnInit() {
    this._formName = 'referralForm';
    this._referralFormVM = new ReferralForm(this._formName);
  }


  onCancel() {
    this._onReferralCancel.emit('Cancel');
  }

  onSubmit($event) {
    this._submitted = true;
    if (this._referralForm.valid) {
      this._onReferralSubmit.emit('Save');
      let _referralToSave: Referral = Object.assign({}, this._referral, <Referral>this._referralForm.value);
      this._referralService.saveReferralDetails(_referralToSave);
    }
  }

  onFormInit(fg: FormGroup) {
    this._referralForm = fg;
  }
}
