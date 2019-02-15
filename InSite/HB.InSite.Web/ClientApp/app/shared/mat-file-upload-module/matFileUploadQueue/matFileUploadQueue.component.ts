import { HttpHeaders, HttpParams } from "@angular/common/http";
import {
  Component,
  ContentChildren,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  QueryList
} from "@angular/core";
import { MatDialog } from "@angular/material";
import { merge, Subscription } from "rxjs";
import { startWith } from "rxjs/operators";

import { ModelDialogComponent } from "../../components/model-dialog/model-dialog.component";
import { MatFileUpload } from "./../matFileUpload/matFileUpload.component";

/**
 * A material design file upload queue component.
 */
@Component({
  selector: "mat-file-upload-queue",
  templateUrl: `matFileUploadQueue.component.html`,
  // exportAs: 'matFileUploadQueue',
  styleUrls: ["./../matFileUploadQueue.scss"]
})
export class MatFileUploadQueue implements OnDestroy {
  @ContentChildren(forwardRef(() => MatFileUpload))
  fileUploads: QueryList<MatFileUpload>;

  /** Subscription to remove changes in files. */
  private _fileRemoveSubscription: Subscription | null;

  /** Subscription to changes in the files. */
  private _changeSubscription: Subscription;

  /** Combined stream of all of the file upload remove change events. */
  get fileUploadRemoveEvents() {
    return merge(...this.fileUploads.map(fileUpload => fileUpload.removeEvent));
  }

  private _files: Array<any> = [];

  /* Http request input bindings */
  get files() {
    return this._files;
  }
  set files(value: Array<any>) {
    this._files = value;
  }

  get viewType() {
    return this.fileUploads.first && this.fileUploads.first.displayType;
  }

  @Input()
  httpUrl: string;

  @Input()
  httpRequestHeaders:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      } = new HttpHeaders()
    .set("cache-control", "no-cache")
    .set("Authorization", `Bearer ${localStorage.getItem("adal.idtoken")}`);

  @Input()
  httpRequestParams:
    | HttpParams
    | {
        [param: string]: string | string[];
      } = new HttpParams();

  @Input()
  fileAlias: string = "file";

  @Output()
  allFilesRemoved = new EventEmitter();

  constructor(private _dialog: MatDialog) {}

  ngAfterViewInit() {
    // When the list changes, re-subscribe
    this._changeSubscription = this.fileUploads.changes.pipe(startWith(null)).subscribe(() => {
      if (this._fileRemoveSubscription) {
        this._fileRemoveSubscription.unsubscribe();
      }
      this._listenTofileRemoved();
    });
  }

  private _listenTofileRemoved(): void {
    this._fileRemoveSubscription = this.fileUploadRemoveEvents.subscribe((event: MatFileUpload) => {
      this._files.splice(event.id, 1);
    });
  }

  add(file: any) {
    this._files.push(file);
  }

  public uploadAll() {
    this.fileUploads.forEach(fileUpload => {
      //Upload files with no identifier and no validation errors.
      if (fileUpload.canUpload && !fileUpload.file.fileIdentifier) {
        fileUpload.upload();
      }
    });
  }

  public removeAll() {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "320px",
      data: {
        name: "Are you sure you want to delete all pending attachments?",
        okName: "Yes",
        type: "notification"
      }
    });
    dialogRef
      .afterClosed()
      .pipe()
      .subscribe(result => {
        if (result) {
          let files = this.fileUploads.toArray();
          for (let index = files.length - 1; index >= 0; index--) {
            if (!files[index].isPreview) {
              files[index].removePending();
            }
          }
        }
      });
  }

  ngOnDestroy() {
    if (this._files && this._files.length > 0) {
      this._files.splice(0, this._files.length);
    }
  }
}
