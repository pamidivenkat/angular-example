import { URLSearchParams, Response } from '@angular/http';
import * as Immutable from 'immutable';
import { IncidentListModel } from '../models/incident-list-model';
import { isNullOrUndefined } from 'util';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { IncidentStatus } from '../models/incident-status.enum';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { IConHelper } from '../../shared/helpers/icon-helper';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { IncidentCategory } from '../../shared/models/lookup.models';
import { AeInformationBarItemType } from "../../atlas-elements/common/ae-informationbar-itemtype.enum";
import { InjuredParty } from "../incident/models/incident-injured-person.model";

export function getSearchParamsFromFilters(...mappedInput: Map<string, string>[]) {
    let params: URLSearchParams = new URLSearchParams();
    mappedInput.map((item) => {
        item.forEach((v, k) => {
            params.set(k, v);
        });
    });
    return params;
}

export function extractIncidentListModel(response: Response): Immutable.List<IncidentListModel> {
    let incidents: Array<IncidentListModel> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        let items = Array.from(body.Entities);
        incidents = items.map((item) => {
            let incident = new IncidentListModel();
            incident = ObjectHelper.extract(item, incident);
            let status = parseInt(item['StatusId'], 10);
            incident.StatusName = IncidentStatus[status];
            return incident;
        });
    }
    return Immutable.List(incidents);
}

export function extractIncidentLogStats(response: Response, incidentCategories: Array<IncidentCategory>): AeInformationBarItem[] {
    let informationBarItems: AeInformationBarItem[] = [];
    if (!isNullOrUndefined(response)) {
        let body = response.json();
        if (body && body.length && body.length > 0) {
            Array.from(body).forEach((stat) => {
                let statCode: number = <number>stat['Code'];
                let statCount: number = <number>stat['Count'];
                let statName: string = <string>stat['Name'];
                let statIcon: string = <string>stat['IconName'];
                let statPriority: number = <number>stat['Priority'];
                let infoItem: AeInformationBarItem;
                switch (statCode) {
                    case 45: {
                        infoItem = new AeInformationBarItem(statCode
                            , statCount
                            , statName
                            , false
                            , IConHelper.GetByInformationBarItemTooltip(statCode, statCount)
                            , statIcon
                            , ''
                            , false);
                        infoItem.Priority = statPriority;
                        informationBarItems.push(infoItem);
                    }
                        break;
                    case 47: {
                        infoItem = new AeInformationBarItem(statCode
                            , statCount
                            , statName
                            , false
                            , IConHelper.GetByInformationBarItemTooltip(statCode, statCount)
                            , statIcon
                            , '1');
                        infoItem.Priority = statPriority;
                        informationBarItems.push(infoItem);
                    }
                        break;
                    case 46: {
                        let contextData: Map<string, number> = new Map<string, number>();
                        Array.from(stat['ContextData']).forEach((kv) => {
                            contextData.set(kv['Key'], parseInt(kv['Value'], 10));
                        });

                        incidentCategories.map((cat) => {
                            statCount = 0;
                            if (!isNullOrUndefined(contextData.get(cat.Id))) {
                                statCount = contextData.get(cat.Id);
                            }
                            let priority: number;
                            switch (cat.Code) {
                                case 1: {
                                    statCode = AeInformationBarItemType.NearMisses;
                                    priority=AeInformationBarItemType.NearMisses;
                                    statName='Near misses';
                                    statIcon = 'icon-runner';
                                }
                                    break;
                                case 2: {
                                    statCode = AeInformationBarItemType.Fatalities;
                                    priority = AeInformationBarItemType.Fatalities;
                                    statName='Fatalities';
                                    statIcon = 'icon-dove';
                                }
                                    break;
                                case 3: {
                                    statCode = AeInformationBarItemType.Diseases;
                                    priority = AeInformationBarItemType.Diseases;
                                    statName='Occupational diseases';
                                    statIcon = 'icon-disease';
                                }
                                    break;
                                case 4: {
                                    statCode = AeInformationBarItemType.Injuries;
                                    priority = AeInformationBarItemType.Injuries;
                                    statName='Injuries';
                                    statIcon = 'icon-injury';
                                }
                                break;
                                case 6: {
                                    statCode = AeInformationBarItemType.Behavioural;
                                    priority = AeInformationBarItemType.Behavioural;
                                    statName='Behavioural';
                                    statIcon = 'icon-behavioural';
                                }
                                break;
                                case 5: {
                                    statCode = AeInformationBarItemType.Dangerous;
                                    priority = AeInformationBarItemType.Dangerous;
                                    statName='Dangerous occurrences';
                                    statIcon = 'icon-electric-bolt';
                                }
                                break;
                                case 7: {
                                    statCode = AeInformationBarItemType.Environmental;
                                    priority = AeInformationBarItemType.Environmental;
                                    statName='Environmental';
                                    statIcon = 'icon-environmental';
                                }
                                    break;
                            }

                            infoItem = new AeInformationBarItem(statCode
                                , statCount
                                , statName
                                , false
                                , IConHelper.GetByInformationBarItemTooltip(statCode, statCount)
                                , statIcon
                                , cat.Id
                                , true);
                            infoItem.Priority = priority;
                            informationBarItems.push(infoItem);
                        });
                    }
                        break;

                }
            });
        }
    }
    return informationBarItems.sort((first, second): number => {
        if (first.Priority < second.Priority) {
            return -1;
        }
        if (first.Priority > second.Priority) {
            return 1;
        }
        return 0;
    });
}

export function generateLastTenYears(): Immutable.List<AeSelectItem<number>> {
    let currentYear = (new Date()).getFullYear();
    let lastTenyears =
        Array.from(new Array(10), (x, i) => i)
            .map((element, index: number) => {
                let year = currentYear - index;
                return new AeSelectItem<number>(year.toString(), year, false);
            });
    return Immutable.List(lastTenyears);
}

export function mapInjuredPartyData(injuredparty: InjuredParty[]): Immutable.List<AeSelectItem<string>> {
    let tempInjuredPartyList = injuredparty.filter(obj => obj.Id != '0').sort((a, b) => a.Name.localeCompare(b.Name));
    let otherInjuredParty = new InjuredParty();
    otherInjuredParty.Id = '0';
    otherInjuredParty.Name = 'Other';
    tempInjuredPartyList.push(otherInjuredParty);
    return Immutable.List(tempInjuredPartyList.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }));
}