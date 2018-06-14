
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';

@Injectable()
export class AbsencetypeService implements OnInit {

  constructor(private _store: Store<fromRoot.State>, private _data: RestClientService) { }

  ngOnInit() {

  }
  isTypeNameAlreadyExists() {
    let params: URLSearchParams = new URLSearchParams();
    params.set('fields', 'TypeName,AbsenceCodeId,Id');
    params.set('pageNumber', '0');
    params.set('pageSize', '0');
    return this._data.get('AbsenceType', { search: params })
      .map((response) => {
                return response.json();
            });
  }



}