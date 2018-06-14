import {
  Component
  , OnInit
  , Output
  , EventEmitter
  , ChangeDetectorRef
  , ChangeDetectionStrategy
  , ViewEncapsulation
} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { AeLabelStyle } from '../../../atlas-elements/common/ae-label-style.enum';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { Orientation } from '../../../atlas-elements/common/orientation.enum';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'incident-log-header',
  templateUrl: './incident-log-header.component.html',
  styleUrls: ['./incident-log-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IncidentLogHeaderComponent extends BaseComponent implements OnInit {

  private _statesLoaded: any;
  private _incidentLogStatsSubscription: Subscription;

  public get lightClassStyle() {
    return AeLabelStyle.Medium;
  }

  public get orientationStyle() {
    return Orientation.Horizontal;
  }

   public get statesLoaded() {
    return this._statesLoaded;
  }

  @Output()
  addIncident: EventEmitter<string> = new EventEmitter<string>();

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.IncidentLog;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  public addIncidentLog() {
    this.addIncident.emit('add');
  }

  public showLogIncident():boolean{
    return this._claimsHelper.canManageIncidents() || this._claimsHelper.canLogIncident();
  }
  
  ngOnInit() {
     this._incidentLogStatsSubscription = this._store.let(fromRoot.getIncidentLogStatsData).subscribe((stats) => {
      if (stats.length == 0) {
        this._statesLoaded = 'INCIDENT_LOG.INCIDENT_LOG_INFO_EMPLOYEE';
      } else {
        this._statesLoaded = 'INCIDENT_LOG.INCIDENT_LOG_INFO';
      }
      this._cdRef.markForCheck();
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._incidentLogStatsSubscription)) {
      this._incidentLogStatsSubscription.unsubscribe();
    }
  }

}
