import { AeDataTableAction } from '../../atlas-elements/common/models/ae-data-table-action';
import { BehaviorSubject, Subject } from 'rxjs/Rx';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import * as Immutable from 'immutable';

@Component({
    selector: 'ae-datatable-demo',
    templateUrl: './ae-datatable-demo.component.html',
    styleUrls: ['./ae-datatable-demo.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeDatatableDemoComponent implements OnInit {

    keys = Immutable.List(['Title']);
    totalRecords = new BehaviorSubject(0);

    dataSource = new BehaviorSubject(Immutable.List([]));
    _dataSource1 = Immutable.List([
        { Title: 'Test10' },
        { Title: 'Test20' },
        { Title: 'Test30' },
        { Title: 'Test40' },
        { Title: 'Test50' },
        { Title: 'Test60' },
        { Title: 'Test70' },
        { Title: 'Test80' },
        { Title: 'Test90' },
        { Title: 'Test100' }
    ]);

    _action = new Subject();

    actions = Immutable.List([
        new AeDataTableAction("Add", this._action, false)
    ]);

    constructor() {
        this._action.subscribe();
    }

    nextDataSet() {
        this.totalRecords.next(10);
        this.dataSource.next(this._dataSource1);

    }

    ngOnInit() {
    }

}
