import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";

import { PostType } from "../../core/models/post";
import { AssociateUser } from "../../core/models/user";
import { LayoutActions } from "../../core/redux/actions/layout.actions";
import { PostService } from "../../core/services/post.service";
import { UserService } from "../../core/services/user.service";
import { BaseComponent } from "../../shared/base-component";
import { CommonHelpers } from "../../shared/helpers/common-helper";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _associate: AssociateUser;
  private _postTypes: Array<any>;
  private _isLoading: boolean = true;
  private _isProfileLoading: boolean = true;
  private _selectedType: Array<number>;
  private _posts: Array<any> = [];
  private _associateId: string;
  private _selectedTypes: Array<number>;
  private _maxId: number = 0;
  private _recordCount: number = 0;

  @select(["layout", "isScrollEnd"])
  private _isScrollEnd$: Observable<boolean>;
  // End of Private Fields

  // Public properties
  get associate(): AssociateUser {
    return this._associate;
  }
  get postTypes(): Array<any> {
    return this._postTypes;
  }
  get selectedType() {
    return this._selectedType;
  }
  get posts(): Array<any> {
    return this._posts;
  }
  get isLoading(): boolean {
    return this._isLoading;
  }
  get isProfileLoading(): boolean {
    return this._isProfileLoading;
  }
  get selectedTypes(): Array<number> {
    return this._selectedTypes;
  }

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
    private _layoutActions: LayoutActions,
    private _userService: UserService
  ) {
    super();

    this._associate = new AssociateUser();
    this._selectedTypes = [];
  }
  // End of constructor

  // Private methods
  private _getContent() {
    this._isLoading = true;
    const options = Object.create({});
    options.maxId = this._maxId;
    options.types =
      this._selectedTypes.length > 0
        ? this._selectedTypes.reduce((a, b) => {
            return +a + +b;
          })
        : 0;
    this._postService
      .getPostsByUser(this._associateId, options)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        this._isProfileLoading = false;
        this._isLoading = false;
        if (response instanceof HttpErrorResponse) {
        } else {
          this._posts = this._posts.concat(response && response.data ? response.data : []);
          this._maxId = response && response.paging.maxId;
        }
      });
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._postTypes = CommonHelpers.EnumToArray(PostType).filter(type => type.value <= PostType.Inspection);
    this._postTypes.push({ value: 0, name: "Answer" });
    this._postTypes.sort((a, b) => (a.name < b.name ? -1 : 1));
    this._selectedType = this._postTypes.map(type => {
      return type.value;
    });

    this._activatedRoute.params
      .pipe(
        takeUntil(this._destructor$),
        switchMap(data => {
          this._isProfileLoading = true;
          this._associateId = data.id;
          const options = Object.create({});
          options.maxId = this._maxId;
          options.types =
            this._selectedTypes.length > 0
              ? this._selectedTypes.reduce((a, b) => {
                  return +a + +b;
                })
              : 0;

          return Observable.combineLatest(
            this._postService.getPostsByUser(this._associateId, options).pipe(takeUntil(this._destructor$)),
            this._userService.getUserById(this._associateId).pipe(takeUntil(this._destructor$))
          );
        })
      )
      .subscribe(response => {
        this._isProfileLoading = false;
        this._isLoading = false;
        if (response instanceof HttpErrorResponse) {
        } else {
          this._posts = this._posts.concat(response[0] && response[0].data ? response[0].data : []);
          this._associate = response[1];
          this._associate.location = [
            this._associate.businessCity,
            this._associate.businessState,
            this._associate.country
          ]
            .filter(loc => loc)
            .join(", ");
          this._maxId = response[0] && response[0].paging.maxId;
          this._recordCount = response[0] && response[0].paging.recordCount;
        }
      });

    this._isScrollEnd$.pipe(takeUntil(this._destructor$)).subscribe(scrollEnd => {
      if (scrollEnd) {
        if (this.posts.length < this._recordCount) {
          this._getContent();
        }
      }
      this._layoutActions.updateScrollEnd(false);
    });
  }

  updateList(postTypes) {
    this._isLoading = true;
    this._posts = [];
    this._selectedTypes = postTypes;
    this._maxId = 0;

    const options = Object.create({});
    options.maxId = this._maxId;
    options.types =
      this._selectedTypes.length > 0
        ? this._selectedTypes.reduce((a, b) => {
            return +a + +b;
          })
        : 0;

    this._postService
      .getPostsByUser(this._associateId, options)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        this._isLoading = false;
        this._posts = response.data;
        this._maxId = response[0] && response[0].paging.maxId;
        this._recordCount = response[0] && response[0].paging.recordCount;
      });
  }

  sendMail(email: string) {
    location.href = `mailto:${this._associate.email}`;
  }

  getMoreContributions(event) {
    if (event.endReached) {
      console.log("sdf");
      this._layoutActions.updateScrollEnd(true);
    }
  }
  // End of public methods
}
