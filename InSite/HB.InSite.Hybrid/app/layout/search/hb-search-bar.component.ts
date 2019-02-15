import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { TNSFontIconService } from 'nativescript-ngx-fonticon/services/fonticon.service';
import { Page } from 'tns-core-modules/ui/page';
import { Router } from "@angular/router";
import { SearchBar } from "tns-core-modules/ui/search-bar/search-bar";
import { Switch } from "tns-core-modules/ui/switch/switch";
import { WebViewService } from '~/core/web-view/webview.service';

@Component({
  selector: "hb-search-bar",
  templateUrl: "./layout/search/hb-search-bar.component.html"
})
export class HBSearchBarComponent {
    @Input() parent;
    @Input() hasSearchField: boolean = false;
    private postOption;
    private venueOption;
    public isVenueOption: boolean = true;

    constructor(
        private _page: Page,
        private _router: Router,
        private _cdr: ChangeDetectorRef,
        private fonticon: TNSFontIconService,
        private webService: WebViewService
    ) {
        console.log("app header component");
        _page.actionBarHidden = true;
        _page.on("loaded", this.onLoaded, this);
    }
    ngOnInit() {
    }
    ngAfterContentInit() {
        this._cdr.detectChanges();
    }

    ngOnDestroy() {
    }

    public onLoaded(args) {
    }
    
    @HostListener('toggleSearch', ['$event'])
    public toggleSearchBar(event: any = null) {
        this.hasSearchField = !this.hasSearchField;
    }

    public venueOptionChange(args: any) {
        this.venueOption = <Switch>args.object.checked;
    }

    @Output() searchBarEvent = new EventEmitter();
    public onSearch(args: any) {
        let searchBar = <SearchBar>args.object;
        this.searchBarEvent.emit({text:searchBar.text, venue: this.venueOption});
        console.log("Loading search results for " + searchBar.text);
        this.toggleSearchBar();
        //this.navigateTo('/search/results');
    }

    public onSearchLoaded(args: any) {
        // console.log("onSearchLoaded - ");
    }

    public onSearchClear(args: any) {
        // console.log("onSearchClear - ");
    }

}
