import { TeamCalendarLoadType } from '../../model/calendar-filter.model';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers/index';
import { SetTeamCalendarAction } from "../../../calendar/actions/calendar.actions";
@Component({
  selector: 'team-calendar',
  templateUrl: './team-calendar.component.html',
  styleUrls: ['./team-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TeamCalendarComponent extends BaseComponent implements OnInit {
  private _showSlider: boolean = false;
  lightClass: AeClassStyle = AeClassStyle.Light;
  private _loadType: TeamCalendarLoadType = TeamCalendarLoadType.ChildComponent;

  get loadType(): TeamCalendarLoadType {
    return this._loadType;
  }
  get showSlider() {
    return this._showSlider;
  }
  set showSlider(val: boolean) {
    this._showSlider = val;
  }

  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, _changeDetector: ChangeDetectorRef, private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _changeDetector)
  }

  ngOnInit() {
    this._store.dispatch(new SetTeamCalendarAction(true));
  }

  sliderClosed(e) {
    this._showSlider = false;
  }
}
