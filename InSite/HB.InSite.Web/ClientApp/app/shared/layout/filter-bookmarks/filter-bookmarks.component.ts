import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { PostType } from "../../../core/models/post";
import { CommonHelpers } from "../../helpers/common-helper";
import { BookmarkService } from "../../../core/services/bookmark.service";

@Component({
  selector: "app-filter-bookmarks",
  templateUrl: "./filter-bookmarks.component.html",
  styleUrls: ["./filter-bookmarks.component.scss"]
})
export class FilterBookmarksComponent implements OnInit {
  public postTypes: Array<any>;
  public filtersForm: FormGroup;
  private _filters: Array<number>;

  constructor(
    private _fb: FormBuilder,
    private _location: Location,
    private _router: Router,
    private _bookmarkService: BookmarkService
  ) {
    this.postTypes = CommonHelpers.EnumToArray(PostType).filter(type => {
      return type.value !== PostType.CVB;
    });
    this._filters = this._bookmarkService.selectedFilters ? this._bookmarkService.selectedFilters : [];
  }

  ngOnInit() {
    this.filtersForm = this._fb.group({
      postType: ""
    });

    this.postTypes.map(type => {
      this.filtersForm.addControl(`postType${type.value}`, new FormControl(""));
    });

    this._filters.map(value => {
      this.filtersForm.get(`postType${value}`).setValue(true);
    });
  }

  clear() {
    this.postTypes.map(type => {
      this.filtersForm.get(`postType${type.value}`).setValue(false);
    });

    // this._filters.map(value => {
    //   this.filtersForm.get(`postType${value}`).setValue(true);
    // });
  }

  cancel() {
    this._location.back();
  }

  apply() {
    let filters: Array<number> = [];
    this.postTypes.map(type => {
      if (this.filtersForm.get(`postType${type.value}`).value) {
        filters.push(type.value);
      }
    });

    this._bookmarkService.selectedFilters = filters;
    this._router.navigateByUrl("/mybookmarks");
  }
}
