import { StringHelper } from '../../../shared/helpers/string-helper';
import { nameFieldValidator } from '../../common/employee-validators';
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
import { TrainingCourseCreateAction } from '../../../shared/actions/training-course.actions';
import { TrainingCourse } from '../../../shared/models/training-course.models';

@Component({
  selector: 'training-course-add',
  templateUrl: './training-course-add.component.html',
  styleUrls: ['./training-course-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TrainingCourseAddComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _trainingCourseDetails: TrainingCourse;
  private _trainingCourseAddForm: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _submitted: boolean = false;
  private _toggleTrainingCourseAddForm: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _toggleTrainingCourseAddFormSubscription: Subscription;
  private _currentTrainingCourseSubscription: Subscription;
  // End of private Fields

  // Output properties declarations
  @Output('aeCloseTC')
  private _aeCloseTC: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('getNewTC')
  private _getNewTC: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Output properties declarations

  public get trainingCourseAddForm() {
    return this._trainingCourseAddForm;
  }

  public get lightClass() {
    return this._lightClass;
  }

  //Public properties
  @Input('toggleTC')
  get toggleTrainingCourseAddForm() {
    return this._toggleTrainingCourseAddForm.getValue();
  }
  set toggleTrainingCourseAddForm(val: string) {
    this._toggleTrainingCourseAddForm.next(val);
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

  }
  //end of constructor

  //public method start
  ngOnInit() {
    let _toggleTrainingCourseAddFormSubscription = this._toggleTrainingCourseAddForm.subscribe(status => {
      this._trainingCourseDetails = new TrainingCourse();
      this._initForm();
    });
  }
  ngOnDestroy() {
    if (this._toggleTrainingCourseAddFormSubscription)
      this._toggleTrainingCourseAddFormSubscription.unsubscribe();
  }
  public fieldHasRequiredError(fieldName: string): boolean {
    return (this._trainingCourseAddForm.get(fieldName).hasError('required') && (!this._trainingCourseAddForm.get(fieldName).pristine || this._submitted));
  }
  public fieldHasInvalidName(fieldName: string): boolean {
    return this._trainingCourseAddForm.get(fieldName).getError('validName') == false;
  }
  public onAddFormClosed(e) {
    this._aeCloseTC.emit(false);
  }  
  public onAddFormSubmit(e) {
    this._submitted = true;
    if (this._trainingCourseAddForm.valid) {
      let _trainingCourseToSave: TrainingCourse = Object.assign({}, this._trainingCourseDetails, <TrainingCourse>this._trainingCourseAddForm.value);
      _trainingCourseToSave.CompanyId = this._claimsHelper.getCompanyId();
      _trainingCourseToSave.IsAtlasTraining = false;
      _trainingCourseToSave.IsCompleted = false;
      _trainingCourseToSave.Type = "";
      this._getNewTC.emit(true);
      this._store.dispatch(new TrainingCourseCreateAction(_trainingCourseToSave));
    }
  }
  //End of public methods

  // Private methods start
  private _initForm() {
    this._trainingCourseAddForm = this._fb.group({
      Title: [{ value: this._trainingCourseDetails.Title, disabled: false }, [Validators.required]],
      CourseCode: [{ value: this._trainingCourseDetails.CourseCode, disabled: false }],
      Description: [{ value: this._trainingCourseDetails.Description, disabled: false }],
    });
  }
  // End of Private methods 

}
