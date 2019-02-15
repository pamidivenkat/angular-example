import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";

import { PostType } from "../../../core/models/post";

@Component({
  selector: "app-post-mini",
  templateUrl: "./post-mini.component.html",
  styleUrls: ["./post-mini.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class PostMiniComponent implements OnInit {
  @Input()
  posts;

  constructor(private _router: Router) {}

  ngOnInit() {}
  getType(typeId: number): string {
    return PostType[typeId];
  }

  gotoPage(postType: PostType, id: number) {
    let navigateUrl: string = "/";
    switch (postType) {
      case PostType.Insight:
      case PostType.Question:
        navigateUrl = `/post/view/${id}`;
        break;
      case PostType.Review:
        navigateUrl = `/review/view/${id}`;
        break;
      case PostType.Inspection:
        navigateUrl = `/inspection/${id}`;
        break;
      case PostType.Promotion:
        navigateUrl = `/promotion/${id}`;
        break;
    }

    this._router.navigateByUrl(navigateUrl);
  }
}
