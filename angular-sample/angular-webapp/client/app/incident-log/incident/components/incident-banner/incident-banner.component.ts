import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { AeBannerTheme } from '../../../../atlas-elements/common/ae-banner-theme.enum';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
  selector: 'incident-banner',
  templateUrl: './incident-banner.component.html',
  styleUrls: ['./incident-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentBannerComponent extends BaseComponent implements OnInit, OnDestroy {
  aeBannerTheme = AeBannerTheme.Default;
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef) {
    super(_localeService, _translationService, _cdRef);
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.IncidentLog;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
