import { getSelectedHazarads, sortItemsByName } from "./extract-helper";
import { FurtherControlMeasuresMockStoreProvider } from "../../shared/testing/mocks/mock-store-RA-FCM-provider-factory";
import { RiskAssessment } from '../models/risk-assessment';
import { fakeAsync, tick } from "@angular/core/testing";
import { MockStoreAddUpdateFurtherControls } from './../../shared/testing/mocks/mock-store-addupdate-further-control';

describe('extract helper', () => {
    let currentRiskAssessment: RiskAssessment;
    beforeEach(() => {
        currentRiskAssessment = MockStoreAddUpdateFurtherControls.RiskAssesmentData();
    });

    it('should return Hazards details of risk assessment when getSelectedHazards method was called', fakeAsync(() => {
        let extractedHazardDetails = getSelectedHazarads(currentRiskAssessment);
        tick(60);
        let sortedArrayItems = sortItemsByName(currentRiskAssessment.RAHazards);
        expect(extractedHazardDetails).toEqual(sortedArrayItems);
    }));
});