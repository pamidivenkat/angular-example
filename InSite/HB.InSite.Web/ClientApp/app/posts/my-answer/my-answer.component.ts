import { select } from "@angular-redux/store";
import { Component, Input, OnInit } from "@angular/core";
import { NgxGalleryImage, NgxGalleryOptions } from "ngx-gallery";
import { Observable } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";

import { Answer } from "../../core/models/answer";
import { BaseComponent } from "../../shared/base-component";

@Component({
  selector: "app-my-answer",
  templateUrl: "./my-answer.component.html",
  styleUrls: ["./my-answer.component.scss"]
})
export class MyAnswerComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _filePath: string;

  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;
  // End of Private Fields

  // Public properties
  public galleryOptions: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];

  @Input()
  answer: Answer;
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor() {
    super();

    this._settings$
      .pipe(
        takeUntil(this._destructor$),
        filter(setting => setting !== null)
      )
      .subscribe(settings => {
        this._filePath =
          settings.find(setting => setting.name === "BlobStorage:Path").value +
          "/" +
          settings.find(setting => setting.name === "BlobStorage:Container").value +
          "/";
      });
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {
    this.galleryOptions = [
      {
        width: "600px",
        height: "400px",
        thumbnailsColumns: 4
      },
      { image: false, thumbnailsRemainingCount: true, height: "100px" },
      { breakpoint: 500, width: "100%" }
    ];

    this.galleryImages = [];

    if (this.answer.attachments) {
      this.answer.attachments.map(attachment => {
        if (attachment.isImage) {
          this.galleryImages.push({
            small: this._filePath + attachment.fileIdentifier,
            big: this._filePath + attachment.fileIdentifier,
            medium: this._filePath + attachment.fileIdentifier
          });
        }
      });
    }
  }
  // End of public methods
}
