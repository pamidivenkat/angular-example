import { RestClientService } from '../../../shared/data/rest-client.service';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Response, Headers, ResponseContentType, RequestOptions } from '@angular/http';
import { isNullOrUndefined } from 'util';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { MessengerService } from '../../../shared/services/messenger.service';

@Injectable()
export class ManageDepartmentsService {

    getTemplateForPrint(html: string) {
        return this._http.get('./assets/templates/company-org-structure/manage-dept-team-print.html')
            .map(templateResponse => {
                let template = templateResponse.text();
                let data = template.replace('{{bodyContent}}', html);
                return data;
            });
    }

    generatePDF(html: string, width: number, companyName: string) {
        let message = 'Downloading department structure';
        let vm = ObjectHelper.operationInProgressSnackbarMessage(message);
        this._messenger.publish('snackbar', vm);
        return this._http.get('./assets/templates/company-org-structure/manage-dept-team-pdf.html')
            .switchMap(templateResponse => {
                let template = templateResponse.text();
                let data = template.replace('{{bodyContent}}', html);

                const params = new URLSearchParams();
                params.set('title', `${companyName} org chart`);
                params.set('width', width.toString());
                params.set('pdf', 'true');

                let headers = new Headers();
                headers.append('Content-Type',
                    'application/x-www-form-urlencoded');
                headers.append('accept', 'application/pdf');

                let options = new RequestOptions({
                    headers: headers
                    , responseType: ResponseContentType.Blob
                    , search: params
                });
                return this._data.post('Download/GeneratePdfFromContent', data, options)
                    .map(c => {
                        let message = 'Department structure downloaded successfully';
                        let vm = ObjectHelper.operationCompleteSnackbarMessage(message);
                        this._messenger.publish('snackbar', vm);
                        return c;
                    });
            });
    }

    constructor(private _data: RestClientService
        , private _http: Http
        , private _messenger: MessengerService) {
    }
}
