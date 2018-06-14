import { onlySpaceValidator } from './../../../employee/common/employee-validators';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { BehaviorSubject, Subscription, Observable } from 'rxjs/Rx';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { AddJobTitleAction } from '../../../shared/actions/company.actions';
import { JobTitle } from '../../../shared/models/company.models';


// import { TrainingCourseCreateAction } from '../../../shared/actions/training-course.actions';


@Component({
  selector: 'jobtitle-add',
  templateUrl: './jobtitle-add.component.html',
  styleUrls: ['./jobtitle-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class JobtitleAddComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _jobTitleDetails: JobTitle;
  private _jobTitleAddForm: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _submitted: boolean = false;
  private _toggleJobTitleAddForm: BehaviorSubject<string> = new BehaviorSubject<string>("");

  private _selectedRecord : JobTitle;
  private _isNew : boolean;
  // End of private Fields

  // Output properties declarations
  @Output('onCancel')
  private _onCancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('onSave')
  private _onSave: EventEmitter<any> = new EventEmitter<any>();
  // End of Output properties declarations

  public get jobTitleAddForm() {
    return this._jobTitleAddForm;
  }

  public get lightClass() {
    return this._lightClass;
  }

  //Public properties
  @Input('selectedRecord')
  get selectedRecord() {
    return this._jobTitleDetails;
  }
  set selectedRecord(val: any) {
    this._jobTitleDetails = val;
    if (val && val.Id) {
      this._isNew = false;
      this._jobTitleDetails = val;
    }else{
      this._jobTitleDetails = new JobTitle();
    }
  }
  //End of public properties

  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this.id = 'add-jobtitle';
    this.name = 'add-jobtitle';
  }
  //end of constructor

  //public method start
  ngOnInit() {  
      this._initForm();   
  }
  ngOnDestroy() {
    
  }
  public fieldHasRequiredError(fieldName: string): boolean {
    return ( (this._jobTitleAddForm.get(fieldName).hasError('required')  || this._jobTitleAddForm.get(fieldName).getError('onlySpace') == false )  && (!this._jobTitleAddForm.get(fieldName).pristine || this._submitted));
  }
  public onAddFormClosed(e) {
    this._onCancel.emit(false);
  }
  public onAddFormSubmit(e) {
    this._submitted = true;
    if (this._jobTitleAddForm.valid) {
      let _jobTitleToSave: JobTitle = Object.assign({}, this._jobTitleDetails, <JobTitle>this._jobTitleAddForm.value);
      _jobTitleToSave.CompanyId = this._claimsHelper.getCompanyId();
      this._onSave.emit(_jobTitleToSave);     
    }
  }
  //End of public methods

  // Private methods start
  private _initForm() {
    if(isNullOrUndefined(this._jobTitleDetails)){
      this._jobTitleDetails = new JobTitle();
    }
    this._jobTitleAddForm = this._fb.group({
      Name: [{ value: this._jobTitleDetails.Name, disabled: false }, [Validators.required, onlySpaceValidator]]
    });
  }
  // End of Private methods 

}
