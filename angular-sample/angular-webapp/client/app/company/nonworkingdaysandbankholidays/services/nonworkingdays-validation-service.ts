import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { NonWorkingdaysModel } from './../models/nonworkingdays-model';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { URLSearchParams } from '@angular/http';

import * as errorActions from './../../../shared/actions/error.actions';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { getNonWorkingDayEntity } from './../common/extract-helpers';


@Injectable()
export class NonworkingdaysValidationService {
    constructor(private _data: RestClientService,  private _messenger: MessengerService) {

    }

    checkForDuplicates(nonWorkingDayModel: NonWorkingdaysModel, assignedTo: string): Observable<NonWorkingdaysModel> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('type', assignedTo);
        //params.set('action', 'CheckExistingProfiles');       
        return this._data.post('HolidayWorkingProfile', nonWorkingDayModel, { search: params })
            .map((res) => {
                return <NonWorkingdaysModel>res.json();
            })
            // .catch((error) => {
            //     return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Validating the non working days profile assign', nonWorkingDayModel.Id)));
            // });
    }
}
