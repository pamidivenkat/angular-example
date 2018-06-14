import { AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { TrainingReportsLoad, TrainingReportDownLoadAction } from '../actions/training-report.actions';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';


@Injectable()
export class TrainingReportService implements OnInit {
    constructor(private _store: Store<fromRoot.State>) {

    }

    ngOnInit() {

    }
    LoadTrainingReportsData(atlasApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new TrainingReportsLoad(atlasApiRequestWithParams));
    }
   DownLoadTrainingReport(Id:string){
       this._store.dispatch(new TrainingReportDownLoadAction(Id))
   }
}
