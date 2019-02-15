import { select } from "@angular-redux/store";
import { Component, Input, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Observable, Subject } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";

import { PostType } from "../../../core/models/post";
import { SnackbarType } from "../../../core/models/snackbar-type";
import { User } from "../../../core/models/user";
import { NotificationService } from "../../../core/services/notification.service";
import { SnackbarService } from "../../../core/services/snackbar.service";
import { BaseComponent } from "../../base-component";
import { ModelDialogComponent } from "../model-dialog/model-dialog.component";
import { Notification } from "./../../../core/models/notification";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"]
})
export class NotificationComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _notificationId: number;
  // End of Private Fields

  // Public properties
  isSubscribed: boolean;
  showDialog: boolean;
  title: string;

  @Input()
  showLabel: boolean;
  @Input()
  entity: any;
  @Input()
  entitySubject: Subject<any>;
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _dialog: MatDialog,
    private _notificationService: NotificationService,
    private _snackbarService: SnackbarService
  ) {
    super();
    this.isSubscribed = false;
  }
  // End of constructor

  // Private methods
  private _addNotification(dialogRef: MatDialogRef<ModelDialogComponent, any>) {
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._destructor$))
      .filter(result => result)
      .map(result => {
        let notification = new Notification();
        notification.associateId = 0;
        notification.entityId = this.entity.id ? this.entity.id : this.entity.propertyId;
        notification.postType = this.entity.type
          ? this.entity.type
          : this.entity.propertyChainId === "100325" && !this.entity.isInternalOnly
            ? //    &&
              //this.entity.propertyAdvanceEligible
              PostType.CVB
            : PostType.Venue;
        notification.active = true;
        return notification;
      })
      .switchMap(notification => {
        return this._notificationService.createNotification(notification);
      })
      .subscribe(response => {
        this._notificationId = response.id;
        this.isSubscribed = true;
        this._snackbarService.success("Notification added", SnackbarType.Success);
      });
  }

  private _removeNotification(dialogRef: MatDialogRef<ModelDialogComponent, any>) {
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._destructor$))
      .filter(result => result)
      .switchMap(() => this._notificationService.deleteNotification(this._notificationId.toString()))
      .subscribe(response => {
        if (response && response.error) {
          this._snackbarService.error("Unable to subscribe notifications");
        } else {
          this.isSubscribed = false;
          this._notificationId = null;
          this._snackbarService.success("Unsubscribed from notifications", SnackbarType.Success);
        }
      });
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._notificationId = this.entity.notificationId;
    this.isSubscribed = this._notificationId ? true : false;

    if (this.entitySubject) {
      this.entitySubject.pipe(distinctUntilChanged()).subscribe(data => {
        this._notificationId = data.notificationId;
        this.isSubscribed = this._notificationId ? true : false;
      });
    }
  }

  showNotification() {
    let title = "Turn on notifications for this item?";
    let btnName = "Yes";

    if (this.isSubscribed) {
      title = "Turn off notifications for this item?";
    }

    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "320px",
      data: { name: title, okName: btnName, type: "notification" }
    });

    this._notificationId ? this._removeNotification(dialogRef) : this._addNotification(dialogRef);
  }
  // End of public methods
}
