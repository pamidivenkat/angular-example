import { Injectable }              from '@angular/core';
import { Http, Response, URLSearchParams }          from '@angular/http';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { RestClientService } from '../../shared/data/rest-client.service';

@Injectable()
export class EmployeeService {
  private apiUrl = 'Employee/GetById/';
  constructor (private _data: RestClientService, private http: Http, private _claimsHelper: ClaimsHelperService) {}
  getEmployeeById(){
    let employeeId = this._claimsHelper.getEmpId();
                let apiUrl = 'Employee/GetById/' + employeeId;
                let params: URLSearchParams = new URLSearchParams();
                params.set('fields', 'Id,FirstName,SurName,DOB,Email,HasEmail,Job.StartDate,Address.MobilePhone');
                return this._data.get(apiUrl, { search: params })

  }
  private extractData(res: Response) {
    let body = res.json();
    return body || { };
  }
  private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return errMsg;
  }
}
