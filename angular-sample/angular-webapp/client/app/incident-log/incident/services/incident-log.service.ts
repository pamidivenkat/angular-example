import { Injectable } from '@angular/core';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Http, URLSearchParams, Response, Headers, ResponseContentType, RequestOptions } from '@angular/http';
import { extractRIDDOROnlineForm } from '../common/extract-helpers';
import { DocumentCategoryEnum } from '../../../document/models/document-category-enum';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { Observable } from 'rxjs/Observable';
import { InvSection } from "../models/incident-inv-section";
import { Incident } from "../models/incident.model";
import { RiskAssessment } from "../../../risk-assessment/models/risk-assessment";
import { ConstructionPhasePlan } from "../../../construction-phase-plans/models/construction-phase-plans";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers/index';
import { LoadRiskAssessmentsAction, LoadMethodStatementsAction } from "../actions/incident-formal-investigation.actions";
import { isNullOrUndefined } from "util";
@Injectable()
export class IncidentLogService {
  private _isIncidentDetailsLoaded: boolean = false;
  private _incidentDetails: Incident;
  private _riskAssessments: Array<RiskAssessment>;
  private _methodStatements: Array<ConstructionPhasePlan>;

  getIncidentPreviewInfo(incidentId: string) {
    let params = new URLSearchParams();
    params.set('fields', `Id, CompanyId,
      IncidentReportedBy.User.FirstName as ReportedByFirstname,
      IncidentReportedBy.User.LastName as ReportedBySurname,       
      IncidentReportedBy.User.Telephone,
      IncidentReportedBy.User.Email,
      IncidentReportedBy.User.Id as UserId,
      AboutIncident.IncidentDetails as AboutIncidentDetails,
      IncidentReportedBy.Address as ReportedByAddress,
      AboutIncident.IncidentDetails as AIDetails,
      AboutIncident == null ? "" :AboutIncident.IncidentType.Name as IncidentTypeName,
      InjuredPerson.Name as InjuredPersonName,
      InjuredPerson == null ? "" :InjuredPerson.Address.MobilePhone as MobilePhone,
      InjuredPerson == null ? "" :InjuredPerson.Occupation as InjuredPersonOccupation,
      InjuredPerson == null ? "" :(InjuredPerson.InjuredParty == null ? InjuredPerson.OtherInjuredParty :  InjuredPerson.InjuredParty.Name) as InjuredPartyName,
      InjuredPerson == null ? null : InjuredPerson.Gender as Gender, 
      InjuredPerson.DateOfBirth as DateOfBirth,
      InjuredPerson.Address as Address`);

    return this._data.get(`incident/getbyid/${incidentId}`, { search: params })
      .map((res) => extractRIDDOROnlineForm(res))
      .switchMap((model) => {
        if (!StringHelper.isNullOrUndefinedOrEmpty(model.CompanyId)) {
          if (model.CompanyId.toLowerCase() !== this._claimsHelper.getCompanyId().toLowerCase()) {
            params = new URLSearchParams();
            params.set('fields', `Id,FullName`);
            return this._data.get(`company/getbyid/${model.CompanyId}`, { search: params }).mergeMap((res) => {
              model.CompanyName = res.json().FullName;
              let searchparams: URLSearchParams = new URLSearchParams();
              searchparams.set('userId', model.UserId);
              searchparams.set('isActive', 'true');
              searchparams.set('isActive2', 'true');
              searchparams.set('cid', model.CompanyId);

              return this._data.get(`employee/GetEmployeebyUserId`, { search: searchparams })
                .map((res) => {
                  let body = res.json();
                  if (!isNullOrUndefined(body)) {
                   model.ReportedByJobTitle = body.Job == null ? "" : (body.Job.JobTitle == null ? "" : body.Job.JobTitle.Name);
                  }
                  return model;
                })

            });
          } else if (model.CompanyId.toLowerCase() === this._claimsHelper.getCompanyId().toLowerCase()) {
            model.CompanyName = this._claimsHelper.getCompanyName();
            let searchParams: URLSearchParams = new URLSearchParams();
            searchParams.set('userId', model.UserId);
            searchParams.set('isActive', 'true');
            searchParams.set('isActive2', 'true');

            return this._data.get(`employee/GetEmployeebyUserId`, { search: searchParams })
              .map((res) => {
                let body = res.json();
                if (!isNullOrUndefined(body)) {
                  model.ReportedByJobTitle = body.Job == null ? "" : (body.Job.JobTitle == null ? "" : body.Job.JobTitle.Name);
                }
                return model;
              })
          }
        } else {
          model.CompanyName = '';
          return Observable.of(model);
        }
      });
  }

  getIncidentCategory(incidentId: string) {
    let params = new URLSearchParams();
    params.set('fields', `AboutInjury.IncidentType.IncidentCategory.Name as CategoryName`);
    return this._data.get(`incident/getbyid/${incidentId}`, { search: params }).map((res) => res.json().CategoryName);
  }

  generateRIDDORPDF(html: string, width: number, incidentId: string) {
    return this._http.get('./assets/templates/incident-log/riddor-online-form.html')
      .switchMap(templateResponse => {
        let vm = ObjectHelper.operationInProgressSnackbarMessage('Generating pdf ...');
        this._messenger.publish('snackbar', vm);

        let template = templateResponse.text();
        let data = template.replace('{{bodyContent}}', html);

        let riddorFormModel = {
          AttachTo: { Id: incidentId, ObjectTypeCode: 333 },
          RegardingObject: { Id: incidentId, ObjectTypeCode: 333 },
          Category: DocumentCategoryEnum.AccidentLogs,
          Title: 'incident ' + Date().toString(),
          FileName: incidentId + ' RiddorOnlineForm ' + Date().toString() + '.pdf',
          Content: data,
        };

        let params: URLSearchParams = new URLSearchParams();
        params.set('pdf', 'true');

        return this._data.post('Incident/UploadPdf'
          , riddorFormModel
          , { search: params }).map((res) => {
            vm = ObjectHelper.operationCompleteSnackbarMessage('Pdf has been generated.');
            this._messenger.publish('snackbar', vm);
            return res.json().Id;
          });
      });
  }

  getIncidentDetails() {
    return this._incidentDetails;
  }

  setIncidentDetails(val: Incident) {
    this._incidentDetails = val;
  }

  getRiskAssessments() {
    return this._riskAssessments;
  }
  setRiskAssessments(val: Array<RiskAssessment>) {
    this._riskAssessments = val;
  }
  loadRiskAssessments() {
    this._store.dispatch(new LoadRiskAssessmentsAction(true));
  }
  getMethodStatements() {
    return this._methodStatements;
  }
  setMethodStatements(val: Array<ConstructionPhasePlan>) {
    this._methodStatements = val;
  }
  loadMethodStatements() {
    this._store.dispatch(new LoadMethodStatementsAction(true));
  }
  constructor(private _data: RestClientService
    , private _http: Http
    , private _claimsHelper: ClaimsHelperService
    , private _messenger: MessengerService
    , private _store: Store<fromRoot.State>
  ) {
  }
}
