import { AeTemplateComponent } from '../../atlas-elements/ae-template/ae-template.component';
import { IMessageVM } from '../../shared/models/imessage-vm';
import { isNullOrUndefined } from 'util';
import { PopoverMessageVm } from '../../atlas-elements/common/models/popover-message-vm';
import { createPopOverVm, PopoverVm } from '../../atlas-elements/common/models/popover-vm';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { MessageType } from '../../atlas-elements/common/ae-message.enum';
import { MessageStatus } from '../../atlas-elements/common/models/message-event.enum';
import { SnackbarMessageVM } from '../../shared/models/snackbar-message-vm';
import { SnackbarModel } from '../../atlas-elements/common/models/snackbar-model';
import { MessengerService } from '../../shared/services/messenger.service';
import { NotificationIndicatorComponent } from './notification-indicator/notification-indicator.component';
import { AtlasNotification, NotificationMarkAsReadPayLoad } from './../models/notification';
import { AeListItem } from './../../atlas-elements/common/models/ae-list-item';
import { PagingInfo } from './../../atlas-elements/common/models/ae-paging-info';
import { LoadNotificationItemsAction, LoadNotificationUnReadCountAction, NotificationsMarkAsReadAction } from './../actions/notification-actions';
import { environment } from '../../../environments/environment.prod';
import { AuthorizationService } from '../../shared/security/authorization.service';
import { MenuState } from '../reducers/menu.reducer';
import { Subject, Subscription } from 'rxjs/Rx';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { LoadConsultantsAction } from '../actions/consultant-info.actions';
import { consulantModel } from '../models/consulant-info';
import { Store } from '@ngrx/store';
import { BaseComponent } from '../../shared/base-component';
import { LoadMenuAction } from '../actions/menu.actions';
import { LinkOrigin, Menu } from '../models/menu';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { getAeListItemsFromAtlasNotifications } from '../common/extract-helpers';

