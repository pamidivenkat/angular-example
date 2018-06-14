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
import { ModalDialogSize } from '../../../atlas-elements/common/modal-dialog-size.enum';
import { AeChangeEvent } from '../../../atlas-elements/common/models/ae-change-event';
import { TabSelection } from '../../../atlas-elements/common/models/ae-tab-model';
import { AeWizardStep } from '../../../atlas-elements/common/models/ae-wizard-step';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AtlasParams } from '../../../shared/models/atlas-api-response';
import * as fromRoot from '../../../shared/reducers';
import {
  CreateControlAction,
  LoadAllControls,
  LoadFrequentlyUsedControls,
  LoadRaControlsCategoryText,
  LoadSuggestedControls,
  RemoveControl,
  UpdateRiskAssessmentControlAction,
  AddControl
} from '../../actions/risk-assessment-actions';
import { ControlsCategory } from '../../common/controls-category-enum';
import { HazardCategory } from '../../common/hazard-category-enum';
import { getPictureUrl } from '../../common/helper';
import { RAControlsCategoryText } from '../../models/ra-controls-category-text';
import { RiskAssessment } from '../../models/risk-assessment';
import { RiskAssessmentControl } from '../../models/risk-assessment-control';
import { RiskAssessmentHazard } from '../../models/risk-assessment-hazard';
import { RiskAssessmentService } from '../../services/risk-assessment-service';

