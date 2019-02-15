import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from "@angular/core";

import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-user-avatar",
  templateUrl: "./user-avatar.component.html",
  styleUrls: ["./user-avatar.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class UserAvatarComponent extends BaseComponent implements OnInit, OnChanges {
  // Private Fields
  path: string;
  private _imageSize: string = "medium";
  private _userImage: string;
  // End of Private Fields

  // Public properties
  @Input("userImage")
  set userImage(value: string) {
    this._userImage = value;
  }
  get userImage(): string {
    return this._userImage;
  }

  @Input("imageSize")
  set imageSize(value: string) {
    this._imageSize = value;
  }
  get imageSize(): string {
    return this._imageSize;
  }

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
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {
    if (this._userImage && this._userImage.startsWith("http")) {
      this.path = this._userImage;
    } else {
      this.path = "Clientapp/dist/assets/user.png";
    }

    if (!this._imageSize) {
      this._imageSize = "medium";
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.path = changes.userImage.currentValue;
  }

  // End of public methods
}
