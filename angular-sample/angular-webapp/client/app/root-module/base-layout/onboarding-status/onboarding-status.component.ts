import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Onboarding } from '../../models/onboarding';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { LoadOnBoardingStepsAction } from '../../actions/onboarding.actions';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectorRef, ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';
import * as fromConstants from '../../../shared/app.constants';

@Component({
  selector: 'onboarding-status',
  templateUrl: './onboarding-status.component.html',
  styleUrls: ['./onboarding-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class OnboardingStatusComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _percentCompleted: number;
  private _onBoarding: boolean;
  private _steps: Immutable.List<Onboarding>;
  private _iconSize: AeIconSize = AeIconSize.small;
  private _stepsSubscription: Subscription;
  // End of Private Fields

  // Public properties

  
  getSlideoutState(): string {
    return this._onBoarding ? 'expanded' : 'collapsed';
  }

  showSlider(): boolean {
    return this._onBoarding;
  }

  
  onClick() {
    this._onBoarding = !this._onBoarding;
  }

  goToWizard() {
    window.open(fromConstants.wizardURL, '_self');
  }

  canShowOnBoaring(): boolean {
    return this._percentCompleted !== 100;
  }

  get iconSize(): AeIconSize{
    return this._iconSize;
  }

  get percentCompleted(): number{
    return this._percentCompleted;
  }

  get steps(): Immutable.List<Onboarding>{
    return this._steps;
  }

  updateSlideoutStatus() {
    this._onBoarding = false;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(_localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._percentCompleted = 0;
    this._onBoarding = false;
  }
  // End of constructor

  // Private methods

  private _onCancel() {
    this._onBoarding = false;
  }

  // End of private methods

  // Public methods
  ngOnInit() {
    this._store.dispatch(new LoadOnBoardingStepsAction(false));

    this._stepsSubscription = this._store.let(fromRoot.getOnBoardingSteps).subscribe((steps) => {
      if (!isNullOrUndefined(steps) && steps.length > 0) {
        this._steps = Immutable.List(steps);
        let stepsCompleted = steps.filter((step) => {
          return step.Status === true;
        }).length;
        this._percentCompleted = Math.round((stepsCompleted / steps.length) * 100);
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDistroy() {
    this._stepsSubscription.unsubscribe();
  }
}
// End of public methods