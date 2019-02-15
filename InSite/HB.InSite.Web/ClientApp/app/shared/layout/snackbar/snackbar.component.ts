import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Inject,
  ViewEncapsulation
} from "@angular/core";
import { Observable } from "rxjs";
import { BaseComponent } from "../../base-component";
import { MatSnackBarConfig, MAT_SNACK_BAR_DATA } from "@angular/material";
import { SnackbarService } from "../../../core/services/snackbar.service";

@Component({
  selector: "app-snackbar",
  templateUrl: "./snackbar.component.html",
  styleUrls: ["./snackbar.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class SnackbarComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _snackbarMessage: string;
  private _messageType: string;
  // End of Private Fields

  // Public properties
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
    super();
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {}

  close() {}

  checkSnackbarType(type: string): boolean {
    return this._messageType === type;
  }
  // End of public methods
}
