import { RiskAssessment } from './../../risk-assessment/models/risk-assessment';
import { MSRiskAssessment,MSOtherRiskAssessments } from './../models/method-statement';
import { extractMSRiskAssessments, getSortedData } from './extract-helper';
import { PPECategoryGroup } from './../../shared/models/lookup.models';
import { MSPPEMockStoreProviderFactory } from './../../shared/testing/mocks/ms-ppe-mock-store-provider-factory';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import * as Immutable from 'immutable';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';

describe('ExatcHelpers', () => {

  let ppeCategoryGroups: AtlasApiResponse<PPECategoryGroup>;
  let msotherRA: AtlasApiResponse<MSOtherRiskAssessments>;
  let rAmap: AtlasApiResponse<RiskAssessment>;
  let mookupRA: any;

  beforeEach(async(() => {
    ppeCategoryGroups = MSPPEMockStoreProviderFactory.getppeCategoryGroups();
    msotherRA = MockStoreProviderFactory.msotherRA();
    rAmap = MockStoreProviderFactory.msRAMap();
    mookupRA = MockStoreProviderFactory.RAhelperResultset();

  }));

  it('PPE Categories and groups with sorting order', fakeAsync(() => {
    let sortedPPE = getSortedData(ppeCategoryGroups.Entities);
    tick(100);
    expect(ppeCategoryGroups.Entities).toEqual(sortedPPE);
  }));


  it('Mrging RA others and library', fakeAsync(() => {
    let racombine = extractMSRiskAssessments(rAmap.Entities, msotherRA.Entities);
    tick(100);
    expect(racombine).toEqual(mookupRA.Entities);
  }));

});
