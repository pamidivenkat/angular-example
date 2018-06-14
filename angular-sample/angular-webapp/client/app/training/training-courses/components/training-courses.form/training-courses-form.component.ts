import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { BaseComponent } from '../../../../shared/base-component';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers/index';
import { TrainingCourse, TrainingModule } from '../../../models/training-course';
import { TrainingCourseService } from '../../services/training-courses.service';

@Component({
  selector: 'training-courses-form',
  templateUrl: './training-courses-form.component.html',
  styleUrls: ['./training-courses-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TrainingCourseFormComponent extends BaseComponent implements OnInit {

  //private field   
  private _trainingCourseForm: FormGroup;
  private _employeePeriodOptionList: Immutable.List<AeSelectItem<string>>;
  private _submitted: boolean = false;
  private _addOrUpdateActionType: string = "";
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _vm: TrainingCourse;
  private _headerTitle: string;
  private _buttonText: string;
  private _SelectedTrainingModules: TrainingModule[];
  private _trainingModules: TrainingModule[];
  private _dataSourceType: AeDatasourceType;

  get headerTitle(): string {
    return this._headerTitle;
  }

  get trainingCourseForm(): FormGroup {
    return this._trainingCourseForm
  }

  get dataSourceType(): AeDatasourceType {
    return this._dataSourceType
  }

  get lightClass(): AeClassStyle {
    return this._lightClass
  }

  /**
*Member to specify whether to show/hide icon for checkbox
* default value is false
* @type {boolean}
* @memberOf AeCheckboxComponent
*/
  @Input('addOrUpdateActionType')
  get addOrUpdateActionType() {
    return this._addOrUpdateActionType;
  }
  set addOrUpdateActionType(val: string) {
    this._addOrUpdateActionType = val;
    if (this._addOrUpdateActionType === 'ADD')
      this._headerTitle = !this._claimsHelper.CanManageExamples() ? 'TRAINING_COURSE.Add_Training_Course' : 'TRAINING_COURSE.Add_Training_Course_Citation_Client';
  }

  /**
*TrainingCourse model object, selected item
* @type {TrainingCourse}
* @memberOf TrainingCourseFormComponent
*/
  @Input('TrainingModules')
  set TrainingModules(value: TrainingModule[]) {
    this._trainingModules = value;
  }
  get TrainingModules() {
    return this._trainingModules;
  }
  

  @Input('vm')
  set vm(value: TrainingCourse) {
    this._vm = value;
  }
  get vm() {
    return this._vm;
  }
  

  @Output('onCancel') _onCancel: EventEmitter<string>;
  @Output('OnSaveComplete') _OnSaveComplete: EventEmitter<string>;

  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _TrainingCourseService: TrainingCourseService
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this._onCancel = new EventEmitter<string>();
    this._OnSaveComplete = new EventEmitter<string>();
  }

  ngOnInit() {
    this._initForm();
    this._dataSourceType = AeDatasourceType.Local;
    if (this._addOrUpdateActionType === 'UPDATE') {
      this._store.let(fromRoot.getTrainingSelectedModuleData).subscribe(selectedModule => {
        if (!isNullOrUndefined(selectedModule)) {
          this._vm = selectedModule;
          if (!this._claimsHelper.CanManageExamples()) {
            this._headerTitle = 'TRAINING_COURSE.Update_Training_Course';
          }
          else {
            if (this._vm.IsExample)
              this._headerTitle = this._translationService.translate('TRAINING_COURSE.Update_Training_Course_Citation_Client', { trainingCourseType: 'standard' });
            else
              this._headerTitle = this._translationService.translate('TRAINING_COURSE.Update_Training_Course_Citation_Client', { trainingCourseType: 'customised' });
          }
          this._initialazeForm();
        }
      });
    }
  }
 public buttonTextReturn(): string {
    if (this._addOrUpdateActionType === "ADD") {
      return this._buttonText = "BUTTONS.ADD";

    } else {
      return this._buttonText = "BUTTONS.UPDATE";
    }
  }

  // Private methods start
  private _initForm() {
    this._trainingCourseForm = this._fb.group({
      Title: [{ value: null, disabled: false }, [Validators.required]],
      Description: [{ value: null, disabled: false }],
      IsExample: [{ value: null, disabled: false }],
      TrainingModules: [{ value: [], disabled: false }, [Validators.required]],
    });
  }



  private _initialazeForm() {
    let tmodules: Array<TrainingModule> = [];
    this._trainingCourseForm.get('Title').setValue(this._vm.Title);
    this._trainingCourseForm.get('Description').setValue(this._vm.Description);
    this._trainingCourseForm.get('IsExample').setValue(this._vm.IsExample);
    this._vm.TrainingModules.map((value, index) => {
      tmodules.push({ Id: value.Id, Title: value.Title });
    });
    this._trainingCourseForm.get('TrainingModules').setValue(tmodules);
    this._SelectedTrainingModules = tmodules;
  }

  /**
   * Submit form(add/update)
   * 
   * @private
   * @param {any} e
   * 
   * @memberOf TrainingCourseFormComponent
   */
  onFormSubmit(e) {
    this._submitted = true;
    if (this._trainingCourseForm.valid) {
      //dispatch an action to save form
      let _formDataToSave: TrainingCourse = Object.assign({}, this._vm, <TrainingCourse>this._trainingCourseForm.value);
      _formDataToSave.TrainingModules = this._SelectedTrainingModules;
      _formDataToSave.Type = this._SelectedTrainingModules.length > 1 ? "Multiple Module" : "Single Module";
      _formDataToSave.IsAtlasTraining = true;
      if (this._addOrUpdateActionType === 'ADD') {
        this._TrainingCourseService._createTrainingCourse(_formDataToSave); //save action
      } else {
        this._TrainingCourseService._updateTrainingCourse(_formDataToSave); //save action
      }
      if (this._addOrUpdateActionType === 'ADD')
        this._OnSaveComplete.emit('add'); //emit to parent component
      else
        this._OnSaveComplete.emit('update'); //emit to parent component
      this._trainingCourseForm.reset(); //clear form.
    }
  }
  onTrainingModuleFilterChanged($event: any) {
    const statusFilterValues = $event.map((selectItem => selectItem.Entity));
    this._SelectedTrainingModules = statusFilterValues;
  }

  onTrainingModuleFilterCleared($event: any) {
    this._SelectedTrainingModules = [];


  }

  canAddStandardCourse(): boolean {
    return this._claimsHelper.CanManageExamples();
  }
  /**
 * on slide-out pop cancel
 * @private
 * @param {any} e 
 * 
 * @memberOf TrainingCourseFormComponent
 */
  onFormClosed(e) {
    this._trainingCourseForm.reset(); //clear form.
    if (this._addOrUpdateActionType === 'ADD')
      this._onCancel.emit('add');
    else
      this._onCancel.emit('update');

  }
  /**
  * Validate require field.
  * @private
  * @param {string} fieldName
  * @returns {boolean}
  * 
  * @memberOf EmployeeGroupFormComponent
  */
  fieldHasRequiredError(fieldName: string): boolean {
    if (this._trainingCourseForm.get(fieldName).hasError('required') && (!this._trainingCourseForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }
  private _onLocationFilterCleared($event: any) {
    //To do
  }
  ngOnDestroy() {
  }

}
