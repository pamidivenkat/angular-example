import { informationBarReducer, InformationBarState } from './information-bar.reducer';
import { Observable } from 'rxjs/Rx';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { ActionTypes } from '../actions/information-bar.actions';
import { ResponseOptions, Response } from '@angular/http';
import * as Immutable from 'immutable';
import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';


describe('information bar reducer', () => {
  let initialInfoBarMockState: InformationBarState;
  beforeEach(() => {
    initialInfoBarMockState = {
      status: false,
      entities: []
    };
  });

  it('verify whether information bar reducer is returning the initial state or not', () => {
    expect(informationBarReducer(undefined, { type: '', payload: [] })).toEqual({
      status: false,
      entities: []
    });
  });

  it('verify whether information bar reducer is returning the loading state as (status=false) and empty items list or not', () => {
    expect(
      informationBarReducer(undefined, { type: ActionTypes.LOAD_INFORMATIONBAR, payload: false })
    ).toEqual(
      {
        status: false,
        entities: []
      });
  });

  it('verify whether information bar reducer is returning the loading state as (status=true) and supplied items or not', () => {
    let body = JSON.parse('[{"Code":2,"Priority":7,"Name":"Team holidays","IconName":null,"Count":0.0,"ContextData":null},{"Code":22,"Priority":3,"Name":"My team tasks","IconName":"icon-tasks-team","Count":4455.0,"ContextData":null},{"Code":1,"Priority":6,"Name":"Holidays available","IconName":"icon-holidays-absence","Count":0.0,"ContextData":[{"Key":"HolidayUnitType","Value":"Days"}]},{"Code":26,"Priority":7,"Name":"Outstanding training","IconName":"icon-education","Count":282.0,"ContextData":null},{"Code":5,"Priority":10,"Name":"Training courses","IconName":"icon-education","Count":7.0,"ContextData":null},{"Code":21,"Priority":2,"Name":"Manage team","IconName":"icon-people","Count":170.0,"ContextData":null},{"Code":4,"Priority":9,"Name":"Tasks to complete","IconName":"icon-tasks-to-complete","Count":496.0,"ContextData":null},{"Code":6,"Priority":5,"Name":"Holiday countdown","IconName":"icon-case","Count":0.0,"ContextData":null},{"Code":3,"Priority":8,"Name":"Documents to action","IconName":"icon-to-review","Count":24.0,"ContextData":null},{"Code":25,"Priority":6,"Name":"Risk assessments","IconName":"icon-alert-triangle","Count":20.0,"ContextData":null},{"Code":23,"Priority":4,"Name":"Employees absent today","IconName":"icon-steth","Count":0.0,"ContextData":null},{"Code":20,"Priority":1,"Name":"Holidays requested","IconName":"icon-holidays-absence","Count":7.0,"ContextData":null}]');
    let options = new ResponseOptions({ body: body });
    let response = new Response(options);
    let mockInformationBarItems: Immutable.List<AeInformationBarItem> = Immutable.List(extractInformationBarItems(response));

    expect(informationBarReducer(initialInfoBarMockState,
      { type: ActionTypes.LOAD_INFORMATIONBAR_COMPLETE, payload: mockInformationBarItems })).toEqual({
        status: true,
        entities: mockInformationBarItems
      });
  });
});

