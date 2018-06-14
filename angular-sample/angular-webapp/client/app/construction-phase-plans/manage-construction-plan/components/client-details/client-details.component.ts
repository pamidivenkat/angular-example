import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { CommonHelpers } from '../../../../shared/helpers/common-helpers';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { FormBuilder, Validators } from '@angular/forms';
import { CppClientDetailsForm } from './../../../models/cpp-client-details.form.';
import { FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { ConstructionPhasePlan, Contractor, CPPAdditionalInfo } from './../../../models/construction-phase-plans';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { CppGeneralForm } from './../../../models/cpp-general.form';

@Component({
  selector: 'client-details',
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientDetailsComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields  
  private _cppClientDetailsFormVM: IFormBuilderVM;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _formName: string;
  private _context: any;
  private _addUpdateCppClientDtlsForm: FormGroup;
  private _cppAddtionalInformation: CPPAdditionalInfo;
  private _submitEventSubscription: Subscription;
  private _cppAddtionalInformation$: Observable<CPPAdditionalInfo>;
  private _cppAdditionalInformationSub: Subscription;
  private _contractorsFormGroup: FormGroup;
  private _contractorsFormShown$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _noOfContractorsChnagedSub: Subscription;
  private _aeFormValidity: boolean;
  private _contractFormValidity: boolean = true;
  private _contractFormValueChangesSub: Subscription;
  private _existingContractors: Contractor[] = [];
  private _renderForm: boolean = false;
  private _constructionPhasePlan: ConstructionPhasePlan;
  private _cppSubscription: Subscription;
  // End of Private Fields

  // Public properties
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  get cppClientDetailsFormVM() {
    return this._cppClientDetailsFormVM;
  }
  get contractors(): AbstractControl[] {
    return (<FormArray>this._contractorsFormGroup.controls['contractors']).controls;
  }
  get contractorsFormGroup() {
    return this._contractorsFormGroup;
  }
  get canContractorsFormShown$(): BehaviorSubject<boolean> {
    return this._contractorsFormShown$;
  }
  @Input('cppAddtionalInformation$')
  set cppAddtionalInformation$(val: Observable<CPPAdditionalInfo>) {
    this._cppAddtionalInformation$ = val;
  }
  get cppAddtionalInformation$() {
    return this._cppAddtionalInformation$;
  }
 

  @Input('cppAddtionalInformation')
  set cppAddtionalInformation(val: CPPAdditionalInfo) {
    this._cppAddtionalInformation = val;
    if (this._cppAddtionalInformation) {
      this._patchForm(this._cppAddtionalInformation);
    }
  }
  get cppAddtionalInformation() {
    return this._cppAddtionalInformation;
  }
  
  @Input('constructionPhasePlan')
  set constructionPhasePlan(val: ConstructionPhasePlan) {
    this._constructionPhasePlan = val;
  }
  get constructionPhasePlan() {
    return this._constructionPhasePlan;
  }
  

  // End of Public properties

  // Public Output bindings
  @Output('onAeSubmit') _onAeSubmit: EventEmitter<CPPAdditionalInfo> = new EventEmitter<CPPAdditionalInfo>();
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
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods  

  private _patchContractorsFormCount(noOfContractors: number) {
    //based on this count we need to control the contractors array
    let intNumber = 0;
    intNumber = StringHelper.isNullOrUndefinedOrEmpty(noOfContractors.toString()) ? 0 : parseInt(noOfContractors.toString());
    let alreadyAddedContractors = 0;
    if (this._contractorsFormGroup && this._contractorsFormGroup.get('contractors'))
      alreadyAddedContractors = (this._contractorsFormGroup.get('contractors') as FormArray).length;


    if (StringHelper.isNullOrUndefinedOrEmpty(noOfContractors.toString())) {
      this.cppAddtionalInformation.Contractors = [];
    }
    else if (this.cppAddtionalInformation.Contractors && alreadyAddedContractors < intNumber) {
      //contractos exists but requested length is greater than the existing length.. add thos difference
      let diff = intNumber - alreadyAddedContractors;
      for (let i = 0; i < diff; i++) {
        this.cppAddtionalInformation.Contractors.push(new Contractor());
      }
    }
    else if (this.cppAddtionalInformation.Contractors && alreadyAddedContractors > intNumber) {
      // remove already existing contractors
      this.cppAddtionalInformation.Contractors = this.cppAddtionalInformation.Contractors.slice(0, intNumber)
    }
    else if (this.cppAddtionalInformation.Contractors && alreadyAddedContractors == intNumber) {
      // here we need to keep the existing array...
    }
    else {
      // probably asking the when there is no contractors array is defined
      for (let i = 0; i < intNumber; i++) {
        this.cppAddtionalInformation.Contractors.push(new Contractor());
      }
    }
    this._initContractorsForm(this.cppAddtionalInformation.Contractors);
  }

  private _initContractorsForm(contractors: Contractor[]) {
    let index: number = 0;
    let controls = [];
    contractors = CommonHelpers.sortArray(contractors, 'PositionIndex', SortDirection.Ascending);
    contractors.forEach(contractor => {
      let ctrlName = index.toString();
      let contractorDtls: FormGroup = this._fb.group({
        Id: [{ value: (contractor && !StringHelper.isNullOrUndefinedOrEmpty(contractor.Id) ? contractor.Id : null), disabled: false }, null]
        , Name: [{ value: (contractor && !StringHelper.isNullOrUndefinedOrEmpty(contractor.Name) ? contractor.Name : null), disabled: false }, [Validators.required]]
        , Position: [{ value: (contractor && !StringHelper.isNullOrUndefinedOrEmpty(contractor.Position) ? contractor.Position : null), disabled: false }]
      });
      controls.push(contractorDtls);

    });

    this._contractorsFormGroup = this._fb.group(
      { contractors: new FormArray(controls) }
    );
    this.setOverAllValidity(null);
  }

  private _patchForm(model: CPPAdditionalInfo) {
    //patch form goes here...
    if (this._addUpdateCppClientDtlsForm) {
      this._addUpdateCppClientDtlsForm.patchValue({
        PrincipalDesigner: model.PrincipalDesigner,
        PrincipalContractor: model.PrincipalContractor,
        Others: model.Others,
        Client: this._constructionPhasePlan.IsDomestic ? model.Client : null,
        NumberOfContractors: model.NumberOfContractors
      });
    }
  }
  private _getRows(): FormArray {
    return this._contractorsFormGroup.get('contractors') as FormArray;
  }
  private _onSubmit() {
    //submit related code goes here...
    // we are storing some form pristine in the data model just to check whether we need to execute below code and save or simply move to the next step...   
    if (this._addUpdateCppClientDtlsForm.valid && (!this._addUpdateCppClientDtlsForm.pristine || !this._contractorsFormGroup.pristine)) {
      let cppAdditionalInfoToSave: CPPAdditionalInfo = Object.assign({}, this._cppAddtionalInformation, <CPPAdditionalInfo>this._addUpdateCppClientDtlsForm.value);
      //Here we need to copy the contractor form details to the object....
      let newContractors: Contractor[] = [];
      let existingContractorsFrmDB: Contractor[] = [];
      existingContractorsFrmDB = this._existingContractors;
      let formmValue = this._getRows();
      for (let i = 0; i < formmValue.length; i++) {
        let formEvent = <FormGroup>formmValue.controls[i];
        let Id = formEvent.controls['Id'].value;
        let name = formEvent.controls['Name'].value;
        let position = formEvent.controls['Position'].value;
        let existingContractorslength = this._cppAddtionalInformation.Contractors.length;
        if (!StringHelper.isNullOrUndefinedOrEmpty(Id)) {
          let existingContractor: Contractor = existingContractorsFrmDB.find(obj => obj.Id == Id);
          existingContractor.Name = name;
          existingContractor.Position = position;
          existingContractor.CPPAdditionalInfoId = this.cppAddtionalInformation.Id
          existingContractor.PositionIndex = i;
          newContractors.push(existingContractor);
        }
        else {
          let newContractor = new Contractor();
          newContractor.Name = name;
          newContractor.Position = position;
          newContractor.PositionIndex = i;
          newContractor.CPPAdditionalInfoId = this.cppAddtionalInformation.Id
          newContractors.push(newContractor);
        }
      }

      //existing contractos who do not existis in the newContractors list should be set as isDeleted=true..
      existingContractorsFrmDB.forEach(existC => {
        let alreadyUpdated = newContractors.filter(obj => obj.Id == existC.Id && !StringHelper.isNullOrUndefinedOrEmpty(existC.Id));
        if (alreadyUpdated && alreadyUpdated.length == 0) {
          existC.IsDeleted = true;
          newContractors.push(existC);
        }
      });
      cppAdditionalInfoToSave.Contractors = newContractors;
      this._onAeSubmit.emit(cppAdditionalInfoToSave);
    }
    //now after mapping hte object correctly with all form inputs emit this object
  }
  // End of private methods

  // Public methods
  public fieldHasRequiredError(field, index) {
    return (<FormArray>this._contractorsFormGroup.controls['contractors']).controls[index] && (<FormGroup>(<FormArray>this._contractorsFormGroup.controls['contractors']).controls[index]).controls[field].hasError('required') && !(<FormGroup>(<FormArray>this._contractorsFormGroup.controls['contractors']).controls[index]).controls[field].pristine ;
  }

  onFormInit(fg: FormGroup) {
    this._addUpdateCppClientDtlsForm = fg;
    if (this._cppAddtionalInformation) {
      this._patchForm(this._cppAddtionalInformation);
    }
    this._aeFormValidity = this._addUpdateCppClientDtlsForm.valid;
    this.emitValidEvent();
  }
  onFormValidityChange(status: boolean) {
    this._aeFormValidity = status;
    this.emitValidEvent();
  }
  setOverAllValidity($event) {
    this._contractFormValidity = (!this._contractorsFormGroup || (this._contractorsFormGroup && this._contractorsFormGroup.valid))
    this.emitValidEvent();
  }
  emitValidEvent() {
    this._context.isValidEvent.emit(this._aeFormValidity && this._contractFormValidity);
  }
  ngOnInit() {
    this._formName = 'CPPClientDetails';

    this._cppClientDetailsFormVM = new CppClientDetailsForm(this._formName);
    this._formFields = this._cppClientDetailsFormVM.init();

    this._submitEventSubscription = this._context.submitEvent.subscribe((value) => {
      if (value) {
        this._onSubmit();
      }
    });

    this._initContractorsForm([]);

    this._cppAdditionalInformationSub = this._cppAddtionalInformation$.subscribe((val) => {
      this._cppAddtionalInformation = val;
      if (this._cppAddtionalInformation) {
        this._patchForm(this._cppAddtionalInformation);
        this._existingContractors = Array.from(this._cppAddtionalInformation.Contractors);
        this._initContractorsForm(this._cppAddtionalInformation.Contractors);
        this.setOverAllValidity(null);
        //subscribe only for first time    
        this._contractorsFormShown$.next(true);
        this._contractFormValueChangesSub = this._contractorsFormGroup.valueChanges.subscribe((data) => {
          this.setOverAllValidity(null);
        });
      } else {
        this.cppAddtionalInformation = new CPPAdditionalInfo(); // giving empty values but not patching the form

      }
    });

    //onSelectChange

    let noOfContractorsField = this._formFields.filter(f => f.field.name === 'NumberOfContractors')[0];
    this._noOfContractorsChnagedSub = (<EventEmitter<any>>noOfContractorsField.context.getContextData().get('onSelectChange')).subscribe((value) => {
      //Need to re bind the contractors form here
      this._patchContractorsFormCount(value.SelectedValue);
    });
    //set the client field visibility
    let clientFieldContextData = this._formFields.filter(f => f.field.name === 'Client')[0].context.getContextData();
    let clientFieldVisibility = <BehaviorSubject<boolean>>clientFieldContextData.get('propertyValue');

    if (this._constructionPhasePlan) {
      if (this._constructionPhasePlan.IsDomestic.toString() == "true") {
        clientFieldVisibility.next(true);
      } else {
        clientFieldVisibility.next(false);
      }
    }

  }

  ngOnDestroy() {
    if (this._submitEventSubscription) {
      this._submitEventSubscription.unsubscribe();
    }
    if (this._cppAdditionalInformationSub) {
      this._cppAdditionalInformationSub.unsubscribe();
    }
    if (this._noOfContractorsChnagedSub) {
      this._noOfContractorsChnagedSub.unsubscribe();
    }
    if (this._contractFormValueChangesSub) {
      this._contractFormValueChangesSub.unsubscribe();
    }
    if (this._cppSubscription) {
      this._cppSubscription.unsubscribe();
    }
  }
  // End of public methods

}
