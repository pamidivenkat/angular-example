import { PlantandequipmentContainerComponent } from './containers/plantandequipment-container/plantandequipment-container.component';
import { Routes } from '@angular/router';
import { AuthGuard } from './../../shared/security/auth.guard';


export const routes: Routes = [
    {
        path: '',
        component: PlantandequipmentContainerComponent,
        canActivate: [AuthGuard]       
    }
];
