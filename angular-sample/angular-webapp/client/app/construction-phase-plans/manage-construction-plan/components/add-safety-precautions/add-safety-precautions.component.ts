import { User } from './../../../../shared/models/user';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { emptyGuid } from './../../../../shared/app.constants';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { UserService } from './../../../../shared/services/user-services';
import { FormGroup } from '@angular/forms';
import { AddSafetyPrecautionsForm } from '../../../models/add-safetyPrecautions.form';
import { ConstructionPhasePlan, CPPSafetyPrecautions } from './../../../models/construction-phase-plans';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';


@Component({
  selector: 'add-safety-precautions',
  templateUrl: './add-safety-precautions.component.html',
  styleUrls: ['./add-safety-precautions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSafetyPrecautionsComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _cppAddSafetyPrecautionsVM: IFormBuilderVM;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _formName: string;
  private _addUpdateSafetyPrecautionsForm: FormGroup;
  private _context: any;
  private _safetyPrecautionsModel: CPPSafetyPrecautions;
  private _emergencyRespUserSub: Subscription;
  private _emergencyRespUserSelectSub: Subscription;
  private _emergencyRespUserInputChangeSub: Subscription;
  private _userServiceSub: Subscription;
  private _contextEmergencyOtherUserFieldPropertyValue: BehaviorSubject<boolean>;
  private _selectedEmergencyUser: User;
  private _firstAidRespUserSub: Subscription;
  private _firstAidUserSelectSub: Subscription;
  private _firstAidUserInputChangeSub: Subscription;
  private _contextFirstAidOtherUserFieldPropertyValue: BehaviorSubject<boolean>;
  private _selectedFirstAidUser: User;
  private _fireRespUserSub: Subscription;
  private _fireUserSelectSub: Subscription;
  private _fireUserInputChangeSub: Subscription;
  private _contextFireOtherUserFieldPropertyValue: BehaviorSubject<boolean>;
  private _selectedFireUser: User;
  private _accidentReportRespUserSub: Subscription;
  private _accidentReportUserSelectSub: Subscription;
  private _accidentReportUserInputChangeSub: Subscription;
  private _contextaccidentReportOtherUserFieldPropertyValue: BehaviorSubject<boolean>;
  private _selectedAccidentReportedUser: User;
  private _operationMode: string;
  private _action: string;
  // End of Private Fields

  // Public properties  
  @Input('safetyPrecautions')
  set safetyPrecautions(val: CPPSafetyPrecautions) {
    this._safetyPrecautionsModel = val;
    //Need to format the model based on binding requirements
    if (this._safetyPrecautionsModel) {
      this._safetyPrecautionsModel = this._formatInput(this._safetyPrecautionsModel);
      this._operationMode = 'update';
    } else {
      this._safetyPrecautionsModel = new CPPSafetyPrecautions();
      this._operationMode = 'add';
    }
    this._patchForm(this._safetyPrecautionsModel);
  }
  get safetyPrecautions() {
    return this._safetyPrecautionsModel;
  }  

  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  @Input('action')
  get action() {
    return this._action;
  }
  set action(value: string) {
    this._action = value;
  }
  get cppAddSafetyPrecautionsVM(): IFormBuilderVM {
    return this._cppAddSafetyPrecautionsVM;
  }
  // End of Public properties

  // Public Output bindings
  @Output('onAeSubmit') _onAeSubmit: EventEmitter<CPPSafetyPrecautions> = new EventEmitter<CPPSafetyPrecautions>();
  @Output('aeClose') _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _userService: UserService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods

  private _formatInput(safetyModel: CPPSafetyPrecautions): CPPSafetyPrecautions {
    let common: User = new User();
    common.FirstName = 'other';
    common.LastName = '';
    common.Id = emptyGuid;

    if (!StringHelper.isNullOrUndefinedOrEmpty(safetyModel.EmergencyRespOtherUser)) {
      // we need to append the other option EmergencyRespUser property
      safetyModel.EmergencyRespUserId = emptyGuid;
      let otherUserOption: User = new User();
      Object.assign(otherUserOption, common);
      safetyModel.EmergencyRespUser = otherUserOption;
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(safetyModel.FirstAidRespOtherUser)) {
      // we need to append the other option EmergencyRespUser property
      safetyModel.FirstAidRespUserId = emptyGuid;
      let otherUserOption: User = new User();
      Object.assign(otherUserOption, common);
      safetyModel.FirstAidRespUser = otherUserOption;
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(safetyModel.FireRespOtherUser)) {
      // we need to append the other option EmergencyRespUser property
      safetyModel.FireRespUserId = emptyGuid;
      let otherUserOption: User = new User();
      Object.assign(otherUserOption, common);
      safetyModel.FireRespUser = otherUserOption;
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(safetyModel.AccidentRespOtherUser)) {
      // we need to append the other option EmergencyRespUser property
      safetyModel.AccidentRespUserId = emptyGuid;
      let otherUserOption: User = new User();
      Object.assign(otherUserOption, common);
      safetyModel.AccidentRespUser = otherUserOption;
    }
    return safetyModel;
  }

  private _formatOutPut(safetyModel: CPPSafetyPrecautions): CPPSafetyPrecautions {

    if ((safetyModel.EmergencyRespUserId != emptyGuid)) {
      // we need to append the other option EmergencyRespUser property
      safetyModel.EmergencyRespOtherUser = null;
      safetyModel.EmergencyRespUserId = this._selectedEmergencyUser ? this._selectedEmergencyUser.Id : null;
    } else {
      safetyModel.EmergencyRespUser = null;
      safetyModel.EmergencyRespUserId = null;
    }
    if ((safetyModel.FirstAidRespUserId != emptyGuid)) {
      // we need to append the other option EmergencyRespUser property
      safetyModel.FirstAidRespOtherUser = null;
      safetyModel.FirstAidRespUserId = this._selectedFirstAidUser ? this._selectedFirstAidUser.Id : null;
    }
    else {
      safetyModel.FirstAidRespUser = null;
      safetyModel.FirstAidRespUserId = null;
    }
    if ((safetyModel.FireRespUserId != emptyGuid)) {
      // we need to append the other option EmergencyRespUser property
      safetyModel.FireRespOtherUser = null;
      safetyModel.FireRespUserId = this._selectedFireUser ? this._selectedFireUser.Id : null;
    } else {
      safetyModel.FireRespUserId = null;
      safetyModel.FireRespUser = null;
    }
    if ((safetyModel.AccidentRespUserId != emptyGuid)) {
      // we need to append the other option EmergencyRespUser property
      safetyModel.AccidentRespOtherUser = null;
      safetyModel.AccidentRespUserId = this._selectedAccidentReportedUser ? this._selectedAccidentReportedUser.Id : null;
    } else {
      safetyModel.AccidentRespUserId = null;
      safetyModel.AccidentRespUser = null;
    }
    //for safe side remove if any empty guids are theere
    if (safetyModel.EmergencyRespUserId == emptyGuid)
      safetyModel.EmergencyRespUserId = null;
    if (safetyModel.FireRespUserId == emptyGuid)
      safetyModel.FireRespUserId = null;
    if (safetyModel.FirstAidRespUserId == emptyGuid)
      safetyModel.FirstAidRespUserId = null;
    if (safetyModel.AccidentRespUserId == emptyGuid)
      safetyModel.AccidentRespUserId = null;
    //safetyModel.IsAsbestos = safetyModel.IsAsbestos == 1 ? true : false;
    return safetyModel;
  }
  private _patchForm(safetyModel: CPPSafetyPrecautions) {

    let emergencyRespUser = [];
    if (safetyModel.EmergencyRespUser) {
      this._selectedEmergencyUser = safetyModel.EmergencyRespUser;
      emergencyRespUser.push(new AeSelectItem(safetyModel.EmergencyRespUser.FullName, safetyModel.EmergencyRespUser.Id, false));
    }

    let firstAidRespUser = [];
    if (safetyModel.FirstAidRespUser) {
      this._selectedFirstAidUser = safetyModel.FirstAidRespUser;
      firstAidRespUser.push(new AeSelectItem(safetyModel.FirstAidRespUser.FullName, safetyModel.FirstAidRespUser.Id, false));
    }

    let fireRespUser = [];
    if (safetyModel.FireRespUser) {
      this._selectedFireUser = safetyModel.FireRespUser;
      fireRespUser.push(new AeSelectItem(safetyModel.FireRespUser.FullName, safetyModel.FireRespUser.Id, false));
    }

    let accidentRespUser = [];
    if (safetyModel.AccidentRespUser) {
      this._selectedAccidentReportedUser = safetyModel.AccidentRespUser;
      accidentRespUser.push(new AeSelectItem(safetyModel.AccidentRespUser.FullName, safetyModel.AccidentRespUser.Id, false));
    }

    if (this._addUpdateSafetyPrecautionsForm) {
      this._addUpdateSafetyPrecautionsForm.patchValue({
        EmergencyRespUserId: safetyModel.EmergencyRespUserId
        , EmergencyRespOtherUser: safetyModel.EmergencyRespOtherUser
        , FirstAidRespUserId: safetyModel.FirstAidRespUserId
        , FirstAidRespOtherUser: safetyModel.FirstAidRespOtherUser
        , IsAsbestos: `${safetyModel.IsAsbestos}`
        , WelfareFacilities: safetyModel.WelfareFacilities
        , Communication: safetyModel.Communication
        , FireRespUserId: safetyModel.FireRespUserId
        , FireRespOtherUser: safetyModel.FireRespOtherUser
        , AccidentRespUserId: safetyModel.AccidentRespUserId
        , AccidentRespOtherUser: safetyModel.AccidentRespOtherUser
        , PPE: safetyModel.PPE
        , SiteSecurity: safetyModel.SiteSecurity
      });
    }
  }

  private _setAppropriateSelectedUser(useridProperty: string, selectedUser: AeSelectItem<string>[]) {
    let firstValueSelected: AeSelectItem<string>;
    if (selectedUser && selectedUser.length > 0) {
      firstValueSelected = selectedUser[0];
    } else {
      return;
    }

    let objUser: User = new User();
    objUser.FirstName = firstValueSelected.Text;
    objUser.Surname = '';
    objUser.LastName = '';
    objUser.Id = firstValueSelected.Value;


    switch (useridProperty) {
      case 'EmergencyRespUserId':
        if (firstValueSelected.Value != emptyGuid) {
          this._selectedEmergencyUser = objUser;
        }
        else {
          this._selectedEmergencyUser = null;
        }
        this._safetyPrecautionsModel.EmergencyRespUser = this._selectedEmergencyUser;
        break;
      case 'FirstAidRespUserId':
        if (firstValueSelected.Value != emptyGuid) {
          this._selectedFirstAidUser = objUser;
        }
        else {
          this._selectedFirstAidUser = null;
        }
        this._safetyPrecautionsModel.FirstAidRespUser = this._selectedFirstAidUser;
        break;
      case 'AccidentRespUserId':
        if (firstValueSelected.Value != emptyGuid) {
          this._selectedAccidentReportedUser = objUser;
        }
        else {
          this._selectedAccidentReportedUser = null;
        }
        this._safetyPrecautionsModel.AccidentRespUser = this._selectedAccidentReportedUser;
        break;
      case 'FireRespUserId':
        if (firstValueSelected.Value != emptyGuid) {
          this._selectedFireUser = objUser;
        }
        else {
          this._selectedFireUser = null;
        }
        this._safetyPrecautionsModel.FireRespUser = this._selectedFireUser;
        break;
    }
  }

  private _setUserAndOtherUserOptions(useridProperty: string, otherUserProperty: string, otherUserInitialValue: string, otherUserVisibility: BehaviorSubject<boolean>, userApiSub: Subscription, selectUserSub: Subscription, inputUserSub: Subscription) {
    let userField = this._formFields.filter(f => f.field.name === useridProperty)[0];
    let userFieldContextData = userField.context.getContextData()
    let otherUserField = this._formFields.filter(f => f.field.name === otherUserProperty)[0];
    otherUserVisibility = <BehaviorSubject<boolean>>otherUserField.context.getContextData().get('propertyValue');

    userApiSub = (<EventEmitter<any>>userFieldContextData.get('searchEvent')).subscribe((event) => {
      this._userServiceSub = this._userService.getFilteredUserData(event.query).first().subscribe((data) => {
        let otherOption: AeSelectItem<string> = new AeSelectItem<string>('other', emptyGuid);
        data.push(otherOption);
        (<BehaviorSubject<AeSelectItem<string>[]>>userFieldContextData.get('items')).next(data);
      });
    });

    if (!StringHelper.isNullOrUndefined(otherUserInitialValue)) // if some other value exists
      otherUserVisibility.next(true);

    selectUserSub = (<EventEmitter<any>>userFieldContextData.get('onSelectEvent')).subscribe((selectedUser) => {
      if (selectedUser && selectedUser[0].Value == emptyGuid) {
        otherUserVisibility.next(true);
      }
      else {
        otherUserVisibility.next(false);
        //here in this case the the appropirate UserObject property should be set to proper user object 
      }
      this._setAppropriateSelectedUser(useridProperty, selectedUser);
    });

    inputUserSub = (<EventEmitter<any>>userFieldContextData.get('onInputEvent')).subscribe((input) => {
      otherUserVisibility.next(false);
    });
    return otherUserVisibility;
  }
  // End of private methods

  // Public methods
  formButtonNames() {
    return (this._action == 'add' ? { Submit: 'Add' } : { Submit: 'Update' });
  }

  onCancel($event) {
    this._aeClose.emit(true);
  }

  onFormInit(fg: FormGroup) {
    this._addUpdateSafetyPrecautionsForm = fg;
    if (this._safetyPrecautionsModel) {
      this._patchForm(this._safetyPrecautionsModel);
    }
  }


  onSubmit($event) {
    if (this._addUpdateSafetyPrecautionsForm.valid) {
      let safetyPrecautionsToAddUpdate: CPPSafetyPrecautions = Object.assign({}, this._safetyPrecautionsModel, <CPPSafetyPrecautions>this._addUpdateSafetyPrecautionsForm.value);
      safetyPrecautionsToAddUpdate = this._formatOutPut(safetyPrecautionsToAddUpdate);
      this._onAeSubmit.emit(safetyPrecautionsToAddUpdate);
    }
  }


  title(): string {
    if (this._action == 'update') {
      return 'CPP_ADD.UPDATE_SAFETY_PRECAUTIONS';
    }
    else {
      return 'CPP_ADD.ADD_SAFETY_PRECAUTIONS';
    }
  }


  ngOnInit() {

    this._formName = 'AddSafetyPrecautions';
    this._cppAddSafetyPrecautionsVM = new AddSafetyPrecautionsForm(this._formName, this._safetyPrecautionsModel);
    this._formFields = this._cppAddSafetyPrecautionsVM.init();
    this._contextEmergencyOtherUserFieldPropertyValue = this._setUserAndOtherUserOptions('EmergencyRespUserId', 'EmergencyRespOtherUser', (this._safetyPrecautionsModel ? this._safetyPrecautionsModel.EmergencyRespOtherUser : null), this._contextEmergencyOtherUserFieldPropertyValue, this._emergencyRespUserSub, this._emergencyRespUserSelectSub, this._emergencyRespUserInputChangeSub);
    this._contextFirstAidOtherUserFieldPropertyValue = this._setUserAndOtherUserOptions('FirstAidRespUserId', 'FirstAidRespOtherUser', (this._safetyPrecautionsModel ? this._safetyPrecautionsModel.FirstAidRespOtherUser : null), this._contextFirstAidOtherUserFieldPropertyValue, this._firstAidRespUserSub, this._firstAidUserSelectSub, this._firstAidUserInputChangeSub);
    this._contextFireOtherUserFieldPropertyValue = this._setUserAndOtherUserOptions('FireRespUserId', 'FireRespOtherUser', (this._safetyPrecautionsModel ? this._safetyPrecautionsModel.FireRespOtherUser : null), this._contextFireOtherUserFieldPropertyValue, this._fireRespUserSub, this._fireUserSelectSub, this._fireUserInputChangeSub);
    this._contextaccidentReportOtherUserFieldPropertyValue = this._setUserAndOtherUserOptions('AccidentRespUserId', 'AccidentRespOtherUser', (this._safetyPrecautionsModel ? this._safetyPrecautionsModel.AccidentRespOtherUser : null), this._contextaccidentReportOtherUserFieldPropertyValue, this._accidentReportRespUserSub, this._accidentReportUserSelectSub, this._accidentReportUserInputChangeSub);

    if (this._operationMode == 'add') {
      //in add mode all other use fields should be set to visibility false
      this._contextEmergencyOtherUserFieldPropertyValue.next(false);
      this._contextFireOtherUserFieldPropertyValue.next(false);
      this._contextFirstAidOtherUserFieldPropertyValue.next(false);
      this._contextaccidentReportOtherUserFieldPropertyValue.next(false);
    }

  }
  ngOnDestroy() {

    if (this._emergencyRespUserSub) {
      this._emergencyRespUserSub.unsubscribe();
    }

    if (this._userServiceSub) {
      this._userServiceSub.unsubscribe();
    }

    if (this._emergencyRespUserSelectSub) {
      this._emergencyRespUserSelectSub.unsubscribe();
    }

    if (this._emergencyRespUserInputChangeSub) {
      this._emergencyRespUserInputChangeSub.unsubscribe();
    }
    if (this._firstAidUserSelectSub) {
      this._firstAidUserSelectSub.unsubscribe();
    }
    if (this._fireUserSelectSub) {
      this._fireUserSelectSub.unsubscribe();
    }
    if (this._firstAidRespUserSub) {
      this._firstAidRespUserSub.unsubscribe();
    }
    if (this._firstAidRespUserSub) {
      this._firstAidRespUserSub.unsubscribe();
    }
    if (this._firstAidUserInputChangeSub) {
      this._firstAidUserInputChangeSub.unsubscribe();
    }
    if (this._fireRespUserSub) {
      this._fireRespUserSub.unsubscribe();
    }
    if (this._fireUserInputChangeSub) {
      this._fireUserInputChangeSub.unsubscribe();
    }
    if (this._accidentReportRespUserSub) {
      this._accidentReportRespUserSub.unsubscribe();
    }
    if (this._accidentReportUserSelectSub) {
      this._accidentReportUserSelectSub.unsubscribe();
    }
    if (this._accidentReportUserInputChangeSub) {
      this._accidentReportUserInputChangeSub.unsubscribe();
    }
  }
  // End of public methods

}
