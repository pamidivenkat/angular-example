import { IconType } from '../../models/icon-type.enum';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeSplitButtonOption } from '../../../../atlas-elements/common/models/ae-split-button-options';
import { Subject, Subscription } from 'rxjs/Rx';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'icon-management-header',
  templateUrl: './icon-management-header.component.html',
  styleUrls: ['./icon-management-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconManagementHeaderComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _addHazardCommand = new Subject<boolean>();
  private _addControlCommand = new Subject<boolean>();
  private _splitButtonOptions: any[] = [
    new AeSplitButtonOption<boolean>('Add Hazard', this._addHazardCommand, false),
    new AeSplitButtonOption<boolean>('Add Control', this._addControlCommand, false),
  ];
  private _addHazardSubscription: Subscription;
  private _addControlSubscription: Subscription;
  private _iconName: string = 'icon-info';
  // End of Private Fields
  // Public properties
  get splitButtonOptions(): any[] {
    return this._splitButtonOptions;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.IconManagement;
  }
  // End of Public properties

  // Public Output bindings
  @Output('onAddIcon')
  onAddIcon: EventEmitter<{ type: IconType, action: string }> = new EventEmitter<{ type: IconType, action: string }>();


  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  ngOnInit() {
    this._addHazardSubscription = this._addHazardCommand.subscribe(() => {
      this.onAddIcon.emit({ type: IconType.Hazard, action: 'Add' });
    });

    this._addControlSubscription = this._addControlCommand.subscribe(() => {
      this.onAddIcon.emit({ type: IconType.Control, action: 'Add' });
    });
  }

  ngOnDestroy() {
    this._addHazardSubscription.unsubscribe();
    this._addControlSubscription.unsubscribe();
  }

  // Private methods
  // End of private methods

  // Public methods
  public onSplitBtnClick(event: any) {
  }

  public getIconSvgUrl(): string {
    return this.getAbsoluteUrl(this._iconName);
  }
  // End of public methods



}
