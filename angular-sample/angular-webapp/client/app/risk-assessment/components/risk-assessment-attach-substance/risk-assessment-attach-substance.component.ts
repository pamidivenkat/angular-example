import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { LocaleService, TranslationService } from "angular-l10n";
import { BaseComponent } from "../../../shared/base-component";
import { Subscription } from "rxjs/Subscription";
import { isNullOrUndefined } from "util";
import { MessengerService } from "../../../shared/services/messenger.service";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers';
import { RiskAssessmentService } from "../../services/risk-assessment-service";
import { RiskAssessmentAttachSubstanceFormFieldWrapper, RiskAssessmentAttachSubstanceForm } from "../../models/risk-assessment-attach-substance-form";
import { FormBuilder, FormGroup, FormArray } from "@angular/forms";
import { IFormBuilderVM } from "../../../shared/models/iform-builder-vm";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import * as Immutable from 'immutable';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { RACoshhInventory } from "../../models/risk-assessment-coshh-inventory";
import { extractRACoshhInventoryToAeSelectItems } from "../../common/extract-helper";
import { Observable } from "rxjs/Observable";
import { AddRACoshhInventoryAction } from "../../actions/risk-assessment-actions";
import { RASubstance } from "../../models/risk-assessment-substance";
import { AeClassStyle } from "../../../atlas-elements/common/ae-class-style.enum";

@Component({
  selector: 'risk-assessment-attach-substance',
  templateUrl: './risk-assessment-attach-substance.component.html',
  styleUrls: ['./risk-assessment-attach-substance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentAttachSubstanceComponent extends BaseComponent implements OnInit, OnDestroy {
  private _coshhInventorySubscription: Subscription;
  private _fields: Array<RiskAssessmentAttachSubstanceFormFieldWrapper<any>>;
  private _riskAssessmentForm: FormGroup;
  private _riskAssessmentFormVM: IFormBuilderVM;
  private _formName: string;
  private _coshhInventoryVisibility: BehaviorSubject<boolean>;
  private _peopleAffectedVisibility: BehaviorSubject<boolean>;
  private _isExample: boolean;
  private _generalForm: FormGroup;
  private _substanceList$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _substanceList: Immutable.List<AeSelectItem<string>[]>;
  private _action: string;
  private _isFormSubmitted: boolean;
  private _isAddNewSubstance: boolean = false;
  private _coshhInventoryList: RACoshhInventory[];
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get riskAssessmentFormVM(): IFormBuilderVM {
    return this._riskAssessmentFormVM;
  }

  @Input('isExample')
  get isExample(): boolean {
    return this._isExample;
  }
  set isExample(val: boolean) {
    this._isExample = val;
  }
  @Input('action')
  get action() {
    return this._action;
  }
  set action(val: string) {
    this._action = val;
  }


  @Output('attachSubstanceSubmit')
  private _attachSubstanceSubmit: EventEmitter<any> = new EventEmitter<any>();

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _messenger: MessengerService
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _riskAssessmentService: RiskAssessmentService
    , private _fb: FormBuilder) {
    super(_localeService, _translationService, _cdRef);
  }
  ngOnInit() {

    this._formName = 'risk-assessment-attach-substance-form';
    this._riskAssessmentFormVM = new RiskAssessmentAttachSubstanceForm(this._formName, true);
    this._fields = this._riskAssessmentFormVM.init();
    this._getVisibility();
    this._bindDropdownData();
  }

  ngOnDestroy() {
    if (this._coshhInventorySubscription) {
      this._coshhInventorySubscription.unsubscribe();
    }
  }

  onFormInit(fg: FormGroup) {
    this._riskAssessmentForm = fg;
  }

  private _initGeneralForm() {
    this._generalForm = this._fb.group({
      SelectALL: [{ value: null, disabled: false }],
      WorkspaceTypes: this._fb.array([]),
      Sectors: this._fb.array([])
    });
  }

  onUpdateFormSubmit(e) {
    this._isFormSubmitted = true;

    //this._attachSubstanceSubmit.emit(e);
    if (this._riskAssessmentForm.valid) {
      let substanceId = this._riskAssessmentForm.value.Substance;
      let raSubstance = this._coshhInventoryList.filter(s => s.Id == substanceId);
      raSubstance[0].PeopleAffected = this._riskAssessmentForm.value.PeopleAffected;
      this._attachSubstanceSubmit.emit(raSubstance[0]);
    }
  }
  addCoshhInventory(coshhInventory: RACoshhInventory) {
    if (!isNullOrUndefined(coshhInventory)) {
      this._store.dispatch(new AddRACoshhInventoryAction(coshhInventory));
      this._attachSubstanceSubmit.emit(coshhInventory);
      this.closedAddSlideOut();
    }
  }
  onUpdateFormClosed(e) {
    this._slideOutClose.emit(false);
  }

  private _bindDropdownData() {
    let substanceField = this._fields.find(f => f.field.name === 'Substance');
    if (!isNullOrUndefined(substanceField)) {
      this._substanceList$ = substanceField.context.getContextData().get('options');
      this._coshhInventorySubscription = this._store.let(fromRoot.getcoshhInventoryList).subscribe((res) => {
        if (!isNullOrUndefined(res)) {
          let sortedList = res.sort((a, b) => a.Substance > b.Substance ? 1 : -1);
          this._coshhInventoryList = sortedList;
          this._substanceList$.next(Immutable.List<AeSelectItem<string>>(extractRACoshhInventoryToAeSelectItems(sortedList)));
        }
        else {
          this._riskAssessmentService._loadcoshhInventory();
        }
      });
    }
  }
  private _getVisibility() {


  }
  getSlideoutAnimateState(): boolean {
    return this._isAddNewSubstance ? true : false;
  }

  getSlideoutState(): string {
    return this._isAddNewSubstance ? 'expanded' : 'collapsed';
  }
  showAddSlideOut() {
    return this._isAddNewSubstance
  }
  closedAddSlideOut() {
    return this._isAddNewSubstance = false;
  }

  addSubstance() {
    this._isAddNewSubstance = true;
  }


  private _onFormValidityChange(status: boolean) {
    //this._context.isValidEvent.emit(status);
  }

}