@Component({
  selector: 'controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlsComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _currentRiskAssessment: RiskAssessment;
  private _hazards: RiskAssessmentHazard[];
  private _controls: Map<string, RiskAssessmentControl[]>;
  private _showControlsModal: boolean;
  private _frequentlyUsedControls: RiskAssessmentControl[];
  private _context: any;
  private _loading: boolean;
  private _suggestedControls: RiskAssessmentControl[];
  private _suggestedControlsMap: Map<string, RiskAssessmentControl[]>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _selectedControl: RiskAssessmentControl;
  private _showCreateControlSlideOut: boolean;
  private _addModelSize: ModalDialogSize = ModalDialogSize.large;
  private _isSearch: boolean;
  private _switchTextLeft: AeClassStyle = AeClassStyle.TextLeft;
  private _stepSubscription: Subscription;
  private _printControlDescriptionChanged: boolean = false;
  private _activatedRoutesSubscription: Subscription;
  private _isExampleRA: boolean = false;
  private _defaultSelection: number = 0;
  private _selectedControls: RiskAssessmentControl[];
  private _currentTab: number;
  private _refreshEventData: any;
  private _isMigrated: boolean;
  private _selectedHazardId: string;
  private _refreshTab: boolean;
  private _notes: RAControlsCategoryText;
  private _notesForm: FormGroup;
  private _notesText: string;
  // End of Private Fields

  // Public properties
  @Input('context')
  get context(): any {
    return this._context;
  }
  set context(value: any) {
    this._context = value;
  }

  @Input('currentRiskAssessment')
  get currentRiskAssessment(): RiskAssessment {
    return this._currentRiskAssessment;
  }
  set currentRiskAssessment(value: RiskAssessment) {
    this._currentRiskAssessment = value;
  }

  @Input('refreshEventData')
  get refreshEventData() {
    return this._refreshEventData;
  }
  set refreshEventData(val: any) {
    this._refreshEventData = val;
    this._currentTab = val;
  }

  get hazards(): RiskAssessmentHazard[] {
    return this._hazards;
  }

  get controls(): Map<string, RiskAssessmentControl[]> {
    return this._controls;
  }

  get showControlsModal(): boolean {
    return this._showControlsModal;
  }

  get selectedHazardId(): string {
    return this._selectedHazardId;
  }

  get frequentlyUsedControls(): RiskAssessmentControl[] {
    return this._frequentlyUsedControls;
  }

  get suggestedControls(): RiskAssessmentControl[] {
    return this._suggestedControls;
  }

  get loading(): boolean {
    return this._loading;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass
  }

  get selectedControl(): RiskAssessmentControl {
    return this._selectedControl;
  }

  get showCreateControlSlideOut(): boolean {
    return this._showCreateControlSlideOut;
  }

  get addModelSize(): ModalDialogSize {
    return this._addModelSize;
  }

  get printControlDescription() {
    if (isNullOrUndefined(this._currentRiskAssessment)) return;
    return this._currentRiskAssessment.IncludeControlDescription;
  }

  get switchTextLeft() {
    return this._switchTextLeft;
  }

  get defaultSelection() {
    return this._defaultSelection;
  }

  get isMigrated(): boolean {
    return this._isMigrated;
  }

  get selectedControls() {
    return this._selectedControls;
  }
  // End of Public properties

  // Public Output bindings
  @Output('refreshStep')
  refreshStep: EventEmitter<{ stepType: string, data: any }> = new EventEmitter<{ stepType: string, data: any }>()
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _activatedRoute: ActivatedRoute
    , private _riskAssessmentService: RiskAssessmentService
    , private _fb: FormBuilder
    , private _claimsHelper: ClaimsHelperService
    , private _routeParamsService: RouteParams
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
    this._refreshTab = false;
    this._notes = new RAControlsCategoryText();
  }
  // End of constructor

  // Private methods
  private _raHazardCategoryType(): number {
    return this.isCOSHH() ? HazardCategory.Substance : HazardCategory.General;
  }

  private _raControlsCategoryType(): number {
    return this.isCOSHH() ? ControlsCategory['COSHH Control'] : ControlsCategory['General Control'];
  }

  private _initForm() {
    this._notesForm = this._fb.group(
      { notesText: [{ value: this._notesText, disabled: false }] }
    );
  }

  // End of private methods

  // Public methods
  isCOSHH(): boolean {
    return this._riskAssessmentService.isCOSHH(this._currentRiskAssessment);
  }

  tabChanged(tab: TabSelection) {
    this._currentTab = tab.currentTabIndex;
  }

  getPictureUrl(id: string, isSharedDocument: boolean = false, isHazard: boolean = false) {
    return getPictureUrl(id, this._routeParamsService.Cid, isSharedDocument, isHazard)
  }

  getControls(hazardId: string = null): RiskAssessmentControl[] {
    if (isNullOrUndefined(hazardId)) {
      return this._selectedControls.sort((a, b) => { return a.Name > b.Name ? 1 : -1 });
    } else if (!isNullOrUndefined(this._controls)) {
      let hazardControls = this._controls.get(hazardId);
      return !isNullOrUndefined(hazardControls) ? hazardControls.sort((a, b) => { return a.Name > b.Name ? 1 : -1 }) : [];
    }
    this._cdRef.markForCheck();
  }

  updateControl(control: RiskAssessmentControl) {
    this._showCreateControlSlideOut = true;
    this._showControlsModal = false;
    this._selectedControl = control;
    this._refreshTab = true;
  }

  addControl(selectedHazard: RiskAssessmentHazard) {
    this._showControlsModal = true;
    if (isNullOrUndefined(this._selectedHazardId) || this._selectedHazardId !== selectedHazard.Id) {
      this._selectedHazardId = selectedHazard.Id;

      let params = {
        ControlsByCategoryFilter: this.isCOSHH() ? ControlsCategory['COSHH Control'] : ControlsCategory['General Control'],
        hazardControlsFilter: selectedHazard.PrototypeId
      }
      this._store.dispatch(new LoadSuggestedControls(params));
    } else {
      this._selectedControls = this.getControls(this._selectedHazardId)
    }
  }

  modalClosed() {
    this._showControlsModal = false;
  }

  doAction(t) {
    this._showControlsModal = false;
  }

  removeControl(control: RiskAssessmentControl) {
    this._store.dispatch(new RemoveControl(control));
    this._refreshTab = true;
  }

  addNewControl(hazard: RiskAssessmentHazard) {
    this._showCreateControlSlideOut = true;
    this._showControlsModal = false;
    this._selectedControl = null;
  }

  closeSlideOut(e) {
    this._showCreateControlSlideOut = false;
  }

  createControlSubmit(controlToSave: RiskAssessmentControl) {
    this._showCreateControlSlideOut = false;

    if (isNullOrUndefined(controlToSave.Id)) {
      controlToSave.Category = this._raControlsCategoryType();
      controlToSave.IsExample = this.currentRiskAssessment.IsExample;
      let params = {
        control: controlToSave,
        hazardId: this._selectedHazardId,
        isSharedPrototype: this._claimsHelper.canCreateExampleRiskAssessments() && this._currentRiskAssessment.IsExample ? true : false,
        riskAssessmentId: this._currentRiskAssessment.Id
      }
      this._store.dispatch(new CreateControlAction(params));
    } else {
      this._selectedControl = null;
      this._store.dispatch(new UpdateRiskAssessmentControlAction(controlToSave))
    }
    this._refreshTab = true;
  }

  createControlSlideoutState(): string {
    return this._showCreateControlSlideOut ? 'expanded' : 'collapsed';
  }

  setPrintControlDiscription($event: boolean) {
    this._printControlDescriptionChanged = !this._printControlDescriptionChanged;
    this._currentRiskAssessment.IncludeControlDescription = $event;
  }

  addControlToRiskAssessment(control: RiskAssessmentControl) {
    let controlToAdd = new RiskAssessmentControl();
    controlToAdd.Name = control.Name;
    controlToAdd.PictureId = control.PictureId;
    controlToAdd.Description = control.Description;
    controlToAdd.PrototypeId = control.Id;
    controlToAdd.IsSharedPrototype = control.IsExample
    controlToAdd.RiskAssessmentId = this._currentRiskAssessment.Id;
    controlToAdd.RiskAssessmentHazardId = this._selectedHazardId;
    controlToAdd.Category = this._raControlsCategoryType();
    this._store.dispatch(new AddControl(controlToAdd))
  }

  get notesForm(): FormGroup {
    return this._notesForm;
  }

  ngOnInit() {
    if (!isNullOrUndefined(this.refreshEventData)) {
      this._defaultSelection = this._refreshEventData;
    }

    this._isMigrated = this._riskAssessmentService.isMigrated(this._currentRiskAssessment);

    this._store.let(fromRoot.getCurrentRiskAssessmentHazards).takeUntil(this._destructor$).subscribe((hazards) => {
      if (!isNullOrUndefined(hazards)) {
        this._hazards = hazards.filter((hazard) => { return hazard.Category === this._raHazardCategoryType() });
        this._cdRef.markForCheck();
      }
    });

    if (this._isMigrated && isNullOrUndefined(this._notes.Text)) {
      let params = new Array<AtlasParams>();
      params.push(new AtlasParams('pageNumber', 1));
      params.push(new AtlasParams('pageSize', 10));
      params.push(new AtlasParams('sortField', 'CreatedOn'));
      params.push(new AtlasParams('direction', 'desc'));
      params.push(new AtlasParams('AdditionalControlsTextByRAIdFilter', this._currentRiskAssessment.Id));
      params.push(new AtlasParams('AdditionalControlsTextByCategoryFilter', ControlsCategory['COSHH Control']));

      this._store.dispatch(new LoadRaControlsCategoryText(params));
    }

    this._store.let(fromRoot.getControlsNotes).takeUntil(this._destructor$).subscribe((notes) => {
      if (!isNullOrUndefined(notes)) {
        this._notes = notes;
        if (!isNullOrUndefined(this._notesForm)) {
          this._notesText = notes.Text;
        }
      }
      this._initForm();
    })

    this._store.let(fromRoot.getCurrentRiskAssessmentControls).takeUntil(this._destructor$).subscribe((controls) => {
      if (!isNullOrUndefined(controls)) {
        if (!this.isMigrated) {
          this._controls = new Map<string, RiskAssessmentControl[]>();
          controls.forEach((control) => {
            let hazardId = control.RiskAssessmentHazardId;
            if (this._controls.has(hazardId)) {
              this._controls.get(hazardId).push(control);
            } else {
              this._controls.set(hazardId, [control]);
            }
          });

        } else {
          this._selectedControls = controls;
          if (this._refreshTab) {
            this.refreshStep.emit({ stepType: 'controls', data: this._currentTab });
            this._refreshTab = false;
          }
        }
        this._cdRef.markForCheck();
      }
    });

    this._store.let(fromRoot.getFrequentlyUsedControls).takeUntil(this._destructor$).subscribe((frequentlyUsedControls) => {
      if (!isNullOrUndefined(frequentlyUsedControls)) {
        this._frequentlyUsedControls = frequentlyUsedControls.sort((a, b) => { return a.Name > b.Name ? 1 : -1 });
      } else {
        if (!isNullOrUndefined(this._currentRiskAssessment)) {
          let params = {
            companyId: this._currentRiskAssessment.CompanyId,
            isExample: this._currentRiskAssessment.IsExample
          }
          this._store.dispatch(new LoadFrequentlyUsedControls(params));
        }
      }
    });

    this._store.let(fromRoot.getSuggestedControls).takeUntil(this._destructor$).subscribe((suggestedControls) => {
      if (!isNullOrUndefined(suggestedControls)) {
        this._suggestedControls = suggestedControls.sort((a, b) => { return a.Name > b.Name ? 1 : -1 });
        this._cdRef.markForCheck();
      }
    });

    this._activatedRoutesSubscription = this._activatedRoute.params.subscribe((params) => {
      this._isExampleRA = params['example'] === "example" ? true : false;
    });

    this._stepSubscription = this._context.submitEvent.subscribe((val) => {
      if (val) {
        if (this._printControlDescriptionChanged) {
          this._riskAssessmentService.updateRiskAssessmentPrintDescriptionStatus(this._currentRiskAssessment, this._isExampleRA);
        }
      }
    });

    this._context.submitEvent.takeUntil(this._destructor$).subscribe((val) => {
      if (val) {
        if (this._notesForm.dirty) {
          if (this._notes.Id) {
            this._notes.Text = this._notesForm.get('notesText').value;
            this._riskAssessmentService.updateRiskAssessmentControlsCategoryText(this._notes);
          } else {
            let params = {
              Category: ControlsCategory['COSHH Control'],
              CreatedBy: this._claimsHelper.getUserId(),
              RiskAssessmentId: this._currentRiskAssessment.Id,
              'Text': this._notesForm.get('notesText').value
            }
            this._riskAssessmentService.createRiskAssessmentControlsCategoryText(params);
          }
        }
      }
    });
    this._initForm();
  }

  ngOnDestroy() {
    if (this._stepSubscription) {
      this._stepSubscription.unsubscribe();
    }
    if (this._activatedRoutesSubscription) {
      this._activatedRoutesSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }
  // End of public methods  

}
