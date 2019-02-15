import { Injectable } from "@angular/core";
import { DataService } from "./data.service";
import { Comment } from "../models/comment";
import { Observable } from "rxjs/Rx";

@Injectable()
export class CommentService {
  constructor(private _dataService: DataService) {}

  createComment(comment: Comment): Observable<any> {
    return this._dataService.post("comments", comment);
  }

  updateComment(comment: Comment): Observable<any> {
    return this._dataService.put("comments/" + comment.id, comment);
  }

  deleteComment(id: string) {
    return this._dataService.delete("comments", id);
  }
}
