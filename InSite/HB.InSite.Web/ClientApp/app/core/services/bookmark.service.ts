import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { distinctUntilChanged } from "rxjs/operators";
import { Observable } from "rxjs/Rx";

import { Bookmark, Folder } from "../models/bookmark";
import { DataService } from "./data.service";

const bookmarkAPI = "bookmarks";
const folderAPI = "bookmarkfolders";

@Injectable()
export class BookmarkService {
  public selectedFilters: Array<number>;
  public selectedFolderId: number;

  constructor(private _dataService: DataService) {}

  createBookmark(bookmark: Bookmark): Observable<any> {
    return this._dataService.post(bookmarkAPI, bookmark);
  }

  deleteBookmark(id: string): Observable<any> {
    return this._dataService.delete(bookmarkAPI, id);
  }

  updateBookmark(bookmark: Bookmark): Observable<any> {
    return this._dataService.put(`${bookmarkAPI}/${bookmark.id}`, bookmark);
  }

  createFolder(name: string, parentId: number = 0): Observable<any> {
    let folder = new Folder();
    folder.name = name;
    folder.activeStatus = 1;
    folder.parentId = parentId;
    return this._dataService.post(folderAPI, folder);
  }

  updateFolder(folderName: string, folderId: number): Observable<any> {
    return this._dataService.put(`${folderAPI}/${folderId}/${folderName}`);
  }

  deleteFolder(id: number): Observable<any> {
    return this._dataService.delete(folderAPI, id.toString());
  }

  getBookmarks(userId: string): Observable<any> {
    return this._dataService.get(`${bookmarkAPI}/byuserid/${userId}`);
  }

  getFolders(userId: string): Observable<any> {
    this._dataService
      .get(`${folderAPI}/user/${userId}`)
      .pipe(distinctUntilChanged())
      .subscribe(response => {
        if (!response || response.data instanceof HttpErrorResponse) {
          return [];
        } else {
          return response;
        }
      });
    return this._dataService.get(`${folderAPI}/user/${userId}`);
  }
}
