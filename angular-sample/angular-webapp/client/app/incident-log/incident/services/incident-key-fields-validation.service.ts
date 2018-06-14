import { AnswerType } from '../models/incident-inv-question';
import { Injectable } from "@angular/core";
import { RestClientService } from "../../../shared/data/rest-client.service";
import * as fromRoot from '../../../shared/reducers/index';
import { Store } from "@ngrx/store";
import { Http } from "@angular/http";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { MessengerService } from "../../../shared/services/messenger.service";
import { IncidentKeyFields } from "../../incident/models/incident-key-fields";
import { Subscription } from "rxjs/Rx";
import { IncidentAboutYouDetailsGetAction } from "../../incident/actions/incident.actions";
import { IncidentReportedBy } from "../../incident/models/incident-reported-by.model";
import { isNullOrUndefined } from "util";
import { IncidentPreviewVM } from "../../incident/models/incident-preview.model";
import { InvSection } from "../../incident/models/incident-inv-section";
import { ValidationType } from "../../incident/models/validation-type";
import { IncidentFormField } from "../../incident/models/incident-form-field";

/**
 * @description
 * @class
 */
@Injectable()
export class IncidentKeyFieldsValidationService {

  constructor(private _data: RestClientService
    , private _http: Http
    , private _claimsHelper: ClaimsHelperService
    , private _messenger: MessengerService
    , private _store: Store<fromRoot.State>
  ) {
  }

  public getSectionsData(invSections: InvSection[], incidentId: string) {
    let isValid: boolean = true;
    return new Promise<any>((fulfill, reject) => {
      if (isNullOrUndefined(invSections)) {
        this._data.get(`invsection`, { params: { incidentId: incidentId } }).map(
          (res) => {
            let sectionsData = res.json() as InvSection[];
            isValid = this._validateSections(sectionsData, isValid);
            fulfill(isValid);
          }).toPromise();
      }
      else {
        isValid = this._validateSections(invSections, isValid);
        fulfill(isValid);
      }
    });
  }

  private _validateSections(sections: InvSection[], isValid: boolean) {
    sections.forEach(x => {
      if (isValid) {
        x.InvQuestions.forEach(f => {
          let validations = f.Validations.split(',');
          let hasRequiredValidation = validations.findIndex(v => Number(v) === ValidationType.Required);
          if (hasRequiredValidation !== -1) {
            switch (f.AnswerType) {
              case AnswerType.UploadDocument:
                if (isNullOrUndefined(f.AttachedObjectId)) {
                  isValid = false;
                }
                break;
              default:
                if (isNullOrUndefined(f.Value)) {
                  isValid = false;
                }
                break;
            }
          }
        })
      }
    });
    return isValid;
  }

  validateIncidentKeyFields(incidentDetails: IncidentPreviewVM, aboutIncidentKeyFields: string[], invSections: InvSection[]) {
    let isValid: boolean = true;
    let keyFields = new IncidentKeyFields();
    return new Promise<any>((fulfill, reject) => {

      keyFields.PersonReportingTabKeyFields.forEach(x => {
        if (isValid) {
          if (isNullOrUndefined(incidentDetails[x]) || incidentDetails[x] == "") {
            isValid = false;
          }
        }
      });
      if (isValid) {
        keyFields.AboutAffectedPartyTabKeyFields.forEach(x => {
          if (isValid) {
            if (x == "InjuredPersonInjuredPartyName") {
              if (isNullOrUndefined(incidentDetails[x]) || incidentDetails[x] == "") {
                if (isNullOrUndefined(incidentDetails.InjuredPersonOtherInjuredParty) || incidentDetails.InjuredPersonOtherInjuredParty == "")
                  isValid = false;
              }
            }
            else if (isNullOrUndefined(incidentDetails[x]) || incidentDetails[x] == "") {
              isValid = false;
            }
          }
        });
        if (isValid) {
          keyFields.AboutIncidentKeyFields = keyFields.AboutIncidentKeyFields.concat(aboutIncidentKeyFields);
          keyFields.AboutIncidentKeyFields.forEach(x => {
            if (isValid) {
              if (x == "AboutIncidentIncidentTypeId") {
                if (isNullOrUndefined(incidentDetails[x]) || incidentDetails[x] == "") {
                  isValid = false;
                }
              }
              else if (x == "MedicalAssistanceDetails") {
                let value: any = incidentDetails.AboutIncidentDetails["IsMedicalAssistanceRequired"];
                if ((value == "Yes") && (isNullOrUndefined(incidentDetails.AboutIncidentDetails[x]) || incidentDetails.AboutIncidentDetails[x] == "")) {
                  isValid = false;
                }
              }
              else if (x == "SiteId") {
                if (isNullOrUndefined(incidentDetails.AboutIncidentDetails["OtherSite"]) && (isNullOrUndefined(incidentDetails.AboutIncidentDetails[x]) || incidentDetails.AboutIncidentDetails[x] == "")) {
                  isValid = false;
                }
              }
              else if (x == "OtherSite") {
                if (isNullOrUndefined(incidentDetails.AboutIncidentDetails["SiteId"]) && (isNullOrUndefined(incidentDetails.AboutIncidentDetails[x]) || incidentDetails.AboutIncidentDetails[x] == "")) {
                  isValid = false;
                }
              }
              else if (x == "AddressLine1" || x == "AddressLine2" || x == "Town" || x == "County" || x == "Postcode") {
                if (!isNullOrUndefined(incidentDetails.AboutIncidentDetails["SiteId"]) && incidentDetails.AboutIncidentDetails["SiteId"] != "other") {
                  if((isNullOrUndefined(incidentDetails.AboutIncidentDetails[x]) || incidentDetails.AboutIncidentDetails[x] == ""))
                  isValid = false;
                }
              }
              else if (x == "UpdatedDate") {
                if ((incidentDetails.AboutIncidentDetails["IsRiskAssessmentUpdated"] == true) && (isNullOrUndefined(incidentDetails.AboutIncidentDetails[x]))) {
                  isValid = false;
                }
              }
              else {
                if (isNullOrUndefined(incidentDetails.AboutIncidentDetails[x]) || incidentDetails.AboutIncidentDetails[x] == "") {
                  isValid = false;
                }
              }
            }
          });
          if (isValid) {
            if (incidentDetails['ReportedToIsRIDDORRequired'] == true) {
              keyFields.RIDDORTabKeyFields.forEach(x => {
                if (isValid) {
                  if (isNullOrUndefined(incidentDetails[x]) || incidentDetails[x] == "") {
                    isValid = false;
                  }
                }
              });
            }
          }
          else {
            fulfill(isValid);
          }
        }
        else {
          fulfill(isValid);
        }
      }
      else {
        fulfill(isValid);
      }
      if (isValid) {
        if (incidentDetails.IsInvestigationRequired) {
          this.getSectionsData(invSections, incidentDetails.Id).then((response: any) => {
            if (!isNullOrUndefined(response)) {
              isValid = response;
              fulfill(isValid);
            }
          });
        }
        else {
          fulfill(isValid);
        }
      }
      else {
        fulfill(isValid);
      }
    });
  }
}
