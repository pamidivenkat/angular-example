import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { Post, PostType } from "../core/models/post";
import { AssociateUser } from "../core/models/user";
import { CategoryService } from "../core/services/category.service";
import { PostService } from "../core/services/post.service";
import { PropertyService } from "../core/services/property.service";
import { SnackbarService } from "../core/services/snackbar.service";
import { BaseComponent } from "../shared/base-component";

@Component({
  selector: "app-search-results",
  templateUrl: "./search-results.component.html",
  styleUrls: ["./search-results.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class SearchResultsComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _isVenueSearch: boolean = false;
  private _existingFilters: Array<string> = [];
  private _searchText: string = "*";
  private _searchType: string = "";
  private _isLoading: boolean = true;
  private _type$: Observable<string>;
  private _text$: Observable<string>;
  private _isLocationSearch: boolean = false;
  // End of Private Fields

  // Public properties
  get isVenueSearch(): boolean {
    return this._isVenueSearch;
  }

  // get archived(): boolean {
  //   return this._archived;
  // }

  get isLoading(): boolean {
    return this._isLoading;
  }

  public searchResults: Array<any>;
  public categories: Array<any>;
  public selectedCategory: number;
  public selectedTypes: Array<number> = [];
  public archived: boolean;

  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _postService: PostService,
    private _categoryService: CategoryService,
    private _propertyService: PropertyService,
    private _snackbar: SnackbarService
  ) {
    super();
    this.searchResults = [];

    this._categoryService
      .getAllCategories()
      .pipe(takeUntil(this._destructor$))
      .subscribe(categories => {
        this.categories = categories.sort(function(a, b) {
          return a.propertyName > b.propertyName ? 1 : 0;
        });
      });
  }
  // End of constructor

  // Private methods
  private _setResults(results) {
    this._isLoading = false;
    this.searchResults = [];
    results.map(result => {
      let post = new Post();
      post.associateUser = new AssociateUser();
      if (result.contentType) {
        post.id = result.postId;
        post.entityId = result.postId;
        post.type = result.contentType;

        post.associateUser.fullname = result.author;
        post.createdBy = result.userId;
        post.createdOn = result.postDate;
        post.title =
          result["@search.highlights"] && result["@search.highlights"].title
            ? result["@search.highlights"].title.join(" ... ")
            : result.title;
        post.detail =
          result["@search.highlights"] && result["@search.highlights"].description
            ? result["@search.highlights"].description.join(" ... ")
            : result.description;
        post.associateUser.photoUrl = result.photoUrl;
        switch (post.type) {
          case PostType.Insight:
            post.numberOfComments = result.answerCount;
            break;
          case PostType.Question:
            post.numberofAnswers = result.answerCount;
            break;
          case PostType.Review:
          case PostType.Inspection:
            post.detail = result.location;
            break;
        }
      } else {
        post.id = result.propertyID;
        post.type = PostType.Venue;
        post.createdOn = result.addedDate;
        post.title = result.title;
        post.entityId = result.propertyID;
        post.detail = result.location;
      }

      this.searchResults.push(post);
    });
  }

  private _getSearchResults(searchType?: string) {
    this._isLoading = true;
    if (searchType === "property") {
      this._existingFilters = [];
      this._propertyService
        .searchProperties(this._searchText)
        .pipe(takeUntil(this._destructor$))
        .subscribe(results => {
          if (results instanceof HttpErrorResponse) {
            this._isLoading = false;
            this._snackbar.error(results.statusText);
          } else {
            this._setResults(results.value);
          }
        });
    } else {
      this._postService
        .searchPosts(this._searchText, this._isLocationSearch, this._existingFilters)
        .pipe(takeUntil(this._destructor$))
        .subscribe(results => {
          if (results instanceof HttpErrorResponse) {
            this._isLoading = false;
            this._snackbar.error(results.statusText);
          } else {
            this._setResults(results);
          }
        });
    }
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._type$ = this._activatedRoute.params.pluck("type");
    this._text$ = this._activatedRoute.params.pluck("text");

    let sub1 = this._type$.pipe();
    let sub2 = this._text$.pipe();

    Observable.combineLatest(sub1, sub2).subscribe(([searchType, searchText]) => {
      if (this._searchType == searchType && this._searchText == searchText) {
        return;
      }
      this._searchType = searchType;
      this._isVenueSearch = false;
      switch (searchType) {
        case "searchText":
          this._searchText = searchText;
          this._existingFilters = [];
          break;
        case "category":
          this._searchText = "*";
          this.selectedCategory = +searchText;
          this._existingFilters = [`categoryId eq ${searchText}`];
          break;
        case "brand":
          this._searchText = "*";
          this._existingFilters = [`venueBrandId eq ${searchText}`];
          break;
        case "location":
          this._searchText = searchText;
          this._isLocationSearch = true;
          break;
        default:
          this._searchText = searchText;
          this._isVenueSearch = true;
          break;
      }

      let previousUrl = localStorage.getItem("previousUrl");
      let storedFilters = localStorage.getItem("searchFilters");
      let setTypes =
        previousUrl.indexOf("$/post/view/") >= 0 ||
        previousUrl.indexOf("$/review/view/") >= 0 ||
        previousUrl.indexOf("$/inspection/") >= 0 ||
        previousUrl.indexOf("$/promotion/") >= 0;

      if (setTypes && storedFilters) {
        let filters = storedFilters.split("and");
        let postTypes = [];
        filters.map(filter => {
          if (filter.indexOf("category") >= 0) {
            this.selectedCategory = +filter.trim().substr(14, filter.length);
            this._existingFilters.push(`categoryId eq ${this.selectedCategory}`);
          }

          if (filter.indexOf("archive") >= 0) {
            this.archived = true;
            this._existingFilters.push("(archive eq true or archive eq false)");
          }

          if (filter.indexOf("postType") >= 0) {
            filter
              .trim()
              .slice(1, -1)
              .split("or")
              .map(postType => {
                postTypes.push(+postType.trim().substr(12, postType.length));
              });
          }
        });
        this.applyPostTypeFilter(postTypes);
      } else {
        localStorage.removeItem("searchFilters");
        this.selectedCategory = this._searchType === "category" ? +searchText : undefined;
        this.selectedTypes = [];
        this.archived = false;
        this._getSearchResults(searchType);
      }
    });
  }

  applyPostTypeFilter(types: Array<number>) {
    let filterTypes: Array<string> = [];

    this._existingFilters.map((filter, index) => {
      if (filter.indexOf("postType") !== -1) {
        this._existingFilters.splice(index, 1);
      }
    });

    if (types && this.selectedTypes !== types && types.length > 0) {
      this.selectedTypes = types;
      this.selectedTypes.map(type => {
        filterTypes.push(`postType eq ${type}`);
      });
      this._existingFilters = [...this._existingFilters, "(" + filterTypes.join(" or ") + ")"];
    }
    localStorage.setItem("searchFilters", this._existingFilters.join(" and "));

    this._getSearchResults();
  }

  applyCategoryFilter(categoryId) {
    let index = this._existingFilters.findIndex(filter => filter.indexOf("categoryId") !== -1);

    if (categoryId === undefined) {
      if (index >= 0) {
        this._existingFilters.splice(index, 1);
      }
    } else if (index !== -1) {
      this._existingFilters[index] = `categoryId eq ${categoryId}`;
    } else {
      this._existingFilters = [...this._existingFilters, `categoryId eq ${categoryId}`];
    }

    localStorage.setItem("searchFilters", this._existingFilters.join(" and "));

    this._getSearchResults();
  }

  includeArchivePosts(includeArchive: boolean) {
    let index = this._existingFilters.findIndex(filter => filter.indexOf("archive") !== -1);

    if (index === -1 && includeArchive) {
      this._existingFilters = [...this._existingFilters, `(archive eq true or archive eq false)`];
    }

    if (index !== -1 && !includeArchive) {
      this._existingFilters.splice(index, 1);
    }

    localStorage.setItem("searchFilters", this._existingFilters.join(" and "));

    this._getSearchResults();
  }
  // End of public methods
}
