import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { FormGroup, FormBuilder } from "@angular/forms";
import { MSOtherRiskAssessmentForm } from "../../../../method-statements/manage-methodstatements/models/ms-other-riskassessments-form";
import { IFormFieldWrapper } from "../../../../shared/models/iform-builder-vm";
import { Subscription } from "rxjs/Rx";
import { MethodStatement, MSOtherRiskAssessments } from "../../../../method-statements/models/method-statement";
import { Store } from "@ngrx/store";
import * as fromRoot from './../../../../shared/reducers';
import { isNullOrUndefined } from "util";


@Component({
  selector: 'information-from-computer',
  templateUrl: './information-from-computer.component.html',
  styleUrls: ['./information-from-computer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class InformationFromComputerComponent extends BaseComponent implements OnInit {

  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _fromComputerForm: FormGroup;
  private _isFormLoaded: boolean = false;
  private _msOtherRiskAssessmentsVM: MSOtherRiskAssessmentForm;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _context: any;
  private _submitEventSubscription: Subscription;
  private _msOtherRiskAssessmentsForm: FormGroup;
  private _submitted: boolean = false;
  private _methodstatement: MethodStatement;
  private _isModified: boolean = false;


  get msOtherRiskAssessmentsVM() {
    return this._msOtherRiskAssessmentsVM;
  }
  get isFormLoaded() {
    return this._isFormLoaded;
  }

  get msOtherRiskAssessmentsForm(){
    return this._msOtherRiskAssessmentsForm;
  }
  // Private Fields
  @Input('context')
  set context(val: any) {
    this._context = val;
  }
  get context() {
    return this._context;
  }

  @Input('methodstatement')
  set methodstatement(val: MethodStatement) {
    this._methodstatement = val;
  }
  get methodstatement() {
    return this._methodstatement;
  }

  // End of Public properties

  // Public Output bindings
  @Output('onMSOtherRASubmit') onMSOtherRAFormSubmit: EventEmitter<MSOtherRiskAssessments[]> = new EventEmitter<MSOtherRiskAssessments[]>();
  @Output('onMSOtherRACancel') onMSOtherRAFormCancel: EventEmitter<any> = new EventEmitter<any>();

  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings
  get lightClass() {
    return this._lightClass;
  }

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Public methods
  ngOnInit() {

    this._formName = 'MSOtherRiskAssessmentForm';
    this._msOtherRiskAssessmentsVM = new MSOtherRiskAssessmentForm(this._formName);
    // init form
    this._formFields = this._msOtherRiskAssessmentsVM.init();
    this._isFormLoaded = true;
    this._cdRef.markForCheck();

    this._submitEventSubscription = this._context.submitEvent.subscribe((value) => {
      if (value) {
        this.onMSOtherRiskAssessmentsSubmitted(null);
      }
    });

  }
  ngOnDestroy() {
    if (!isNullOrUndefined(this._submitEventSubscription)) {
      this._submitEventSubscription.unsubscribe();
    }
  }



  // End of public methods


  // Private methods 
  onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  onFormInit(fg: FormGroup) {
    this._msOtherRiskAssessmentsForm = fg;
  }

  private _fieldHasRequiredError(fieldName: string): boolean {
    return (this._msOtherRiskAssessmentsForm.get(fieldName).hasError('required') && (!this._msOtherRiskAssessmentsForm.get(fieldName).pristine || this._submitted));
  }
  onMSOtherRiskAssessmentsSubmitted($event) {
    if (this._msOtherRiskAssessmentsForm.valid) {
      this._submitted = true;
      let dataToSave: MSOtherRiskAssessments[] = [];
      if (this._msOtherRiskAssessmentsForm.valid) {
        let data = this._msOtherRiskAssessmentsForm.value;

        if (this._msOtherRiskAssessmentsForm.pristine) {
          this.onMSOtherRAFormSubmit.emit(dataToSave);
        } else {
          for (var item in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
            if (!isNullOrUndefined(data['OtherName' + item]) && !isNullOrUndefined(data['OtherNumber' + item])
              && data['OtherName' + item] !== '' && data['OtherNumber' + item] !== '') {

              this._isModified = true;
              dataToSave.push({
                CompanyId: this._methodstatement.CompanyId,
                MethodStatementId: this._methodstatement.Id,
                Name: data['OtherName' + item],
                Id: '',
                ReferenceNumber: data['OtherNumber' + item],
              });
            }
          }
          if (this._isModified) {
            this.onMSOtherRAFormSubmit.emit(dataToSave);
          }
        }


      }
    }
  }

  onFormCancel($event) {
    this.onMSOtherRAFormCancel.emit(true);
  }
  public formButtonNames() {
    return ({ Submit: 'Add', Cancel: 'Close' });
  }

  // End of private methods
}