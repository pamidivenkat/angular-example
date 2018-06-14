import { AddIconAction, UpdateIconAction } from '../../actions/icon-add-update.actions';
import { Store } from '@ngrx/store';
import { Icon } from '../../models/icon';
import { IconType } from '../../models/icon-type.enum';
import { IconManagementConstants } from '../../icon-management-constants';
import { TabSelection } from '../../../../atlas-elements/common/Models/ae-tab-model';
import { Subject, Subscription } from 'rxjs/Rx';
import { AeSplitButtonOption } from '../../../../atlas-elements/common/models/ae-split-button-options';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import * as fromRoot from '../../../../shared/reducers/index';
@Component({
  selector: 'icon-management-container',
  templateUrl: './icon-management-container.component.html',
  styleUrls: ['./icon-management-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconManagementContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _hazardUrl: string = IconManagementConstants.Routes.Hazards;
  private _controlUrl: string = IconManagementConstants.Routes.Controls;
  private _showIconAddUpdateSlideOut: boolean;
  private _iconType: IconType;
  private _iconAction: string;
  // End of Private Fields

  // Public properties
  get iconType() {
    return this._iconType;
  }

  get iconAction() {
    return this._iconAction;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this.id = 'icon-management';
    this.name = 'icon-management';
  }
  // End of constructor

  ngOnInit() {

  }

  ngOnDestroy() {

  }

  // Private methods
  // End of private methods

  // Public methods

  getHazardsUrl(): string {
    return this._hazardUrl;
  }

  getControlsUrl(): string {
    return this._controlUrl;
  }
  showIconAddUpdateSlideOut(): boolean {
    return this._showIconAddUpdateSlideOut;
  }
  onAddIconClick(event: { type: IconType, action: string }) {
    this._showIconAddUpdateSlideOut = false;
    this._iconAction = event.action;
    this._iconType = event.type;
    this._showIconAddUpdateSlideOut = true;
  }
  addUpdateIconSubmit(icon: Icon) {
    this._showIconAddUpdateSlideOut = false;
    if (this._iconAction == 'Add') {
      this._store.dispatch(new AddIconAction({ icon: icon, type: this._iconType }));
    }
    else {
      this._store.dispatch(new UpdateIconAction({ icon: icon, type: this._iconType }));
    }
  }
  cancelAddUpdateIcon() {
    this._showIconAddUpdateSlideOut = false;
  }
  getIconUpdateSlideOutState(): string {
    return this._showIconAddUpdateSlideOut ? 'expanded' : 'collapsed';
  }
  // End of public methods
}
