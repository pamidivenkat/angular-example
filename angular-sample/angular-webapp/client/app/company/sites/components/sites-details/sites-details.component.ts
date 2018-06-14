import { DatePipe } from '@angular/common';
import { RouteParams } from '../../../../shared/services/route-params';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Document } from '../../../../document/models/document';
import { FileResult } from '../../../../atlas-elements/common/models/file-result';
import { isNullOrUndefined } from 'util';
import { CQCProPackage } from '../../common/cqc-pro-package.enum';
import { CQCProProduct } from '../../common/cqc-pro-product.enum';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { Site } from '../../models/site.model';
import { SitesService } from '../../services/sites.service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'sites-details',
  templateUrl: './sites-details.component.html',
  styleUrls: ['./sites-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SitesDetailsComponent extends BaseComponent implements OnInit {
  private _siteDetails: Site;
  private _isAdministrator: boolean;
  private _isConsultant: boolean;
  private _isCareSector: boolean;
  private _isDentalSector: boolean;
  private _cqcProProductCare: number;
  private _cqcProProductDental: number;
  private _cqcProPackageStandard: number;
  private _cqcProPackagePremium: number;
  private _imageUrl: string;
  private _selectedFile: FileResult;
  private _document: Document;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _darkClass: AeClassStyle = AeClassStyle.Dark;

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _routeParams: RouteParams
    , private _datePipe: DatePipe
    , private _sitesService: SitesService) {
    super(_localeService, _translationService, _cdRef);
  }

  @Input('siteDetails')
  get siteDetails(): Site {
    return this._siteDetails
  }
  set siteDetails(val: Site) {
    this._siteDetails = val;
  }

  @Input('siteLogo')
  get imageUrl(): string {
    return this._imageUrl;
  }
  set imageUrl(val: string) {
    this._imageUrl = val;
  }

  @Output('aeClose')
  _aeClose: EventEmitter<any> = new EventEmitter<any>();

  @Output('aeRemove')
  _aeRemove: EventEmitter<Site> = new EventEmitter<Site>();

  @Output('aeUpload')
  _aeUpload: EventEmitter<any> = new EventEmitter<any>();

  get cqcProPackageStandard() {
    return this._cqcProPackageStandard;
  }

  get cqcProProductCare() {
    return this._cqcProProductCare;
  }

  get cqcProProductDental() {
    return this._cqcProProductDental;
  }

  get cqcProPackagePremium() {
    return this._cqcProPackagePremium;
  }

  get lightClass() {
    return this._lightClass;
  }

  get selectedFile() {
    return this._selectedFile;
  }

  get isAdministrator() {
    return this._isAdministrator;
  }

  get isCareSector() {
    return this._isCareSector;
  }

  get isConsultant() {
    return this._isConsultant;
  }

  get isDentalSector() {
    return this._isDentalSector;
  }

  ngOnInit() {
    this._isAdministrator = this._claimsHelper.isAdministrator();
    this._isConsultant = this._claimsHelper.isConsultant();
    if (!isNullOrUndefined(this._siteDetails) && !isNullOrUndefined(this._siteDetails.Sector)) {
      this._isCareSector = this._siteDetails.Sector.Name.toLowerCase() == 'care' ? true : false;
      this._isDentalSector = (this._siteDetails.Sector.Name.toLowerCase() == 'dental' || this._siteDetails.Sector.Name.toLowerCase() == 'dentists') ? true : false;
    }
    this._cqcProProductCare = CQCProProduct.CQCProCare;
    this._cqcProProductDental = CQCProProduct.CQCProDental;
    this._cqcProPackageStandard = CQCProPackage.Standard;
    this._cqcProPackagePremium = CQCProPackage.Premium;
  }

  ondetailsFormClosed(e) {
    this._aeClose.emit(e);
  }

  removeSite() {
    this._aeRemove.emit(this._siteDetails);
  }

  getFullAddress(): string {
    if (!isNullOrUndefined(this._siteDetails.Address)) {
      if (this._siteDetails.Address.FullAddress.charAt(0) === ',' && this._siteDetails.Address.FullAddress.charAt(1) === ' ') {
        return this._siteDetails.Address.FullAddress.replace(', ', '');
      } else {
        return this._siteDetails.Address.FullAddress;
      }
    }
    return '';
  }

  onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      this._addDocument();
    }
  }

  private _addDocument() {
    this._document = new Document();
    this._document.CompanyId = this._siteDetails.CompanyId;
    this._document.RegardingObjectId = this._siteDetails.Id;
    this._document.RegardingObjectTypeCode = 3;
    this._document.FileName = this._selectedFile.file.name;
    this._document.Category = 0;
    this._document.LastModifiedDateTime = this._datePipe.transform(this._selectedFile.file.lastModifiedDate, 'medium');
  }

  submitSiteLogo() {
    this._aeUpload.emit({ file: this._selectedFile.file as File, document: this._document });
    this._selectedFile = null;
  }

  canManageCompanySites(): boolean {
    return this._claimsHelper.canManageCompany() || (this._routeParams.Cid && this._claimsHelper.isConsultant());
  }

}
