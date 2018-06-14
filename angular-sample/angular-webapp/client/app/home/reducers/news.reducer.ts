import { News } from '../models/news';
import { Action } from "@ngrx/store";
import * as newsActions from '../actions/news.actions';
import { Observable } from "rxjs/Rx";
import * as Immutable from 'immutable';

export interface NewsState {
    loading: boolean,
    news: Immutable.List<News>;
}

const initialState: NewsState = {
    news: null,
    loading: null
}

export function reducer(state = initialState, action: Action): NewsState {
    switch (action.type) {
        case (newsActions.ActionTypes.LOAD_NEWS): {
            return Object.assign({}, state, { loading: false });
        }
        case (newsActions.ActionTypes.LOAD_NEWS_COMPLETE): {
            return Object.assign({}, state, { news: action.payload, loading: true })
        }
        default:
            return state;
    }
}

export function getNews(state$: Observable<NewsState>): Observable<Immutable.List<News>> {
    return state$.select(state => state && state.news);
}

export function newsLoadingStatus(state$: Observable<NewsState>): Observable<boolean> {
    return state$.select(state => state && state.loading);
}