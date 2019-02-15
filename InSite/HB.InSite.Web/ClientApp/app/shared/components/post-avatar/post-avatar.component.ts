import { Component, Input, OnInit } from "@angular/core";

import { PostType } from "../../../core/models/post";
import * as constants from "./../../../app.constants";

@Component({
  selector: "app-post-avatar",
  templateUrl: "./post-avatar.component.html",
  styleUrls: ["./post-avatar.component.scss"]
})
export class PostAvatarComponent implements OnInit {
  @Input()
  type: any;
  @Input()
  userImage: string;
  @Input()
  isBookmark: boolean = false;

  public path: string;
  public iconColor: string;
  public isIconAvatar: boolean = false;
  public avatarIcon: string = "";
  public overlayIcon: string = "";

  constructor() {}

  ngOnInit() {
    if (this.userImage && this.userImage.startsWith("http")) {
      this.path = this.userImage;
    } else {
      //TODO: move to const file.
      this.path = "Clientapp/dist/assets/user.png";
    }

    switch (this.type) {
      case PostType.Inspection:
        this.iconColor = constants.POST_COLORS.INSPECTION;
        break;
      case PostType.Insight:
        this.iconColor = constants.POST_COLORS.INSIGHT;
        break;
      case PostType.Promotion:
        this.iconColor = constants.POST_COLORS.PROMOTION;
        this.isIconAvatar = true;
        this.avatarIcon = "attach_money";
        break;
      case PostType.Question:
      case 0: //For Answer
        this.iconColor = constants.POST_COLORS.QUESTION;
        break;
      case PostType.Review:
        this.iconColor = constants.POST_COLORS.REVIEW;
        break;
      case PostType.Venue:
        this.iconColor = constants.POST_COLORS.VENUE;
        this.isIconAvatar = true;
        this.avatarIcon = "hotel";
        break;
      case PostType.CVB:
        this.iconColor = constants.POST_COLORS.CVB;
        this.isIconAvatar = true;
        this.avatarIcon = "place";
        break;
      case "request": //Review Request
        this.iconColor = constants.POST_COLORS.REQUEST;
        break;
      default:
        this.iconColor = "auto";
        break;
    }
  }
}
