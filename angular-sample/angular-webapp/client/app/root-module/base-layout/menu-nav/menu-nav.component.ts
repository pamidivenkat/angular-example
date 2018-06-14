import { PermissionWithArea } from '../../common/permissionarea-map';
import { isNullOrUndefined } from 'util';
import { SecureContext } from 'tls';
import { LinkOrigin, LinkTarget, Menu } from '../../models/menu';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers/index';
import { RouteParams } from '../../../shared/services/route-params';

@Component(
    {
        selector: 'menu-top',
        templateUrl: './menu-nav.component.html',
        styleUrls: ['./menu-nav.component.scss'],
        // changeDetection: ChangeDetectionStrategy.OnPush,
        encapsulation: ViewEncapsulation.None
    }
)
export class MenuNavComponent extends BaseComponent implements OnInit, OnDestroy {
    // Private Fields

    /**
     * private variable to hold menu items stream
     * 
     * @private
     * 
     * @memberOf MenuNavComponent
     */
    private _menuItems = new BehaviorSubject<Menu[]>([]);

    /**
     * private variable to hold menu items with sub level 
     * 
     * @private
     * @type {Menu[]}
     * @memberOf MenuNavComponent
     */
    private _menuItemsWithSubLevel: Menu[];

    /**
     * private variable to hold menu items first level items
     * 
     * @private
     * @type {Menu[]}
     * @memberOf MenuNavComponent
     */
    private _menuItemsWithoutSubLevel: Menu[];

    /**
     * variable to hold current clicked index
     * 
     * @private
     * @type {string}
     * @memberOf MenuNavComponent
     */
    private _clickedIndex: string;

    /**
     * variable to hold level two items toggle stat
     * @private
     * @type {boolean}
     * @memberOf MenuNavComponent
     */
    private _toggleChild: boolean = false;

    /**
     * variable to hold v1 URL
     * @private
     * @type {string}
     * @memberOf MenuNavComponent
     */
    private _atlasV1URL: string;


    /**
     * variable to hold sub menu items 
     * @private
     * @type {Immutable.List<Menu>}
     * @memberOf MenuNavComponent
     */
    //private _subMenuItems: Immutable.List<Menu>;

    /**
     * variable to hold current expanded sub menu item id
     * @private
     * @type {Immutable.List<Menu>}
     * @memberOf MenuNavComponent
     */
    private _currentExpandedSubMenu: string;


    // End of Private Fields

    // Public properties

    // get subMenuItems(): Immutable.List<Menu> {
    //     return this._subMenuItems;
    // }
    get menuItemsWithoutSubLevel(): Menu[] {
        return this._menuItemsWithoutSubLevel;
    }

    get menuItemsWithSubLevel(): Menu[] {
        return this._menuItemsWithSubLevel;
    }

    /**
     *  property to hold V1 URL
     * @readonly
     * 
     * @memberOf MenuNavComponent
     */
    @Input('atlasV1URL')
    get atlasV1URL() {
        return this._atlasV1URL;
    }
    set atlasV1URL(toggleLevel: string) {
        this._atlasV1URL = toggleLevel;
    }


    /**
     * Property to hold menu items stream
     * @readonly
     * 
     * @memberOf MenuNavComponent
     */
    @Input('menuItems')
    get menuItems() {
        return this._menuItems;
    }
    set menuItems(menu: BehaviorSubject<Menu[]>) {
        this._menuItems = menu;
    }
    // End of Public properties

    // Public Output bindings

    /**
     *  emits the level two open state
     * @type {EventEmitter<boolean>}
     * @memberOf MenuNavComponent
     */
    @Output() notifyOnToggleLevelTwo: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output('onMenuClick') notifyOnMenuClick: EventEmitter<boolean> = new EventEmitter<boolean>();
    //End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bidnings

    // constructor
    constructor(_localeService: LocaleService, _translationService: TranslationService, _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _routeParams: RouteParams
    ) {
        super(_localeService, _translationService, _cdRef);
    }
    // End of constructor

    // Private methods

    ngOnInit() {
        this._menuItemsWithSubLevel = new Array<Menu>();
        this._menuItemsWithoutSubLevel = new Array<Menu>();
        this._menuItems.subscribe((menuItems) => {
            menuItems.map(mi => {
                if (isNullOrUndefined(mi.MenuItems)) {
                    this._menuItemsWithoutSubLevel.push(mi);
                } else {
                    this._menuItemsWithSubLevel.push(mi);
                }
            });
        });
        this._toggleChild = false;
    }

    /**
     *  click event to toggle menu
     * @param {number} menuIndex 
     * 
     * @memberOf MenuNavComponent
     */
    toggleMenuOnClick(menu: Menu) {
        if (this._clickedIndex === menu.Id) {
            this._clickedIndex = null;
            this._toggleChild = false;
        }
        else {
            this._clickedIndex = menu.Id;
            this._toggleChild = true;
        }
        this.notifyOnToggleLevelTwo.emit(this._toggleChild);

        //this._subMenuItems = Immutable.List(menu.MenuItems);
    }

