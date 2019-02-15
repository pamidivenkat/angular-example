import { PostType } from "../../core/models/post";

export class CommonHelpers {
  static getRandomNumber(): number {
    return Math.ceil(Math.random() * 10);
  }

  static EnumToArray(value: any, isString?: boolean): Array<any> {
    let objectKeys = Object.keys(value);
    let objectArray = [];
    const enumLength = isString ? objectKeys.length : objectKeys.length / 2;
    for (let i = 0; i < enumLength; i++) {
      objectArray.push({
        value: isString ? objectKeys[i] : +objectKeys[i],
        name: isString ? value[objectKeys[i]] : objectKeys[enumLength + i]
      });
    }
    return objectArray;
  }

  static getTypeByName(name: string): number {
    switch (name) {
      case "insights":
      case "insight":
        return PostType.Insight;
      case "reviews":
      case "review":
        return PostType.Review;
      case "questions":
      case "question":
        return PostType.Question;
      case "inspections":
      case "inspection":
        return PostType.Inspection;
      case "promotions":
      case "promotion":
        return PostType.Promotion;
      default:
        return 0;
    }
  }

  static getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  static gotoPage(postType: PostType, id: number, isEdit?: boolean): string {
    let navigateUrl: string = "/";
    switch (postType) {
      case PostType.Insight:
      case PostType.Question:
        navigateUrl = `/post/${isEdit ? "update" : "view"}/${id}`;
        break;
      case PostType.Review:
        navigateUrl = `/review/${isEdit ? "update" : "view"}/${id}`;
        break;
      case PostType.Inspection:
        navigateUrl = `/inspection/${id}`;
        break;
      case PostType.Promotion:
        navigateUrl = `/promotion/${id}`;
        break;
    }
    return navigateUrl;
  }

  static _getOrientation(file, callback) {
    if (file.fileIdentifier) return;
    var reader = new FileReader();

    reader.onload = event => {
      let view = new DataView((<any>event.target).result);
      if (view.getUint16(0, false) != 0xffd8) {
        return callback(-2);
      }

      let length = view.byteLength;
      let offset = 2;

      while (offset < length) {
        let marker = view.getUint16(offset, false);
        offset += 2;

        if (marker == 0xffe1) {
          if (view.getUint32((offset += 2), false) != 0x45786966) {
            return callback(-1);
          }

          let little = view.getUint16((offset += 6), false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          let tags = view.getUint16(offset, little);
          offset += 2;

          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) == 0x0112) {
              return callback(view.getUint16(offset + i * 12 + 8, little));
            }
          }
        } else if ((marker & 0xff00) != 0xff00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      return callback(-1);
    };

    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  }

  static _getBase64(file, orientation) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      var base64 = reader.result;
      this._resetOrientation(base64, orientation, resetBase64Image => {
        return resetBase64Image;
      });
    };
  }

  static _resetOrientation(srcBase64, srcOrientation, callback) {
    var img = new Image();

    img.onload = () => {
      var width = img.width,
        height = img.height,
        canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d");

      // set proper canvas dimensions before transform & export
      if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      // transform context before drawing image
      switch (srcOrientation) {
        case 2:
          ctx.transform(-1, 0, 0, 1, width, 0);
          break;
        case 3:
          ctx.transform(-1, 0, 0, -1, width, height);
          break;
        case 4:
          ctx.transform(1, 0, 0, -1, 0, height);
          break;
        case 5:
          ctx.transform(0, 1, 1, 0, 0, 0);
          break;
        case 6:
          ctx.transform(0, 1, -1, 0, height, 0);
          break;
        case 7:
          ctx.transform(0, -1, -1, 0, height, width);
          break;
        case 8:
          ctx.transform(0, -1, 1, 0, 0, width);
          break;
        default:
          break;
      }

      // draw image
      ctx.drawImage(img, 0, 0);

      // export base64
      callback(canvas.toDataURL());
    };

    img.src = srcBase64;
  }
}
