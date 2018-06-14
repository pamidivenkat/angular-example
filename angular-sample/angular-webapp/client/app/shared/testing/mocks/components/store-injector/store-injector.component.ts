import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import * as fromRoot from '../../../../reducers/index';

@Component({
  selector: 'app-store-injector',
  templateUrl: './store-injector.component.html',
  styleUrls: ['./store-injector.component.scss']
})
export class StoreInjectorComponent implements OnInit {

  constructor(private _store: Store<fromRoot.State>) {

  }
  public getStore(): Store<fromRoot.State> {
    return this._store;
  }
   
  ngOnInit() {
  }

}
