import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { FolderNode } from "../models/folder";

@Injectable({
  providedIn: "root"
})
export class MatTreeService {
  private _folders;
  private _foldersArray: Array<any> = [];

  dataChange: BehaviorSubject<FolderNode[]> = new BehaviorSubject<FolderNode[]>([]);

  get data(): FolderNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this._folders = [];
  }

  private _jsonToArray(bookmarksList: Array<any>) {
    let folders = [];
    bookmarksList.map(bookmark => {
      bookmark.children = [];
      folders[bookmark.id] = bookmark;
      let parent = bookmark.parentId !== null ? bookmark.parentId : "-";

      if (!folders[parent]) {
        folders[parent] = { children: [] };
      }
      folders[parent].children.push(bookmark);
    });
    this._folders = folders["-"] && folders["-"].children ? folders["-"].children : [];
  }

  private _buildFolderTree(folders: Array<any>, level: number): Array<FolderNode> {
    let data: any[] = [];
    folders.map(folder => {
      let id = folder.id;
      let node = new FolderNode();
      node.id = id;
      node.folderName = folder.name;
      node.parentId = folder.parentId;
      if (folder.children.length > 0) {
        node.children = this._buildFolderTree(folder.children, level + 1);
      }

      data.push(node);
    });

    return data;
  }

  public initialize(folders) {
    this._foldersArray = folders;
    this._jsonToArray(this._foldersArray);
    const data = this._buildFolderTree(this._folders, 0);
    this.dataChange.next(data);
  }

  public insertItem(parent: FolderNode, name: string) {
    let child: FolderNode = new FolderNode();
    child.folderName = name;
    child.parentId = parent.id;
    if (parent.children) {
      parent.children.push(child);
    } else {
      parent.children = [child];
    }
    this.dataChange.next(this.data);
  }

  public updateItem(node: FolderNode, name: string) {
    node.folderName = name;
    let index = this._foldersArray.findIndex(folder => folder.id === node.id);
    if (index > 0) {
      this._foldersArray[index] = {
        id: node.id,
        name: node.folderName,
        parentId: node.parentId
      };
    } else {
      this._foldersArray.push({
        id: node.id,
        name: node.folderName,
        parentId: node.parentId
      });
    }

    this._jsonToArray(this._foldersArray);
    this.dataChange.next(this.data);
  }

  private _findAndRemove(folderTree: FolderNode[], node: FolderNode) {
    const parentIndex = folderTree.findIndex(parent => parent.folderName === node.folderName);

    if (parentIndex !== -1) {
      folderTree.splice(parentIndex, 1);
      return;
    }

    for (let index in folderTree) {
      const children = folderTree[index].children;
      if (!children) {
        continue;
      }
      const nodeIndex = children.findIndex(child => child.folderName === node.folderName);

      if (nodeIndex === -1) {
        this._findAndRemove(children, node);
      } else {
        folderTree[index].children.splice(nodeIndex, 1);
        return;
      }
    }
  }

  public removeItem(node: FolderNode) {
    this._findAndRemove(this.data, node);
    this.dataChange.next(this.data);
  }

  public setFolders(folders) {
    this._folders = folders;
  }

  public insertParentItem(parent: FolderNode) {
    this.data.push(parent);
    this._foldersArray.push({
      id: parent.id,
      name: parent.folderName,
      parentId: 0
    });
    this._jsonToArray(this._foldersArray);
    this.dataChange.next(this.data);
  }

  public removeParentItem(node: FolderNode) {
    let index = this.data.findIndex(n => n.id == node.id);
    this.data.splice(index);
    index = this._foldersArray.findIndex(n => n.id == node.id);
    this._foldersArray.splice(index);
    this._jsonToArray(this._foldersArray);
    this.dataChange.next(this.data);
  }
}
