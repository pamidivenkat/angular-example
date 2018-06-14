import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { isNullOrUndefined } from 'util';
import { ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { Subscription } from "rxjs/Subscription";
import { LocaleService, TranslationService } from "angular-l10n";

/**
 * Atlas Greeting Component that represents a banner with greeting text and today text. 
 * 
 * @export
 * @class GreetingComponent
 */
@Component({
  selector: 'greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GreetingComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _backgroundImage: string;
  private _greetingText: string;
  private _todayText: string;
  private _todayDay: string;
  private _todayDate: number;
  private _todayMonth: string;
  private _userFirstName: string;
  private _employeeDOB: any;
  private _timer: Observable<number>;
  private _sub: Subscription;
  // End of Private Fields

  get todayMonth(): string {
    return this._todayMonth;
  }
  
  get todayDate(): number {
    return this._todayDate;
  }
  get todayText(): string {
    return this._todayText;
  }

  get todayDay(): string {
    return this._todayDay;
  }

  get greetingText(): string {
    return this._greetingText;
  }

  get userFirstName(): string {
    return this._userFirstName;
  }
  // Public properties
  /**
    * Holds background image url for the greeting banner.
    * 
    * get/setter property
    * 
    * @memberOf GreetingComponent
    */
  @Input('backgroundImage')
  get backgroundImage() {
    return this._backgroundImage;
  }
  set backgroundImage(val: string) {
    this._backgroundImage = val;
  }


  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, protected _cdRef: ChangeDetectorRef, private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this._userFirstName = _claimsHelper.getUserFirstName();
    this._employeeDOB = _claimsHelper.getEmpDOB();
    this.id = 'Greeting';
    this.name = 'Greeting';
    if (isNullOrUndefined(this._userFirstName)) {
      this._userFirstName = '';
    }
  }
  // End of constructor

  // Private methods
  /**
  * Used to return the background image url, for the greeting banner.
  * 
  * method
  * 
  * @memberOf GreetingComponent
  */
  getBackgroundImageUrl(): string {
    return "url(" + this._backgroundImage + ")";
  }
  /**
    * Used to return the todate date icon size - small.
    * 
    * method
    * 
    * @memberOf GreetingComponent
    */
  getTodayIconSize(): AeIconSize {
    return AeIconSize.small;
  }
  /**
  * Used to return greeting text, for the greeting component.
  * 
  * method
  * 
  * @memberOf GreetingComponent
  */
  private _getGreetingText(): string {
    let isHappyBirthDay: boolean = false;
    var curDt = new Date();
    if (!isNullOrUndefined(this._employeeDOB)) {
      var dob = new Date(this._employeeDOB);
      
      isHappyBirthDay = (curDt.getMonth() == dob.getMonth() && curDt.getDate() == dob.getDate());
    }
    if (isHappyBirthDay) {
      this._greetingText = "GREETING.HAPPY BIRTHDAY";
    }
    else {
      if (curDt.getHours() >= 0 && curDt.getHours() < 12) {
        this._greetingText = "GREETING.GOOD MORNING";
      }
      else if (curDt.getHours() >= 12 && curDt.getHours() < 17) {
        this._greetingText = "GREETING.GOOD AFTERNOON";
      }
      else {
        this._greetingText = "GREETING.GOOD EVENING";
      }
    }
    return this._greetingText;
  }
  /**
   * Used to prepare today details, for the greeting component.
   * 
   * method
   * 
   * @memberOf GreetingComponent
   */
  private _getTodayDetails() {
    var days = ['DAYOFWEEK.SUNDAY', 'DAYOFWEEK.MONDAY', 'DAYOFWEEK.TUESDAY', 'DAYOFWEEK.WEDNESDAY', 'DAYOFWEEK.THURSDAY', 'DAYOFWEEK.FRIDAY',
      'DAYOFWEEK.SATURDAY'];
    var months = ['MONTH.JANUARY', 'MONTH.FEBRUARY', 'MONTH.MARCH', 'MONTH.APRIL', 'MONTH.MAY', 'MONTH.JUNE', 'MONTH.JULY',
      'MONTH.AUGUST', 'MONTH.SEPTEMBER', 'MONTH.OCTOBER', 'MONTH.NOVEMBER', 'MONTH.DECEMBER'];
    var curDt = new Date();
    this._todayDay = days[curDt.getDay()];
    this._todayMonth = months[curDt.getMonth()];
    this._todayDate = curDt.getDate();
  }
  // End of private methods

  // Public methods
  ngOnInit(): void {
    //timer is set for 2 minutes instead of 1 sec which is not needed
    this._timer = Observable.timer(50, 120000);
    this._sub = this._timer.subscribe(t => {
      let latestGreeting = this._getGreetingText();
      this._getTodayDetails();

      this._cdRef.markForCheck();
    });
  }
  ngOnDestroy(): void {
    this._sub.unsubscribe();
  }
  // End of public methods
}