import { FormGroup } from '@angular/forms';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../shared/models/iform-builder-vm';
import { ConstructionPhasePlan } from './../../models/construction-phase-plans';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CPPCopyForm } from './../../models/cpp-copy.form';

@Component({
  selector: 'cpp-copy',
  templateUrl: './cpp-copy.component.html',
  styleUrls: ['./cpp-copy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CppCopyComponent extends BaseComponent implements OnInit {
  // Private Fields  

  private _constructionPhasePlan: ConstructionPhasePlan;
  private _cppCopyFormVM: IFormBuilderVM;
  private _cppCopyForm: FormGroup;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _formName: string;
  // End of Private Fields

  // Public properties
  @Input('constructionPhasePlan')
  set constructionPhasePlan(val: ConstructionPhasePlan) {
    this._constructionPhasePlan = val;
  }
  get constructionPhasePlan() {
    return this._constructionPhasePlan;
  }
 
  get cppCopyFormVM() {
    return this._cppCopyFormVM;
  }
  // End of Public properties

  // Public Output bindings
  @Output('copyCPP') _onCopy: EventEmitter<ConstructionPhasePlan> = new EventEmitter<ConstructionPhasePlan>();
  @Output('cancel') _onCancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _breadcrumbService: BreadcrumbService
    , private _router: Router) {
    super(_localeService, _translationService, _cdRef);

  }
  // End of constructor

  // Private methods
  private _patchForm() {
    this._cppCopyForm.patchValue({
      Name: this._constructionPhasePlan.Name,
      StartDate: new Date(),
      ReviewDate: new Date()
    });
  }
  // End of private methods

  // Public methods
  public buttonLabels() {
return { Submit: "Copy"};
  }
  
  public onFormInit(fg: FormGroup) {
    this._cppCopyForm = fg;
    this._patchForm();
  }
  public onSubmit($event) {
    if (this._cppCopyForm.valid) {
      let copiedEntity: ConstructionPhasePlan = Object.assign({}, this._constructionPhasePlan, <ConstructionPhasePlan>this._cppCopyForm.value);
      this._onCopy.emit(copiedEntity);
    }
  }
  public onCancel($event) {
    this._onCancel.emit(true);
  }
  ngOnInit() {
    this._formName = 'procedureForm';
    this._cppCopyFormVM = new CPPCopyForm(this._formName);
    this._fields = this._cppCopyFormVM.init();
  }
  // End of public methods

}
