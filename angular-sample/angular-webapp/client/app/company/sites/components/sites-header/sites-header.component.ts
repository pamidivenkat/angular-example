import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AeBannerTheme } from '../../../../atlas-elements/common/ae-banner-theme.enum';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
  selector: 'sites-header',
  templateUrl: './sites-header.component.html',
  styleUrls: ['./sites-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SitesHeaderComponent extends BaseComponent implements OnInit {
  aeBannerTheme = AeBannerTheme.Default;
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    let bcItem = new IBreadcrumb('Sites', '/company/site', BreadcrumbGroup.Company);
    _breadcrumbService.add(bcItem);
  }

  get bcGroup(): BreadcrumbGroup {
      return BreadcrumbGroup.Company;
  }
  ngOnInit() {
  }

}
