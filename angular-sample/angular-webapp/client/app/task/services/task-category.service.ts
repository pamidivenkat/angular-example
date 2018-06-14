import { TaskCategory } from '../models/task-categoy';
import { LoadTaskCategories } from '../actions/task.list.actions';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import * as fromRoot from '../../shared/reducers/index';

@Injectable()
export class TaskCategoryService {

  constructor(private _store: Store<fromRoot.State>) {


  }
  getTaskCategories(): void {
    this._store.dispatch(new LoadTaskCategories(true));
  }
}

