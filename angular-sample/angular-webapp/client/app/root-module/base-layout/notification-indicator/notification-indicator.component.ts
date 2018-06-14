import { AbsenceStatus } from './../../../shared/models/lookup.models';
import { AbsenceStatusLoadAction } from './../../../shared/actions/lookup.actions';
import { getAeListItemsFromAtlasNotifications, getUnReadNotificationIds } from '../../common/extract-helpers';
import { AtlasNotification, NotificationMarkAsReadPayLoad, NotificationCategory } from '../../models/notification';
import { AeListItem } from './../../../atlas-elements/common/models/ae-list-item';
import { LoadNotificationUnReadCountAction, NotificationsMarkAsReadAction } from './../../actions/notification-actions';
import { Observable, Subscription } from 'rxjs/Rx';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, Input, ChangeDetectionStrategy, OnChanges, OnDestroy, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { Router, NavigationExtras } from '@angular/router';
import { LoadEmployeeEvent } from "./../../../employee/actions/employee.actions";
import { StringHelper } from "./../../../shared/helpers/string-helper";
import { isNullOrUndefined } from "util";

@Component({
  selector: 'notification-indicator',
  templateUrl: './notification-indicator.component.html',
  styleUrls: ['./notification-indicator.component.css'],
  //changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NotificationIndicatorComponent extends BaseComponent implements OnInit, OnChanges, OnDestroy {
  showSlider: boolean;
  // Private Fields

  private _noOfUnReadNotifications: number;
  private _initialNotificationItems: AtlasNotification[];
  private _notificationListtems: Immutable.List<AeListItem>;
  private _hasUnReadNotificationsLoaded: boolean;
  private _employeeEventSubscription$: Subscription;
  private _absenceStatusSubscription$: Subscription;
  private _absenceStatus: AbsenceStatus[];
  // End of Private Fields

  // Public properties
  // End of Public properties

  // Public Output bindings

  @Input('initialNotifications')
  get initialNotificationItems(): AtlasNotification[] {
    return this._initialNotificationItems;
  }
  set initialNotificationItems(value: AtlasNotification[]) {
    this._initialNotificationItems = value;
  }

  @Input('closeNotification')
  get closeNotification(): boolean {
    return this.showSlider;
  }
  set closeNotification(value: boolean) {
    this.showSlider = value;
  }
  get NotificationListtems(): Immutable.List<AeListItem> {
    return this._notificationListtems;
  }
  set NotificationListtems(value: Immutable.List<AeListItem>) {
    this._notificationListtems = value;
  }

  @Input('pendingNotificationsCount')
  get noOfUnReadNotifications(): number {
    return this._noOfUnReadNotifications;
  }
  set noOfUnReadNotifications(value: number) {
    this._noOfUnReadNotifications = value;
  }

  @Input('hasUnReadNotificationsLoaded')
  get HasUnReadNotificationsLoaded(): boolean {
    return this._hasUnReadNotificationsLoaded;
  }
  set HasUnReadNotificationsLoaded(value: boolean) {
    this._hasUnReadNotificationsLoaded = value;
  }

  @Output('onNotificationClick') notifyOnNotificationClick: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, protected _cdRef: ChangeDetectorRef, private _claimsHelper: ClaimsHelperService, private _store: Store<fromRoot.State>, private _router: Router) {
    super(_localeService, _translationService, _cdRef);
    this.id='notificationIcon';
    this.name='notificationIcon';
  }
  // End of constructor

  // Private methods
  requireNotification(): boolean {
    return this._noOfUnReadNotifications && this._noOfUnReadNotifications > 0;
  }
  private _needToShowCount(): boolean {
    return this._hasUnReadNotificationsLoaded;
  }
  getPendingCountAsString(): string {
    if (this._needToShowCount && this.requireNotification) {
      return this._noOfUnReadNotifications < 100 ? this._noOfUnReadNotifications.toString() : "99+";
    }
  }

  onNotificationClick($evt) {
    this.showSlider = !this.showSlider;
    //here we need to emit the unread items that are binded here , with all update as true for now
    let markAsReadPayLoad = new NotificationMarkAsReadPayLoad();
    markAsReadPayLoad.NotificationIds = getUnReadNotificationIds(this.initialNotificationItems);
    markAsReadPayLoad.MarkAllAsRead = true;
    let $event: any = {};
    $event.event = $evt;
    $event.payLoad = markAsReadPayLoad;
    //only despatch mark as read if at least the count > 0
    if (this._noOfUnReadNotifications > 0)
      this._store.dispatch(new NotificationsMarkAsReadAction(markAsReadPayLoad));


    this.notifyOnNotificationClick.emit(this.showSlider);
  }
  // End of private methods


  sliderValue: number = 0;
  onSliderChange(event) {
    this.sliderValue = event.value;
  }
  sliderClosed(event: any) {
    this.showSlider = false;
  }

  // Public methods
  onNotificationItemClick($event) {
    //here based on clicked item we need to redirect to various pages
    let category: NotificationCategory = isNullOrUndefined($event.selectedItem.Category) ? NotificationCategory.Undefined : <NotificationCategory>$event.selectedItem.Category;
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    }
    let navigateUrl: string;
    if (category == NotificationCategory.OutOfOffice) {
      navigateUrl = ' ';
      $event.event.stopPropagation();
      return;
    }
    else if ($event.selectedItem.RegardingObjectOtcType == "3723") {
      let holidayPage = $event.selectedItem.Title.indexOf('Holiday') > -1 ? true : false;
      navigateUrl = "/absence-management/" + (holidayPage ? "holiday/all" : "absence");
    }
    else if ($event.selectedItem.RegardingObjectOtcType == "270") {
      this._store.dispatch(new LoadEmployeeEvent($event.selectedItem.RegardingObjectId));
      this.showSlider = false;
    }
    else if ($event.selectedItem.RegardingObjectOtcType == "52") {
      navigateUrl = "/document/shared/distributed";
    }
    else if ($event.selectedItem.RegardingObjectOtcType == "4095") {
      navigateUrl = "/training";
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(navigateUrl)) {
      this._router.navigate([navigateUrl], navigationExtras);
      this.showSlider = false;
    }
    window.scrollTo(0, 0);
  }



  ngOnInit(): void {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    //We might need to despatch the same event whenever user has opened the notification side out and sliding down to read the notifications
    //but we are not despatching this action again here since its not necessary to show real time data for NOW, but we can despatch this timed events from background if needed
    this._absenceStatusSubscription$ = this._store.let(fromRoot.getAbsenceStatusData).subscribe((absenceStatuses) => {
      if (!isNullOrUndefined(absenceStatuses)) {
        this._absenceStatus = absenceStatuses;
        this._notificationListtems = getAeListItemsFromAtlasNotifications(this.initialNotificationItems, absenceStatuses);
      } else {
        this._store.dispatch(new AbsenceStatusLoadAction(true));
      }
    });


    this._employeeEventSubscription$ = this._store.let(fromRoot.getSelectedEmployeeEvent).subscribe((event) => {
      if (!isNullOrUndefined(event)) {
        this._router.navigate(["/employee/edit/" + event.EmployeeId + "/timeline"], navigationExtras);
      }
    });

  }

  ngOnChanges(): void {
    this._notificationListtems = getAeListItemsFromAtlasNotifications(this.initialNotificationItems, this._absenceStatus);
  }

  ngOnDestroy() {
    if (this._absenceStatusSubscription$) {
      this._absenceStatusSubscription$.unsubscribe();
    }
    if (this._employeeEventSubscription$) {
      this._employeeEventSubscription$.unsubscribe();
    }
  }
  // End of public methods
}