import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material";
import { Observable, of } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

import { Post } from "../core/models/post";
import { User } from "../core/models/user";
import { LayoutActions } from "../core/redux/actions/layout.actions";
import { PostService } from "../core/services/post.service";
import { BaseComponent } from "../shared/base-component";
import { ReviewRequest } from "./../core/models/review-request";

@Component({
  selector: "app-container",
  templateUrl: "./container.component.html",
  styleUrls: ["./container.component.scss"]
})
export class ContainerComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _hasInitData: boolean;
  private _viewCount: number = 0;
  private _currentTabIndex: number;
  private _maxId: number = 0;
  private _loading: boolean;
  private _user: User;
  private _selectedTypes: Array<number> = [];
  private _scrollPosition: number = 0;
  // End of Private Fields

  // Public properties
  public recentPosts: Array<Post>;
  public questions: Array<Post>;
  public reviews: Array<ReviewRequest>;
  public isMobile: boolean;
  public totalCount: number = 0;
  public savedTab: number = 0;

  get hasInitData(): boolean {
    return this._hasInitData;
  }

  get loading(): boolean {
    return this._loading;
  }

  get selectedTypes(): Array<number> {
    return this._selectedTypes;
  }

  @select(["layout", "isScrollEnd"])
  isScrollEnd$: Observable<boolean>;

  @select(["layout", "isMobile"])
  private _isMobile$: Observable<boolean>;

  @select(["identity", "user"])
  private _user$: Observable<User>;
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(private _postService: PostService, private _layoutActions: LayoutActions) {
    super();
    this.recentPosts = [];
    this.questions = [];
    this.reviews = [];
    this._hasInitData = false;
    this._loading = false;
  }
  // End of constructor

  // Private methods
  private _loadCards(posts: any, loadMore: boolean, backNavigation?: boolean) {
    let nextSet = posts.data;

    if (this._currentTabIndex == 1) {
      if (this.questions.findIndex(post => post.id === nextSet[0].id) === -1) {
        this.questions = this.questions.concat(nextSet);
        this._viewCount = this.questions.length;
      }
    } else if (this._currentTabIndex == 2) {
      if (this.reviews.findIndex(post => post.id === nextSet[0].id) === -1) {
        this.reviews = this.reviews.concat(nextSet);
        this._viewCount = this.reviews.length;
      }
    } else {
      if (this.recentPosts.findIndex(post => post.id === nextSet[0].id) === -1) {
        this.recentPosts = this.recentPosts.concat(nextSet);
        this._viewCount = this.recentPosts.length;
      }
    }
    this._maxId = posts.paging.maxId;
    this.totalCount = posts.paging.recordCount;

    if (loadMore) {
      this._loading = false;
    } else {
      this._hasInitData = true;
    }

    if (backNavigation) {
      //Time out to load the data and navigate to saved position.
      setTimeout(() => {
        window.scrollTo(0, this._scrollPosition);
      }, 200);
    }
  }

  private _getPosts(loadMore?: boolean, backNavigation?: boolean) {
    let options: any = {};

    if (loadMore) {
      options = { count: 30, maxId: this._maxId };
    } else {
      this.recentPosts = [];
    }

    if (this._currentTabIndex == 1) {
      options["answered"] = false;
    }

    let types;
    if (this._selectedTypes.length > 0) {
      types = this._selectedTypes.reduce((a, b) => {
        return +a + +b;
      });
    } else {
      types = 127;
    }

    if (this._currentTabIndex != 2) {
      options = Object.assign({ types: types }, options);
      this._postService
        .getLatestPosts(options)
        .pipe(takeUntil(this._destructor$))
        .subscribe(posts => {
          if (posts instanceof HttpErrorResponse || !posts) {
            posts = {
              data: [],
              paging: {
                batchSize: 30,
                maxId: 0,
                pageIndex: 1,
                recordCount: 0
              }
            };
          }
          this._loadCards(posts, loadMore, backNavigation);
        });
    } else {
      this._postService
        .getRequestedReviews(options)
        .pipe(takeUntil(this._destructor$))
        .subscribe(posts => {
          if (posts instanceof HttpErrorResponse || !posts) {
            posts = {
              data: [],
              paging: {
                batchSize: 30,
                maxId: 0,
                pageIndex: 1,
                recordCount: 0
              }
            };
          }
          this._loadCards(posts, loadMore, backNavigation);
        });
    }

    this._isMobile$.pipe(takeUntil(this._destructor$)).subscribe(value => {
      this.isMobile = value;
    });
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    let previousUrl = localStorage.getItem("previousUrl");
    let filters = localStorage.getItem("homeFilter");

    let isBackNavigation =
      previousUrl.indexOf("/$/post/view/") >= 0 ||
      previousUrl.indexOf("/$/review/view/") >= 0 ||
      previousUrl.indexOf("/$/inspection/") >= 0 ||
      previousUrl.indexOf("/$/announcement/") >= 0 ||
      previousUrl.indexOf("/$/property/") >= 0;

    if (isBackNavigation && filters) {
      filters.split(",").map(item => {
        this._selectedTypes.push(+item);
      });
    }

    if (isBackNavigation) {
      this.savedTab = +localStorage.getItem("postFeedTab");
      this._currentTabIndex = this.savedTab;
      this._scrollPosition = +localStorage.getItem("scrollPosition");
    }

    this._user$
      .pipe(
        takeUntil(this._destructor$),
        switchMap(user => {
          this._user = user ? user : new User();
          return of(this._user);
        })
      )
      .subscribe(user => {
        if (user.id) {
          this._getPosts(false, isBackNavigation);
        }
      });

    this.isScrollEnd$.pipe(takeUntil(this._destructor$)).subscribe(scrollEnd => {
      if (scrollEnd) {
        if (this._viewCount < this.totalCount) {
          this._loading = true;
          this._getPosts(true);
        }
      }
      this._layoutActions.updateScrollEnd(false);
    });
  }

  onTabChange(event: MatTabChangeEvent) {
    this.recentPosts = [];
    this.questions = [];
    this.reviews = [];
    this._maxId = 0;
    this._currentTabIndex = event.index;
    this._viewCount = 0;
    this._hasInitData = false;
    localStorage.setItem("postFeedTab", this._currentTabIndex.toString());
    this._getPosts();
  }

  getMorePosts(scroll) {
    if (scroll.endReached) {
      this._layoutActions.updateScrollEnd(true);
    }
  }

  loadMoreData() {
    this._loading = true;
    this._getPosts(true);
  }

  filterPosts(event: Array<number>) {
    localStorage.setItem("homeFilter", event.join(","));
    if (event && this._selectedTypes !== event) {
      this._hasInitData = false;
      this._selectedTypes = event;
      this._getPosts();
    }
  }

  saveScrollPosition(position) {
    localStorage.setItem("scrollPosition", position);
  }
  // End of public methods
}
