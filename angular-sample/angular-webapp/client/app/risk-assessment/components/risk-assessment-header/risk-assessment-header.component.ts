import { RouteParams } from '../../../shared/services/route-params';
import { Subject } from 'rxjs/Rx';
import { AeSplitButtonOption } from '../../../atlas-elements/common/models/ae-split-button-options';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { RiskAssessmentSecurityService } from '../../services/risk-assessment-security.service';
import { isNull, isNullOrUndefined } from 'util';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { Router, NavigationExtras } from '@angular/router';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import * as fromRoot from '../../../shared/reducers';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Store } from "@ngrx/store";

@Component({
  selector: 'risk-assessment-header',
  templateUrl: './risk-assessment-header.component.html',
  styleUrls: ['./risk-assessment-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentHeaderComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _informationBarItems: AeInformationBarItem[];
  private _showButtons: boolean;
  private _riskAssessmentComponentItemClick: EventEmitter<AeInformationBarItem>;
  private _raTitle: string = 'Risk assessments';
  private _riskAssessmentName: string = "Risk Assessment";
  // End of Private Fields

  // Public properties
  @Input('informationBarItems')
  set InformationBarItems(informationBarItems: AeInformationBarItem[]) {
    this._informationBarItems = informationBarItems;
  }
  get InformationBarItems() {
    return this._informationBarItems;
  }
 

  @Input('showButtons')
  get showButtons() {
    return isNullOrUndefined(this._showButtons) ? true : this._showButtons;
  }
  set showButtons(value: boolean) {
    this._showButtons = value;
  }
  @Input('riskAssessmentName')
  get riskAssessmentName() {
    return this._riskAssessmentName;
  }
  set riskAssessmentName(val: string) {
    this._riskAssessmentName = val;
  }
  @Output('riskAssessmentComponentItemClick')
  get riskAssessmentComponentItemClick(): EventEmitter<AeInformationBarItem> {
    return this._riskAssessmentComponentItemClick;
  }

  set riskAssessmentComponentItemClick(item: EventEmitter<AeInformationBarItem>) {
    this._riskAssessmentComponentItemClick = item;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.RiskAssessments;
  }

  get RATitle(){
    return this._raTitle;
  }
  // End of Public properties

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _router: Router
    , private _routeParams: RouteParams
    , private _riskAssessmentSecurityService: RiskAssessmentSecurityService
    , private _breadcrumbService: BreadcrumbService
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _cdRef);
    this._riskAssessmentComponentItemClick = new EventEmitter<AeInformationBarItem>();

  }

  navigateToAdd() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(["/risk-assessment/add"], navigationExtras);
  }

  navigateToAddExample() {
    this._router.navigate(["/risk-assessment/add/example"]);
  }

  ngOnInit() {
    this._store.let(fromRoot.getRiskAssessmentName).takeUntil(this._destructor$).subscribe((val) => {
      if (!isNullOrUndefined(val)) {
        this._raTitle = val;
      }
    });
  }

  ngOnDestroy() {

  }

  informationItemSelected(aeInformationBarItem: AeInformationBarItem) {
    this._riskAssessmentComponentItemClick.emit(aeInformationBarItem);
  }

  public canCreateExampleRiskAssessments(): boolean {
    return this._riskAssessmentSecurityService.canCreateExampleRiskAssessments();
  }
  public canCreateRiskAssessments(): boolean {
    return this._riskAssessmentSecurityService.canCreateRiskAssessments();
  }
  public isCompanyLevelCid(): boolean {
    return !isNullOrUndefined(this._routeParams.Cid);
  }

}
