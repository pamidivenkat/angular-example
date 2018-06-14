import { Input } from '@angular/core';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { BehaviorSubject } from 'rxjs/Rx';
import { ProcedureForm } from '../../models/procedure-form';
import { ProcedureService } from '../../services/procedure.service';
import { IFormBuilderVM, IFormFieldWrapper } from '../../../../shared/models/iform-builder-vm';
import { isNullOrUndefined } from 'util';
import { Procedure } from '../../models/procedure';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'procedure-add-update',
  templateUrl: './procedure-add-update.component.html',
  styleUrls: ['./procedure-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ProcedureAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _addUpdateProcedureForm: FormGroup;
  private _submitted: boolean = false;
  private _procedureGroups$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _formName: string;
  private _addUpdateProcedureFormVM: IFormBuilderVM;
  private _action: string;
  private _procedureToSave: Procedure = new Procedure();
  private _procedureType: Procedure;
  private _procedureGroupOptions$: BehaviorSubject<any>;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _formFields: IFormFieldWrapper<any>[];
  private _procedureLoading$: Observable<boolean>;
  // End of Private Fields

  // Public properties
  // End of Public properties

  // Public Output 
  @Output('onCancel') _onProcedureCancel: EventEmitter<string>;
  @Output('onSubmit') _onProcedureSubmit: EventEmitter<any>;
  // End of Public Output bindings

  @Input('SelectedProcedure')
  set SelectedProcedure(value: Procedure) {
    this._procedureToSave = value;
  }
  get SelectedProcedure() {
    return this._procedureToSave;
  }


  @Input('action')
  set action(value: string) {
    this._action = value;
  }
  get action() {
    return this._action;
  }


  get addUpdateProcedureFormVM(): IFormBuilderVM {
    return this._addUpdateProcedureFormVM;
  }
  get addUpdateProcedureForm(): FormGroup {
    return this._addUpdateProcedureForm;
  }
  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilder
    , private _procedureService: ProcedureService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._onProcedureCancel = new EventEmitter<string>();
    this._onProcedureSubmit = new EventEmitter<string>();

  }
  // End of constructor

  // Private methods  
  formButtonNames() {
    return (this._action == 'Add' ? { Submit: 'Add' } : { Submit: 'Update' });
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._procedureGroups$ = this._store.let(fromRoot.getProcedureGroupsData);
    this._formName = 'addUpdateForm';
    let isExampleVal = this._claimsHelper.cancreateExampleProcedures();
    if (this._claimsHelper.HasCid && this._claimsHelper.cancreateExampleProcedures()) {
      isExampleVal = false;
    }
    this._addUpdateProcedureFormVM = new ProcedureForm(this._formName, this._procedureToSave, isExampleVal, this._procedureService);
    this._fields = this._addUpdateProcedureFormVM.init();
    let procedureGroupField = this._fields.find(f => f.field.name === 'ProcedureGroupId');
    this._procedureGroups$.subscribe(<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>procedureGroupField.context.getContextData().get('options'));

  }
  ngOnDestroy() {

  }
  // End of public methods

  onCancel(e) {
    this._onProcedureCancel.emit('Cancel');
    this._addUpdateProcedureForm.reset(); //clear form.
  }

  onSubmit($event) {
    this._submitted = true;
    if (this._addUpdateProcedureForm.valid) {
      this._onProcedureSubmit.emit('Save');
      let procedureToSave: Procedure = Object.assign({}, this._procedureToSave, <Procedure>this._addUpdateProcedureForm.value);
      if (this._action == 'Add') {
        this._procedureService.saveProcedureDetails(procedureToSave);
      } else {
        this._procedureService.updateProcedureDetails(procedureToSave);
      }
      this._procedureLoading$ = this._store.let(fromRoot.getProcedureListLoadingState);
      this._onProcedureCancel.emit('Cancel');
      this._addUpdateProcedureForm.reset();
    }

  }

  onFormInit(fg: FormGroup) {
    this._addUpdateProcedureForm = fg;
  }

  title() {
    if (this._action == 'Add') {
      return "ADD_PROCEDURE";
    } else {
      return "UPDATE_PROCEDURE";
    }
  }
}
