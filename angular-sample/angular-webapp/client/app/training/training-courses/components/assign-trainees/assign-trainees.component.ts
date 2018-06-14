import { LoadAllUsersAction } from './../../../../company/user/actions/user.actions';
import { mapUsersListToAeSelect } from '../../../common/extract-helper';
import { RouteParams } from '../../../../shared/services/route-params';
import { SendInviteForSelectedCourseRegardingObjectsAction } from './../../actions/training-courses.actions';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { LoadApplicableDepartmentsAction } from './../../../../shared/actions/user.actions';
import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { extractUserSelectOptionListData } from '../../../../employee/common/extract-helpers';
import { PublicUserInviteForm } from '../../../models/public-users-invite-form';
import { User } from '../../../../shared/models/user';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { TrainingCourseService } from '../../services/training-courses.service';
import { AeSortModel, SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { UserService } from '../../../../shared/services/user-services';
import { isNullOrUndefined } from 'util';
import { TrainingCourseInviteForm } from '../../../models/training-course-invitees-form';
import { TrainingCourse } from '../../../../shared/models/training-course.models';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { IFormBuilderVM, IFormFieldWrapper } from '../../../../shared/models/iform-builder-vm';
import { FormGroup } from '@angular/forms';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../../../shared/reducers';

@Component({
  selector: 'assign-trainees',
  templateUrl: './assign-trainees.component.html',
  styleUrls: ['./assign-trainees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignTraineesComponent extends BaseComponent implements OnInit, OnDestroy {

  private _assignTraineesForm: FormGroup;
  private _formName: string;
  private _assignTraineesFormVM: IFormBuilderVM;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _inviteUsersApiRequestParams: AtlasApiRequestWithParams;
  private _courseId: string;
  private _usersList: Array<any>;
  private _action: string;
  private _courseName: string;
  private _invitePublicUserFormVM: IFormBuilderVM;
  private _searchEventSubscription: Subscription;
  private _regardingObjects$: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>(null);
  private _regardingObjectsVisibility$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private _regardingObjectTypeCode: string;
  private _regardingObjectTypeField: IFormFieldWrapper<any>;
  private _regardingObjectsField: IFormFieldWrapper<any>;
  private _userNameField: IFormFieldWrapper<any>;
  private _subscriptions: Subscription[] = [];
  private _sites$: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>(null);
  private _departments$: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>(null);
  private _userNameVisibility$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private _allUsersLoaded: boolean = false;
  //do not make these as private as these are changed to public considering one purpose APB-19574
  invitePublicUserForm: FormGroup;
  isStandardCourse: boolean = false;

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _trainingCourseService: TrainingCourseService
    , private _claims: ClaimsHelperService
    , private _routeParams: RouteParams
    , private _userService: UserService) {
    super(_localeService, _translationService, _cdRef);
  }

  get assignTraineesFormVM(): IFormBuilderVM {
    return this._assignTraineesFormVM;
  }

  get assignTraineesForm(): FormGroup {
    return this._assignTraineesForm;
  }

  //Input Output Bindings
  @Input('StandardCourse')
  get StandardCourse() {
    return this.isStandardCourse;
  }
  set StandardCourse(val: boolean) {
    this.isStandardCourse = val;
  }

  @Input('courseId')
  get courseId() {
    return this._courseId;
  }
  set courseId(val: string) {
    this._courseId = val;
  }
  @Input('courseName')
  get courseName() {
    return this._courseName;
  }
  set courseName(val: string) {
    this._courseName = val;
  }
  @Input('action')
  get action(): string {
    return this._action;
  }
  set action(val: string) {
    this._action = val;
  }

  get invitePublicUserFormVM(): IFormBuilderVM {
    return this._invitePublicUserFormVM;
  }
  @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() submit: EventEmitter<boolean> = new EventEmitter<boolean>();
  //Input Output Bindings end

  //init method starts
  ngOnInit() {
    if (this._action == "AssignUsers") {
      this._formName = 'assignTraineesForm';
      this._assignTraineesFormVM = new TrainingCourseInviteForm(this._formName);
      this._fields = this._assignTraineesFormVM.init();

      //setting the data source for regarding object
      let items: Immutable.List<AeSelectItem<string>>;
      if (this._claims.canViewAllEmployees() || (this._claims.isHSOrELConsultant() && !isNullOrUndefined(this._routeParams.Cid))) {
        items = Immutable.List<AeSelectItem<string>>([
          new AeSelectItem<string>('All users in the company', '1')
          , new AeSelectItem<string>('Site', '3')
          , new AeSelectItem<string>('Department', '4')
          , new AeSelectItem<string>('User', '11')
        ]);
      }
      else {
        items = Immutable.List<AeSelectItem<string>>([
          new AeSelectItem<string>('Department', '4')
          , new AeSelectItem<string>('User', '11')
        ]);
      }


      let siteSub = this._store.let(fromRoot.getsitesForMultiSelectData).subscribe(sites => {
        if (isNullOrUndefined(sites)) {
          this._store.dispatch(new LoadSitesAction(false));
        } else {
          this._sites$.next(sites);
        }
      });
      this._subscriptions.push(siteSub);

      let deptSub = this._store.let(fromRoot.getApplicableDepartmentsDataForMultiSelect).subscribe(departments => {
        if (isNullOrUndefined(departments)) {
          this._store.dispatch(new LoadApplicableDepartmentsAction());
        } else {
          this._departments$.next(departments);
        }
      });

      this._subscriptions.push(deptSub);

      this._regardingObjectTypeField = this._fields.find(field => field.field.name === 'RegardingObjectType');
      this._regardingObjectsField = this._fields.find(field => field.field.name === 'RegardingObjects');
      this._userNameField = this._fields.find(field => field.field.name === 'UserName');

      if (!isNullOrUndefined(this._regardingObjectTypeField)) {
        (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>(this._regardingObjectTypeField).context.getContextData().get('options')).next(
          items
        );
        //subscribe to change event..
        let sub = (<EventEmitter<any>>(this._regardingObjectTypeField).context.getContextData().get('onSelectChange')).subscribe((val) => {
          this._setRegardingObjects(val.SelectedValue);
        });
        this._subscriptions.push(sub);
      }

      this._regardingObjects$ = (<BehaviorSubject<AeSelectItem<string>[]>>(this._regardingObjectsField).context.getContextData().get('items'));
      this._regardingObjectsVisibility$ = (<BehaviorSubject<boolean>>(this._regardingObjectsField).context.getContextData().get('propertyValue'));
      this._userNameVisibility$ = (<BehaviorSubject<boolean>>(this._userNameField).context.getContextData().get('propertyValue'));
      this._userNameVisibility$.next(false);

      if (!isNullOrUndefined(this._userNameField)) {
        let allUsersSub = this._store.let(fromRoot.getAllUsersData).subscribe((allUsers) => {
          if (allUsers) {
            this._allUsersLoaded = true;
            let allUsersAeSelects = mapUsersListToAeSelect(allUsers);
            (<BehaviorSubject<AeSelectItem<string>[]>>this._userNameField.context.getContextData().get('items')).next(allUsersAeSelects);
          }
        });
        this._subscriptions.push(allUsersSub);
      }

      //Below code is not used since we are populating users in local mode
      // if (!isNullOrUndefined(this._userNameField)) {
      //   this._searchEventSubscription = (<EventEmitter<any>>this._userNameField.context.getContextData().get('searchEvent')).subscribe((user) => {
      //     this._trainingCourseService.getFilteredUserData(user.query, this._courseId, this._isStandardCourse).first().subscribe((data) => {
      //       (<BehaviorSubject<AeSelectItem<string>[]>>this._userNameField.context.getContextData().get('items')).next(data.map((keyValuePair) => {
      //         let aeSelectItem = new AeSelectItem<string>(keyValuePair.FirstName + ' ' + keyValuePair.LastName, keyValuePair.Id, false);
      //         aeSelectItem.Childrens = null;
      //         return aeSelectItem;
      //       }));
      //     });
      //   });
      // }

    }
    if (this._action == "InvitePublicUser") {
      this._formName = 'invitePublicUserForm';
      this._invitePublicUserFormVM = new PublicUserInviteForm(this._formName, this._trainingCourseService, this._cdRef);
      this._fields = this._invitePublicUserFormVM.init();

      let nameField = this._fields.find(field => field.field.name === 'FirstName');
      let surNameField = this._fields.find(field => field.field.name === 'Surname');
      let emailField = this._fields.find(field => field.field.name === 'Email');
    }
  }

  //private methods
  private _setRegardingObjects(regardingObjectType: string) {
    switch (regardingObjectType) {
      case '1':
        this._regardingObjectsVisibility$.next(false);
        this._regardingObjects$.next([]);
        this._userNameVisibility$.next(false);
        break;
      case '3':
        this._regardingObjectsVisibility$.next(true);
        this._regardingObjects$.next(this._sites$.value);
        this._userNameVisibility$.next(false);
        break;
      case '4':
        this._regardingObjectsVisibility$.next(true);
        this._regardingObjects$.next(this._departments$.value);
        this._userNameVisibility$.next(false);
        break;
      case '11':
        this._regardingObjectsVisibility$.next(false);
        this._regardingObjects$.next([]);
        this._userNameVisibility$.next(true);
        if (!this._allUsersLoaded) {
          this._allUsersLoaded = true;
          this._store.dispatch(new LoadAllUsersAction());
        }
        break;
      default:
        this._regardingObjectsVisibility$.next(false);
        this._regardingObjects$.next([]);
        this._userNameVisibility$.next(false);
        break;
    }
    this._cdRef.markForCheck();
  }

  private extractUserData(res: any) {
    let userList = Array.from(res as User[]);
    if (!isNullOrUndefined(this._usersList)) {
      userList.forEach((data) => {
        let id = data.Id;
        let user = this._usersList.find(user =>
          user.Id === id
        );
        if (isNullOrUndefined(user))
          this._usersList.push({ FirstName: data.FirstName, LastName: data.LastName, HasEmail: data.HasEmail, Surname: data.Surname, Id: data.Id, Email: data.Email, UserName: data.UserName, CompanyId: this._claims.getCompanyId() });
      });
    }
    else {
      this._usersList = <User[]>userList;
    }
  }
  //private method ends here

  //public methods

  public onCancel() {
    this.cancel.emit(false);
  }
  public onSubmit() {
    if (this._assignTraineesForm.valid) {
      let regardingObjects: Array<string> = [];
      let regardingObjectTypeCode: string = this._assignTraineesForm.get('RegardingObjectType').value;
      if (regardingObjectTypeCode == '11') {
        if (!isNullOrUndefined(this._assignTraineesForm.get('UserName')))
          regardingObjects = this._assignTraineesForm.get('UserName').value;
      } else {
        if (!isNullOrUndefined(this._assignTraineesForm.get('RegardingObjects')))
          regardingObjects = this._assignTraineesForm.get('RegardingObjects').value;
      }
      this._store.dispatch(new SendInviteForSelectedCourseRegardingObjectsAction({ regardingObjectTypeCode: regardingObjectTypeCode, regardingObjects: regardingObjects }));
      this.submit.emit(false);
    }
  }
  public onFormInit(fg: FormGroup) {
    this._assignTraineesForm = fg;
    let userName = this._assignTraineesForm.get('UserName');
    if (!isNullOrUndefined(userName)) {
      this._assignTraineesForm.get('UserName').setValue(null);
    }
  }
  public InvitePublicUserFormInit(fg: FormGroup) {
    this.invitePublicUserForm = fg;
    this.invitePublicUserForm.get('FirstName').setValue('');
    this.invitePublicUserForm.get('Surname').setValue('');
    this.invitePublicUserForm.get('Email').setValue('');
  }
  public formButtonLabels() {
    let labels = { Submit: 'Submit' };
    return labels;
  }
  public buttonLabels() {
    let labels = { Submit: 'Save' };
    return labels;
  }
  public showAssignForm() {
    if (this._action == "AssignUsers")
      return true;
    else
      return false;
  }
  public showInvitePublicUserForm() {
    if (this._action == "InvitePublicUser")
      return true;
    else
      return false;
  }
  public onInvitePublicUserFormSubmit() {
    setTimeout(() => {
      if (this.invitePublicUserForm.valid) {
        let userData = new User();
        let firstName = this.invitePublicUserForm.get('FirstName').value;
        let lastName = this.invitePublicUserForm.get('Surname').value;
        let email = this.invitePublicUserForm.get('Email').value;
        let hasEmail = true;
        let isStandardCourse = this.isStandardCourse;
        this._trainingCourseService.invitePublicUser({ firstName: firstName, lastName: lastName, email: email, hasEmail: true, isStandardCourse: isStandardCourse });
        this.submit.emit(false);
      }
    }, 200);
  }
  
  public getTitle() {
    return "Assign Trainees" + ' - ' + this._courseName;
  }
  //public method ends here

  ngOnDestroy() {
    if (this._subscriptions) {
      this._subscriptions.forEach(sub => {
        if (sub) {
          sub.unsubscribe();
        }
      });
    }
    if (this._searchEventSubscription)
      this._searchEventSubscription.unsubscribe();

  }
}
