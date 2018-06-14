import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../shared/reducers/index';
import { RestClientService } from "../../shared/data/rest-client.service";
import { Observable } from "rxjs/Rx";
import { URLSearchParams } from '@angular/http';
import { isNullOrUndefined } from "util";
import { EmailModel } from "../../email-shared/models/email.model";
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { MessengerService } from '../../shared/services/messenger.service';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';

/**
 * @description
 * @class
 */
@Injectable()
export class EmailService {

  private _emailModel: EmailModel;
  constructor(private _store: Store<fromRoot.State>, private _data: RestClientService, private _messenger: MessengerService) {
  }

  getEmailTemplate(emailModel: EmailModel): Observable<EmailModel> {
    return this._data.post('email', emailModel)
      .map((res) => {
        this._emailModel = <EmailModel>res.json();
        return this._emailModel;
      }).catch((error) => {
        Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, "Email Template", null)));
        return [];
      });
  }
}