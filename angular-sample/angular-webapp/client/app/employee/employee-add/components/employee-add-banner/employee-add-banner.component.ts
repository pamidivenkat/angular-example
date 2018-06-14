import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';

@Component({
  selector: 'employee-add-banner',
  templateUrl: './employee-add-banner.component.html',
  styleUrls: ['./employee-add-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeAddBannerComponent extends BaseComponent implements OnInit, OnDestroy {

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Employees;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
