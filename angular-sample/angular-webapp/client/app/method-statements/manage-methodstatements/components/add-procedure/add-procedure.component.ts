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
import { AddProcedureForm } from '../../models/add-procedure-form';

@Component({
  selector: 'add-procedure',
  templateUrl: './add-procedure.component.html',
  styleUrls: ['./add-procedure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddProcedureComponent extends BaseComponent implements OnInit, OnDestroy {

  // private field declarations start
  private _addProcedureForm: FormGroup;
  private _submitted: boolean = false;
  private _formName: string;
  private _addProcedureFormVM: IFormBuilderVM;
  private _action: string;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _formFields: IFormFieldWrapper<any>[];
  // end of private fields

  // getters start
  get addProcedureFormVM() {
    return this._addProcedureFormVM;
  }
  // end of getters

  // public output bindings
  @Output()
  onProcedureCancel: EventEmitter<boolean>;
  @Output()
  onProcedureSubmit: EventEmitter<any>;
  // End of Public Output bindings

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
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this.onProcedureCancel = new EventEmitter<boolean>();
    this.onProcedureSubmit = new EventEmitter<string>();

    this.id = 'addprocedure';
    this.name = 'addprocedure';
  }
  // end of constructor


  // public methods start
  public formButtonNames() {
    return ({ Submit: 'Add' });
  }

  public onSubmit() {
    this._submitted = true;
    if (this._addProcedureForm.valid) {
      let dataToSave = this._addProcedureForm.value;
      this.onProcedureSubmit.emit(dataToSave);
    }
  }

  public onCancel() {
    this.onProcedureCancel.emit(true);
    this._addProcedureForm.reset();
  }

  public onFormInit(fg: FormGroup) {
    this._addProcedureForm = fg;

    this._addProcedureForm.patchValue({
      Name: '',
      Description: ''
    });
  }

  ngOnInit() {
    this._formName = 'addProcedureForm';
    this._addProcedureFormVM = new AddProcedureForm(this._formName);
    this._formFields = this.addProcedureFormVM.init();
  }

  ngOnDestroy() {

  }
  // end of public methods
}
