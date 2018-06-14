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
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeChangeEvent } from '../../../atlas-elements/common/models/ae-change-event';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { TabSelection } from '../../../atlas-elements/common/Models/ae-tab-model';
import { Document } from '../../../document/models/Document';
import { AeDataActionTypes } from '../../../employee/models/action-types.enum';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import { LoadRaHazardCategoryText, LoadSelectedHazardsAction } from '../../actions/risk-assessment-actions';
import { HazardCategory } from '../../common/hazard-category-enum';
import { Hazard } from '../../models/hazard';
import { RAHazardCategoryText } from '../../models/ra-hazard-category-text';
import { RiskAssessment } from '../../models/risk-assessment';
import { RiskAssessmentHazard } from '../../models/risk-assessment-hazard';
import { WhoAffected } from '../../models/who-affected';
import { RiskAssessmentService } from '../../services/risk-assessment-service';

@Component({
  selector: 'risk-assessment-hazard',
  templateUrl: './risk-assessment-hazard.component.html',
  styleUrls: ['./risk-assessment-hazard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RiskAssessmentHazardComponent extends BaseComponent implements OnInit, OnDestroy {
  private _hazard$: BehaviorSubject<Immutable.List<Hazard>>;
  private _hazardsApiRequestParams: AtlasApiRequestWithParams;
  private _searchText: string;
  private _context: any;
  private _totalHazardsCount: number;
  private _totalExampleHazardsCount: number;
  private _countSubscription: Subscription;
  private _defaultNumber = 20;
  private _selectedHazards: Array<RiskAssessmentHazard>;
  private _selectedHazard: any;
  private _showSlider: boolean;
  private _affectedPeoplesList: Array<any>;
  private _actionType: string;
  private _currentRiskAssessment: RiskAssessment;
  private _showRemoveConfirmation: boolean;
  private _selectedHazardsCountSubscription: Subscription;
  private _selectedHazardsCount: number;
  private _showCreateHazardSlideOut: boolean;
  private _hasStandardIconsLoadedSubscription: Subscription;
  private _standardHazardIconsSubscription: Subscription;
  private _standardHazardIcons: Array<Document>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _refreshEventData: any;
  private _defaultSelection: number = 0;
  private _currentTab: number;
  private _refreshTab: boolean;
  private _isSearch: boolean;
  private _stepSubscription: Subscription;
  private _printHazardDescriptionChanged: boolean = false;
  private _activatedRoutesSubscription: Subscription;
  private _isExampleRA: boolean = false;
  private _switchTextLeft: AeClassStyle = AeClassStyle.TextLeft;
  private _hazardNotes: RAHazardCategoryText;
  private _hazardNotesForm: FormGroup;
  private _notesText: string;
  private _lastpage: number = -1;
  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _claimsHelper: ClaimsHelperService
    , private _activatedRoute: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _riskAssessmentService: RiskAssessmentService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._selectedHazardsCount = 0;
    this._refreshTab = false;
    this._hazard$ = new BehaviorSubject<Immutable.List<Hazard>>(null);
    this._isSearch = false;
    this._hazardNotes = new RAHazardCategoryText();
  }
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  get defaultNumber() {
    return this._defaultNumber;
  }

  get listStream() {
    return this._hazard$;
  }

  @Input('affectedPeople')
  get affectedPeople() {
    return this._affectedPeoplesList;
  }
  set affectedPeople(val: any) {
    this._affectedPeoplesList = val;
  }

  @Input('refreshEventData')
  get refreshEventData() {
    return this._refreshEventData;
  }
  set refreshEventData(val: any) {
    this._refreshEventData = val;
    this._currentTab = val;
  }

  get removeConfirmation() {
    return this._showRemoveConfirmation;
  }

  get searchText() {
    return this._searchText;
  }

  get standardHazardIcons() {
    return this._standardHazardIcons;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get selectedHazard(): any {
    return this._selectedHazard;
  }
  get selectedHazards(): Array<RiskAssessmentHazard> {
    return this._selectedHazards
  }
  get actionType(): string {
    return this._actionType;
  }
  get affectedPeoplesList() {
    return this._affectedPeoplesList;
  }

  get defaultSelection() {
    return this._defaultSelection;
  }

  get isSearch() {
    return this._isSearch;
  }

  get printHazardDescription() {
    return this._currentRiskAssessment && this._currentRiskAssessment.IncludeHazardDescription;
  }

  get switchTextLeft() {
    return this._switchTextLeft;
  }

  @Output('refreshStep')
  refreshStep: EventEmitter<{ stepType: string, data: any }> = new EventEmitter<{ stepType: string, data: any }>()

  get selectedHazardsCount() {
    return this._selectedHazardsCount;
  }

  searchAllHazards($event: any) {
    this._searchText = $event.event.target.value;
    this._isSearch = true;
    this._lastpage = 0;
    this._cdRef.markForCheck();
    this._initialLoadHazards();
  }

  tabChanged(tab: TabSelection) {
    this._currentTab = tab.currentTabIndex;
  }

  isCOSHH(): boolean {
    if (!isNullOrUndefined(this._currentRiskAssessment)) {
      return this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.coshhRiskAssessmentTypeId || this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.coshhMigratedRiskAssessmentTypeId;
    }
    return false;
  }

  isMigrated(): boolean {
    return this._currentRiskAssessment && (this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.generalMigratedRiskAssessmentTypeId || this._currentRiskAssessment.RiskAssessmentTypeId === fromConstants.coshhMigratedRiskAssessmentTypeId);
  }

  private _raHazardCategoryType(): number {
    return this._currentRiskAssessment && this.isCOSHH() ? HazardCategory.Substance : HazardCategory.General;
  }

  get hazardNotesForm(): FormGroup {
    return this._hazardNotesForm;
  }

  get hazardNotes() {
    return this._hazardNotes;
  }

  onChange(event: AeChangeEvent) {
    if (!isNullOrUndefined(this._totalHazardsCount) && this._totalHazardsCount > 0) {
      let currentLoadedHazardItems = this._hazardsApiRequestParams.PageNumber * this._hazardsApiRequestParams.PageSize;
      if (currentLoadedHazardItems < this._totalHazardsCount) {
        this._hazardsApiRequestParams.PageNumber += 1;
        this._riskAssessmentService._loadHazards(this._hazardsApiRequestParams);
      }
    }
  }

  ngOnInit() {
    if (!isNullOrUndefined(this.refreshEventData)) {
      this._defaultSelection = this._refreshEventData;
    }
    this._store.let(fromRoot.getCurrentRiskAssessment).skipWhile(val => isNullOrUndefined(val)).takeUntil(this._destructor$).subscribe((data) => {
      this._currentRiskAssessment = data;
      if (!isNullOrUndefined(this._currentRiskAssessment) && !StringHelper.isNullOrUndefinedOrEmpty(this._currentRiskAssessment.Id)) {
        this._store.dispatch(new LoadSelectedHazardsAction({ category: this._raHazardCategoryType(), riskAssessmentId: this._currentRiskAssessment.Id }))
      }
      if (this.isMigrated() && this.isCOSHH() && isNullOrUndefined(this._hazardNotes.Text)) {
        this._store.dispatch(new LoadRaHazardCategoryText({ id: this._currentRiskAssessment.Id }))
      }
    });

    this._store.let(fromRoot.getHazardNotes).takeUntil(this._destructor$).subscribe((hazardNotes) => {
      if (!isNullOrUndefined(hazardNotes)) {
        this._hazardNotes = hazardNotes;
        if (!isNullOrUndefined(this._hazardNotesForm)) {
          this._notesText = hazardNotes.Text
        }
      }
      this._initNotes();
    })



    this._searchText = '';
    this._initialLoadHazards();
    this._store.let(fromRoot.getHazardsData).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        let data = res.data;
        let isLoading = res.allHazardsLoading;
        if (!isNullOrUndefined(data) && !isNullOrUndefined(isLoading) && isLoading == false) {
          // apb-19018 avoid duplicates being pushed to virtual list.
          if (this._lastpage < this._hazardsApiRequestParams.PageNumber) {
            if (data.count() > 0) {
              this._lastpage = this._hazardsApiRequestParams.PageNumber;
            }
            this._hazard$.next(data);
            this._cdRef.markForCheck();
            if (this._isSearch) {
              this._isSearch = false;
              this._cdRef.markForCheck();
            }
          }
        }
      }
    });
    this._countSubscription = this._store.let(fromRoot.getHazardsCount).subscribe(count => {
      if (!isNullOrUndefined(count)) {
        let hazardsCount = <Map<string, number>>count;
        this._totalHazardsCount = hazardsCount.get('hazardsCount');
        this._totalExampleHazardsCount = hazardsCount.get('exampleHazardsCount');
      }
    });

    this._store.let(fromRoot.getSelectedHazards).takeUntil(this._destructor$).subscribe((hazards) => {
      if (!isNullOrUndefined(hazards)) {
        this._selectedHazards = hazards.filter((item) => item.Category === this._raHazardCategoryType());
        this._selectedHazardsCount = this._selectedHazards.length;
        if (this._refreshTab) {
          this.refreshStep.emit({ stepType: 'hazards', data: this._currentTab });
          this._refreshTab = false;
        }
        this._cdRef.markForCheck();
      }

    });


    this._hasStandardIconsLoadedSubscription = this._store.let(fromRoot.getHasStandardHazardIconsLoaded).subscribe(loaded => {
      if (loaded === false) {
        this._riskAssessmentService.loadStandardHazardIcons();
      }
    });

    this._standardHazardIconsSubscription = this._store.let(fromRoot.getStandardHazardIcons).subscribe(icons => {
      if (!isNullOrUndefined(icons)) {
        this._standardHazardIcons = icons;
      }
    });

    this._activatedRoutesSubscription = this._activatedRoute.params.subscribe((params) => {
      this._isExampleRA = params['example'] === "example" ? true : false;
    });

    this._stepSubscription = this._context.submitEvent.subscribe((val) => {
      if (val) {
        if (this._printHazardDescriptionChanged) {
          this._riskAssessmentService.updateRiskAssessmentPrintDescriptionStatus(this._currentRiskAssessment, this._isExampleRA);
        }

        if (this._hazardNotesForm.dirty) {
          if (this._hazardNotes.Id) {
            this._hazardNotes.Text = this._hazardNotesForm.get('hazardNotesText').value;
            this._riskAssessmentService.updateRiskAssessmentHazardCategoryText(this._hazardNotes);
          } else {
            let params = {
              Category: HazardCategory.General,
              CreatedBy: this._claimsHelper.getUserId(),
              RiskAssessmentId: this._currentRiskAssessment.Id,
              'Text': this._hazardNotesForm.get('hazardNotesText').value
            }
            this._riskAssessmentService.createRiskAssessmentHazardCategoryText(params);
          }
        }
      }
    });

    this._initNotes();
  }

  private _initNotes() {
    this._hazardNotesForm = this._fb.group(
      { hazardNotesText: [{ value: this._notesText, disabled: false }] }
    );
  }

  private _initialLoadHazards() {
    let hazardParams = new Array<AtlasParams>();
    hazardParams.push(new AtlasParams('searchHazardsFilter', this._searchText));
    hazardParams.push(new AtlasParams('categoryHazardsFilter', this._raHazardCategoryType()));
    this._hazardsApiRequestParams = new AtlasApiRequestWithParams(1, 50, 'Name', SortDirection.Ascending, hazardParams);
    this._riskAssessmentService._loadHazards(this._hazardsApiRequestParams);
  }

  public getPictureUrl(pictureId: string, isExample: boolean): string {
    if (!isNullOrUndefined(pictureId)) {
      if (isExample) {
        return "/filedownload?documentId=" + pictureId + "&isSystem=true";
      } else {
        return this._routeParamsService.Cid ? "/filedownload?documentId=" + pictureId + "&cid=" + this._routeParamsService.Cid : "/filedownload?documentId=" + pictureId;
      }
    }
    else {
      return '/assets/images/hazard-default.png';
    }

  }

  addHazardToRiskAssessment(hazard: Hazard) {
    this._selectedHazard = hazard;
    this._actionType = AeDataActionTypes.Add;
    this._showSlider = true;
  }

  updateHazard(selectedHazard: RiskAssessmentHazard) {
    this._selectedHazard = selectedHazard;
    this._actionType = AeDataActionTypes.Update;
    this._showSlider = true;
  }

  removeHazard(selectedHazard: RiskAssessmentHazard) {
    this._selectedHazard = selectedHazard;
    this._showRemoveConfirmation = true;
  }

  removeHazardConfirm(e) {
    this._showRemoveConfirmation = false;
    this._riskAssessmentService.removeRiskAssessmentHazard(this._selectedHazard.Id);
    this._refreshTab = true;
  }

  showSlideOut = (): boolean => this._showSlider;
  getSlideoutState = (): string => this._showSlider ? 'expanded' : 'collapsed';

  showCreateHazardSlideOut = (): boolean => this._showCreateHazardSlideOut;
  getCreateHazardSlideoutState = (): string => this._showCreateHazardSlideOut ? 'expanded' : 'collapsed';

  removeConfirmModalClosed(e) {
    this._showRemoveConfirmation = false;
  }

  closeSlideOut(e) {
    this._showSlider = false;
    this._showCreateHazardSlideOut = false;
  }

  addUpdateRAHazard(raHazard: RiskAssessmentHazard) {
    this._showSlider = false;
    //raHazard.WhoAffecteds carries array of affected values or array of objects
    let _whoAffecteds = this._affectedPeoplesList.filter((obj) => {
      return raHazard.WhoAffecteds.indexOf(obj.Affected) !== -1 || ((raHazard.WhoAffecteds.map(function (a) { return a.Affected; })).indexOf(obj.Affected) !== -1);
    });
    raHazard.WhoAffecteds = _whoAffecteds;
    if (this._actionType === AeDataActionTypes.Add) {
      let selectedItem: Hazard = <Hazard>this._selectedHazard;
      raHazard.PrototypeId = this._selectedHazard.Id;
      raHazard.PictureId = this._selectedHazard.PictureId;
      raHazard.Category = this._raHazardCategoryType();
      raHazard.RiskAssessmentId = this._currentRiskAssessment.Id;
      raHazard.IsSharedPrototype = this._selectedHazard.IsExample;
      this._riskAssessmentService.createRiskAssessmentHazard(raHazard);
    } else {
      this._selectedHazard.Name = raHazard.Name;
      this._selectedHazard.Description = raHazard.Description;
      if (!isNullOrUndefined(raHazard.WhoAffecteds) && raHazard.WhoAffecteds.length > 0) {
        if (!isNullOrUndefined(this._selectedHazard.WhoAffecteds)) {
          let affectedPeopleList: Array<WhoAffected> = Array.from(<Array<WhoAffected>>this._selectedHazard.WhoAffecteds);
          this._selectedHazard.WhoAffecteds = []; //empty the array and add to the array who are actually selected
          raHazard.WhoAffecteds.forEach(f => {
            let WhoAffected = affectedPeopleList.find(m => m.Affected === f.Affected);
            if (isNullOrUndefined(WhoAffected)) {
              this._selectedHazard.WhoAffecteds.push(f);
            } else {
              //now get the item from the existing list(WhoAffected is the existing list item) and attach to the selected hazards whoAffects array
              this._selectedHazard.WhoAffecteds.push(WhoAffected);
            }
          });
        }
        else {
          this._selectedHazard.WhoAffecteds = _whoAffecteds;
        }

      }
      else {
        this._selectedHazard.WhoAffecteds = new Array();
      }

      this._selectedHazard.OthersAffected = raHazard.OthersAffected;
      this._selectedHazard.HowManyAffected = raHazard.HowManyAffected;
      this._selectedHazard.PeopleAffected = raHazard.PeopleAffected;
      this._riskAssessmentService.updateRiskAssessmentHazard(this._selectedHazard);
    }

    this._refreshTab = true;
  }
  createHazardSubmit(hazard: RiskAssessmentHazard) {
    let _whoAffecteds = this._affectedPeoplesList.filter((obj) => {
      return hazard.WhoAffecteds.indexOf(obj.Affected) !== -1;
    });
    hazard.Category = this._raHazardCategoryType();
    hazard.WhoAffecteds = _whoAffecteds;
    this._riskAssessmentService.createHazard(hazard);
    this._showCreateHazardSlideOut = false;

    this._refreshTab = true;
  }
  onCreateHazard($event: any) {
    this._showCreateHazardSlideOut = true;
  }
  setPrintHazardDescription($event: boolean) {
    this._printHazardDescriptionChanged = !this._printHazardDescriptionChanged;
    this._currentRiskAssessment.IncludeHazardDescription = $event;
  }
  ngOnDestroy() {
    if (this._selectedHazardsCountSubscription) {
      this._selectedHazardsCountSubscription.unsubscribe();
    }
    if (this._countSubscription) {
      this._countSubscription.unsubscribe();
    }
    if (this._stepSubscription) {
      this._stepSubscription.unsubscribe();
    }
    if (this._activatedRoutesSubscription) {
      this._activatedRoutesSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }
}
