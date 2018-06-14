import { TrainingCourseInviteComponent } from './components/training-course-invite/training-course-invite.component';
import { AuthGuard } from '../../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { TrainingCoursesComponent } from "./container/training-courses/training-courses";

export const routes: Routes = [
    { path: '', component: TrainingCoursesComponent, canActivate: [AuthGuard] },
    {
        path: 'invitees/:id', component: TrainingCourseInviteComponent, canActivate: [AuthGuard]
    },
]