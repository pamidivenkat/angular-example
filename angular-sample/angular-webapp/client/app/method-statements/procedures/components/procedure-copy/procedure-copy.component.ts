import { Component, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Procedure } from "../../../../method-statements/procedures/models/procedure";
import { IFormBuilderVM, IFormFieldWrapper } from "../../../../shared/models/iform-builder-vm";
import { ProcedureForm } from "../../../../method-statements/procedures/models/procedure-form";
import { FormGroup, FormControl, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { ProcedureService } from "../../../../method-statements/procedures/services/procedure.service";
import { isNullOrUndefined } from "util";
import { Store } from "@ngrx/store";
import * as fromRoot from './../../../../shared/reducers';
import { ClaimsHelperService } from "./../../../../shared/helpers/claims-helper";
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";

@Component({
  selector: 'procedure-copy',
  templateUrl: './procedure-copy.component.html',
  styleUrls: ['./procedure-copy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcedureCopyComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _procedure: Procedure;
  private _formName: string;
  private _procedureFormVM: IFormBuilderVM;
  private _procedureForm: FormGroup;
  private _proceduredata: any;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of Private Fields

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , protected _cdRef: ChangeDetectorRef
    , private _procedureService: ProcedureService
    , private _store: Store<fromRoot.State>
    , protected _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._procedure = new Procedure();
  }
  // Public Output bindings 
  @Output('onCancel') _onProcedureCancel: EventEmitter<string> = new EventEmitter<string>();
  @Output('onCopy') _onProcedureSubmit: EventEmitter<any> = new EventEmitter<any>();

  @Input('Procedure')
  get Procedure() {
    return this._procedure;
  }
  set Procedure(value: Procedure) {
    this._procedure = value;
  }

  get procedureFormVM(): IFormBuilderVM {
    return this._procedureFormVM;
  }

  onCancel() {
    this._onProcedureCancel.emit('Cancel');
  }

  onSubmit($event) {
    if (this._procedureForm.valid) {
      let _procedureToSave: Procedure = Object.assign({}, this._procedure, <Procedure>this._procedureForm.value);
      this._onProcedureSubmit.emit(_procedureToSave);
    }
  }

  onFormInit(fg: FormGroup) {
    this._procedureForm = fg;
  }

  buttonLabels() {
    return { Submit: 'Copy' }
  }

  // End of Public Output bindings

  ngOnInit() {
    this._formName = 'procedureForm';
    this._procedureFormVM = new ProcedureForm(this._formName, this._procedure, false, this._procedureService);
    this._fields = this._procedureFormVM.init();
  }
}
