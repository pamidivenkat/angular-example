import { NavigationStart, Router } from '@angular/router';
import { DocumentCategoryEnum } from '../../../document/models/document-category-enum';
import { DatePipe } from '@angular/common';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { FileResult } from './../../../atlas-elements/common/models/file-result';
import { UpdateDocument } from './../../../document/actions/document.actions';
import { FileUploadService } from './../../../shared/services/file-upload.service';
import { Document } from './../../../document/models/document';
import { RouteParams } from '../../../shared/services/route-params';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';
import { BaseComponent } from '../../../shared/base-component';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { AeImageAvatarSize } from '../../../atlas-elements/common/ae-image-avatar-size.enum';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as employeeActions from '../../actions/employee.actions';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import { EmployeeInformation } from "../../models/employee-information";
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import { EmployeeProfilePictureUpdate } from "../../actions/employee.actions";

@Component({
  selector: 'app-employeeInformation',
  templateUrl: './employee-information.component.html',
  styleUrls: ['./employee-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeInformationComponent extends BaseComponent implements OnInit, OnDestroy {
  // private fields
  private _imageAvatarSize = AeImageAvatarSize.big;
  private _imgPreviewEditIconSize: AeIconSize = AeIconSize.small;
  private _getPictureUrl: BehaviorSubject<string> = new BehaviorSubject<string>('/assets/images/profile-default.png');
  private _empInfo;
  private _employeeInfoSubscription: Subscription;
  private _employeePictureDocumentId: string;
  private _cid: string;
  private _selectedFile: FileResult;
  private _employeeId: string;
  private _maxEmployeePictureImageSize: number = 5000000;
  private _isModifiedIndex: number = 0;
  // end of private fields
  //public properties start
  get getPictureUrl(): BehaviorSubject<string> {
    return this._getPictureUrl;
  }
  get imageAvatarSize() {
    return this._imageAvatarSize;
  }
  get imgPreviewEditIconSize(): AeIconSize {
    return this._imgPreviewEditIconSize;
  }
  get maxEmployeePictureImageSize(): number {
    return this._maxEmployeePictureImageSize;
  }
  get empInfo(): any {
    return this._empInfo;
  }
  //public properties ends

  // constructor start 
  constructor(private _changeDetector: ChangeDetectorRef
    , private _store: Store<fromRoot.State>, _localeService: LocaleService, _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService
    , private _routeParams: RouteParams
    , private _router: Router
    , private _messenger: MessengerService
    , private _fileUploadService: FileUploadService
    , private _claimsHelper: ClaimsHelperService
    , private _datePipe: DatePipe
  ) {
    super(_localeService, _translationService, _changeDetector);
  }
  // constructor end

  // Private method declarations start
  // End of private method declarations

  // public method declaration start
  onEmployeeProfilePicChange($event: any) {
    //here we need to update the employe profile picture with the selected image  
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile)) {
      let documentToSave: any = {};
      documentToSave.CompanyId = this._cid ? this._cid : this._claimsHelper.getCompanyId();
      documentToSave.RegardingObjectId = this._empInfo.Id;
      documentToSave.RegardingObjectTypeCode = 17;
      documentToSave.LastModifiedDateTime = this._datePipe.transform(this._selectedFile.file.lastModifiedDate, 'medium');
      documentToSave.FileName = this._selectedFile.file.name;
      documentToSave.Category = DocumentCategoryEnum.Uploads;
      documentToSave.Usage = 2;
      documentToSave.Sensitivity = 1;
      documentToSave.documentId = this._employeePictureDocumentId ? this._employeePictureDocumentId : null;
      let vm = ObjectHelper.operationInProgressSnackbarMessage('Uploading profile picture..');
      this._messenger.publish('snackbar', vm);
      this._fileUploadService.Upload(documentToSave, this._selectedFile.file).then((response: any) => {
        documentToSave.documentId = response.Id;
        this._isModifiedIndex++;
        this._store.dispatch(new EmployeeProfilePictureUpdate(documentToSave.documentId));
        this._getPictureUrl.next((this._cid) ? `/filedownload?documentId=${documentToSave.documentId}&isModifiedIndex=${this._isModifiedIndex}&cid=${this._cid}`
          : `/filedownload?documentId=${documentToSave.documentId}&isModifiedIndex=${this._isModifiedIndex}`);
      })
    }
  }
  hasEmployeeInfo() {
    return !isNullOrUndefined(this._empInfo);
  }

  hasEmail() {
    return !StringHelper.isNullOrUndefinedOrEmpty(this._empInfo.Email) && this._empInfo.HasEmail;
  }

  hasMobileNumber() {
    return !StringHelper.isNullOrUndefinedOrEmpty(this._empInfo.MobilePhone);
  }

  ngOnInit(): void {
    super.ngOnInit();
    let employeeInfo = this._store.let(fromRoot.getEmployeeInformationData);
    let routerEvent = this._router.events;
    let combineInfo = Observable.combineLatest(employeeInfo, routerEvent, (empInfo, routerChange) => {
      if (empInfo && routerChange) {
        this._empInfo = empInfo;
        if (!StringHelper.isNullOrUndefinedOrEmpty(this._empInfo.PictureId)) {
          this._cid = this._routeParams.Cid;
          this._employeePictureDocumentId = this._empInfo.PictureId;
          if (this._empInfo.PictureId !== '00000000-0000-0000-0000-000000000000') {
            this._getPictureUrl.next((this._cid) ? `/filedownload?documentId=${this._empInfo.PictureId}&isModifiedIndex=${this._isModifiedIndex}&cid=${this._cid}`
              : `/filedownload?documentId=${this._empInfo.PictureId}&isModifiedIndex=${this._isModifiedIndex}`);
          }
        }

        this._breadcrumbService.clear(BreadcrumbGroup.Employees);
        const bcItem: IBreadcrumb = new IBreadcrumb(`${empInfo.FirstName} ${empInfo.Surname}`, '', BreadcrumbGroup.Employees);
        this._breadcrumbService.add(bcItem);
        this._changeDetector.markForCheck();
      }
    });
    this._employeeInfoSubscription = combineInfo.subscribe();
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._employeeInfoSubscription)) {
      this._breadcrumbService.clear(BreadcrumbGroup.Employees); // to clear employee details on navigation to same breadcrumb group item.
      this._employeeInfoSubscription.unsubscribe();
    }
  }
  // End of public method declarations
}