import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Renderer,
    ViewChild,
    ViewEncapsulation,
    Output,
    HostListener
} from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as fromConstants from '../../shared/app.constants';
import * as Immutable from 'immutable';
import { ConsultantState } from "../reducers/consultants.reducer";
import { LoadCompanyStructureAction } from "../actions/company-structure.actions";
import { RouteParams } from "../../shared/services/route-params";
@Component({
    selector: 'at-base-layout',
    templateUrl: './base-layout.component.html',
    styleUrls: ['./base-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BaseLayoutComponent extends BaseComponent implements OnInit, OnDestroy, AfterContentInit {
    // Private Fields
    //fields related to notification list
    private _initialFetchCount: number = 999;
    private _totalNotificationsCount: number;
    private _notifications$: Observable<AtlasNotification[]>;
    private _firstTimeDataFetched: boolean = false;
    private _cProps: string[] = ['Title,HasRead,RegardingObjectId,RegardingObjectOtcType']
    private _initialItems: BehaviorSubject<Immutable.List<AtlasNotification>> = new BehaviorSubject<Immutable.List<AtlasNotification>>(null);
    private _notificationItems: AtlasNotification[];
    //fileds related to notification indicator 
    private _noOfUnReadNotifications: number;
    private _noOfUnReadNotifications$: Observable<number>;
    private _snackbarItems: Array<SnackbarModel> = new Array();
    private _popOverVisibilityChange: Subject<PopoverVm<any>>;
    private _popOverVm: PopoverVm<any>;
    private _showSearch: boolean = false;
    private _siteUrl: string;
    private _showNotification: boolean;
    private _showSearchBox: boolean;
    //private _timer: Observable<number>;
    //private _timerSubscription: Subscription;
    /**
    * to know whether user is authorized
    * @private
    * @type {boolean}
    */
    private _isAuthorized: boolean = false;

    /**
     * to hold menu loading status
     * @private
     * @type {boolean}
     * @memberOf BaseLayoutComponent
     */
    private _showOnMenuLoad: boolean = false;

    /**
     * to hold v1 app URL
     * 
     * @private
     * @type {string}
     * @memberOf BaseLayoutComponent
     */
    v1AppUrl: string;

    /**
     * to hold consultant info
     * 
     * @private
     * @type {ConsulantInfo[]}
     * @memberOf BaseLayoutComponent
     */
    private _consultantsInfo: consulantModel[];

    /**
     * to hold advice card number
     * 
     * @private
     * @type {string}
     * @memberOf BaseLayoutComponent
     */
    private _adviceCard: string;

    /**
     * to hold toggling status of menu
     * 
     * @private
     * @type {boolean}
     * @memberOf BaseLayoutComponent
     */
    private _menuToggle: boolean = false;

    /**
     *  to hold menu items stream
     * 
     * @private
     * 
     * @memberOf BaseLayoutComponent
     */
    private _menus = new BehaviorSubject<Menu[]>([]);

    /**
     * to hold level two open/close status
     * 
     * @private
     * @type {boolean}
     * @memberOf BaseLayoutComponent
     */
    private _toggleChild: boolean = false;

    //Snackbar
    snackbarInfo = MessageType.Info;
    snackbarSccuss = MessageType.Success;
    snackbarError = MessageType.Error;
    /**
     *  user identity Subscription
     * @private
     * @type {Subscription}
     * @memberOf BaseLayoutComponent
     */
    private _userIdentitySubscription: Subscription;

    /**
     * menu items subscription
     * @private
     * @type {Subscription}
     * @memberOf BaseLayoutComponent
     */
    private _menuItemsSubscription: Subscription;


    /**
     *  consultant info subscription
     * @private
     * @type {Subscription}
     * @memberOf BaseLayoutComponent
     */
    private _consultantInfoSubscription: Subscription;

    // End of Private Fields

    // Public properties
    /**
     *  property to hold menu items
     * @readonly
     * 
     * @memberOf BaseLayoutComponent
     */
    @Input('menus')
    get menus() {
        return this._menus;
    }
    set menus(menuItems: BehaviorSubject<Menu[]>) {
        this._menus = menuItems;
    }

    get initialItems() {
        return this._initialItems;
    }
    set initialItems(val: BehaviorSubject<Immutable.List<AtlasNotification>>) {
        this._initialItems = val;
    }

    get notificationItems() {
        return this._notificationItems;
    }
    set notificationItems(val: AtlasNotification[]) {
        this._notificationItems = val;
    }

    get noOfUnReadNotifications() {
        return this._noOfUnReadNotifications;
    }
    set noOfUnReadNotifications(val: number) {
        this._noOfUnReadNotifications = val;
    }

    get NoOfUnReadNotifications$() {
        return this._noOfUnReadNotifications$;
    }
    set NoOfUnReadNotifications(val: Observable<number>) {
        this._noOfUnReadNotifications$ = val;
    }

    get Notifications$() {
        return this._notifications$;
    }

    get popOverVisibilityChange(): Subject<PopoverVm<any>> {
        return this._popOverVisibilityChange;
    }

    set Notifications$(val: Observable<AtlasNotification[]>) {
        this._notifications$ = val;
    }

    get snackbarItems(): Array<SnackbarModel> {
        return this._snackbarItems;
    }

    get isAuthorized(): boolean {
        return this._isAuthorized;
    }

    get showOnMenuLoad(): boolean {
        return this._showOnMenuLoad;
    }

    get adviceCard(): string {
        return this._adviceCard;
    }

    get menuToggl(): boolean {
        return this._menuToggle;
    }
    get searchActive(): boolean {
        return this._showSearchBox;
    }

    get toggleChild(): boolean {
        return this._toggleChild;
    }

    get consultantsInfo(): consulantModel[] {
        return this._consultantsInfo;
    }

    get siteUrl(): string {
        return this._siteUrl;
    }
    get showNotification() {
        return this._showNotification;
    }
    get closeSearchBox() {
        return !this._showSearchBox;
    }
    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings
    /**
       * Trigger click event on profile section
       * 
       * @type {EventEmitter<any>}
       * @memberOf ProfileComponent
       */
    @Output()
    aeClick: EventEmitter<any> = new EventEmitter<any>();

    // constructor
    constructor(_localeService: LocaleService
        , _translationService: TranslationService
        , _cdRef: ChangeDetectorRef
        , private _renderer: Renderer
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _authService: AuthorizationService
        , public _router: Router
        , private _messenger: MessengerService
        , private _routeParams: RouteParams
    ) {
        super(_localeService, _translationService, _cdRef);
        this._popOverVisibilityChange = new Subject();
        this._messenger.subscribe('popOver', (message) => {
            this._onPopOverRequested(message);
        });
        this._siteUrl = environment.stsURL;
        this._showNotification = false;
    }
    // End of constructor

    // Private methods

    private canShowHelpline(): boolean {
        return this._claimsHelper.isHSServiceOwnerOrCoordinator() || this._claimsHelper.isHRManagerOrServiceOwner();
    }

    private _maxPageNumber(): number {
        if (this._totalNotificationsCount < this._initialFetchCount) return 1;
        else {
            return Math.ceil(this._totalNotificationsCount / this._initialFetchCount);
        }
    }

    private _fetchNextAvailableChunk($event) {
        //here we should get the next page number clue so that we can raise the api call
        //based on the start and end emiited here we should check whether next page data is available or not this can be verified by _maxPageNumber
        //we need to despatch the  this._store.dispatch(new LoadNotificationItemsAction(new PagingInfo(0, 0, 1, this._initialFetchCount))); with appropriate page number which is the third parameter
    }

    closeSnackbar(snackbarModel: SnackbarModel) {
        this._snackbarItems.forEach((item, index) => {
            if (item.Code === snackbarModel.Code) {
                this._snackbarItems.splice(index, 1);
            }
        });
    }

    showOnboarding(): boolean {
        return this._claimsHelper.canManageCompanyOnBoarding();
    }

    ngOnInit() {
        this._messenger.subscribe('snackbar', (val) => {
            let vm = val.getDataObject<SnackbarMessageVM>();
            this._snackbarItems.forEach((item, index) => {
                if (item.Code === vm.code) {
                    this._snackbarItems.splice(index, 1);
                    return;
                }
            });
            this._snackbarItems.push({
                Message: val.toMessage(), MessageEvent: vm.event,
                MessageStatus: vm.status, MessageType: vm.type, Code: vm.code
            });
            this._cdRef.markForCheck();
        });

        this._userIdentitySubscription = this._store.let(fromRoot.getUserIdentity).takeWhile(()=> !this._isAuthorized).subscribe((identity) => {
            if (!this._isAuthorized)
                this._isAuthorized = this._authService.IsAuthorized();
            if (this._authService.IsAuthorized()) {
                this._store.dispatch(new LoadMenuAction(true));
                if (this.canShowHelpline()) {
                    this._store.dispatch(new LoadConsultantsAction(true));
                }               
                if (this._claimsHelper.canAccessGroupCompanies()) {
                    this._store.dispatch(new LoadCompanyStructureAction(true));
                }
            }
        });

        this._menuItemsSubscription = this._store.let(fromRoot.getMenuData).subscribe((menu: MenuState) => {
            if (menu.status) {
                this.menus.next(menu.entities);
                this._showOnMenuLoad = true;
            }
        });
        this._consultantInfoSubscription = this._store.let(fromRoot.getConsultantInfoData).subscribe((consultantState: ConsultantState) => {
            if (consultantState.status) {
                this._consultantsInfo = consultantState.entities;
                this._adviceCard = this._claimsHelper.getAdviceCardNumber();
            }
        }
        );
        this.v1AppUrl = fromConstants.v1AppUrl;

        //Below are the changes related to notification NotificationIndicatorComponent      
        this._noOfUnReadNotifications$ = this._store.let(fromRoot.getUnReadNotificationsCount);

        //Below is the code which will despatch the load event only for first time in the store.        



        //  below is the code starts with notification list related changes
        this._notifications$ = this._store.let(fromRoot.getNotifications);
        this._router.events.subscribe(val => {
            if (val instanceof NavigationEnd) {
                this.scrollTop();
                this._menuToggle = false;
            }
        });
    }

    scrollTop() {
        window.scrollTo(0, 0);
    }

    onNotificationMarkAsRead($event) {
        let markAsReadPayLoad = <NotificationMarkAsReadPayLoad>$event.payLoad;
        this._store.dispatch(new NotificationsMarkAsReadAction(markAsReadPayLoad));
    }
    ngOnDestroy() {
        this._userIdentitySubscription.unsubscribe();
        this._menuItemsSubscription.unsubscribe();
        if (this._consultantInfoSubscription) {
            this._consultantInfoSubscription.unsubscribe();
        }
        //this._timerSubscription.unsubscribe();
    }


    /**
     * method to toggle status of menu
     * 
     * @memberOf BaseLayoutComponent
     */
    menuToggleClick() {
        this.menuToggle();
        this._showNotification = false;
        this._showSearchBox = false;
    }

    /**
     * On menu load to change the status of burger
     * @param {boolean} menuLoaded 
     * 
     * @memberOf BaseLayoutComponent
     */
    // _onMenuLoad(menuLoaded: boolean) {
    //   this._showOnMenuLoad = menuLoaded;
    // }

    /**
     * toggle level two status 
     * @param {boolean} toggleChild 
     * 
     * @memberOf BaseLayoutComponent
     */
    onToggleChild(toggleChild: boolean) {
        this._toggleChild = toggleChild;
    }


    /**
     * click event on back layer
     * @memberOf BaseLayoutComponent
     */
    _onMaskClick() {
        if (this._menuToggle === true) {
            this.menuToggle();
        }
        if (this._showSearchBox === true) {
            this._showSearchBox = !this._showSearchBox;
        }
    }

    helpNavigation() {
        this._menuToggle = false;
        this._showNotification = false;
        this._router.navigate(['help']);
        var htmlTag = this.getDomElementById('main-container');
        this._removeMaskOnCss(htmlTag);
        this._showSearchBox = false;

    }

    onHelpClick() {
        this.menuToggle();
        this.helpNavigation();
    }

    /**
     * method menu toggle 
     * @private
     * 
     * @memberOf BaseLayoutComponent
     */
    private menuToggle() {
        this._menuToggle = !this._menuToggle;
        var htmlTag = this.getDomElementById('main-container');
        if (!this._menuToggle) {
            this._toggleChild = false;
            this._removeMaskOnCss(htmlTag);
        }
        else {
            this._addMaskOnCss(htmlTag);
        }
    }

    /**
     * Method to get the dom element by tag
     * @private
     * @param {string} tag 
     * @returns {Element} 
     * 
     * @memberOf BaseLayoutComponent
     */
    private getDomElementById(tag: string): Element {
        const htmlTag = document.getElementById(tag);
        return htmlTag;
    }

    /**
     * Method to remove the mask on class
     * @private
     * @param {Element} tag 
     * 
     * @memberOf BaseLayoutComponent
     */
    private _removeMaskOnCss(tag: Element) {
        tag.classList.remove('mask-on');
    }


    /**
     * Method to add the mask on class
     * @private
     * @param {Element} tag 
     * 
     * @memberOf BaseLayoutComponent
     */
    private _addMaskOnCss(tag: Element) {
        tag.classList.add('mask-on');
    }

    /**
     * toggle menu on item click
     * @private
     * 
     * @memberOf BaseLayoutComponent
     */
    toggleMenu() {
        this.menuToggle();
    }

    /**
 * Method to navigate on clicking logo
 * 
 * @private
 * 
 * @memberOf BaseLayoutComponent
 */
    private redirectTo(): void {
        this._router.navigateByUrl("");
        this.toggleMenuAndNotificationProfile()

    }

    private _onPopOverRequested(message: IMessageVM) {
        if (!isNullOrUndefined(message)) {
            this._popOverVm = message.getDataObject()['vm'];
        } else {
            this._popOverVm = null;
        }
        this._popOverVisibilityChange.next(this._popOverVm);
    }

    /**
      * Used to return 'person__dropdown--open' class for profile
      * 
      * method
      * 
      * @memberOf BaseLayoutComponent
      */

    // End of private methods

    // Public methods
    showCompanyName(): boolean {
        return !isNullOrUndefined(this._routeParams.Cid);
    }

    onNotificationClicked(clicked: boolean) {
        var htmlTag = this.getDomElementById('main-container');
        if (clicked) {
            this._addMaskOnCss(htmlTag);
        } else {
            this._removeMaskOnCss(htmlTag);
        }
        this._menuToggle = false;
        this._showSearchBox = false;
    }

    toggleNotification() {
        this._showNotification = !this._showNotification;
        if (!this._showNotification) {
            var htmlTag = this.getDomElementById('main-container');
            this._removeMaskOnCss(htmlTag);
        }
    }
    closeSearch($event) {
        this._showNotification = false;
        this._menuToggle = false;
        var htmlTag = this.getDomElementById('main-container');
        this._removeMaskOnCss(htmlTag);
        this._showSearchBox = !this._showSearchBox;
    }
    toggleMenuAndNotification($event) {
        if (this._showSearchBox) {
            this.closeSearch($event);
        }
    }
    closeMenuAndNotification($event) {
        if (this._showSearchBox) {
            this._showNotification = false;
            this._menuToggle = false;
            var htmlTag = this.getDomElementById('main-container');
            this._removeMaskOnCss(htmlTag);
            this._showSearchBox = !this._showSearchBox;
        }
    }
    toggleMenuAndNotificationProfile() {
        this._showNotification = false;
        this._menuToggle = false;
        var htmlTag = this.getDomElementById('main-container');
        this._removeMaskOnCss(htmlTag);
        this._showSearchBox = false;
    }
    // End of public methods
    // For Reference
    @ViewChild(AeTemplateComponent)
    popOverTemplate: AeTemplateComponent<any>;
    private _pvm: PopoverVm<any>;

    ngAfterContentInit(): void {
        this._pvm = createPopOverVm<any>(this.popOverTemplate, { text: "Hello" });
    }
    // Reference Over
}