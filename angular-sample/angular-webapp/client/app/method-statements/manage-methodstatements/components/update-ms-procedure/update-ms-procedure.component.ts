import {
  Component
  , OnInit
  , ViewEncapsulation
  , ChangeDetectionStrategy
  , OnDestroy
  , ChangeDetectorRef
  , Output
  , EventEmitter,
  Input
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { FormGroup } from '@angular/forms';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { UpdateMSProcedureForm } from '../../models/update-ms-procedure-form';
import { MSProcedure } from '../../../models/method-statement';

@Component({
  selector: 'update-ms-procedure',
  templateUrl: './update-ms-procedure.component.html',
  styleUrls: ['./update-ms-procedure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateMsProcedureComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _updateMSProcedureForm: FormGroup;
  private _submitted: boolean = false;
  private _formName: string;
  private _updateMSProcedureFormVM: IFormBuilderVM;
  private _action: string;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _formFields: IFormFieldWrapper<any>[];
  private _msProcedure: MSProcedure;
  // End of private fields

  // getters start
  get updateMSProcedureFormVM() {
    return this._updateMSProcedureFormVM;
  }
  // end of getters

  // public properties
  @Input('msProcedure')
  set msProcedure(val: MSProcedure) {
    this._msProcedure = val;
  }
  get msProcedure() {
    return this._msProcedure;
  }
  // end of public properties

  // public output bindings
  @Output()
  onProcedureUpdateCancel: EventEmitter<boolean>;
  @Output()
  onProcedureUpdateSubmit: EventEmitter<any>;
  // End of Public Output bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this.onProcedureUpdateCancel = new EventEmitter<boolean>();
    this.onProcedureUpdateSubmit = new EventEmitter<string>();

    this.id = 'updatemsprocedure';
    this.name = 'updatemsprocedure';
  }
  // End of constructor

  // public methods start
  public formButtonNames() {
    return ({ Submit: 'Update' });
  }

  public onSubmit() {
    this._submitted = true;
    if (this._updateMSProcedureForm.valid) {
      let dataToSave = Object.assign({}, this.msProcedure, this._updateMSProcedureForm.value);
      this.onProcedureUpdateSubmit.emit(dataToSave);
      this._updateMSProcedureForm.reset();
    }
  }

  public onCancel() {
    this.onProcedureUpdateCancel.emit(true);
  }

  public onFormInit(fg: FormGroup) {
    this._updateMSProcedureForm = fg;
    this._updateMSProcedureForm.patchValue({
      Name: this.msProcedure.Name,
      Description: this.msProcedure.Description
    });
  }

  ngOnInit() {
    this._formName = 'updateMSProcedureForm';
    this._updateMSProcedureFormVM = new UpdateMSProcedureForm(this._formName);
    this._formFields = this._updateMSProcedureFormVM.init();
  }

  ngOnDestroy() {

  }
  // end of public methods
}
