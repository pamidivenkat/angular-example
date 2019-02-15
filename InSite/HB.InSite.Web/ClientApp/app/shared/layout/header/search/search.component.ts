import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";

import { BaseComponent } from "../../../base-component";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class SearchComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _showModel: boolean;
  // End of Private Fields

  // Public properties
  get showModel(): boolean {
    return this._showModel;
  }

  search = {
    query: "",
    venues: false
  };
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(private _router: Router) {
    super();
    this._showModel = false;
  }

  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {}

  goToResults(searchText: string) {
    if (searchText.trim() != "") {
      this._showModel = false;

      let searchType = "searchText";
      if (this.search.venues) {
        searchType = "property";
      }
      localStorage.removeItem("searchFilters");
      this._router.navigateByUrl(`search/results/${searchType}/${searchText}`);
    }
  }

  showSearch() {
    this._showModel = true;
  }

  hideSearch() {
    this._showModel = false;
  }

  searchByEnterKey(event, searchText: string) {
    if (event.keyCode === 13) {
      this.goToResults(searchText);
    }
  }

  // End of public methods
}
