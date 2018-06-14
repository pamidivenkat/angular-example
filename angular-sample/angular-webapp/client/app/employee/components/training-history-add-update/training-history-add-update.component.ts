import { Employee } from '../../models/employee.model';
import { DocumentCategoryEnum } from '../../../document/models/document-category-enum';
import { RouteParams } from './../../../shared/services/route-params';
import { StringHelper } from '../../../shared/helpers/string-helper';
import {
  EmployeeTrainingHistoryCreateAction,
  EmployeeTrainingHistoryUpdateAction
} from '../../actions/employee.actions';
import { nameFieldValidator, startDateValidator } from '../../common/employee-validators';
import { isNullOrUndefined } from 'util';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { BehaviorSubject, Subscription, Observable } from 'rxjs/Rx';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { TrainingUserCourseModule } from '../../models/training-history.model';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { TrainingCourseLoadAction } from '../../../shared/actions/training-course.actions';
import { TrainingCourse } from '../../../shared/models/training-course.models';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { FileResult } from '../../../atlas-elements/common/models/file-result';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { Document, ResourceUsage } from '../../../document/models/document';

@Component({
  selector: 'training-history-add-update',
  templateUrl: './training-history-add-update.component.html',
  styleUrls: ['./training-history-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TrainingHistoryAddUpdateComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _employeeTrainingDetails: TrainingUserCourseModule;
  private _empTrainingHistoryAddUpdateForm: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _submitted: boolean = false;
  private _toggleTrainingHistoryAddUpdateForm: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _toggleTrainingHistoryAddUpdateFormSubscription: Subscription;
  private _currentTrainingHistorySubscription: Subscription;
  private _trainingCourseListLoaded$: Observable<boolean>
  private _trainingCourseListLoadedSubscription: Subscription;
  private _trainingCourseList$: Observable<TrainingCourse[]>;
  private _dataSouceType: AeDatasourceType;
  private _selectedTrainingCourse: TrainingCourse;
  private _showTrainingCourseAddForm: boolean = false;
  private _operationModeTC: string = "add";
  private _btnStyle: AeClassStyle;
  private _selectedFile: FileResult;
  private _trainingCourseProgressStatusSubscription: Subscription;
  private _datasourceSelectedCourses: any[];
  private _canGetNewTtariningCourse: boolean = false;
  private _currentTrainingCourseSubscription: Subscription;
  private _showRemainingCount: boolean = true;
  private _customValidation: boolean = false;
  private _employeePersonalVMSubscription: Subscription;
  private _currentEmployee: Employee;
  // End of private Fields

  // Output properties declarations
  @Output('aeCloseTH')
  private _aeCloseTH: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Output properties declarations

  //Public properties
  @Input('toggleTH')
  get toggleTrainingHistoryAddUpdateForm() {
    return this._toggleTrainingHistoryAddUpdateForm.getValue();
  }
  set toggleTrainingHistoryAddUpdateForm(val: string) {
    this._toggleTrainingHistoryAddUpdateForm.next(val);
  }
  //End of public properties

  public get showTrainingCourseAddForm() {
    return this._showTrainingCourseAddForm;
  }

  public get operationModeTC() {
    return this._operationModeTC;
  }

  public get empTrainingHistoryAddUpdateForm() {
    return this._empTrainingHistoryAddUpdateForm;
  }

  public get trainingCourseList$() {
    return this._trainingCourseList$;
  }

  public get dataSouceType() {
    return this._dataSouceType;
  }

  public get datasourceSelectedCourses() {
    return this._datasourceSelectedCourses;
  }

  public get btnStyle() {
    return this._btnStyle;
  }

  public get showRemainingCount() {
    return this._showRemainingCount;
  }

  public get lightClass() {
    return this._lightClass;
  }
  get employeeTrainingDetails() {
    return this._employeeTrainingDetails;
  }
  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${docId}`;
  }
  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fileUploadService: FileUploadService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._dataSouceType = AeDatasourceType.Local;

  }
  //end of constructor

  //public method start
  ngOnInit() {
    this._btnStyle = AeClassStyle.Light;
    this._employeePersonalVMSubscription = this._store.select(c => c.employeeState.EmployeePersonalVM).subscribe((employeeVM) => {
      this._currentEmployee = employeeVM;
    });
    this._trainingCourseListLoaded$ = this._store.let(fromRoot.getTrainingCourseListDataLoadStatus);
    this._trainingCourseListLoadedSubscription = this._trainingCourseListLoaded$.subscribe(trainingCourseListLoaded => {
      if (!trainingCourseListLoaded) {
        this._store.dispatch(new TrainingCourseLoadAction(null));
      }
    });
    this._trainingCourseList$ = this._store.let(fromRoot.getNonAtlasTrainingCourseList);
    this._currentTrainingHistorySubscription = this._store.select(ed => ed.employeeState.CurrentTrainingHistory).subscribe(ed => {
      if (!isNullOrUndefined(ed)) {
        this._employeeTrainingDetails = ed;
        this._datasourceSelectedCourses = Array.of(ed.SelectedCourse);
        this._initForm();
        this._cdRef.markForCheck();
      }
    });
    this._toggleTrainingHistoryAddUpdateFormSubscription = this._toggleTrainingHistoryAddUpdateForm.subscribe(status => {
      if (status == "add") {
        this._employeeTrainingDetails = new TrainingUserCourseModule();
        this._datasourceSelectedCourses = [{ Id: '', Title: '', CourseCode: '' }];
        this._initForm();
      }
    });
    this._trainingCourseProgressStatusSubscription = this._store.let(fromRoot.getTrainingCourseProgressStatus).subscribe(status => {
      if (status) {
        this._showTrainingCourseAddForm = false;
      }
    });
    this._currentTrainingCourseSubscription = this._store.select(ed => ed.trainingCourseState.CurrentTrainingCourse).subscribe(newTC => {
      if (!isNullOrUndefined(newTC) && this._canGetNewTtariningCourse) {
        this._datasourceSelectedCourses = Array.of(newTC);
        this._trainingCourseList$.concat(Array.of(newTC));
        this._selectedTrainingCourse = newTC;
        this._empTrainingHistoryAddUpdateForm.get('CourseCode').setValue(newTC.CourseCode);
        this._empTrainingHistoryAddUpdateForm.get('CourseId').setValue(newTC.Id);
        this._cdRef.markForCheck();
        this._canGetNewTtariningCourse = false;
      }
    });
  }

  ngOnDestroy() {
    if (this._employeePersonalVMSubscription) {
      this._employeePersonalVMSubscription.unsubscribe();
    }
    if (this._trainingCourseListLoadedSubscription)
      this._trainingCourseListLoadedSubscription.unsubscribe();
    if (this._currentTrainingHistorySubscription)
      this._currentTrainingHistorySubscription.unsubscribe();
    if (this._toggleTrainingHistoryAddUpdateFormSubscription)
      this._toggleTrainingHistoryAddUpdateFormSubscription.unsubscribe();
    if (this._trainingCourseProgressStatusSubscription)
      this._trainingCourseProgressStatusSubscription.unsubscribe();
    if (this._currentTrainingCourseSubscription)
      this._currentTrainingCourseSubscription.unsubscribe();
  }
  public onCertificateDownLoad(docId: string) {
    window.open(this._getDownloadUrl(docId));
  }
  public closeTrainingCourseAddForm(e) {
    this._showTrainingCourseAddForm = false;
  }
  public getTrainingCourseSlideoutState(): string {
    return this._showTrainingCourseAddForm ? 'expanded' : 'collapsed';
  }
  public isUpdateMode() {
    return this.toggleTrainingHistoryAddUpdateForm == "update";
  }
  public getNewTrainingCourse() {
    this._canGetNewTtariningCourse = true;
  }
  public onTrainingCourseChanged($event: any) {
    $event.map((selectedItem => this._selectedTrainingCourse = <TrainingCourse>(selectedItem.Entity)));
    if (this._selectedTrainingCourse != null) {
      this._empTrainingHistoryAddUpdateForm.get('CourseCode').setValue(this._selectedTrainingCourse.CourseCode);
      this._empTrainingHistoryAddUpdateForm.get('CourseId').setValue(this._selectedTrainingCourse.Id);
    }
  }
  public onClearSelectedTrainingCourse($event: any) {

  }
  public openTrainingCourseAddForm(e) {
    this._showTrainingCourseAddForm = true;
    this._operationModeTC = "add";
  }
  public fieldHasRequiredError(fieldName: string): boolean {
    if (fieldName == 'SelectedCourse') {
      // this._empTrainingHistoryAddUpdateForm.get('CourseId').value instanceof Object
      if (this._empTrainingHistoryAddUpdateForm.get('CourseId').value.value === '' || this._empTrainingHistoryAddUpdateForm.value.SelectedCourse.length == 0) {
        this._customValidation = true;
      } else {
        this._customValidation = false;
      }
      return (this._customValidation && (!this._empTrainingHistoryAddUpdateForm.get(fieldName).pristine || this._submitted));
    }
    else {
      return (this._empTrainingHistoryAddUpdateForm.get(fieldName).hasError('required') && (!this._empTrainingHistoryAddUpdateForm.get(fieldName).pristine || this._submitted));
    }
  }
  public formHasStartDateError(errorName: string): boolean {
    return !StringHelper.isNullOrUndefined(this._empTrainingHistoryAddUpdateForm.get('StartDate').value)
      && !StringHelper.isNullOrUndefined(this._empTrainingHistoryAddUpdateForm.get('PassDate').value)
      && this._empTrainingHistoryAddUpdateForm.errors && (!StringHelper.isNullOrUndefined(this._empTrainingHistoryAddUpdateForm.errors["startDateValidator"]) && !this._empTrainingHistoryAddUpdateForm.errors["startDateValidator"])
  }
  public formHasCompletionDateError(errorName: string): boolean {
    return !StringHelper.isNullOrUndefined(this._empTrainingHistoryAddUpdateForm.get('PassDate').value)
      && !StringHelper.isNullOrUndefined(this._empTrainingHistoryAddUpdateForm.get('ExpiryDate').value)
      && this._empTrainingHistoryAddUpdateForm.errors && (!StringHelper.isNullOrUndefined(this._empTrainingHistoryAddUpdateForm.errors["completionDateValidator"]) && !this._empTrainingHistoryAddUpdateForm.errors["completionDateValidator"])
  }
  public onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      //this._showDesciptionAndNotes = true;
    }
  }
  public onAddUpdateFormClosed(e) {
    this._aeCloseTH.emit(false);
  }
  public onAddUpdateFormSubmit(e) {
    this._submitted = true;
    if (this._empTrainingHistoryAddUpdateForm.valid && !this._customValidation) {
      let _empTrainingDetailsToSave: TrainingUserCourseModule = Object.assign({}, this._employeeTrainingDetails, <TrainingUserCourseModule>this._empTrainingHistoryAddUpdateForm.value);
      if (this._selectedTrainingCourse) {
        _empTrainingDetailsToSave.SelectedCourse = this._selectedTrainingCourse;
      }
      else {
        _empTrainingDetailsToSave.CourseId = this._employeeTrainingDetails.CourseId;
      }
      _empTrainingDetailsToSave.Status = 1;
      if (this._selectedFile) {
        this._uploadCertificatesAndDispatchTrainingHistory(_empTrainingDetailsToSave);
      }
      else {
        this._dispatchTrainingHistory(_empTrainingDetailsToSave);
      }
    }
  }
  //End of public methods

  // Private methods start  
  private _uploadCertificatesAndDispatchTrainingHistory(_empTrainingDetailsToSave: TrainingUserCourseModule) {
    let _documentToSave: Document = Object.assign({}, new Document());
    //no need to assign company id  _documentToSave.CompanyId = this._claimsHelper.getCompanyId();
    _documentToSave.LastModifiedDateTime = this._selectedFile.file.lastModifiedDate;
    _documentToSave.Category = DocumentCategoryEnum.Certificates;
    _documentToSave.Usage = ResourceUsage.User;
    _documentToSave.FileName = this._selectedFile.file.name;
    _documentToSave.FileNameAndTitle = this._selectedFile.file.name;
    _documentToSave.RegardingObjectTypeCode = 17;// mapped to employee
    _documentToSave.RegardingObjectId = this._currentEmployee.Id;
    this._fileUploadService.Upload(_documentToSave, this._selectedFile.file).then((response: any) => {
      let _certificateToSave: Document = Object.assign({}, response);
      if (_empTrainingDetailsToSave.Certificates) {
        _empTrainingDetailsToSave.Certificates.push(_certificateToSave);
      }
      else {
        _empTrainingDetailsToSave.Certificates = new Array<Document>();
        _empTrainingDetailsToSave.Certificates.push(_certificateToSave);
      }
      this._dispatchTrainingHistory(_empTrainingDetailsToSave);
    }, (error: string) => { console.log(error); });
  }
  private _dispatchTrainingHistory(_empTrainingDetailsToSave: TrainingUserCourseModule) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(_empTrainingDetailsToSave.Id)) {
      this._store.dispatch(new EmployeeTrainingHistoryUpdateAction(_empTrainingDetailsToSave));
    }
    else {
      this._store.dispatch(new EmployeeTrainingHistoryCreateAction(_empTrainingDetailsToSave));
    }

  }
  private _isFileSelected(): boolean {
    return (this._submitted === true && isNullOrUndefined(this._selectedFile));
  }
  private _initForm() {
    this._empTrainingHistoryAddUpdateForm = this._fb.group({
      CourseId: [{ value: this._employeeTrainingDetails.CourseId, disabled: false, visible: false }],
      SelectedCourse: [{ value: this._datasourceSelectedCourses, disabled: false }, [Validators.required]],
      CourseCode: [{ value: this._employeeTrainingDetails.SelectedCourse ? this._employeeTrainingDetails.SelectedCourse.CourseCode : null, disabled: true }],
      StartDate: [{ value: this._employeeTrainingDetails.StartDate ? new Date(this._employeeTrainingDetails.StartDate) : null, disabled: false }, [Validators.required]],
      PassDate: [{ value: this._employeeTrainingDetails.PassDate ? new Date(this._employeeTrainingDetails.PassDate) : null, disabled: false }],
      ExpiryDate: [{ value: this._employeeTrainingDetails.ExpiryDate ? new Date(this._employeeTrainingDetails.ExpiryDate) : null, disabled: false }],
      CourseGrade: [{ value: this._employeeTrainingDetails.CourseGrade, disabled: false }],
      Provider: [{ value: this._employeeTrainingDetails.Provider, disabled: false }],
      Description: [{ value: this._employeeTrainingDetails.Description, disabled: false }],
    },
      {
        validator: startDateValidator
      },
    );
  }
  private _fieldHasInvalidName(fieldName: string): boolean {
    return this._empTrainingHistoryAddUpdateForm.get(fieldName).getError('validName') == false;
  }
  // End of Private methods 

}
