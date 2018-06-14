
export function getPictureUrl(pictureId: string, cid: string, isSystemDocument: boolean = false, isHazard: boolean = false): string {
  if (isSystemDocument) {
    return pictureId && pictureId != "00000000-0000-0000-0000-000000000000" ? "/filedownload?documentId=" + pictureId + "&isSystem=true" : (isHazard ? "/assets/images/hazard-default.png" : "/assets/images/default-icon-32x32.png");
  } else if (cid) {
    return pictureId && pictureId != "00000000-0000-0000-0000-000000000000" ? "/filedownload?documentId=" + pictureId + "&cid=" + cid : (isHazard ? "/assets/images/hazard-default.png" : "/assets/images/default-icon-32x32.png");
  } else {
    return pictureId && pictureId != "00000000-0000-0000-0000-000000000000" ? "/filedownload?documentId=" + pictureId : (isHazard ? "/assets/images/hazard-default.png" : "/assets/images/default-icon-32x32.png");
  }
}