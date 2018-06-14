import { TaskListComponent } from './task-list/task-list.component';
import { AuthGuard } from "../shared/security/auth.guard";
import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', component: TaskListComponent, canActivate: [AuthGuard] },
    { path: ':filterBy/:filterValue', component: TaskListComponent, canActivate: [AuthGuard],  data: { preload: false, title: 'Task - List' } },
    { path: ':filterBy/:filterValue/:filterCategory', component: TaskListComponent, canActivate: [AuthGuard],  data: { preload: false, title: 'Task - List' } }
];