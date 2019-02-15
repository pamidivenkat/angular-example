import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material";

import { SnackbarComponent } from "../../shared/layout/snackbar/snackbar.component";
import { SnackbarType } from "./../models/snackbar-type";

@Injectable()
export class SnackbarService {
  constructor(private _snackbar: MatSnackBar) {}

  public success(message: string, type?: SnackbarType) {
    this._snackbar.openFromComponent(SnackbarComponent, {
      verticalPosition: "top",
      duration: 5000,
      panelClass: type ? type.toString() : "success",
      data: {
        message: message,
        type: type
      }
    });
  }

  public error(message: string) {
    this._snackbar.open(message, "Close", {
      duration: 20000,
      panelClass: "error-message",
      verticalPosition: "top"
    });
  }

  public close() {
    this._snackbar.dismiss();
  }
}
