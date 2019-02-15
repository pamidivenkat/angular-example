import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { distinctUntilChanged, filter, switchMap, takeUntil } from "rxjs/operators";

import { NotificationItem } from "../../../core/models/notification";
import { PostType } from "../../../core/models/post";
import { User } from "../../../core/models/user";
import { LayoutActions } from "../../../core/redux/actions/layout.actions";
import { ClaimsHelperService } from "../../../core/services/claims-helper.service";
import { NotificationService } from "../../../core/services/notification.service";
import { SnackbarService } from "../../../core/services/snackbar.service";
import { BaseComponent } from "../../base-component";
import { ModelDialogComponent } from "../../components/model-dialog/model-dialog.component";
import { LoadingBarService } from "@ngx-loading-bar/core";

@Component({
  selector: "app-recent-notification",
  templateUrl: "./recent-notification.component.html",
  styleUrls: ["./recent-notification.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class RecentNotificationComponent extends BaseComponent implements OnInit {
  public isMobile: boolean;
  public notifications: Array<NotificationItem>;
  public users: Array<string>;
  private _user: User;
  private _paging: any;
  private _scrolling: boolean = true;

  @select(["layout", "isMobile"])
  isMobile$: Observable<boolean>;

  @select(["identity", "user"])
  private _user$: Observable<User>;

  dataLoading: boolean = false;

  constructor(
    private _router: Router,
    private _notificationService: NotificationService,
    private _snackbar: SnackbarService,
    private _layoutActions: LayoutActions,
    private _dialog: MatDialog,
    private _claimHelper: ClaimsHelperService,
    private _loadingBar: LoadingBarService
  ) {
    super();
    this.isMobile$.pipe(distinctUntilChanged()).subscribe(value => {
      this.isMobile = value ? true : false;
    });

    this.notifications = [];

    this._notificationService.markRead.subscribe(value => {
      if (value) {
        this.notifications.forEach(notification => {
          notification.isNew = false;
        });
      }
    });
  }

  private _getAge(submitted: string) {
    const now = new Date();
    const diffInMs: number = Date.parse(now.toString()) - Date.parse(submitted);
    return diffInMs / 1000 / 60 / 60;
  }

  private _loadData(response) {
    this.dataLoading = false;
    if (response instanceof HttpErrorResponse || response === null) {
      this._paging = {};
      return;
    }
    this.notifications = this.notifications.concat(response ? response.data : []);
    this._paging = response.paging;
    this.notifications.map(notification => {
      notification.age = this._getAge(notification.submitted.toString());
      let noteTypeText = "";
      if (notification.property.propertyId === 0) {
        switch (notification.postType) {
          case 128:
            notification.description =
              this._user.id === notification.post.createdBy
                ? "commented on an insight you posted"
                : "commented on an insight post you are following";
            break;
          case 256:
            notification.description =
              this._user.id === notification.post.createdBy
                ? "answered your question"
                : "answered a question you are following";
            notification.post.type = 0;
            break;
          case 512:
            if (notification.post.type === PostType.Insight) {
              noteTypeText = "replied to a comment on";
            } else {
              noteTypeText = "replied to an answer on";
            }

            notification.description =
              this._user.id === (notification.post && notification.post.createdBy)
                ? `${noteTypeText}  ${
                    notification.post.type === PostType.Insight ? "an insight you posted" : "your question"
                  }`
                : `${noteTypeText} ${
                    notification.post.type === PostType.Insight ? "an insight" : "a question"
                  } you are following`;
            break;
        }
      } else {
        switch (notification.postType) {
          case PostType.Review:
            notification.description = "posted a review you requested";
            if (this._claimHelper.isSysAdmin(notification.post.createdBy)) {
              notification.description = "A client review has been posted for a Venue/CVB you are following";
            }
            break;
          case PostType.Promotion:
            notification.description = "A promotion has been offered for a Venue/CVB you are following";
            break;
          case PostType.Venue:
          case PostType.CVB:
            switch (notification.post.type) {
              case PostType.Insight:
                notification.description = "posted insight for a Venue/CVB you are following";
                break;
              case PostType.Question:
                notification.description = "asked a question about a Venue/CVB you are following";
                if (notification.answerReply === 1) {
                  notification.post.type = 0;
                  notification.description = "answered a question about a Venue/CVB you are following";
                }
                if (notification.answerReply === 2) {
                  notification.description = "replied to an answer on a question about a Venue/CVB you are following";
                }
                break;
              case PostType.Inspection:
                notification.description = "posted an inspection for a Venue/CVB you are following";
                break;
              default:
                notification.description = "reviewed a Venue/CVB you are following";
                notification.post.type = 4;
                break;
            }
            break;
          case 128:
            notification.description = "commented on an insight post for a Venue/CVB you are following";
            break;
          case 256:
            notification.description = "answered a question about a Venue/CVB you are following";
            notification.post.type = 0;
            break;
          case 512:
            notification.description = `replied to ${
              notification.post.type === PostType.Insight
                ? "a comment on an insight post for"
                : "an answer on a question about "
            } a Venue/CVB you are following`;
            break;
        }
      }

      notification.description =
        (this._claimHelper.isSysAdmin(notification.post.createdBy) ? "" : notification.associateUser.fullname + " ") +
        notification.description;
    });

    //TODo: move fixed value to constants
    let minHeight = this.notifications.length * 120 + "px";
    this._layoutActions.minHeight(minHeight);
  }

  ngOnInit() {
    this.dataLoading = true;
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
          this._notificationService
            .getItemsByUser(this._user.id)
            .pipe(takeUntil(this._destructor$))
            .subscribe(response => {
              if (response && response.error) {
                this._snackbar.error("Unable to read notifications");
              } else {
                this._loadingBar.complete();
                this._loadData(response);
              }
            });
        }
      });
  }

  removeNotification(id: number) {
    this._dialog
      .open(ModelDialogComponent, {
        width: "500px",
        maxHeight: "500px",
        data: { name: "Remove Notification? ", okName: "Remove" }
      })
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(() => {
          this.notifications = this.notifications.filter(item => item.id !== id);
          return this._notificationService.deleteNotificationItem(id.toString()).pipe(takeUntil(this._destructor$));
        })
      )
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error(response.statusText);
        } else {
          this._snackbar.success("Notification removed");
        }
      });
    if (this.notifications.length === 0 && this.isMobile) {
      this._router.navigateByUrl("/");
    }
  }

  clearNotificationItems() {
    this._notificationService
      .clearNotificationItems(this._user.id)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (response && response.error) {
          this._snackbar.error("Error while clearing notifications");
        } else {
          this.notifications = [];
          this._snackbar.success("Cleared all notifications");
        }
      });
  }

  goToEntity(notificationPost: NotificationItem) {
    let navigateUrl: string;

    switch (notificationPost.post.type) {
      case PostType.Inspection:
        navigateUrl = `/inspection/${notificationPost.post.entityId}`;
        break;
      case PostType.Promotion:
        navigateUrl = `/promotion/${notificationPost.post.entityId}`;
        break;
      case PostType.Review:
        navigateUrl = `/review/view/${notificationPost.post.entityId}`;
        break;
      default:
        navigateUrl = `/post/view/${notificationPost.post.id}`;
        break;
    }

    this._router.navigate([navigateUrl]);
  }

  goToProperty(propertyId: number) {
    this._router.navigate([`/property/${propertyId}`]);
  }

  getMoreItems($event) {
    if (this.isMobile && this._router.url.indexOf("/notifications") === -1) {
      return;
    }

    if ($event && this._paging) {
      if (this.notifications.length < this._paging.recordCount && this._scrolling) {
        this._scrolling = false;
        this._notificationService
          .getItemsByUser(this._user.id, {
            maxId: this._paging.maxId
          })
          .pipe(takeUntil(this._destructor$))
          .subscribe(response => {
            if (response && response.error) {
              this._snackbar.error("Unable to read notifications");
            } else {
              this._loadData(response);
            }
            this._scrolling = true;
          });
      }
    }
  }
}
