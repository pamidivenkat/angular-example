import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'training-courses-header',
  templateUrl: './training-courses-header.component.html',
  styleUrls: ['./training-courses-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingCoursesHeaderComponent extends BaseComponent implements OnInit {
  private _addTrainingCourseText: string;
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router) {
    super(_localeService, _translationService, _cdRef);
    this._onTrainingCourseAdd = new EventEmitter<string>();
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Training;
  }

  get addTrainingCourseText(): string {
    return this._addTrainingCourseText;
  }
  @Output('onTrainingCourseAdd') _onTrainingCourseAdd: EventEmitter<string>;
  ngOnInit() {
    this._addTrainingCourseText = !this._claimsHelper.CanManageExamples() ? 'TRAINING_COURSE.Add_Training_Course' : 'TRAINING_COURSE.Add_Training_Course_Citation_Client'
  }

  addTrainingCourses() {
    this._onTrainingCourseAdd.emit('add');
  }

}
