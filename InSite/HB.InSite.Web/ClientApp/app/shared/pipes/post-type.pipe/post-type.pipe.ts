import { Pipe, PipeTransform } from "@angular/core";

import { PostType } from "./../../../core/models/post";
import * as constants from "./../../../app.constants";

@Pipe({ name: "postType" })
export class PostTypePipe implements PipeTransform {
  transform(postTypeId: number) {
    if (postTypeId == 0) {
      return "Answer";
    }
    if (postTypeId == PostType.Venue) {
      return "Venue/CVB";
    }
    return PostType[postTypeId];
  }
}

@Pipe({ name: "postIcon" })
export class PostTypeIconPipe implements PipeTransform {
  transform(postTypeId: number) {
    return this.getIcon(postTypeId as PostType);
  }

  getIcon(type) {
    switch (type) {
      case PostType.Insight:
        return "info";
      case PostType.Review:
        return "stars";
      case PostType.Question:
        return "help";
      case PostType.Inspection:
        return "offline_pin";
      case PostType.Promotion:
        return "monetization_on";
      case "request": //Review request
        return "swap_vertical_circle";
      case 0: //Answer
        return "supervised_user_circle";
      default:
        return "info";
    }
  }
}

@Pipe({ name: "postColor" })
export class PostTypeColorPipe implements PipeTransform {
  transform(postTypeId: number) {
    return this.getColor(postTypeId as PostType);
  }

  getColor(type: PostType) {
    switch (type) {
      case PostType.Insight:
        return constants.POST_COLORS.INSIGHT;
      case PostType.Review:
        return constants.POST_COLORS.REVIEW;
      case PostType.Question:
        return constants.POST_COLORS.QUESTION;
      case PostType.Inspection:
        return constants.POST_COLORS.INSPECTION;
      case PostType.Promotion:
        return constants.POST_COLORS.PROMOTION;
      default:
        return constants.POST_COLORS.QUESTION;
    }
  }
}

// @Pipe({ name: "notification" })
// export class PostTypeNotification implements PipeTransform {
//   transform(postTypeId: number) {
//     switch (postTypeId) {
//       case 3:
//         return " has added a commented to a post you are following";
//       case PostType.Review:
//         return " has just reviewed";
//       case PostType.Question:
//         return " has just answered a question";
//       case PostType.Inspection:
//         return " has just inspected";
//       case PostType.Promotion:
//         return " has added promotion";
//       case PostType.Insight:
//       default:
//         return "has posted insight";
//     }
//   }
// }
