import { type } from "../../shared/util";
import { Action } from "@ngrx/store";
import { News } from "../models/news";
import * as Immutable from 'immutable';

export const ActionTypes = {
    LOAD_NEWS: type('[News] Load news'),
    LOAD_NEWS_COMPLETE: type('[News] Load news complete')
}

export class LoadNewsAction implements Action {
    type = ActionTypes.LOAD_NEWS;
    constructor(public payload: boolean) { }
}

export class LoadNewsCompleteAction implements Action {
    type = ActionTypes.LOAD_NEWS_COMPLETE;
    constructor(public payload: Immutable.List<News>) { }
}

export type Actions = LoadNewsAction | LoadNewsCompleteAction; 