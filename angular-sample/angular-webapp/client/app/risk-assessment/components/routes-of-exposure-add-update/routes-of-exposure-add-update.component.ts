import { WhoIsAffected } from '../../common/who-is-effected-enum';
import { FormControl } from '@angular/forms/forms';
import { RaRoutesOfExposureForm } from '../../models/ra-routes-of-exposure-form';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { IFormBuilderVM } from '../../../shared/models/iform-builder-vm';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AeDataActionTypes } from '../../../employee/models/action-types.enum';
import { RiskAssessmentService } from "../../services/risk-assessment-service";
import { RiskAssessmentHazard } from '../../models/risk-assessment-hazard';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers';
import { ActivatedRoute } from '@angular/router';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';

@Component({
  selector: 'routes-of-exposure-add-update',
  templateUrl: './routes-of-exposure-add-update.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutesOfExposureAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  private _selectedROE: RiskAssessmentHazard;
  private _action: string;
  private _whoIsAffectedOptions$: BehaviorSubject<Array<any>>;
  private _affectedPeople: Array<any>;
  private _raRoutesOfExposureForm: FormGroup;
  private _isFormSubmitted: boolean = false;
  private _raRoutesOfExposureFormVM: IFormBuilderVM;
  private _formName: string;
  private _othersAffectedVisibility: BehaviorSubject<boolean>;

  get raRoutesOfExposureFormVM(): IFormBuilderVM {
    return this._raRoutesOfExposureFormVM;
  }
  @Input('routesOfExposure')
  set routesOfExposure(val: RiskAssessmentHazard) {
    this._selectedROE = val;
  }
  get routesOfExposure() {
    return this._selectedROE;
  }
 

  @Input('action')
  get action() {
    return this._action;
  }
  set action(val: string) {
    this._action = val;
  }

  @Input('affectedPeople')
  get affectedPeople() {
    return this._affectedPeople;
  }
  set affectedPeople(val: any) {
    this._affectedPeople = val;
  }

  @Output('addUpdateROESubmit')
  private _addUpdateROESubmit: EventEmitter<any> = new EventEmitter<any>();

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _activatedRoute: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilderService
    , private _riskAssessmentService: RiskAssessmentService
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  ngOnInit() {
    this._formName = 'raRoutesOfExposureForm';
    this._raRoutesOfExposureFormVM = new RaRoutesOfExposureForm(this._formName);
    let fields = this._raRoutesOfExposureFormVM.init();
    let whoIsAffectedField = fields.find(f => f.field.name === 'WhoAffecteds');
    if (!isNullOrUndefined(whoIsAffectedField)) {
      this._whoIsAffectedOptions$ = whoIsAffectedField.context.getContextData().get('items');
      this._whoIsAffectedOptions$.next(this._affectedPeople);
    }
    let _othersAffectedField = fields.find(f => f.field.name === 'OthersAffected');
    this._othersAffectedVisibility = <BehaviorSubject<boolean>>_othersAffectedField.context.getContextData().get('propertyValue');
  }

  onFormInit(fg: FormGroup) {
    this._raRoutesOfExposureForm = fg;
    this._raRoutesOfExposureForm.get('Name').setValue(this._selectedROE.Name);
    this._raRoutesOfExposureForm.get('Description').setValue(this._selectedROE.Description);
    if (this._action === AeDataActionTypes.Update) {
      let _hasOtherField: boolean = false;
      this._selectedROE.WhoAffecteds.forEach((obj) => {
        obj['Name'] = obj.AffectedText;
        if (obj.Affected == WhoIsAffected.Other) {
          _hasOtherField = true;
        }
      });
      this._raRoutesOfExposureForm.get('WhoAffecteds').setValue(<Array<any>>(this._selectedROE.WhoAffecteds));
      this._raRoutesOfExposureForm.get('Description').setValue(this._selectedROE.Description);
      this._raRoutesOfExposureForm.get('HowManyAffected').setValue(this._selectedROE.HowManyAffected);
      this._raRoutesOfExposureForm.get('PeopleAffected').setValue(this._selectedROE.PeopleAffected);
      if (_hasOtherField) {
        this._raRoutesOfExposureForm.get('OthersAffected').setValue(this._selectedROE.OthersAffected);
        this._othersAffectedVisibility.next(true);
      }
    }
    this._raRoutesOfExposureForm.get('WhoAffecteds').valueChanges.subscribe((values) => {
      let _other = values.find(val => val == WhoIsAffected.Other);
      if (!isNullOrUndefined(_other)) {
        this._othersAffectedVisibility.next(true);
      } else {
        this._othersAffectedVisibility.next(false);
      }
    });
  }

  onUpdateFormSubmit(e) {
    this._isFormSubmitted = true;
    if (this._raRoutesOfExposureForm.valid) {
      this._addUpdateROESubmit.emit(this._raRoutesOfExposureForm.value);
    }
  }

  onUpdateFormClosed(e) {
    this._slideOutClose.emit(false);
  }

  isAddForm() {
    return this._action == AeDataActionTypes.Add;
  }

  isUpdateForm() {
    return this._action == AeDataActionTypes.Update;
  }

  footerBtnText() {
    return { Submit: this.isAddForm() ? 'Add' : 'Update', Cancel: 'Close' }
  }

}
