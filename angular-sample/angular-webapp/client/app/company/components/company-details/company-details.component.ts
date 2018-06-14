import { isNullOrUndefined } from 'util';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Subscription } from 'rxjs/Rx';

import { FileResult } from '../../../atlas-elements/common/models/file-result';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers';
import { Company } from '../../models/company';
import { CompanyHOAddressAction } from '../../sites/actions/sites.actions';
import { RouteParams } from './../../../shared/services/route-params';


@Component({
  selector: 'company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyDetailsComponent extends BaseComponent implements OnInit {
  private _companyDetails: Company;
  private _selectedFile: FileResult;
  private _imgPreviewSrcUrl: string;
  private _sitesSubscription: Subscription;
  private _companyAddress: string;

  @Input('companyDetail')
  set companyDetail(val: Company) {
    this._companyDetails = val;
    if (this._companyDetails) {
      this._imgPreviewSrcUrl = this._routeParamsService.Cid ? `/filedownload?documentId=${this._companyDetails.PictureId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${this._companyDetails.PictureId}`;
      this._store.dispatch(new CompanyHOAddressAction());
    }
  }
  get companyDetail() {
    return this._companyDetails;
  }
 

  @Input('logourl')
  get logourl() {
    return this._imgPreviewSrcUrl;
  }
  set logourl(val: string) {
    this._imgPreviewSrcUrl = val;
  }

  @Output('onCompanyLogoSave') _OnLogoSaveComplete: EventEmitter<FileResult>;

  get companyDetails() {
    return this._companyDetails;
  }

  get imgPreviewSrcUrl() {
    return this._imgPreviewSrcUrl;
  }

  get companyName() {
    return this._companyDetails.CompanyName;
  }

  get companyTradingName() {
    return this._companyDetails.TradingName;
  }

  get companyCustomerSince() {
    return this._companyDetails.CustomerSince;
  }

  get companySector() {
    return this._companyDetails.Sector;
  }

  get companyMainContactNo() {
    return this._companyDetails.MainContactNo;
  }

  get companyAddress() {
    return this._companyAddress;
  }

  get companyWebsite() {
    return this._companyDetails.Website;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService
      , _translationService
      , _cdRef);
    this._OnLogoSaveComplete = new EventEmitter<FileResult>();
    this._companyAddress = null;
  }

  ngOnInit() {
    this._store.dispatch(new CompanyHOAddressAction());
    this._store.let(fromRoot.getCompanyHOAddress).takeUntil(this._destructor$).subscribe(val => {
      this._companyAddress = val;
      this._cdRef.markForCheck();
    });
  }

  onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      this._OnLogoSaveComplete.emit(this._selectedFile);
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

}
