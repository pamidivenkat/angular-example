import { Post } from "./post";
import { Property } from "./property";

export class Bookmark {
  id: number;
  folderId: number;
  entityId: number;
  associateId: number;
  createdOn: Date;
  type: number;
  post: Post;
  folder: Folder;
  property: Property;
}

export class Folder {
  id: number;
  name: string;
  parentId: number;
  associateId: string;
  activeStatus: number;
  children: Array<Folder>;
}
