import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from './../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'employee-manage-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent extends BaseComponent implements OnInit {

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _router: Router
    , private _breadcrumbService: BreadcrumbService
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _cdRef);
    // const bcItem: IBreadcrumb = { label: 'Employees', url: '/employee' };
    // this._breadcrumbService.add(bcItem);
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Employees;
  }
  public canAddEmployee(): boolean {
    return this._claimsHelper.canAddEmployees();
  }

  ngOnInit() {
  }

  navigateToAddEmployeePage() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    let navigateUrl = "/employee/add";
    this._router.navigate([navigateUrl], navigationExtras);
  }

}
