import { select } from "@angular-redux/store";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";

import { User } from "../../core/models/user";
import { IdentityActions } from "../../core/redux/actions/identity.actions";
import { LayoutActions } from "../../core/redux/actions/layout.actions";
import { PostService } from "../../core/services/post.service";
import { BaseComponent } from "../../shared/base-component";

@Component({
  selector: "app-my-expiration-content",
  templateUrl: "./my-expiration-content.component.html",
  styleUrls: ["./my-expiration-content.component.scss"]
})
export class MyExpirationContentComponent extends BaseComponent implements OnInit {
  private _posts: Array<any>;
  private _isLoading: boolean = false;
  private _user: User;
  private _totalCount: number;
  private _maxId: number = 0;

  get posts(): Array<any> {
    return this._posts;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  @select(["identity", "user"])
  private _user$: Observable<User>;

  @select(["layout", "isScrollEnd"])
  private _isScrollEnd$: Observable<boolean>;

  constructor(
    private _postService: PostService,
    private _layoutActions: LayoutActions,
    private _identityActions: IdentityActions
  ) {
    super();
    this._posts = [];
  }

  private _getPosts() {
    this._isLoading = true;
    this._postService
      .getExpiringData(this._user.id)
      .pipe(takeUntil(this._destructor$))
      .subscribe(posts => {
        this._isLoading = false;
        if (posts) {
          this._posts = this._posts.concat(posts.data);
          this._totalCount = posts.paging.recordCount;
          this._maxId = posts.paging.maxId;
        }
      });
  }

  ngOnInit() {
    this._user$.pipe(distinctUntilChanged()).subscribe(user => {
      if (user) {
        this._user = user;
        this._getPosts();
      }
    });

    this._isScrollEnd$.pipe(takeUntil(this._destructor$)).subscribe(scrollEnd => {
      if (scrollEnd) {
        if (this.posts.length < this._totalCount) {
          this._getPosts();
        }
      }
      this._layoutActions.updateScrollEnd(false);
    });
  }

  getMorePosts(scroll) {
    if (scroll.endReached) {
      this._layoutActions.updateScrollEnd(true);
    }
  }

  removeFromList(event) {
    this._posts = this._posts.filter(post => post.id != event);
    this._totalCount--;
    this._identityActions.userExpCount(this._posts.length);
  }
}
