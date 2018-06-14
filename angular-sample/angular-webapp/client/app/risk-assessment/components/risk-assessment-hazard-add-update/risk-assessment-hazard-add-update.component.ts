import { WhoIsAffected } from '../../common/who-is-effected-enum';
import { FormControl } from '@angular/forms/forms';
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
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy, ViewEncapsulation } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { RiskAssessmentHazardForm } from "../../models/risk-assessment-hazard-form";

@Component({
  selector: 'risk-assessment-hazard-add-update',
  templateUrl: './risk-assessment-hazard-add-update.component.html',
  styleUrls: ['./risk-assessment-hazard-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RiskAssessmentHazardAddUpdateComponent extends BaseComponent implements OnInit {
  private _selectedHazard: RiskAssessmentHazard;
  private _action: string;
  private _whoIsAffectedOptions$: BehaviorSubject<Array<any>>;
  private _affectedPeople: Array<any>;
  private _raHazardsForm: FormGroup;
  private _isFormSubmitted: boolean = false;
  private _raHazardsFormVM: IFormBuilderVM;
  private _formName: string;
  private _othersAffectedVisibility: BehaviorSubject<boolean>;

  get raHazardsFormVM(): IFormBuilderVM {
    return this._raHazardsFormVM;
  }
  @Input('hazard')
  set hazard(val: RiskAssessmentHazard) {
    if (val.WhoAffecteds) {
      val.WhoAffecteds = val.WhoAffecteds.filter((p) => !p.IsDeleted);
    }
    this._selectedHazard = val;
  }
  get hazard() {
    return this._selectedHazard;
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

  @Output('addUpdateHazard')
  private _addUpdateHazard: EventEmitter<any> = new EventEmitter<any>();

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
    this._formName = 'raHazardsForm';
    this._raHazardsFormVM = new RiskAssessmentHazardForm(this._formName);
    let fields = this._raHazardsFormVM.init();
    let whoIsAffectedField = fields.find(f => f.field.name === 'WhoAffecteds');
    if (!isNullOrUndefined(whoIsAffectedField)) {
      this._whoIsAffectedOptions$ = whoIsAffectedField.context.getContextData().get('items');
      this._whoIsAffectedOptions$.next(this._affectedPeople);
    }
    let _othersAffectedField = fields.find(f => f.field.name === 'OthersAffected');
    this._othersAffectedVisibility = <BehaviorSubject<boolean>>_othersAffectedField.context.getContextData().get('propertyValue');
  }

  onFormInit(fg: FormGroup) {
    this._raHazardsForm = fg;
    this._raHazardsForm.get('Name').setValue(this._selectedHazard.Name);
    this._raHazardsForm.get('Description').setValue(this._selectedHazard.Description);
    if (this._action === AeDataActionTypes.Update) {
      let _hasOtherField: boolean = false;
      if (!isNullOrUndefined(this._selectedHazard.WhoAffecteds)) {
        this._selectedHazard.WhoAffecteds.forEach((obj) => {
          obj['Name'] = obj.AffectedText;
          if (obj.Affected == WhoIsAffected.Other) {
            _hasOtherField = true;
          }
        });
      }
      this._selectedHazard.WhoAffecteds.forEach((obj) => {
        obj['Name'] = obj.AffectedText;
        if (obj.Affected == WhoIsAffected.Other) {
          _hasOtherField = true;
        }
      });
      this._raHazardsForm.get('WhoAffecteds').setValue(this._selectedHazard.WhoAffecteds);
      this._raHazardsForm.get('HowManyAffected').setValue(this._selectedHazard.HowManyAffected);
      this._raHazardsForm.get('PeopleAffected').setValue(this._selectedHazard.PeopleAffected);
      if (_hasOtherField) {
        this._raHazardsForm.get('OthersAffected').setValue(this._selectedHazard.OthersAffected);
        this._othersAffectedVisibility.next(true);
      }
    }
    this._raHazardsForm.get('WhoAffecteds').valueChanges.subscribe((values) => {
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
    if (this._raHazardsForm.valid) {
      let raHazard: RiskAssessmentHazard = this._raHazardsForm.value;
      raHazard.IsSharedPrototype = this._selectedHazard.IsExample;
      this._addUpdateHazard.emit(raHazard);
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
