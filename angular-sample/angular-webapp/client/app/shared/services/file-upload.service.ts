import { RouteParams } from './route-params';
import { AuthorizationService } from '../security/authorization.service';
import { ClaimsHelperService } from '../helpers/claims-helper';
import { FileUploader, FileItem } from 'ng2-file-upload';

import { isNullOrUndefined, puts } from 'util';
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import { Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromConstants from '../app.constants';

/**
 * File Upload Service
 * 
 * @export
 * @class FileUploadService
 */
@Injectable()
export class FileUploadService {
  constructor(private _claimsHelper: ClaimsHelperService, private _authService: AuthorizationService, private _routeParams: RouteParams) {

  }

  public Upload(document: any, file: File): Promise<any> {
    return new Promise<any>((fulfill, reject) => {
      let fileQueue: Array<FileUploadQueue> = new Array<FileUploadQueue>();
      let url = this.extractFileModel(document);
      let uploader = new FileUploader({ url: fromConstants.apiUrl + url, authToken: 'Bearer ' + this._authService.GetToken(), authTokenHeader: 'Authorization' });
      uploader.addToQueue([file], {});
      uploader.uploadAll();
      uploader.onSuccessItem = (item: FileItem, response: string, status: number) => {
        fulfill(JSON.parse(response));
      }
      uploader.onErrorItem = (item: FileItem, response: string, status: number) => {
        reject(response);
      }
    });
  }

  private extractFileModel(document: any): string {
    let cid: string = this._routeParams.Cid;
    let url: string = !isNullOrUndefined(cid) ? ('Upload?uploadDocument=true&cid=' + cid) : ('Upload?uploadDocument=true');
    let file: File;
    for (let key in document) {
      if (key !== 'File' && !isNullOrUndefined(document[key])) {
        url = url + '&' + key + '=' + document[key];
      }
    }
    return url;
  };
}

export class FileUploadQueue {
  File: File;
  Status: number;
  Response: string;
  constructor(file: File, status: number, response: string) {
    this.File = file;
    this.Status = status;
    this.Response = response;
  }
}