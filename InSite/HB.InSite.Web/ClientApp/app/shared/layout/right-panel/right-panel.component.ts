import { Component, OnInit } from "@angular/core";
import { BaseComponent } from "../../base-component";
import { MatTabChangeEvent } from "@angular/material";
import { Subject } from "rxjs";

@Component({
  selector: "app-right-panel",
  templateUrl: "./right-panel.component.html",
  styleUrls: ["./right-panel.component.scss"]
})
export class RightPanelComponent extends BaseComponent implements OnInit {
  // Private Fields
  // End of Private Fields

  // Public properties
  public notifications;

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
  ngOnInit() {}

  // End of public methods
}
