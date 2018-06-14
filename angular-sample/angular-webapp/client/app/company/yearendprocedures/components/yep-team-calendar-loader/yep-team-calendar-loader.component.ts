import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';

@Component({
  selector: 'yep-team-calendar-loader',
  templateUrl: './yep-team-calendar-loader.component.html',
  styleUrls: ['./yep-team-calendar-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YepTeamCalendarLoaderComponent extends BaseComponent implements OnInit, OnDestroy {
  // private fields start
  private _isLoaded$: BehaviorSubject<boolean>;
  private _isLoaded: boolean = false;
  private _loadSubscription: Subscription;
  // end of private fields

  // Input bindings start
  @Input('isLoaded')
  set isLoaded(val: BehaviorSubject<boolean>) {
    this._isLoaded$ = val;
  }
  get isLoaded() {
    return this._isLoaded$;
  }
  
  // end of input bindings

  // constructor start
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , private _router: Router
    , private _route: ActivatedRoute) {
    super(_localeService, _translationService, _changeDetector);
  }
  // end of constructor

  // private methods starts
  private _loadCalendar(): void {
    this._router.navigate([('teamcalendar')], { relativeTo: this._route, skipLocationChange: true });
  }
  // end of private methods

  // public methods start
  ngOnInit() {
    this._loadSubscription = this._isLoaded$
      .subscribe(x => {
        this._isLoaded = x;
        if (this._isLoaded) {
          this._loadCalendar();
        }
      });
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._loadSubscription)) {
      this._loadSubscription.unsubscribe();
    }
  }
  // end of public methods
}
