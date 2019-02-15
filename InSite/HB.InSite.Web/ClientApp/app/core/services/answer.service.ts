import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Answer, Reply } from "../models/answer";
import { DataService } from "./data.service";

const ANSWER_API = "answers";
const REPLY_API = "replies";

@Injectable()
export class AnswerService {
  constructor(private _dataService: DataService) {}

  public createAnswer(answer: Answer): Observable<any> {
    return this._dataService.post(ANSWER_API, answer);
  }

  public updateAnswer(answer: Answer): Observable<any> {
    return this._dataService.put(ANSWER_API + "/" + answer.answerId, answer);
  }

  public deleteAnswer(answerId: number) {
    return this._dataService.delete(ANSWER_API, answerId.toString());
  }

  public getAnswerById(id: number): Observable<any> {
    return this._dataService.get(ANSWER_API + "/" + id);
  }

  public saveReply(reply: Reply): Observable<any> {
    return this._dataService.post(REPLY_API, reply);
  }

  public updateReply(reply: Reply): Observable<any> {
    return this._dataService.put(REPLY_API + "/" + reply.id, reply);
  }

  public deleteReply(replayId: number): Observable<any> {
    return this._dataService.delete(REPLY_API, replayId.toString());
  }
}
