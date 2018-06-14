import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { isNullOrUndefined } from 'util';
import { IncidentStatus } from '../../models/incident-status.enum';
import { IncidentPreviewVM } from './../models/incident-preview.model';
import { Injectable } from '@angular/core';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Http, URLSearchParams, Response, Headers, ResponseContentType, RequestOptions } from '@angular/http';
import { extractRIDDOROnlineForm, extractIncidentPreviewData } from '../common/extract-helpers';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { Observable } from 'rxjs/Observable';
import { DocumentCategoryEnum, DocumentChangesEnum } from './../../../document/models/document-category-enum';
import { Incident } from './../../../incident-log/incident/models/incident.model';
import { DatePipe } from "@angular/common";
import * as errorActions from '../../../shared/actions/error.actions';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';

@Injectable()
export class IncidentPreviewService {

    getIncidentPreviewDetails(incidentId: string) {        
        let params = new URLSearchParams();
        params.set('id',incidentId);
        params.set('custom','true');        
        return this._data.get(`incident/GetIncidentDetails`, { search: params })
            .map((res) => extractIncidentPreviewData(res))
            .switchMap((model) => {
                return Observable.of(model);
            });
    }

    generatePDF(html: string, width: number, incidentId: string, incidentPreviewModel: IncidentPreviewVM) {
        return this._http.get('./assets/templates/incident-log/incident-preview-template.html')
            .switchMap(templateResponse => {
                let vm = ObjectHelper.operationInProgressSnackbarMessage('Generating pdf ...');
                this._messenger.publish('snackbar', vm);
                let requireChangehistory: boolean = false;
                if (incidentPreviewModel.IncidentStatus == IncidentStatus.Approved) {
                    requireChangehistory = true;
                }
                let template = templateResponse.text();
                let data = template.replace('{{bodyContent}}', html);

                let incidentPdfModel = {
                    AttachTo: { Id: incidentId, ObjectTypeCode: 333 },
                    RegardingObject: { Id: incidentId, ObjectTypeCode: 333 },
                    Category: DocumentCategoryEnum.AccidentLogs,
                    Title: 'Incident Log - ' + this._datePipe.transform(new Date(), 'dd-MM-yyyy'),
                    FileName: 'Incident Log - ' + this._datePipe.transform(new Date(), 'dd-MM-yyyy') + '.pdf',
                    Content: data,
                    LastChange: DocumentChangesEnum.ContentChanged,
                    NeedVersioning: requireChangehistory
                };

                let params: URLSearchParams = new URLSearchParams();
                params.set('pdf', 'true');

                return this._data.post('Incident'
                    , incidentPdfModel
                    , { search: params }).map((res) => {
                        vm = ObjectHelper.operationCompleteSnackbarMessage('Pdf has been generated.');
                        this._messenger.publish('snackbar', vm);
                        return res.json().Id;
                    });
            });
    }

    approveIncident(incidentId: string) {
        let vm = ObjectHelper.operationInProgressSnackbarMessage('Approving incident ...');
        this._messenger.publish('snackbar', vm);
        return this._data.get(`Incident`, { params: { id: incidentId } })
            .map((res) => <Incident>(res.json()))
            .mergeMap((incidentDetails: Incident) => {
                incidentDetails.ApprovedDate = new Date();
                incidentDetails.ApprovedBy = this._claimsHelper.getUserId();
                incidentDetails.ModifiedBy = this._claimsHelper.getUserId();
                incidentDetails.StatusId = 2;
                incidentDetails.IsApprovedNotificationRequired = true;

                return this._data.post(`Incident`, incidentDetails)
                    .mergeMap((res) => {
                        let vm = ObjectHelper.operationCompleteSnackbarMessage('Incident has been approved.');
                        this._messenger.publish('snackbar', vm);
                        return res.json().Id;
                    }).catch((error) => {
                        let body = error.json();
                        if (!isNullOrUndefined(body) && !isNullOrUndefined(body.Code) && body.Code === 5552) {
                            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Incident', 'Access denied,you dont have permissions to approve incident.')));
                        }
                        else {
                            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'IncidentReportedBy', 'Update IncidentReportedBy')));
                        }
                    });
            })
    }

    constructor(private _data: RestClientService
        , private _http: Http
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
        , private _datePipe: DatePipe
    ) {
    }
}
