import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { BaseComponent } from "../../base-component";
import { SnackbarService } from "../../../core/services/snackbar.service";

@Component({
  selector: "app-model-dialog",
  templateUrl: "./model-dialog.component.html",
  styleUrls: ["./model-dialog.component.scss"]
})
export class ModelDialogComponent extends BaseComponent {
  // Private Fields
  private _showFolders: boolean;
  private _selectedFolder: number;
  private _icon: string;
  private _hideNo: boolean = false;
  // End of Private Fields

  // Public properties
  dontAsk: boolean = false;
  newFolder: string;
  result: any;
  folders: Array<any>;

  get showFolders(): boolean {
    return this._showFolders;
  }
  // get folders(): Array<any> {
  //   return this._folders;
  // }
  get selectedFolder(): number {
    return this._selectedFolder;
  }
  get icon(): string {
    return this._icon;
  }
  get hideNo(): boolean {
    return this._hideNo;
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
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModelDialogComponent>,
    private _snackbarService: SnackbarService
  ) {
    super();
    this.result = false;

    if (data.type == "bookmark") {
      this._showFolders = true;
      this._icon = "bookmark";
    } else {
      this._showFolders = false;
    }

    if (data.type == "notification") {
      this._icon = "notification";
    }

    this._hideNo = data.hideNo;

    this.folders = data.folders;
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  selectFolder(event) {
    this._selectedFolder = event ? event.id : null;
  }

  closeDialog() {
    if (this.data.okName === "Move" || this.data.okName === "Add") {
      if (this._selectedFolder === undefined || this._selectedFolder === null) {
        this._snackbarService.error("Select a folder");
        return;
      }
      this.result = this._selectedFolder;
    } else {
      this.result = true;
    }
    this.dialogRef.close(this.result);
  }

  cancelDialog() {
    this.result = false;
    this.dialogRef.close(this.result);
  }
  // End of public methods
}
