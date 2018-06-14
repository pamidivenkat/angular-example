import { LoadCompanyDocumentsStatAction } from './../../../../document/company-documents/actions/company-documents.actions';
import { DatePipe } from '@angular/common';
import { EmployeeTimeLineUpdateDocument, AddEmployeevent } from './../../../actions/employee.actions';
import { FileUploadService } from './../../../../shared/services/file-upload.service';
import { EmployeeEvent } from './../../../employee-timeline/models/emloyee-event';
import { EventType } from './../../../models/timeline';
import { EmployeeTimelineEventTypesLoad } from './../../../../shared/actions/lookup.actions';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AePosition } from '../../../../atlas-elements/common/ae-position.enum';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import * as fromRoot from '../../../../shared/reducers';
import { User } from '../../../../shared/models/user';
import { isNullOrUndefined } from "util";
import { FormGroup, FormBuilder } from "@angular/forms";
import { UserAdminDetails, ResetPasswordVM } from '../../../../employee/administration/models/user-admin-details.model';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import * as Immutable from 'immutable';
import { UserProfile } from '../../../../shared/models/lookup.models';
import { mapLookupTableToAeSelectItems } from '../../../../employee/common/extract-helpers';
import { UpdateEmployeeUserProfileAction, EmployeeRemoveAction } from '../../../../employee/actions/employee.actions';
import { UpdateUserStatusAction, ManualResetPasswordAction, LoadEmployeeLeaverEventDetails } from '../../../../employee/actions/employee.actions';
import { Router, NavigationExtras } from '@angular/router';
import { EmployeeInformation } from '../../../../employee/models/employee-information';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Rx';
import { Document } from '../../../../document/models/document';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { DateTimeHelper } from '../../../../shared/helpers/datetime-helper';
import { StringHelper } from './../../../../shared/helpers/string-helper';
@Component({
  selector: 'admin-details',
  templateUrl: './admin-details.component.html',
  styleUrls: ['./admin-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AdminDetailsComponent extends BaseComponent implements OnInit, AfterViewInit {
  // private fields
  private _employeeAdminDetailsVM: UserAdminDetails;
  private _employeeAdminDetailsForm: FormGroup;
  private _hasUser: boolean = false;
  private _isLeaver: boolean = false;
  private _resetPasswordSuccessPopup: boolean = false;
  private _isUserAccountExist: boolean = false;
  private _showUserProfileUpdateButton: boolean = false;
  private _employeeName: string;
  private _userProfiles: UserProfile[];
  private _showRemoveConfirmDialog: boolean;
  private _employeeInformation: EmployeeInformation;
  private _employeeRemovalSubscription: Subscription;

  lightClass: AeClassStyle = AeClassStyle.Light;
  darkClass: AeClassStyle = AeClassStyle.Dark;
  btnLeft: AePosition = AePosition.Left;
  btnRight: AePosition = AePosition.Right;
  private _afterLoad: boolean = false;
  private _selectedEvent: EventType;
  private _action: string;
  private _showLeaverSlideout: boolean;
  private _employeeId: string;
  private _employeeIdToFetch$: Observable<string>;
  private _showLeaverAlert: boolean;
  private _leaverTerminationDate: string;
  private _userProfileErrorMsg: boolean = false;
  // Input variables
  get DataSourceType() {
    return AeDatasourceType.Local;
  }

  get showLeaverAlert() {
    return this._showLeaverAlert;
  }
  get leaverTerminationDate() {
    return this._leaverTerminationDate;
  }

  get action(): string {
    return this._action;
  }
  get selectedEvent(): EventType {
    return this._selectedEvent;
  }
  get EmployeeAdminDetailsForm() {
    return this._employeeAdminDetailsForm;
  }
  get IsUserAccountExist() {
    return this._isUserAccountExist;
  }
  get HasUser() {
    return this._hasUser;
  }
  get IsLeaver() {
    return this._isLeaver;
  }
  get ShowUserProfileUpdateButton() {
    return this._showUserProfileUpdateButton;
  }
  get UserProfileList() {
    if (this._employeeInformation.HasEmail) {
      return this._userProfiles;
    } else if (!this._employeeInformation.HasEmail &&
      !isNullOrUndefined(this._userProfiles)) {
      let filteredProfiles = this._userProfiles
        .filter(obj => !StringHelper.isNullOrUndefinedOrEmpty(obj.Name) &&
          (obj.Name.toLowerCase() == 'employee' || obj.Name.toLowerCase() == 'publicuserprofile'));
      return filteredProfiles;
    } else {
      return <UserProfile[]>[];
    }
  }
  get ShowRemoveConfirmDialog() {
    return this._showRemoveConfirmDialog;
  }
  get UserProfileErrorMsg() {
    return this._userProfileErrorMsg;
  }
  @Input('employeeAdminDetails')
  set employeeAdminDetails(val: UserAdminDetails) {
    this._employeeAdminDetailsVM = val;
    if (!isNullOrUndefined(val)) {
      this._employeeName = this._employeeAdminDetailsVM.FirstName + ' ' + (isNullOrUndefined(this._employeeAdminDetailsVM.Surname) ? '' : this._employeeAdminDetailsVM.Surname) + this._employeeAdminDetailsVM.LastName;
      this._hasUser = val.IsActive ? true : false;
      this._isUserAccountExist = true;
      this._initForm();
    }
    this._cdRef.markForCheck();
  }
  get employeeAdminDetails() {
    return this._employeeAdminDetailsVM;
  }


  @Input('employeeInformation')
  set employeeInformation(val: EmployeeInformation) {
    if (!isNullOrUndefined(val)) {
      this._employeeInformation = val;
      this._employeeName = this._employeeInformation.FirstName + ' ' + this._employeeInformation.Surname;
    }
  }
  get employeeInformation() {
    return this._employeeInformation;
  }



  @Input('isLeaver')
  get isLeaver() {
    return this._isLeaver;
  }
  set isLeaver(val: boolean) {
    this._isLeaver = val;
    this._cdRef.markForCheck();
  }


  @Input('UserProfiles')
  set UserProfiles(value: UserProfile[]) {
    this._userProfiles = value;
  }
  get UserProfiles(): UserProfile[] {
    return this._userProfiles;
  }

  @Output()
  resetPassword: EventEmitter<ResetPasswordVM> = new EventEmitter<ResetPasswordVM>();

  @Output('onOptionsSave') _onFormSubmitted: EventEmitter<any> = new EventEmitter<any>();


  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fileUpload: FileUploadService
    , private _datePipe: DatePipe
    , private _router: Router) {
    super(_localeService, _translationService, _cdRef);
    this._showLeaverSlideout = false;
  }

  ngOnInit() {
    this._initForm();
    this._employeeRemovalSubscription = this._store.let(fromRoot.getEmployeeRemovalProgressStatus).subscribe(res => {
      if (!res && this._afterLoad) {
        let navigationExtras: NavigationExtras = {
          queryParamsHandling: 'merge'
        };
        this._router.navigate(['/employee/manage'], navigationExtras);
      }
    });
    this._employeeIdToFetch$ = this._store.let(fromRoot.getEmployeeId);
    this._employeeIdToFetch$.takeUntil(this._destructor$).subscribe((val) => {
      this._employeeId = val;
    });
    this._store.let(fromRoot.getEmployeeTimelineEventTypeList).takeUntil(this._destructor$).subscribe(eventTypes => {
      if (!isNullOrUndefined(eventTypes)) {
        let leaverData = eventTypes.filter(f => f.Code === 5);
        this._selectedEvent = leaverData[0];
      } else {
        this._store.dispatch(new EmployeeTimelineEventTypesLoad(true));
      }
    });

    Observable.combineLatest(
      this._store.let(fromRoot.getEmployeeTimelineEventTypeList),
      this._store.let(fromRoot.getEmployeeLeaverEventDetails)
    ).takeUntil(this._destructor$).subscribe(vals => {
      let eventTypes = vals[0];
      let leaverEventDetails = vals[1];

      if (!isNullOrUndefined(eventTypes) &&
        isNullOrUndefined(leaverEventDetails)) {
        this._store.dispatch(new LoadEmployeeLeaverEventDetails(true));
      } else if (!isNullOrUndefined(leaverEventDetails)) {
        if (leaverEventDetails.length > 0) {
          if (DateTimeHelper.getDatePart(leaverEventDetails[0].LeaverTerminationDate) >
            DateTimeHelper.getDatePart(new Date())) {
            this._showLeaverAlert = true;
            this._leaverTerminationDate = this._datePipe.transform(new Date(leaverEventDetails[0].LeaverTerminationDate), 'dd/MM/yyyy');
          } else {
            this._showLeaverAlert = false;
            this._leaverTerminationDate = '';
          }
        } else {
          this._showLeaverAlert = false;
          this._leaverTerminationDate = '';
        }
        this._cdRef.markForCheck();
      }
    });
  }

  ngAfterViewInit(): void {
    this._afterLoad = true;
  }
  private _initForm() {

    this._employeeAdminDetailsForm = this._fb.group({
      HasUser: [{ value: !isNullOrUndefined(this._employeeAdminDetailsVM) ? (this._employeeAdminDetailsVM.IsActive) : false, disabled: false }],
      IsLeaver: [{ value: this._isLeaver, disabled: false }],
      UserName: [{ value: !isNullOrUndefined(this._employeeAdminDetailsVM) ? (this._employeeAdminDetailsVM.Email ? this._employeeAdminDetailsVM.Email : this._employeeAdminDetailsVM.UserName) : '', disabled: false }],
      UserProfile: [{ value: !isNullOrUndefined(this._employeeAdminDetailsVM) ? this._employeeAdminDetailsVM.UserProfiles : [], disabled: false }],
      IsActive: [{ value: !isNullOrUndefined(this._employeeAdminDetailsVM) ? this._employeeAdminDetailsVM.IsActive : false, disabled: false }],
    }
    );

    for (let name in this._employeeAdminDetailsForm.controls) {
      let control = this._employeeAdminDetailsForm.controls[name];
      control.valueChanges.subscribe(v => {
        if (name != 'IsLeaver') {
          this._employeeAdminDetailsVM[name] = v;
          if (name === 'HasUser') {
            this._updateUserStatus(this._employeeAdminDetailsVM.Id, v);
          }
        }
      });
    }
  }

  oncancel($event: any) {
    this._showLeaverSlideout = false;
    this._isLeaver = false;
    this._employeeAdminDetailsForm.get('IsLeaver').setValue(false);
    this._cdRef.markForCheck();
  }

  onChangeLeaver($event: any) {
    if ($event === true) {
      this._showLeaverSlideout = true;
      this._action = 'Add';
      this._isLeaver = true;
    }
  }

  showAddOrUpdateLeaverSlideOut(): boolean {
    return this._showLeaverSlideout === true;
  }

  getSlideoutAnimateState(): boolean {
    return this._showLeaverSlideout === true;
  }

  getSlideoutState(): string {
    return this._showLeaverSlideout === true ? 'expanded' : 'collapsed';
  }

  onSubmit(data: EmployeeEvent) {
    if (!isNullOrUndefined(data)) {
      if (!isNullOrUndefined(data.Attachment)) {
        if (!isNullOrUndefined(data.Attachment.File)) {
          this._uploadDocument(data);
        }
        else {
          let document = data.Documents[0];
          document.ExpiryDate = data.Attachment.ExpriryDate;
          document.ReminderInDays = data.Attachment.ReminderInDays;
          this._store.dispatch(new EmployeeTimeLineUpdateDocument(document));
          this._addOrUpdateEvent(data);
        }

      }
      else {
        this._addOrUpdateEvent(data);
      }
    }

    this._showLeaverSlideout = false;
    this._employeeAdminDetailsForm.get('IsLeaver').setValue(false);
  }

  private _uploadDocument(data: EmployeeEvent) {
    this._fileUpload.Upload(this._prepareDocumentModel(data), data.Attachment.File.file).then((response: any) => {
      if (isNullOrUndefined(data.Documents)) {
        data.Documents = new Array<Document>();
      }
      data.Documents.push(<Document>response);
      if (this._action === 'Add') {
        this._store.dispatch(new AddEmployeevent(data));
        this._store.dispatch(new LoadCompanyDocumentsStatAction());
      }
    }, (error: string) => { console.log(error); });
  }

  private _prepareDocumentModel(data: EmployeeEvent) {
    let document: Document = new Document();
    document.Category = 0;
    document.Comment = data.Attachment.Comment;
    document.Description = data.Attachment.Description;
    document.Usage = 2;
    document.LastModifiedDateTime = this._datePipe.transform(data.Attachment.File.file.lastModifiedDate, 'medium');
    document.FileName = data.Attachment.File.file.name;
    document.CompanyId = this._claimsHelper.getCompanyId();
    document.RegardingObjectId = this._employeeId;
    document.RegardingObjectTypeCode = 17;
    document.Sensitivity = data.Sensitivity;
    document.ExpiryDate = this._datePipe.transform(data.Attachment.ExpriryDate, 'medium');
    document.ReminderInDays = data.Attachment.ReminderInDays;
    return document;
  }

  private _addOrUpdateEvent(data: EmployeeEvent) {
    if (this._action === 'Add') {
      this._store.dispatch(new AddEmployeevent(data));
    }
  }

  onUserProfileChanged($event: any) {
    this._showUserProfileUpdateButton = true;
    this._cdRef.markForCheck();

  }
  onUserProfileCleared($event: any) {
    this._showUserProfileUpdateButton = true;
    this._cdRef.markForCheck();
  }

  onUpdateProfilesAncClick($event: any) {
    if (this._employeeAdminDetailsVM['UserProfile'].length == 0) {
      this._userProfileErrorMsg = true;
    } else {
      if (this._employeeAdminDetailsVM.IsActive)
        this._store.dispatch(new UpdateEmployeeUserProfileAction(this._employeeAdminDetailsVM['UserProfile']));
      this._showUserProfileUpdateButton = false;
      this._userProfileErrorMsg = false;
    }
    this._cdRef.markForCheck();
  }

  private _updateUserStatus(userId: string, status: boolean) {
    this._employeeAdminDetailsVM.IsActive = status;
    this._cdRef.markForCheck();
    this._store.dispatch(new UpdateUserStatusAction({ userId: userId, status: status }));
  }

  resetPasswordField() {
    let resetModel: ResetPasswordVM = new ResetPasswordVM();
    resetModel.IsEmailUser = !isNullOrUndefined(this._employeeAdminDetailsVM.Email && this._employeeAdminDetailsVM.IsActive) ? true : false;
    resetModel.Email = this._employeeAdminDetailsVM.Email;
    resetModel.UserId = this._employeeAdminDetailsVM.Id;
    resetModel.NewPassword = '';
    this.resetPassword.emit(resetModel);
  }

  removeEmployeeClick() {
    this._showRemoveConfirmDialog = true;
  }

  /**
* remove pop-up close event
* 
* @private
* @param {*} event
* 
* @memberOf AdminDetailsComponent
*/
  public removeConfirmModalClosed(event: any) {
    this._showRemoveConfirmDialog = false;
  }

  /**
* remove pop-up confirm event
* 
* @private
* @param {*} event
* 
* @memberOf AdminDetailsComponent
*/
  removeEmployee(event: any) {
    this._showRemoveConfirmDialog = false;  //close the confirm popup
    this._store.dispatch(new EmployeeRemoveAction(this._employeeInformation));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this._employeeRemovalSubscription)
      this._employeeRemovalSubscription.unsubscribe();
  }
}
