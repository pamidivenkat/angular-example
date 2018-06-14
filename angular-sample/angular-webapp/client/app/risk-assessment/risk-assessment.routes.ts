import { RiskAssessmentRouteResolver } from './services/risk-assessment-resolver';
import { RiskAssessmentConstants } from './risk-assessment-constants';
import { PreviewComponent } from './components/preview/preview.component';
import { AddEditComponent } from './components/add-edit/add-edit.component';
import { AuthGuard } from '../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { RiskAssessmentsContainer } from './containers/risk-assessments/risk-assessments.component';
import { RiskAssessmentListComponent } from './components/risk-assessment-list/risk-assessment-list.component';

export const routes: Routes =
    [
        {
            path: '', component: RiskAssessmentsContainer, canActivate: [AuthGuard], data: { preload: false, title: 'Risk assessment - List' }
            , children: [
                { path: RiskAssessmentConstants.Routes.OverDue, component: RiskAssessmentListComponent, data: { preload: false, title: 'Overdue Risk assessment' } },
                { path: RiskAssessmentConstants.Routes.Pending, component: RiskAssessmentListComponent,  data: { preload: false, title: 'Pending Risk assessment' }},
                { path: RiskAssessmentConstants.Routes.Live, component: RiskAssessmentListComponent,  data: { preload: false, title: 'Live Risk assessment' } },
                { path: RiskAssessmentConstants.Routes.Examples, component: RiskAssessmentListComponent,  data: { preload: false, title: 'Example Risk assessment' } },
                { path: RiskAssessmentConstants.Routes.Archived, component: RiskAssessmentListComponent,  data: { preload: false, title: 'Archived Risk assessment' } }
            ]
        },
        {
            path: 'add', component: AddEditComponent, canActivate: [AuthGuard], resolve: { stateClear: RiskAssessmentRouteResolver },  data: { preload: false, title: 'Risk assessment - Add' }
        },
        {
            path: 'add/:example', component: AddEditComponent, canActivate: [AuthGuard], resolve: { stateClear: RiskAssessmentRouteResolver },  data: { preload: false, title: 'Example Risk assessment - Add' }
        },
        {
            path: 'edit/:id', component: AddEditComponent, canActivate: [AuthGuard], resolve: { stateClear: RiskAssessmentRouteResolver },  data: { preload: false, title: 'Risk assessment - Update' }
        },
        {
            path: 'edit/:example/:id', component: AddEditComponent, canActivate: [AuthGuard], resolve: { stateClear: RiskAssessmentRouteResolver },  data: { preload: false, title: 'Example Risk assessment - Update' }
        },
        {
            path: ':id', component: PreviewComponent, canActivate: [AuthGuard], resolve: { stateClear: RiskAssessmentRouteResolver },  data: { preload: false, title: 'Risk assessment - View' }
        },
        {
            path: ':example/:id', component: PreviewComponent, canActivate: [AuthGuard], resolve: { stateClear: RiskAssessmentRouteResolver },  data: { preload: false, title: 'Example Risk assessment - View' }
        }
    ]