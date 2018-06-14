import { EmployeeSharedModule } from './../../employee/employee-shared/employee-shared.module';
import { AtlasSharedModule } from './../../shared/atlas-shared.module';
import { BreadcrumbGroup } from '../../atlas-elements/common/models/ae-breadcrumb-group';
import { UserService } from './services/user.service';
import { routes } from './users.routes';
import { IBreadcrumb } from '../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { LocalizationConfig, initLocalizationWithAdditionProviders } from '../../shared/localization-config';
import { BreadcrumbService } from '../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, LocalizationModule, TranslationService } from 'angular-l10n';
import { RouterModule } from '@angular/router';
import { AtlasElementsModule } from '../../atlas-elements/atlas-elements.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersContainerComponent } from './container/users-container/users-container.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserAddUpdateFormComponent } from './components/user-add-update-form/user-add-update-form.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { UserViewPermissionsComponent } from './components/user-view-permissions/user-view-permissions.component';
import { UserUpdatePermissionsComponent } from './components/user-update-permissions/user-update-permissions.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { AuditLogDetailsComponent } from './components/audit-log-details/audit-log-details.component';

@NgModule({
  imports: [
    CommonModule
    , ReactiveFormsModule
    , AtlasElementsModule
    , RouterModule.forChild(routes)
    , LocalizationModule
    , AtlasSharedModule
    , EmployeeSharedModule
  ]
  , declarations: [UsersContainerComponent, UserListComponent, UserAddUpdateFormComponent,
    UserDetailComponent, UserViewPermissionsComponent, UserUpdatePermissionsComponent, AuditLogComponent, AuditLogDetailsComponent]
  , exports: [UsersContainerComponent]
  , providers: [
    LocalizationConfig,
    UserService
  ]
})
export class UsersModule {
  constructor(private _localizationConfig: LocalizationConfig
    , private _localeService: LocaleService
    , private _translationService: TranslationService
    , private _breadcrumbService: BreadcrumbService) {
    const bcItem: IBreadcrumb = { isGroupRoot: true, group: BreadcrumbGroup.Users, label: 'Users', url: '/company/user' };
    this._breadcrumbService.add(bcItem);
  }
}