    subMenuItems(menu: Menu): Immutable.List<Menu> {
        return Immutable.List(menu.MenuItems);
    }

    subMenuVisibility(menu: Menu) {
        return menu.Id === this._clickedIndex;
    }

    public IsThirdPartyWebsiteLink(menu: Menu) {
        return !isNullOrUndefined(menu.NavigateTo) && (menu.NavigateTo.toLowerCase().indexOf('http://') > -1 || menu.NavigateTo.toLowerCase().indexOf('https://') > -1);
    }
    /**
     * method to toggle top level menu items
     * @param {string} menuId 
     * 
     * @memberOf MenuNavComponent
     */
    toggleMenuWithoutSubLevel(menuId: string) {
        this._clickedIndex = menuId;
        this.notifyOnToggleLevelTwo.emit(false);
    }

    /**
     * Click event to toggle submenu
     * @param {Menu[]} subMenu 
     * @param {Menu} currentMenu 
     * 
     * @memberOf MenuNavComponent
     */
    toggleSubMenuOnClick(subMenuIndex: number, menu: Menu) {
        let currentMenu = menu.MenuItems[subMenuIndex];
        if (this._currentExpandedSubMenu == currentMenu.Id) {
            this._currentExpandedSubMenu = null;
        }
        else
            this._currentExpandedSubMenu = currentMenu.Id;

    }


    /**
     * 
     * 
     * @param {string} id 
     * @returns 
     * 
     * @memberOf MenuNavComponent
     */
    isExpanded(id: string) {
        return this._currentExpandedSubMenu === id;
    }


    /**
     * 
     * 
     * @param {string} id 
     * @returns 
     * 
     * @memberOf MenuNavComponent
     */
    isMainMenuExpanded(id: string) {
        return this._clickedIndex == id;
    }


    /**
     * check to sublevel items exists
     * @param {Menu} menuItem 
     * @returns 
     * 
     * @memberOf MenuNavComponent
     */
    subLevelItemsExists(menuItem: Menu) {
        return menuItem.MenuItems.length == 0;
    }


    /**
     *  method to check link origin is V1 or V2
     * @param {LinkOrigin} linkOrigin 
     * @returns 
     * 
     * @memberOf MenuNavComponent
     */
    IsSameOriginLink(linkOrigin: LinkOrigin) {
        return linkOrigin == LinkOrigin.AtlasV2;
    }

    /**
     * method to navigate link
     * @param {string} navigateLink 
     * @returns {string} 
     * 
     * @memberOf MenuNavComponent
     */
    navigateLink(menuItem: Menu, target: LinkTarget): string {
        let cid = this._routeParams.Cid;

        if (!isNullOrUndefined(menuItem.NavigateTo) && menuItem.NavigateTo.toLowerCase().indexOf('/enquiry/') >= 0) {
            return this._atlasV1URL + menuItem.NavigateTo;
        }
        if (!isNullOrUndefined(cid) && menuItem.PassParams) {
            return this._atlasV1URL + '/#' + menuItem.NavigateTo + '?cid=' + cid;
        }
        else {
            return this._atlasV1URL + '/#' + menuItem.NavigateTo;
        }
    }


    isTargetBlank(target: LinkTarget): string {
        if (target === LinkTarget.Blank) {
            return "_blank";
        }

        return "_self";
    }

    /**
     * menu close on item click output emit
     * @memberOf MenuNavComponent
     */
    menuCloseOnClick() {
        this.notifyOnMenuClick.emit(true);
    }

    // End of private methods

    // Public methods
    menuItemVisible(item: Menu): boolean {
        // When we have duplicate, keep the one with cid
        if (this._routeParams.Cid && !item.RequireCid){
            let otherItemWithCid = this._menuItemsWithSubLevel.find((i) => i.Id !== item.Id && i.Title === item.Title);
            if (otherItemWithCid) return false;
            otherItemWithCid = this._menuItemsWithoutSubLevel.find((i) => i.Id !== item.Id && i.Title === item.Title);
            if (otherItemWithCid) return false;
        }

        if (!item.RequireCid) return true;

        if (this._routeParams.Cid) return true;

        return false;
    }

    subMenuItemVisible(item: Menu, subItems: Menu[]): boolean {
        // When we have duplicate, keep the one with cid
        if (this._routeParams.Cid && !item.RequireCid && subItems) {
            let otherItemWithCid = subItems.find((i) => i.Id !== item.Id && i.Title === item.Title);
            if (otherItemWithCid) return false;
        }

        if (!item.RequireCid) return true;

        if (this._routeParams.Cid) return true;

        return false;
    }
    public ngOnDestroy(): void {
        this.notifyOnToggleLevelTwo.emit(false);
    }
    // End of public methods
}