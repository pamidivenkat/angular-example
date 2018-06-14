import { RouteParams } from './../../../shared/services/route-params';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { TabSelection } from '../../../atlas-elements/common/models/ae-tab-model';
import { AeDataActionTypes } from '../../../employee/models/action-types.enum';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { LoadRaHazardCategoryText } from '../../actions/risk-assessment-actions';
import { HazardCategory } from '../../common/hazard-category-enum';
import { getPictureUrl } from '../../common/helper';
import { RAHazardCategoryText } from '../../models/ra-hazard-category-text';
import { RiskAssessment } from '../../models/risk-assessment';
import { RiskAssessmentHazard } from '../../models/risk-assessment-hazard';
import { WhoAffected } from '../../models/who-affected';
import { RiskAssessmentService } from '../../services/risk-assessment-service';

@Component({
  selector: 'routes-of-exposure',
  templateUrl: './routes-of-exposure.component.html',
  styleUrls: ['./routes-of-exposure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutesOfExposureComponent extends BaseComponent implements OnInit, OnDestroy {
  private _routesExposureList: Immutable.List<RiskAssessmentHazard>;
  private _selectedRoutesExposureList: RiskAssessmentHazard[];
  private _selectedRoutesExposureCount: number;
  private _roesApiRequestParams: Array<AtlasParams>;
  private _slideOut: boolean = false;
  private _actionType: string;
  private _selectedROE: RiskAssessmentHazard;
  private _removeConfirmation: boolean;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _currentRiskAssessmentId: string;
  private _affectedPeoplesList: Array<any>;
  private _keys = ['Id', 'Name', 'PictureId'];
  private _isSearchInput: AeInputType = AeInputType.search;
  private _searchText: string = '';
  private _refreshEventData: any;
  private _defaultSelection: number = 0;
  private _currentTab: number;
  private _refreshTab: boolean = false;
  private _currentRiskAssessment: RiskAssessment;
  private _notes: RAHazardCategoryText;
  private _notesForm: FormGroup;
  private _context: any;
  private _notesText: string

  get removeConfirmation(): boolean {
    return this._removeConfirmation;
  }
  get selectedROE(): RiskAssessmentHazard {
    return this._selectedROE;
  }
  get actionType(): string {
    return this._actionType;
  }
  get slideOut(): boolean {
    return this._slideOut;
  }

  get selectedRoutesExposureList(): RiskAssessmentHazard[] {
    return this._selectedRoutesExposureList;
  }

  get routesExposureList(): Immutable.List<RiskAssessmentHazard> {
    return this._routesExposureList;
  }

  get isSearchInput(): AeInputType {
    return this._isSearchInput;
  }

  get searchText(): string {
    return this._searchText;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get selectedROEName(): string {
    return this._selectedROE.Name;
  }

  get notesForm(): FormGroup {
    return this._notesForm;
  }

  get selectedRoutesExposureCount(): number {
    return this._selectedRoutesExposureCount;
  }

  @Input('affectedPeople')
  get affectedPeople() {
    return this._affectedPeoplesList;
  }
  set affectedPeople(val: any) {
    this._affectedPeoplesList = val;
  }

  @Input('routesOfExposures')
  set routesOfExposures(val: Immutable.List<RiskAssessmentHazard>) {
    this._routesExposureList = val;
  }
  get routesOfExposures() {
    return this._routesExposureList;
  }
  
  @Input('refreshEventData')
  get refreshEventData() {
    return this._refreshEventData;
  }
  set refreshEventData(val: any) {
    this._refreshEventData = val;
  }

  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  get defaultSelection() {
    return this._defaultSelection;
  }

  @Output('refreshStep')
  refreshStep: EventEmitter<{ stepType: string, data: any }> = new EventEmitter<{ stepType: string, data: any }>()

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _activatedRoute: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
    , private _claimsHelper: ClaimsHelperService
    , private _riskAssessmentService: RiskAssessmentService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._notes = new RAHazardCategoryText();
  }

  private _initForm() {
    this._notesForm = this._fb.group(
      { notesText: [{ value: this._notesText, disabled: false }] }
    );
  }

  ngOnInit() {
    if (!isNullOrUndefined(this.refreshEventData)) {
      this._defaultSelection = this._refreshEventData;
      if (isNullOrUndefined(this._currentTab))
        this._currentTab = this._refreshEventData;
    }

    this._store.let(fromRoot.getCurrentRiskAssessment).skipWhile(val => isNullOrUndefined(val)).takeUntil(this._destructor$).subscribe((res) => {
      this._currentRiskAssessmentId = res.Id;
      this._currentRiskAssessment = res;
      this._riskAssessmentService._loadSelectedRoutesOfExposureByRAId({ riskassessmentId: this._currentRiskAssessmentId, category: HazardCategory.RoutesOfExposure });
      if (this.isMigrated() && isNullOrUndefined(this._notes.Text)) {
        this._store.dispatch(new LoadRaHazardCategoryText({ id: this._currentRiskAssessment.Id }))
      }
    });

    this._store.let(fromRoot.getROENotes).takeUntil(this._destructor$).subscribe((notes) => {
      if (!isNullOrUndefined(notes)) {
        this._notes = notes;
        if (!isNullOrUndefined(this._notesForm)) {
          this._notesText = notes.Text;
        }
      }
      this._initForm();
    })

    this._store.let(fromRoot.getCurrentRiskAssessmentRoutesOfExposureData).takeUntil(this._destructor$).subscribe((hazards) => {
      if (!isNullOrUndefined(hazards)) {
        this._selectedRoutesExposureList = hazards;
        this._selectedRoutesExposureCount = hazards ? hazards.length : 0;

        if (this._refreshTab) {
          this.refreshStep.emit({ stepType: 'routesofexposure', data: this._currentTab });
          this._refreshTab = false;
        }
        this._cdRef.markForCheck();
      }
    })

    this._context.submitEvent.takeUntil(this._destructor$).subscribe((val) => {
      if (val) {
        if (this._notesForm.dirty) {
          if (this._notes.Id) {
            this._notes.Text = this._notesForm.get('notesText').value;
            this._riskAssessmentService.updateRiskAssessmentHazardCategoryText(this._notes);
          } else {
            let params = {
              Category: HazardCategory.RoutesOfExposure,
              CreatedBy: this._claimsHelper.getUserId(),
              RiskAssessmentId: this._currentRiskAssessment.Id,
              'Text': this._notesForm.get('notesText').value
            }
            this._riskAssessmentService.createRiskAssessmentHazardCategoryText(params);
          }
        }
      }
    });
    this._initForm();
  }

  searchOnAllRoutes($event) {
    this._searchText = $event.event.target.value;
    this._riskAssessmentService._loadFilteredExampleRoutesOfExposure(this._searchText);
  }

  getPictureUrl(pictureId: string): string {
    return getPictureUrl(pictureId, this._routeParamsService.Cid, true);
  }

  onSelectExampleROE(_roe) {
    this._selectedROE = _roe;
    this._actionType = AeDataActionTypes.Add;
    this._slideOut = true;
  }

  getSlideoutState(): string {
    return this._slideOut ? 'expanded' : 'collapsed';
  }

  closeSlideOut(e) {
    this._slideOut = false;
  }

  removeConfirmModalClosed(e) {
    this._removeConfirmation = false;
  }

  isMigrated(): boolean {
    return this._currentRiskAssessment
      && (this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.coshhMigratedRiskAssessmentTypeId || this._currentRiskAssessment.RiskAssessmentTypeId == fromConstants.generalMigratedRiskAssessmentTypeId);
  }
  removeConfirmModaloOpen(_roe: RiskAssessmentHazard) {
    this._selectedROE = _roe;
    this._removeConfirmation = true;
  }

  addRouteOfExposureToRA(_routeOfExposure: RiskAssessmentHazard) {
    this._slideOut = false;
    let _whoAffecteds = this._affectedPeoplesList.filter((obj) => {
      return _routeOfExposure.WhoAffecteds.indexOf(obj.Affected) !== -1;
    });
    _routeOfExposure.WhoAffecteds = _whoAffecteds;
    if (this._actionType === AeDataActionTypes.Add) {
      _routeOfExposure.PrototypeId = this._selectedROE.Id;
      _routeOfExposure.PictureId = this._selectedROE.PictureId;
      _routeOfExposure.Category = HazardCategory.RoutesOfExposure;
      _routeOfExposure.RiskAssessmentId = this._currentRiskAssessmentId;
      _routeOfExposure.IsSharedPrototype = this._selectedROE.IsExample;
      this._riskAssessmentService._createRiskAssessmentROE(_routeOfExposure);
    } else if (this._actionType === AeDataActionTypes.Update) {
      this._selectedROE.Name = _routeOfExposure.Name;
      this._selectedROE.Description = _routeOfExposure.Description;
      if (!isNullOrUndefined(_routeOfExposure.WhoAffecteds) && _routeOfExposure.WhoAffecteds.length > 0) {
        if (!isNullOrUndefined(this._selectedROE.WhoAffecteds)) {
          let affectedPeopleList: Array<WhoAffected> = <Array<WhoAffected>>this._selectedROE.WhoAffecteds;
          this._selectedROE.WhoAffecteds = [];
          _routeOfExposure.WhoAffecteds.forEach(f => {
            f.RiskAssessmentHazardId = this._selectedROE.Id;
          });
          this._selectedROE.WhoAffecteds = _routeOfExposure.WhoAffecteds;
        }
        else {
          this._selectedROE.WhoAffecteds = _whoAffecteds;
        }
      }
      this._selectedROE.OthersAffected = _routeOfExposure.OthersAffected;
      this._selectedROE.HowManyAffected = _routeOfExposure.HowManyAffected;
      this._selectedROE.PeopleAffected = _routeOfExposure.PeopleAffected;
      this._riskAssessmentService._updateRiskAssessmentROE(this._selectedROE);
    }

    this._refreshTab = true;
  }

  updateROEOpen(_roe: RiskAssessmentHazard) {
    this._selectedROE = _roe;
    this._actionType = AeDataActionTypes.Update;
    this._slideOut = true;
  }

  removeROE(e) {
    this._removeConfirmation = false;
    this._riskAssessmentService._removeRiskAssessmentROE(this._selectedROE);
    this._refreshTab = true;
  }

  tabChanged(tab: TabSelection) {
    this._currentTab = tab.currentTabIndex;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

}
