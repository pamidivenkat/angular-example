import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AeBannerTheme } from '../../../atlas-elements/common/ae-banner-theme.enum';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'construction-phase-plans-header',
  templateUrl: './construction-phase-plans-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConstructionPhasePlansHeaderComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _addConstructionPhasePlanText: string;
  // End of Private Fields

  // Public properties
  aeBannerTheme = AeBannerTheme.Default;
  // End of Public properties

  // Public Output bindings
  @Output('onConstructionPhasePlanAdd') _onConstructionPhasePlanAdd: EventEmitter<string>;
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _router: Router) {
    super(_localeService, _translationService, _cdRef);
    this._onConstructionPhasePlanAdd = new EventEmitter<string>();
  }
  // End of constructor
  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.CPP;
  }
  // Private methods

  // End of private methods

  // Public methods
  public addConstructionPhasePlans() {
    this._onConstructionPhasePlanAdd.emit('add');
  }

  ngOnInit() {
    this._addConstructionPhasePlanText = "";
  }
  // End of public methods



}
