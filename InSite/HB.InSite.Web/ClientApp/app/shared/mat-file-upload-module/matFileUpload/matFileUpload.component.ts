import { select } from "@angular-redux/store";
import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from "@angular/common/http";
import { Component, EventEmitter, forwardRef, Inject, Input, OnChanges, OnDestroy, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";

import { ModelDialogComponent } from "../../components/model-dialog/model-dialog.component";
import { MatFileUploadQueue } from "../matFileUploadQueue/matFileUploadQueue.component";
import { BytesPipe } from "./../bytes.pipe";

/**
 * A material design file upload component.
 */
@Component({
  selector: "mat-file-upload",
  templateUrl: `./matFileUpload.component.html`,
  exportAs: "matFileUpload",
  host: {
    class: "mat-file-upload"
  },
  styleUrls: ["./../matFileUploadQueue.scss"]
})
export class MatFileUpload implements OnDestroy, OnChanges {
  fileType: string;
  _matFileUploadQueue: any;

  public listView: boolean = false;
  private _isUploading: boolean = false;
  private _isPreview: boolean = false;
  private bytesPipe: BytesPipe = new BytesPipe();
  public fileContent: any;
  private _orientation: number = 0;

  @select(["settings", "values"])
  settings$: Observable<Array<any>>;

  constructor(
    private HttpClient: HttpClient,
    @Inject(forwardRef(() => MatFileUploadQueue)) public matFileUploadQueue: MatFileUploadQueue,
    private _dialog: MatDialog
  ) {
    if (!this.filePath) {
      this.settings$.pipe().subscribe(settings => {
        this.filePath =
          settings.find(setting => setting.name === "BlobStorage:Path").value +
          "/" +
          settings.find(setting => setting.name === "BlobStorage:Container").value +
          "/";
      });
    }
    if (matFileUploadQueue) {
      this._matFileUploadQueue = matFileUploadQueue;
    }
  }

  ngOnChanges(changes: any): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

    this.httpUrl = this._matFileUploadQueue.httpUrl || this.httpUrl;
    this.httpRequestHeaders = this._matFileUploadQueue.httpRequestHeaders || this.httpRequestHeaders;
    this.httpRequestParams = this._matFileUploadQueue.httpRequestParams || this.httpRequestParams;
    this.fileAlias = this._matFileUploadQueue.fileAlias || this.fileAlias;
    this.canUpload = this.total <= this.maxSize && this.id < this.maxFiles && !this.file.postId;

    if (this.id >= this.maxFiles) {
      this._errorMessage = " Max files allowed " + this.maxFiles + ". ";
    }

    if (this.total > this.maxSize) {
      this._errorMessage =
        " Max file size " +
        this.bytesPipe.transform(this.maxSize) +
        ", current file size " +
        this.bytesPipe.transform(this.total) +
        ".";
    }

    setTimeout(() => {}, 50);

    if (this._file.fileIdentifier) {
      this._isPreview = true;
      this._isUploading = false;
      if (this.fileUploadSubscription) {
        this.fileUploadSubscription.unsubscribe();
      }
    } else {
      this._file.fileName = "";
      this._file.fileIdentifier = "";
    }
  }

  @Input()
  maxFiles: number = 10;

  @Input()
  filePath: string;

  @Input()
  maxSize: number = 1000000; //1MB file size

  @Input()
  renderType: string = "Create";

  @Input()
  displayType: string;

  /* Http request input bindings */
  @Input()
  httpUrl: string = "/upload";

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

  @Input()
  allowedTypes: string = "file";

  @Input()
  get file(): any {
    // this._file = this._file ? this._file : { fileName: "", fileIdentifier: "" };
    return this._file;
  }
  set file(file: any) {
    this._file = file;
    if (file) {
      this._getOrientation(file, orientation => {
        this._orientation = orientation > 0 ? orientation : 0;
        this._getBase64(file, orientation);
      });
    }
    this.showPreview(file);
    this._total = this._file.size ? this._file.size : this._file.fileSize;
  }

  @Input()
  set id(id: number) {
    this._id = id;
  }
  get id(): number {
    return this._id;
  }

  get progressPercentage() {
    return this._progressPercentage;
  }

  get canUpload() {
    return this._canUpload;
  }

  set canUpload(canUpload: boolean) {
    this._canUpload = canUpload;
  }

  get errorMessage() {
    return this._errorMessage;
  }

  set errorMessage(errorMessage: string) {
    this._errorMessage = errorMessage;
  }

  get total() {
    return this._total;
  }

  @Input()
  set isPreview(value: boolean) {
    this._isPreview = value;
  }
  get isPreview() {
    return this._isPreview;
  }

  get isUploading() {
    return this._isUploading;
  }

  /** Output  */
  @Output()
  removeEvent = new EventEmitter<MatFileUpload>();
  @Output()
  onUpload = new EventEmitter();
  @Output()
  onUploadStart: EventEmitter<boolean> = new EventEmitter();

  private _progressPercentage: number = 0;
  public loaded: number = 0;
  private _total: number = 0;
  private _errorMessage: string = "";
  private _canUpload: boolean = false;
  private _file: any;
  private _id: number;
  private fileUploadSubscription: any;

  // private parseFileType = function (file){
  //     var type =  file.type;
  //     var name =  file.name;
  //     if(this.isImageType(type, name)){
  //         return "image";
  //     }else if(this.isVideoType(type, name)){
  //         return "video";
  //     }else if(this.isAudioType(type, name)){
  //         return "audio";
  //     }
  //     return "object";
  // };

  // public isImageType = function(type, name) {
  //     return (type.match('image.*') || name.match(/\.(gif|png|jpe?g)$/i)) ? true : false;
  // };

  // public isVideoType = function(type, name) {
  //     return (type.match('video.*') || name.match(/\.(og?|mp4|webm|3gp)$/i)) ? true : false;
  // };

  // public isAudioType = function(type, name) {
  //     return (type.match('audio.*') || name.match(/\.(ogg|mp3|wav)$/i)) ? true : false;
  // };

  get getFileUploadSubscription() {
    return this.fileUploadSubscription;
  }
  public showPreview(file): void {
    if (file.fileIdentifier) return;
    var reader = new FileReader();
    reader.onload = event => {
      // called once readAsDataURL is completed
      let fileContent = (<any>event.target).result;
      if (fileContent.startsWith("data:image")) {
        this.fileType = "image";
      } else {
        this.fileType = this.fileContent.split("data:")[1].split("/")[0];
      }

      if (this.allowedTypes === "image" && this.fileType !== "image") {
        this._errorMessage = "Only image type files allowed";
      }
    };
    //Imagepath.files[0] is blob type
    reader.readAsDataURL(file);
  }

  private _getBase64(file, orientation) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      var base64 = reader.result;
      this._resetOrientation(base64, orientation, resetBase64Image => {
        this.fileContent = resetBase64Image;
      });
    };
  }

  private _resetOrientation(srcBase64, srcOrientation, callback) {
    var img = new Image();

    img.onload = () => {
      var width = img.width,
        height = img.height,
        canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");

      // set proper canvas dimensions before transform & export
      if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      // transform context before drawing image
      switch (srcOrientation) {
        case 2:
          ctx.transform(-1, 0, 0, 1, width, 0);
          break;
        case 3:
          ctx.transform(-1, 0, 0, -1, width, height);
          break;
        case 4:
          ctx.transform(1, 0, 0, -1, 0, height);
          break;
        case 5:
          ctx.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx.transform(0, 1, -1, 0, height, 0);
          break;
        case 7:
          ctx.transform(0, -1, -1, 0, height, width);
          break;
        case 8:
          ctx.transform(0, -1, 1, 0, 0, width);
          break;
        default:
          break;
      }

      // draw image
      ctx.drawImage(img, 0, 0);

      // export base64
      callback(canvas.toDataURL());
    };

    img.src = srcBase64;
  }

  private _getOrientation(file, callback) {
    if (file.fileIdentifier) return;
    var reader = new FileReader();

    reader.onload = event => {
      let view = new DataView((<any>event.target).result);
      if (view.getUint16(0, false) != 0xffd8) {
        return callback(-2);
      }

      let length = view.byteLength;
      let offset = 2;

      while (offset < length) {
        let marker = view.getUint16(offset, false);
        offset += 2;

        if (marker == 0xffe1) {
          if (view.getUint32((offset += 2), false) != 0x45786966) {
            return callback(-1);
          }

          let little = view.getUint16((offset += 6), false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          let tags = view.getUint16(offset, little);
          offset += 2;

          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) == 0x0112) {
              return callback(view.getUint16(offset + i * 12 + 8, little));
            }
          }
        } else if ((marker & 0xff00) != 0xff00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      return callback(-1);
    };

    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  }

  public upload(): void {
    if (this._isPreview && !this._canUpload && this._errorMessage !== "") {
      return;
    }
    this.onUploadStart.emit(true);
    this._isUploading = true;
    // How to set the alias?

    let formData = new FormData();
    formData.append(this.fileAlias, this._file, this._file.name);
    formData.append("rotation", this._orientation.toString());
    this.fileUploadSubscription = this.HttpClient.post(this.httpUrl, formData, {
      headers: this.httpRequestHeaders,
      observe: "events",
      params: this.httpRequestParams,
      reportProgress: true,
      responseType: "json"
    }).subscribe(
      (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this._progressPercentage = Math.floor((event.loaded * 100) / event.total);
          this.loaded = event.loaded;
          this._total = event.total;
        } else if (event.type === HttpEventType.Response) {
          this._isPreview = true;
          this._canUpload = false;
          this.file = event.body;
          this.onUpload.emit({ file: this._file, event: event });
        }
      },
      (error: any) => {
        if (this.fileUploadSubscription) {
          this.fileUploadSubscription.unsubscribe();
        }
        this._progressPercentage = Math.floor((0 * 100) / this._file.size);
        this._isUploading = false;
        this._canUpload = true;
        this.onUpload.emit({ file: this._file, event: event });
      }
    );
  }

  public remove(askConfirmation: boolean = true): void {
    if (askConfirmation) {
      let dialogRef = this._dialog.open(ModelDialogComponent, {
        width: "320px",
        data: {
          name: "Are you sure you want to delete attachment?",
          okName: "Yes",
          type: "notification"
        }
      });
      dialogRef
        .afterClosed()
        .pipe()
        .subscribe(result => {
          if (result) {
            // if(this._isPreview) {
            //   this.HttpClient.delete(this.httpUrl, {
            //     headers: this.httpRequestHeaders,
            //     observe: "body",
            //     params: {data:JSON.stringify(this._file)},
            //     reportProgress: true,
            //     responseType: "json"
            //   }).subscribe(
            //     (event: any) => {
            //       if (event.type === HttpEventType.Response) {
            //         if (this.fileUploadSubscription) {
            //           this.fileUploadSubscription.unsubscribe();
            //         }
            //         this.removeEvent.emit(this);
            //       }
            //     },
            //     (error: any) => {
            //       console.log('unable to delete file', this._file);
            //     }
            //   );
            // } else {
            if (this.fileUploadSubscription) {
              this.fileUploadSubscription.unsubscribe();
            }
            this.removeEvent.emit(this);
            // }
          }
        });
    } else {
      if (this.fileUploadSubscription) {
        this.fileUploadSubscription.unsubscribe();
      }
      this.removeEvent.emit(this);
    }
  }

  public removePending() {
    this.removeEvent.emit(this);
  }

  public removeAttachment() {
    if (this.fileUploadSubscription) {
      this.fileUploadSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    // console.log("file " + this._file.name + " destroyed...");
  }
}
