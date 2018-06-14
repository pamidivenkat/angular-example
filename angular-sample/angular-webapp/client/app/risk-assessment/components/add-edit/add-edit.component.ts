import { FormGroup } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { AeWizardComponent } from '../../../atlas-elements/ae-wizard/ae-wizard.component';
import { AeWizardStep } from '../../../atlas-elements/common/models/ae-wizard-step';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers';
import { RouteParams } from '../../../shared/services/route-params';
import { getRiskAssessmentWizardSteps } from '../../common/extract-helper';
import { HazardCategory } from '../../common/hazard-category-enum';
import { WhoIsAffected } from '../../common/who-is-effected-enum';
import { RiskAssessment } from '../../models/risk-assessment';
import { RAAdditionalControl } from '../../models/risk-assessment-additionalcontrols';
import { RiskAssessmentHazard } from '../../models/risk-assessment-hazard';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { RiskAssessmentStatus } from '../../common/risk-assessment-status.enum';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';


@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditComponent extends BaseComponent implements OnInit, OnDestroy {
  private _riskAssessmentSteps$: BehaviorSubject<Immutable.List<AeWizardStep>>;
  private _showComplete: boolean = false;
  private _isExample: boolean = false;
  private _affectedPeoplesList: Array<any>;
  private _riskAssessmentName: string = "Add risk assessment";
  private _riskAssessmentId: string;
  private _roesApiRequestParams: Array<AtlasParams>;
  private _routesExposureList: Immutable.List<RiskAssessmentHazard>;
  private _allFurtherControlsList: Map<string, Array<RAAdditionalControl>>;
  private _currentRiskAssessment: RiskAssessment;
  private _refreshEventData: any;
  private _currentRiskAssessmentTypeId: string;
  private _previousGeneralFormGroup: FormGroup;

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _activatedRoute: ActivatedRoute
    , private _riskAssessmentService: RiskAssessmentService
    , private _store: Store<fromRoot.State>
    , private _breadcrumbService: BreadcrumbService
    , private _claims: ClaimsHelperService
    , private _routeParams: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    // const bcItem: IBreadcrumb = { label: 'Risk assessments', url: '/risk-assessment' };
    // this._breadcrumbService.add(bcItem);
    this._riskAssessmentSteps$ = new BehaviorSubject<Immutable.List<AeWizardStep>>(Immutable.List([]));
    this._currentRiskAssessmentTypeId = fromConstants.generalRiskAssessmentTypeId;
    this.id = 'risk-assessment';
    this.name = 'risk-assessment';
  }
  get previousGeneralFormGroup(): FormGroup {
    return this._previousGeneralFormGroup;
  }
  get riskAssessmentName() {
    return this._riskAssessmentName;
  }
  get riskAssessmentSteps(): BehaviorSubject<Immutable.List<AeWizardStep>> {
    return this._riskAssessmentSteps$;
  }
  get showComplete(): boolean {
    return this._showComplete;
  }
  get isExampleRiskAssessment(): boolean {
    return this._isExample;
  }
  get affectedPeoplesList(): Array<any> {
    return this._affectedPeoplesList;
  }
  get currentRiskAssessment(): RiskAssessment {
    return this._currentRiskAssessment;
  }
  get routesOfExposuresList(): Immutable.List<RiskAssessmentHazard> {
    return this._routesExposureList;
  }
  get allFurtherControlsList(): Map<string, Array<RAAdditionalControl>> {
    return this._allFurtherControlsList;
  }
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.RiskAssessments;
  }
  get refreshEventData(): any {
    return this._refreshEventData;
  }
  get currentRiskAssessmentTypeId(): string {
    return this._currentRiskAssessmentTypeId;
  }

  @ViewChild(AeWizardComponent)
  wizardComponent: AeWizardComponent;

  public refreshWizardStep(event) {
    let step = this._riskAssessmentSteps$.getValue().find((step) => step.templateType == event.stepType);
    if (!isNullOrUndefined(step)) {
      this._refreshEventData = event.data;
      this.wizardComponent.goToStep(step);
    }
  }

  private _initialLoadROEs() {
    if (isNullOrUndefined(this._roesApiRequestParams))
      this._roesApiRequestParams = new Array<AtlasParams>();
    this._roesApiRequestParams.push(new AtlasParams('example', true));
    this._roesApiRequestParams.push(new AtlasParams('searchHazardsFilter', ''));
    this._roesApiRequestParams.push(new AtlasParams('categoryHazardsFilter', HazardCategory.RoutesOfExposure));
    this._riskAssessmentService._loadExampleRoutesOfExposure(this._roesApiRequestParams);
  }
  public onChangeRiskAssessmentType(existingFormGroup: FormGroup) {
    this._previousGeneralFormGroup = existingFormGroup;
  }
  ngOnInit() {
    this._store.let(fromRoot.getRiskAssessmentName).takeUntil(this._destructor$).subscribe((val) => {
      if (!isNullOrUndefined(val)) {
        if (this._riskAssessmentName != "Add risk assessment") {
          const oldBcItem = {
            isGroupRoot: false, group: BreadcrumbGroup.RiskAssessments,
            label: this._riskAssessmentName, url: '/risk-assessment/edit/' + this._riskAssessmentId
          };
          this._breadcrumbService.removeBreadcrumbs(oldBcItem);
        }
        this._riskAssessmentName = val;
        const newBcItem = {
          isGroupRoot: false, group: BreadcrumbGroup.RiskAssessments,
          label: val, url: '/risk-assessment/edit/' + this._riskAssessmentId
        };


        this._breadcrumbService.add(newBcItem);
      }
    });
    this._activatedRoute.params.takeUntil(this._destructor$).subscribe((params) => {
      let riskAssessmentId = params["id"];
      this._isExample = params['example'] === "example" ? true : false;
      if (!isNullOrUndefined(riskAssessmentId)) {
        this._riskAssessmentId = riskAssessmentId;
        this._riskAssessmentService._loadRiskAssessment(riskAssessmentId, this._isExample);
      } else {
        this._riskAssessmentService._loadRiskAssessmentComplete(null);
        const bcItem = {
          isGroupRoot: false, group: BreadcrumbGroup.RiskAssessments,
          label: 'Add', url: '/risk-assessment/add'
        };
        this._breadcrumbService.add(bcItem);
      }
    });

    this._affectedPeoplesList = [
      { Affected: WhoIsAffected.AllStaff, Name: "All Staff" },
      { Affected: WhoIsAffected.Contractors, Name: "Contractors" },
      { Affected: WhoIsAffected.Management, Name: "Management" },
      { Affected: WhoIsAffected.MembersofPublic, Name: "Members of the Public" },
      { Affected: WhoIsAffected.Operators, Name: "Operators" },
      { Affected: WhoIsAffected.Visitors, Name: "visitors" },
      { Affected: WhoIsAffected.StudentPupil, Name: "Student / Pupil" },
      { Affected: WhoIsAffected.Other, Name: "Other(please specify)" }
    ];
    this._store.let(fromRoot.getRiskAssessmentTypeId).takeUntil(this._destructor$).subscribe(val => {
      if (val !== this._currentRiskAssessmentTypeId) {
        this._currentRiskAssessmentTypeId = val || fromConstants.generalRiskAssessmentTypeId;
        this._riskAssessmentSteps$.next(getRiskAssessmentWizardSteps(this._currentRiskAssessmentTypeId, this._isExample));
      }
    });

    this._store.let(fromRoot.getExampleRoutesOfExposureData).takeUntil(this._destructor$).subscribe((val) => {
      if (!isNullOrUndefined(val)) {
        this._routesExposureList = val;
      } else {
        this._initialLoadROEs();
      }
    });

    this._store.let(fromRoot.getAdditionalControlsRiskAssessmentsList).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._allFurtherControlsList = res;
      } else {
        this._riskAssessmentService.loadAdditionalControlTabList();
      }
    });

    this._store.let(fromRoot.getCurrentRiskAssessment).takeUntil(this._destructor$).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._currentRiskAssessment = res;
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
