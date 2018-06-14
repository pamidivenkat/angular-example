import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import {
  TrainingCoursesHeaderComponent
} from './components/training-courses-header/training-courses-header.component';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { initLocalizationWithAdditionProviders, LocalizationConfig } from '../../shared/localization-config';
import { TrainingCoursesComponent } from "./container/training-courses/training-courses";
import { TrainingCourseListComponent } from "./components/training-courses-list/training-courses-list";
import { routes } from './training-courses.routes';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingCourseService } from './services/training-courses.service';
import { TrainingCourseFormComponent } from "./components/training-courses.form/training-courses-form.component";
import { TrainingCourseInviteComponent } from './components/training-course-invite/training-course-invite.component';
import { AssignTraineesComponent } from './components/assign-trainees/assign-trainees.component';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AtlasElementsModule,
    RouterModule.forChild(routes),
    LocalizationModule,
    AtlasSharedModule
  ],
  declarations: [
    TrainingCoursesComponent,
    TrainingCourseListComponent,
    TrainingCourseFormComponent,
    TrainingCoursesHeaderComponent,
    TrainingCourseInviteComponent,
    AssignTraineesComponent

  ],
  exports: [TrainingCoursesComponent],
  providers: [LocalizationConfig, TrainingCourseService]
})
export class TrainingCourseModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {    
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Training, label: 'Training courses', url: '/training/training-course' };
    this._breadcrumbService.add(bcItem);
  }
}
