import { select } from "@angular-redux/store";
import { Location } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { Folder } from "../../../core/models/bookmark";
import { BaseComponent } from "../../base-component";

@Component({
  selector: "app-manage-folders",
  templateUrl: "./manage-folders.component.html",
  styleUrls: ["./manage-folders.component.scss"]
})
export class ManageFoldersComponent extends BaseComponent implements OnInit {
  @select(["identity", "userFolders"])
  private _folders$: Observable<Array<Folder>>;

  folders: Array<any>;

  constructor(private _location: Location) {
    super();
    this._folders$.pipe(takeUntil(this._destructor$)).subscribe(folders => {
      this.folders = folders instanceof HttpErrorResponse ? [] : folders;
    });
  }

  ngOnInit() {}
  close() {
    this._location.back();
  }
}
