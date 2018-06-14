import { Store } from '@ngrx/store';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { RiskAssessment } from '../../models/risk-assessment';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { getAeSelectItemsFromEnum } from '../../../employee/common/extract-helpers';
import { ReviewPeriod } from '../../common/review-period';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { RaReviewForm } from '../../models/ra-review-form';
import { IFormBuilderVM, IFormFieldWrapper } from '../../../shared/models/iform-builder-vm';
import { FormGroup } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../../shared/reducers';
import { DatePipe } from "@angular/common";

@Component({
  selector: 'risk-assessment-review',
  templateUrl: './risk-assessment-review.component.html',
  styleUrls: ['./risk-assessment-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RiskAssessmentReviewComponent extends BaseComponent implements OnInit, OnDestroy {

  //private  fields
  private _raReviewForm: FormGroup;
  private _formName: string;
  private _raReviewFormVM: IFormBuilderVM;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _reviewPeriodOptions$: BehaviorSubject<Immutable.List<AeSelectItem<number>>>;
  private _riskAssessmentVm: RiskAssessment;
  private _isExample: boolean = false;
  private _reviewDateVisibility: BehaviorSubject<boolean>;
  private _reviewDateDisplayVisibility: BehaviorSubject<boolean>;
  private _defaultOption: Immutable.List<AeSelectItem<number>>;
  //end of private fields
  //input out uput bindings
  @Input()
  set RiskAssessmentVm(value: RiskAssessment) {
    this._riskAssessmentVm = value;
  }
  get RiskAssessmentVm() {
    return this._riskAssessmentVm;
  }
  
  @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() reviewSubmit: EventEmitter<boolean> = new EventEmitter<boolean>();

  //public properties
  get raReviewFormVM(): IFormBuilderVM {
    return this._raReviewFormVM;
  }
  //end of public properties

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _riskAssessmentService: RiskAssessmentService
    , private _store: Store<fromRoot.State>
    , private _datePipe: DatePipe) {
    super(_localeService, _translationService, _cdRef);
    this._defaultOption = Immutable.List([
      new AeSelectItem<number>('', null, false),
    ]);
  }
  //private methods
  private _addDaysToDate(date: Date, days: number) {
    date.setDate(date.getDate() + days);
    return date;
  }
  private _calculateReviewDate(updateReviewDate: boolean) {
    let assessmentDate = new Date();
    let reviewPeriod: ReviewPeriod = <ReviewPeriod>(this._raReviewForm.get('ReviewPeriod') ? Number(this._raReviewForm.get('ReviewPeriod').value) : ReviewPeriod.Annually);
    let reviewDate: Date;
    switch (reviewPeriod) {
      case ReviewPeriod.Daily:
        reviewDate = this._addDaysToDate(assessmentDate, 1);
        break;
      case ReviewPeriod.Weekly:
        reviewDate = this._addDaysToDate(assessmentDate, 7);
        break;
      case ReviewPeriod.Monthly:
        reviewDate = this._addDaysToDate(assessmentDate, 30);
        break;
      case ReviewPeriod.Annually:
        reviewDate = this._addDaysToDate(assessmentDate, 365);
        break;
      case ReviewPeriod.Custom:
        reviewDate = updateReviewDate ? assessmentDate : new Date();
        break;
    }
    return reviewDate;
  }
  private _updateReviewDate(showReviewDateField: boolean, updateReviewDate: boolean) {
    this._reviewDateVisibility.next(showReviewDateField && !this._isExample);
    this._reviewDateDisplayVisibility.next(!showReviewDateField && !this._isExample);
    if (!showReviewDateField && !this._isExample) {
      let reviewDateDisplayField = this._fields.find(f => f.field.name === 'ReviewDateDisplay');
      if (!isNullOrUndefined(reviewDateDisplayField)) {
        let reviewDateFieldValue = <BehaviorSubject<string>>reviewDateDisplayField.context.getContextData().get('displayValue');
        let dateValue = <Date>this._calculateReviewDate(updateReviewDate);
        reviewDateFieldValue.next(this._datePipe.transform(dateValue, 'dd/MM/yyyy'));
      }
    }
    if (showReviewDateField && !this._isExample) {
      if (!isNullOrUndefined(this._raReviewForm.get('ReviewDate'))) {
        this._raReviewForm.get('ReviewDate').setValue(this._calculateReviewDate(updateReviewDate));
      }
    }

  }
  //private methods end
  ngOnInit() {
    this._formName = 'raReviewForm';
    this._raReviewFormVM = new RaReviewForm(this._formName, this._isExample);
    this._fields = this._raReviewFormVM.init();
    let commentField = this._fields.find(field => field.field.name === 'GeneralComment');
    let reviewPeriodField = this._fields.find(field => field.field.name === 'ReviewPeriod');
    if (!isNullOrUndefined(reviewPeriodField)) {
      this._reviewPeriodOptions$ = reviewPeriodField.context.getContextData().get('options');
      this._reviewPeriodOptions$.next(Immutable.List(this._defaultOption.toArray().concat(getAeSelectItemsFromEnum(ReviewPeriod).toArray())));

    }
    let reviewDateField = this._fields.find(f => f.field.name === 'ReviewDate');
    if (!isNullOrUndefined(reviewDateField)) {
      this._reviewDateVisibility = <BehaviorSubject<boolean>>reviewDateField.context.getContextData().get('propertyValue');
    }
    let reviewDateDisplayField = this._fields.find(f => f.field.name === 'ReviewDateDisplay');
    if (!isNullOrUndefined(reviewDateDisplayField)) {
      this._reviewDateDisplayVisibility = <BehaviorSubject<boolean>>reviewDateDisplayField.context.getContextData().get('propertyValue');
    }
  }
  onCancel() {
    this.cancel.emit(false);
  }
  onSubmit() {
    let raReviewObject = new RiskAssessment();
    raReviewObject.Id = this._riskAssessmentVm.Id;
    raReviewObject.AssessmentDate = new Date();
    raReviewObject.ReviewPeriod = this._raReviewForm.get('ReviewPeriod').value;
    if (this._raReviewForm.controls.hasOwnProperty('ReviewDate')) {
      raReviewObject.ReviewDate = this._raReviewForm.get('ReviewDate').value;
    }
    else
      raReviewObject.ReviewDate = this._raReviewForm.get('ReviewDateDisplay').value;
    let comments = this._raReviewForm.get('GeneralComment').value;
    if (isNullOrUndefined(comments))
      comments = "";
    let raArray: Array<any> = [];
    raArray.push(raReviewObject, comments);
    this._riskAssessmentService.reviewRiskAssesment(raArray);
    this.reviewSubmit.emit(true);
  }
  onFormInit(fg: FormGroup) {
    this._raReviewForm = fg;
    this._raReviewForm.get('ReviewDateDisplay').setValue(this._datePipe.transform(new Date(), 'dd/MM/yyyy'));
    if (!isNullOrUndefined(this._raReviewForm.get('ReviewPeriod'))) {
      this._raReviewForm.get('ReviewPeriod').valueChanges.subscribe((newVal) => {
        this._reviewPeriodOptions$.next(getAeSelectItemsFromEnum(ReviewPeriod));
        let showReviewDateField = (Number(newVal) === ReviewPeriod.Custom);
        this._updateReviewDate(showReviewDateField, true);
      });
    }
    this._updateReviewDate(false, true);
  }
  formButtonLabels() {
    let lables = { Submit: 'Submit' };
    return lables;
  }
  public getTitle() {
    return "Review";
  }
  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
