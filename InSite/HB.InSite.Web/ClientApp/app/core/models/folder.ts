export class FolderNode {
  id: number;
  children: FolderNode[];
  folderName: string;
  parentId: number;
}

export class FolderFlatNode {
  id: number;
  folderName: string;
  level: number;
  expandable: boolean;
}
