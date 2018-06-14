import { isNullOrUndefined } from 'util';
import { RouteParams } from './../../../../shared/services/route-params';
import { SystemTenantId } from '../../../../shared/app.constants';
import { BaseComponent } from '../../../../shared/base-component';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { SitesService } from '../../services/sites.service';
import { UpdateEmpSiteMappingAction } from './../../../manage-departments/actions/manage-departments.actions';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { ObjectHelper } from "../../../../shared/helpers/object-helper";
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { Site } from '../../models/site.model';
import { Observable, Subscription } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import * as fromRoot from '../../../../shared/reducers';
import { BreadcrumbService } from "../../../../atlas-elements/common/services/breadcrumb-service";
import { IBreadcrumb } from "../../../../atlas-elements/common/models/ae-ibreadcrumb.model";


@Component({
  selector: 'sites-container',
  templateUrl: './sites-container.component.html',
  styleUrls: ['./sites-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SitesContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  private _selectSiteSubscription$: Subscription;
  private _selectedSite: Site;
  private _showRemoveDialog: boolean = false;
  private _slideOut: boolean = false;
  private _aesslideOut: boolean = false;
  private _logoUrl: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get slideOut(): boolean {
    return this._slideOut;
  }

  get showRemoveDialog(): boolean {
    return this._showRemoveDialog;
  }

  get selectedSite(): Site {
    return this._selectedSite;
  }

  get logoUrl(): string {
    return this._logoUrl;
  }
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fileUpload: FileUploadService
    , private _messenger: MessengerService
    , private _sitesService: SitesService
    , private _breadcrumbService: BreadcrumbService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    // const bcItem: IBreadcrumb = { label: 'Sites', url: '/sites' };
    // this._breadcrumbService.add(bcItem);
  }

  get aesslideOut() {
    return this._aesslideOut;
  }


  ngOnInit() {
  }

  ngOnDestroy() {
  }

  doAesAction(site) {
    this._selectedSite = site;
    this._aesslideOut = true;
  }

  getAesSlideOutStatus() {
    return this._aesslideOut ? 'expanded' : 'collapsed';
  }

  closeAesForm(e) {
    this._aesslideOut = false;
  }

  saveAesForm(dataToUpdate) {
    this._store.dispatch(new UpdateEmpSiteMappingAction(dataToUpdate));
    this._aesslideOut = false;
  }

  doAction(site) {
    this._selectedSite = site;
    this._slideOut = true;
    this._logoUrl = this._getPictureUrl();
  }

  private _removeSite(site: Site) {
    this._sitesService.RemoveSite(site);
    this._slideOut = false;
  }

  closeDetailsForm(e) {
    this._slideOut = false;
  }

  getSlideOutStatus() {
    return this._slideOut ? 'expanded' : 'collapsed';
  }

  openConfirmModal() {
    this._showRemoveDialog = true;
  }

  modalClosed(option) {
    if (option == 'yes') {
      this._removeSite(this._selectedSite);
    }
    this._showRemoveDialog = false;
  }

  private _getPictureUrl(): string {
    let cId = this._routeParamsService.Cid;
    let siteLogoId = this._selectedSite && this._selectedSite.LogoId;
    if (isNullOrUndefined(cId)) {
      return siteLogoId !== "00000000-0000-0000-0000-000000000000" ? `/filedownload?documentId=${siteLogoId}` : '/assets/images/default-icon-32x32.png';
    }
    else {
      return siteLogoId !== "00000000-0000-0000-0000-000000000000" ? `/filedownload?documentId=${siteLogoId}&cid=${cId}` : '/assets/images/default-icon-32x32.png';
    }
  }

  uploadSiteLogo(_documentToSave) {
    let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Document', _documentToSave.document.FileName);
    this._messenger.publish('snackbar', vm);
    this._fileUpload.Upload(_documentToSave.document, _documentToSave.file).then((response: any) => {
      vm = ObjectHelper.createInsertCompleteSnackbarMessage('Document', _documentToSave.document.FileName);
      this._messenger.publish('snackbar', vm);
      this._selectedSite.LogoId = response.Id;
      this._logoUrl = this._getPictureUrl();
      this._sitesService.UpdateSite(this._selectedSite);
    });
  }
}
