import { RiskAssessment } from '../../models/risk-assessment';
import { RAProcedures } from '../../models/risk-assessments-procedures';
import { OnDestroy, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { } from '@angular/core/core';
import { RiskAssessmentService } from '../../services/risk-assessment-service';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import {
    ProceduresFormFieldWrapper,
    RiskAssessmentProceduresForm
} from '../../models/risk-assessment-procedures-form';
import { IFormBuilderVM } from '../../../shared/models/iform-builder-vm';
import * as fromRoot from '../../../shared/reducers';

import { BaseComponent } from '../../../shared/base-component';
@Component({
    selector: 'risk-assessment-procedures',
    templateUrl: './risk-assessment-procedures.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentProceduresComponent extends BaseComponent implements OnInit, OnDestroy {
    private _riskAssessmentProceduresForm: FormGroup;
    private _riskAssessmentProceduresFormVM: IFormBuilderVM;
    private _currentRAProcedures: RAProcedures;
    private _updatedRAProcedures: RAProcedures;
    private _formName: string;
    private _fields: Array<ProceduresFormFieldWrapper<any>>;
    private _context: any;
    private _stepSubscription: Subscription;
    private _currentRiskAssessmentSubscription$: Subscription;
    private _currentRiskAssessment: RiskAssessment;
    constructor(
        protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _fb: FormBuilder
        , private _claimsHelper: ClaimsHelperService
        , private _activatedRoute: ActivatedRoute
        , private _store: Store<fromRoot.State>
        , private _riskAssessmentService: RiskAssessmentService) {
        super(_localeService, _translationService, _cdRef);
        this._currentRiskAssessment = new RiskAssessment();

    }
    @Input('context')
    get context() {
        return this._context;
    }
    set context(val: any) {
        this._context = val;
    }

    get riskAssessmentProceduresFormVM(): IFormBuilderVM {
        return this._riskAssessmentProceduresFormVM;
    }

    ngOnInit() {
        this._formName = 'add-update-risk-assessment-procedures-form';
        this._riskAssessmentProceduresFormVM = new RiskAssessmentProceduresForm(this._formName);
        this._fields = this._riskAssessmentProceduresFormVM.init();
        this._stepSubscription = this._context.submitEvent.subscribe((val) => {
            if (val) {
                if (!isNullOrUndefined(this._currentRiskAssessment)) {
                    this._updatedRAProcedures = Object.assign({}, this._currentRAProcedures, <RAProcedures>this._riskAssessmentProceduresForm.value);
                    if (isNullOrUndefined(this._updatedRAProcedures.Id)) {
                        this._updatedRAProcedures.Id = this._currentRiskAssessment.Id;
                        this._riskAssessmentService._createRiskAssessmentProcedures(this._updatedRAProcedures);
                    }
                    else {
                        if (this._currentRAProcedures.Procedures !== this._updatedRAProcedures.Procedures) {
                            this._riskAssessmentService._updateRiskAssessmentProcedures(this._updatedRAProcedures);
                        }

                    }
                }
            }
        });

        this._currentRiskAssessmentSubscription$ = this._store.let(fromRoot.getCurrentRiskAssessment).subscribe((CurrentRiskAssessmentData) => {
            this._currentRiskAssessment = CurrentRiskAssessmentData;
            if (!isNullOrUndefined(CurrentRiskAssessmentData)) {
                this._currentRAProcedures = CurrentRiskAssessmentData.RAProcedures;
                this._setFormValues();
            }
            else {
                this._setDefaultValues();
            }
        });



    }
    private _setFormValues() {
        if (isNullOrUndefined(this._riskAssessmentProceduresForm)) return;
        this._riskAssessmentProceduresForm.patchValue({
            Procedures: isNullOrUndefined(this._currentRiskAssessment.RAProcedures) ? "" : this._currentRiskAssessment.RAProcedures.Procedures
        });
    }
    private _setDefaultValues() {
        if (!isNullOrUndefined(this._riskAssessmentProceduresForm)) {
            this._setFieldValue('Procedures', "");
        }
    }
    private _setFieldValue(fieldName: string, value: any) {
        let field = this._riskAssessmentProceduresForm.get(fieldName);
        if (!isNullOrUndefined(field)) {
            this._riskAssessmentProceduresForm.get(fieldName).setValue(value);
        }
    }
    onFormInit(fg: FormGroup) {
        this._riskAssessmentProceduresForm = fg;
        if (!isNullOrUndefined(this._currentRiskAssessment)) {
            this._setFormValues();
        }
    }

    onFormValidityChange(status: boolean) {
        this._context.isValidEvent.emit(status);
    }
    ngOnDestroy() {
        if (this._stepSubscription) {
            this._stepSubscription.unsubscribe();
        }
        if (this._currentRiskAssessmentSubscription$) {
            this._currentRiskAssessmentSubscription$.unsubscribe()
        }
    }
}