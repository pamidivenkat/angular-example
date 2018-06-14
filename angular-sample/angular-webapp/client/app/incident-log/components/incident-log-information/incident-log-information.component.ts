import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';

import { AeInformationBarItemType } from '../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers';
import { LoadIncidentLogStatsFiltersAction } from '../../actions/incident-log.actions';
import { IncidentStatus } from '../../models/incident-status.enum';

@Component({
  selector: 'incident-log-information',
  templateUrl: './incident-log-information.component.html',
  styleUrls: ['./incident-log-information.component.scss']
})
export class IncidentLogInformationComponent extends BaseComponent implements OnInit, OnDestroy {
  private _incidentLogTiles: AeInformationBarItem[];
  private _incidentLogStatsSubscription: Subscription;
  private _statesLoaded$: Observable<boolean>;

  public get incidentLogTiles() {
    return this._incidentLogTiles;
  }

  public get statesLoaded$() {
    return this._statesLoaded$;
  }

  @Output()
  changeCategory: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  changeStatus: EventEmitter<IncidentStatus> = new EventEmitter<IncidentStatus>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  public onInformationTileClicked($event: AeInformationBarItem) {
    let filterParam = new Map<string, string>();
    if ($event.Type === AeInformationBarItemType.PendingIncidents) {
      // this.changeStatus.emit(IncidentStatus.Pending);
      filterParam.set('IncidentsByStatusFilter', $event.Value);
    } else if ($event.Type === AeInformationBarItemType.NearMisses ||
      $event.Type === AeInformationBarItemType.Injuries ||
      $event.Type === AeInformationBarItemType.Diseases ||
      $event.Type === AeInformationBarItemType.Fatalities ||
      $event.Type === AeInformationBarItemType.Behavioural ||
      $event.Type === AeInformationBarItemType.Dangerous ||
      $event.Type === AeInformationBarItemType.Environmental) {
      // this.changeCategory.emit($event.Value);
      filterParam.set('IncidentsByCategoryIdFilter', $event.Value);
    }
    this._store.dispatch(new LoadIncidentLogStatsFiltersAction(filterParam));
  }

  ngOnInit() {
    this._statesLoaded$ = this._store.let(fromRoot.getIncidentLogStatsLoadStatus);

    this._incidentLogStatsSubscription = this._store.let(fromRoot.getIncidentLogStatsData).subscribe((stats) => {
      this._incidentLogTiles = stats;
      this._cdRef.markForCheck();
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._incidentLogStatsSubscription)) {
      this._incidentLogStatsSubscription.unsubscribe();
    }
  }
}
