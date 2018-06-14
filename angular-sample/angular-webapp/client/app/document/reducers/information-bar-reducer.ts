import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import * as documentInformationbarActions from '../actions/information-bar-actions'

export interface DocumentInformationBarState {
    hasStatisticsDataLoaded: boolean,
    statistics: AeInformationBarItem[]
}


const initialDocumentInfoBarState: DocumentInformationBarState = {
    hasStatisticsDataLoaded: false,
    statistics: []
}


export function reducer(state = initialDocumentInfoBarState, action: Action): DocumentInformationBarState {
    switch (action.type) {
        case documentInformationbarActions.ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR:
            {
                return Object.assign({}, state, { hasStatisticsDataLoaded: false });
            }

        case documentInformationbarActions.ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR_COMPLETE:
            {
                let apiStatistics = <AeInformationBarItem[]>action.payload;
                apiStatistics = apiStatistics.sort(
                    (x, y) => { return (x.Priority === y.Priority) ? 0 : x.Priority < y.Priority ? -1 : 1; }
                ); //here items needs to be orderd by priority
                return Object.assign({}, state, { hasStatisticsDataLoaded: true, statistics: apiStatistics });
            }
        case documentInformationbarActions.ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR_SPECIFIC_STAT:
            {
                return Object.assign({}, state);
            }
        case documentInformationbarActions.ActionTypes.LOAD_DOCUMENT_INFORMATIONBAR_SPECIFIC_STAT_COMPLETE:
            {
                let modifiedStatItems = <AeInformationBarItem[]>action.payload;
                let existingStatItemsTobeModified = state.statistics.slice(0);
                modifiedStatItems.forEach(modifiedItem => {
                    let tobeModifiedItem = existingStatItemsTobeModified.find(obj => obj.Type == modifiedItem.Type);
                    if (tobeModifiedItem)
                        tobeModifiedItem.Count = modifiedItem.Count;
                    else
                        existingStatItemsTobeModified.push(modifiedItem);
                });
                return Object.assign({}, state, { statistics: existingStatItemsTobeModified });
            }
        default:
            return state;
    }
}

// Start of selectors

export function getDocumentInformationBar(state$: Observable<DocumentInformationBarState>): Observable<AeInformationBarItem[]> {
    return state$.select(s => s.statistics);
}


export function getDocumentInformationLoaded(state$: Observable<DocumentInformationBarState>): Observable<boolean> {
    return state$.select(s => s.hasStatisticsDataLoaded);
}



// Emd of selectors