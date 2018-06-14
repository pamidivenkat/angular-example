import { User } from './../../../../company/user/models/user.model';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { UserLoadAction } from './../../../../shared/actions/lookup.actions';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import * as fromRoot from './../../../../shared/reducers';
import { MSSafetyRespAssigned, MethodStatement } from './../../../../method-statements/models/method-statement';
import { SafetyResponsibilityForm } from './../../../../method-statements/models/safety-responsibilities-form';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, BehaviorSubject } from "rxjs/Rx";
import { isNullOrUndefined } from "util";
import { ActivatedRoute } from "@angular/router";
import { IFormFieldWrapper, IFormField, FormFieldType } from './../../../../shared/models/iform-builder-vm';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { UserService } from './../../../../shared/services/user-services';
import { Responsiblity } from './../../../../shared/models/lookup.models';

@Component({
  selector: 'safety-responsibilities-add-update',
  templateUrl: './safety-responsibilities-add-update.component.html',
  styleUrls: ['./safety-responsibilities-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SafetyResponsibilitiesAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _saftyResponsibilityFormVM: SafetyResponsibilityForm;
  private _saftyResponsibilityForm: FormGroup;
  private _methodstatementId: string;
  private _methodstatement: MethodStatement;
  private _selectedRecord: MSSafetyRespAssigned;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _currentResponsiblePerson: User;
  private _currentResponsible: AeSelectItem<string>[];
  private _responsibilities: Responsiblity[];
  private _submitted: boolean = false;
  private _isNew: boolean = true;
  private _dataSet: any;
  private _otherVisibility: BehaviorSubject<boolean>;
  private _otherPersonVisibility: BehaviorSubject<boolean>;

  // End of Private Fields

  // Output Events
  @Output('onCancel')
  _onCancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('onUpdate')
  _onUpdate: EventEmitter<MSSafetyRespAssigned> = new EventEmitter<MSSafetyRespAssigned>();
  @Output('onAdd')
  _onAdd: EventEmitter<MSSafetyRespAssigned> = new EventEmitter<MSSafetyRespAssigned>();
  // Output Events

  // Getters

  get saftyResponsibilityFormVM() {
    return this._saftyResponsibilityFormVM;
  }

  get saftyResponsibilityForm() {
    return this._saftyResponsibilityForm;
  }

  // End of Getters


  // Input Properties
  @Input('methodstatement')
  get methodstatement() {
    return this._methodstatement;
  }
  set methodstatement(val: any) {
    this._methodstatement = val;
  }
  @Input('selectedRecord')
  get selectedRecord() {
    return this._selectedRecord;
  }
  set selectedRecord(val: any) {
    this._selectedRecord = val;
    if (val && val.Id) {
      this._isNew = false;
    }
  }
  @Input('responsibilities')
  get responsibilities() {
    return this._responsibilities;
  }
  set responsibilities(val: any) {
    this._responsibilities = val;
  }
  // End of Input Properties


  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _router: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _userService: UserService
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of Constructor

  // Private Methods
  private _patchForm() {
    if (isNullOrUndefined(this._formFields)) {
      return;
    }
    if (this._saftyResponsibilityForm) {
      this._currentResponsiblePerson = this.selectedRecord.ResponsiblePerson;

      if (isNullOrUndefined(this._dataSet)) {
        this._dataSet = [new AeSelectItem('Other', null, false)];
      }
      if (!isNullOrUndefined(this._currentResponsiblePerson)) {
        this._currentResponsible = [];
        this._currentResponsible.push(new AeSelectItem(this._currentResponsiblePerson.FullName, this._currentResponsiblePerson.Id, false));
        let name: AeSelectItem<string> = new AeSelectItem<string>(this._currentResponsiblePerson.FullName, this._currentResponsiblePerson.Id, false);
        this._dataSet.push(name);
      } else if (!isNullOrUndefined(this.selectedRecord.ResponsiblePersonId) && !isNullOrUndefined(this.selectedRecord.NameOfResponsible)) {
        this._currentResponsible = [];
        this._currentResponsible.push(new AeSelectItem(this.selectedRecord.NameOfResponsible, this.selectedRecord.ResponsiblePersonId, false));
        let name: AeSelectItem<string> = new AeSelectItem<string>(this.selectedRecord.FullName, this.selectedRecord.ResponsiblePersonId, false);
        this._dataSet.push(name);
      }
      else if (isNullOrUndefined(this.selectedRecord.ResponsiblePersonId) && !isNullOrUndefined(this.selectedRecord.NameOfResponsible)) {
        //other value is selected
        this._currentResponsible = [];
        this._currentResponsible.push(new AeSelectItem('Other', null, false));
      }


      this._saftyResponsibilityForm.patchValue({
        ResponsiblePerson: (!isNullOrUndefined(this._currentResponsible)) ? this._currentResponsible : null,
        ResponsibilityAssigned: (!isNullOrUndefined(this.selectedRecord.Responsibilities)) ? this.selectedRecord.Responsibilities : null,
        OtherResponsibilityValue: !isNullOrUndefined(this.selectedRecord) && !isNullOrUndefined(this.selectedRecord.Id) ? (!isNullOrUndefined(this.selectedRecord.OtherResponsibilityValue) ? this.selectedRecord.OtherResponsibilityValue : '') : '',
        NameOfResponsible: !isNullOrUndefined(this.selectedRecord) && !isNullOrUndefined(this.selectedRecord.Id) ? (!isNullOrUndefined(this.selectedRecord.NameOfResponsible) ? this.selectedRecord.NameOfResponsible : '') : ''
      });
      this._cdRef.markForCheck();
    }
  }
  // End of Private Methods

  // Public Methods
  onFormValidityChange(status: boolean) {
  }


  onResponsibilityFormSubmitted($event) {
    this._submitted = true;
    if (this._saftyResponsibilityForm.valid && !this._saftyResponsibilityForm.pristine) {
      let objectToSave: MSSafetyRespAssigned = new MSSafetyRespAssigned();
      objectToSave.CompanyId = this._methodstatement.CompanyId;
      objectToSave.MethodStatementId = this._methodstatement.Id;

      if (!isNullOrUndefined(this._saftyResponsibilityForm.value['ResponsibilityAssigned'][0].Id)) {
        objectToSave.Responsibilities = this._saftyResponsibilityForm.value['ResponsibilityAssigned'];
      } else {
        objectToSave.Responsibilities = this._responsibilities.filter(res => this._saftyResponsibilityForm.value['ResponsibilityAssigned'].join(',').includes(res.Id));
      }


      let othersData = objectToSave.Responsibilities.filter(others => others.Name === 'Other');
      if (!isNullOrUndefined(othersData)) {
        objectToSave.OtherResponsibilityValue = this._saftyResponsibilityForm.value['OtherResponsibilityValue'];
      } else {
        objectToSave.OtherResponsibilityValue = null;
      }


      objectToSave.Id = this.selectedRecord && this.selectedRecord.Id ? this.selectedRecord.Id : null;
      if (!isNullOrUndefined(this.selectedRecord.Id)) {
        objectToSave.CreatedBy = this._claimsHelper.getUserId();
        objectToSave.CreatedOn = new Date();
      }
      //NameOfResponsible should be saved only when value is selected in the dropdown , if other value is selected then save NameOfResponsible
      if (!isNullOrUndefined(this._saftyResponsibilityForm.value['ResponsiblePerson'][0]) && !isNullOrUndefined(this._saftyResponsibilityForm.value['ResponsiblePerson'][0].Value)) {
        objectToSave.FullName = this._saftyResponsibilityForm.value['ResponsiblePerson'][0].Text;
        objectToSave.ResponsiblePersonId = this._saftyResponsibilityForm.value['ResponsiblePerson'][0].Value;
        objectToSave.NameOfResponsible = null;
        objectToSave.ResponsiblePerson = new User();
        let dataFilter = this._dataSet.filter((data) => { return data.Value === objectToSave.ResponsiblePersonId });
        if (dataFilter.length > 0) {
          objectToSave.ResponsiblePerson.Id = dataFilter[0].Value;
          objectToSave.ResponsiblePerson.FullName = dataFilter[0].Text;
          objectToSave.FullName = dataFilter[0].Text;
        }
      } else {
        objectToSave.ResponsiblePersonId = this._saftyResponsibilityForm.value['ResponsiblePerson'][0];
        let responsiblePersonId: any = objectToSave.ResponsiblePersonId;
        let dataFilter = this._dataSet.filter((data) => { return data.Value === objectToSave.ResponsiblePersonId });
        if ((
          (!isNullOrUndefined(responsiblePersonId) && responsiblePersonId.hasOwnProperty('Value')
            && !StringHelper.isNullOrUndefinedOrEmpty(responsiblePersonId.Value))
          ||
          (!isNullOrUndefined(responsiblePersonId) && !responsiblePersonId.hasOwnProperty('Value')
            && !StringHelper.isNullOrUndefinedOrEmpty(responsiblePersonId))
        )
          && (dataFilter.length > 0)) {
          objectToSave.ResponsiblePerson = new User();
          objectToSave.ResponsiblePerson.Id = dataFilter[0].Value;
          objectToSave.ResponsiblePerson.FullName = dataFilter[0].Text;
          objectToSave.FullName = dataFilter[0].Text;
        }
        if (
          (
            (!isNullOrUndefined(responsiblePersonId) && responsiblePersonId.hasOwnProperty('Value')
              && StringHelper.isNullOrUndefinedOrEmpty(responsiblePersonId.Value))
            ||
            (!isNullOrUndefined(responsiblePersonId) && !responsiblePersonId.hasOwnProperty('Value')
              && StringHelper.isNullOrUndefinedOrEmpty(responsiblePersonId))
            ||
            (isNullOrUndefined(responsiblePersonId))
          )
        ) {
          //other value is selected 
          objectToSave.ResponsiblePersonId = null;
          objectToSave.FullName = this._saftyResponsibilityForm.value['NameOfResponsible'];
          objectToSave.NameOfResponsible = this._saftyResponsibilityForm.value['NameOfResponsible'];
        }
      }

      if (!isNullOrUndefined(this.selectedRecord) && !isNullOrUndefined(this.selectedRecord.Id)) {
        this._onUpdate.emit(objectToSave);
      } else {
        this._onAdd.emit(objectToSave);
      }
    }
    else {
      //no change is made so just emit cancel event
      this._onCancel.emit(false);
    }
  }

  onResponsibilityFormCancel($event) {
    this._onCancel.emit(false);
  }

  onFormInit(fg: FormGroup) {
    this._saftyResponsibilityForm = fg;
    this._formFields.forEach(field => {
      if (field.field.name === 'ResponsibilityAssigned') {
        this._saftyResponsibilityForm.get(field.field.name).valueChanges.takeUntil(this._destructor$).subscribe((val) => {
          let otherFiled = this._formFields.find((fw) => fw.field.name === 'OtherResponsibilityValue');
          let otherResponsibility = this._responsibilities ? this._responsibilities.find(obj => obj.Name.toLowerCase() === 'other') : null;

          if (!isNullOrUndefined(otherFiled)) {
            this._otherVisibility = (<BehaviorSubject<boolean>>otherFiled.context.getContextData().get('propertyValue'));
            if (val && val.find(p => p == otherResponsibility.Id)) {
              this._otherVisibility.next(true);
            } else {
              this._otherVisibility.next(false);
              // this._saftyResponsibilityForm.get('OtherResponsibilityValue').setValue(null);
            }
          }

        });
      }

      if (field.field.name === 'ResponsiblePerson') {
        this._saftyResponsibilityForm.get(field.field.name).valueChanges.takeUntil(this._destructor$).subscribe((val) => {
          let otherResponsiblePersonField = this._formFields.find((fw) => fw.field.name === 'NameOfResponsible');
          let otherResposiblePerson = this._dataSet ? this._dataSet.find(obj => obj.Text.toLowerCase() === 'other') : [new AeSelectItem<string>('Other', null, false)];
          //other responsible person
          if (!isNullOrUndefined(otherResponsiblePersonField)) {
            this._otherPersonVisibility = (<BehaviorSubject<boolean>>otherResponsiblePersonField.context.getContextData().get('propertyValue'));
            if (!isNullOrUndefined(val) && (val.filter(p => p == otherResposiblePerson.Value).length > 0 || val.filter(p => !isNullOrUndefined(p) && (p.hasOwnProperty('Value')) && p.Value == otherResposiblePerson.Value).length > 0)) {
              this._otherPersonVisibility.next(true);
            } else {
              this._otherPersonVisibility.next(false);
              // this._saftyResponsibilityForm.get('OtherResponsibilityValue').setValue(null);
            }
          }
        });
      }

    })
    this._patchForm();

    if (!isNullOrUndefined(this.selectedRecord.OtherResponsibilityValue)) {
      this._otherVisibility.next(true);
    }

  }

  getTitle(): string {
    if (!isNullOrUndefined(this.selectedRecord) && !isNullOrUndefined(this.selectedRecord.Id)) {
      return `Update safety responsibility`;
    }
    return `Add safety responsibility`;
  }

  formButtonNames() {
    return ({ Submit: this._isNew ? 'Add' : 'Update' });
  }

  ngOnInit() {
    this._router.params.takeUntil(this._destructor$).subscribe(params => {
      if (isNullOrUndefined(params['id'])) {
        this._methodstatementId = this._methodstatement.Id;
      }
      else {
        this._methodstatementId = params['id'];
      }
    });
    this._formName = 'ResponsibilityForm';
    this._saftyResponsibilityFormVM = new SafetyResponsibilityForm(this._formName);
    this._formFields = this._saftyResponsibilityFormVM.init();

    let responsiblePersonField = this._formFields.filter(f => f.field.name === 'ResponsiblePerson')[0];
    (<EventEmitter<any>>responsiblePersonField.context.getContextData().get('searchEvent')).takeUntil(this._destructor$).subscribe((event) => {
      this._userService.getFilteredUserData(event.query).first().takeUntil(this._destructor$).subscribe((data: AeSelectItem<string>[]) => {
        if (data) {
          //we have to append the other value with empty selected value..
          data.push(new AeSelectItem<string>('Other', null, false));
          this._dataSet = data;
          (<BehaviorSubject<AeSelectItem<string>[]>>responsiblePersonField.context.getContextData().get('items')).next(data);
        }
      });

    });
    let responsibilityField = this._formFields.filter(f => f.field.name === 'ResponsibilityAssigned')[0];

    (<BehaviorSubject<Responsiblity[]>>responsibilityField.context.getContextData().get('items')).next(this._responsibilities);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
  // End of Public Methods

}
