import { isNullOrUndefined } from 'util';
import { IncidentPreviewVM } from '../../incident/models/incident-preview.model';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { IncidentType, InjuryType, InjuredPart } from '../../../shared/models/lookup.models';
import { isObject } from "rxjs/util/isObject";

@Component({
  selector: 'incident-log-view',
  templateUrl: './incident-log-view.component.html',
  styleUrls: ['./incident-log-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentLogViewComponent extends BaseComponent implements OnInit {
  private _viewDetails: IncidentPreviewVM;
  private _injuryTypeData: InjuryType[];

  @Input('viewDetails')
  get incident(): IncidentPreviewVM {
    return this._viewDetails;
  }
  set incident(value: IncidentPreviewVM) {
    this._viewDetails = value;
  }

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  ngOnInit() {
  }

  public onIncidentViewFormClosed(e) {
    this._slideOutClose.emit(false);
  }
  getCountyName(CountyData: any) {
    if (!isNullOrUndefined(CountyData) && isObject(CountyData)) {
      return CountyData.Name;
    }
    else {
      return "";
    }
  }

}
