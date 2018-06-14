import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'app-employeeSummary',
  templateUrl: './employee-summary.component.html',
  styleUrls: ['./employee-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeSummaryComponent extends BaseComponent implements OnInit {
  // constructor starts
  constructor(private _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService, _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _changeDetector);
  }
  // constructor ends

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Employees;
  }
}
