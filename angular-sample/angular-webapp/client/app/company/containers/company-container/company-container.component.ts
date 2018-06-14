import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { FileResult } from '../../../atlas-elements/common/models/file-result';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { Document } from '../../../document/models/document';
import { DocumentCategoryService } from '../../../document/services/document-category-service';
import * as errorActions from '../../../shared/actions/error.actions';
import { BaseComponent } from '../../../shared/base-component';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import * as fromRoot from '../../../shared/reducers';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { MessengerService } from '../../../shared/services/messenger.service';
import { RouteParams } from '../../../shared/services/route-params';
import { CompanyInformationComponentAction } from '../../actions/company.actions';
import { CompanyLoadAction, UploadCompanyLogoAction } from '../../actions/company.actions';
import { Company } from '../../models/company';
import { SystemTenantId, v1AppUrl } from '../../../shared/app.constants';

@Component({
  selector: 'company-container',
  templateUrl: './company-container.component.html',
  styleUrls: ['./company-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  private _selectCompanySubscription: Subscription;
  private _companyDetails$: Observable<Company>;
  private _companyInformationBarItems: AeInformationBarItem[];
  private _selectedFile: FileResult;
  private _objectType: string = "Company Logo";
  private _imgPreviewSrcUrl: string = '';

  get companyInformationBarItems() {
    return this._companyInformationBarItems;
  }

  get companyDetails$() {
    return this._companyDetails$;
  }

  get imgPreviewSrcUrl() {
    return this._imgPreviewSrcUrl;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _documentCategoryService: DocumentCategoryService
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _breadcrumbService: BreadcrumbService
    , private _activatedRoute: ActivatedRoute
    , private _routeParams: RouteParams) {
    super(_localeService, _translationService, _cdRef);
    //  const bcItem: IBreadcrumb = { label: 'Company', url: '/company' };
    // this._breadcrumbService.add(bcItem);
  }

  ngOnInit() {
    let employeeId = this._claimsHelper.getEmpIdOrDefault();


    if ((!isNullOrUndefined(this._claimsHelper.getCompanyId()) &&
      this._claimsHelper.getCompanyId().toLowerCase() === SystemTenantId.toLowerCase() &&
      this._claimsHelper.isConsultant() &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._routeParams.Cid))) {
      window.location.href = v1AppUrl + '/#/company/' + this._routeParams.Cid + '?cid=' + this._routeParams.Cid;
      return;
    }

    this._store.dispatch(new CompanyInformationComponentAction(employeeId));

    //Here we need to clear the company state related stuff for example document state stuff   
   
    this._store.let(fromRoot.getCurrentCompanyInformationComponent).takeUntil(this._destructor$).subscribe((data) => {
      this._companyInformationBarItems = data;
      this._cdRef.markForCheck();
    });
    this._activatedRoute.params.takeUntil(this._destructor$).subscribe((params) => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(this._routeParams.Cid)) {
        this._store.dispatch(new CompanyLoadAction(this._routeParams.Cid));
      }
      else {
        this._store.dispatch(new CompanyLoadAction(this._claimsHelper.getCompanyId()));
      }

    });

    this._companyDetails$ = this._store.let(fromRoot.getCurrentCompanyDetails);
  }

  onCompanyLogoSave(selectedFile: FileResult) {
    this._selectedFile = selectedFile;
    if (this._selectedFile.isValid) {
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, this._selectedFile.file.name);
      this._messenger.publish('snackbar', vm);
      let _documentToSave: Document = Object.assign({}, new Document());
      _documentToSave.LastModifiedDateTime = this._selectedFile.file.lastModifiedDate;
      _documentToSave.Category = 0;
      _documentToSave.FileName = this._selectedFile.file.name;
      _documentToSave.FileNameAndTitle = this._selectedFile.file.name;
      this._fileUploadService.Upload(_documentToSave, this._selectedFile.file).then((response: any) => {
        if (!isNullOrUndefined(response)) {
          let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, this._selectedFile.file.name);
          this._messenger.publish('snackbar', vm);
          this._imgPreviewSrcUrl = this._getImagePreviewUrl(response.Id);
          this._store.dispatch(new UploadCompanyLogoAction(response.Id));
          this._cdRef.markForCheck();
        }
      }, (error: string) => {
        new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Logo', this._selectedFile.file.name));
      });
    }
  }
  private _getImagePreviewUrl(fileId: string) {
    if (isNullOrUndefined(fileId))
      return null;
    return this._routeParams.Cid ? `/filedownload?documentId=${fileId}&cid=${this._routeParams.Cid}` : `/filedownload?documentId=${fileId}`;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
