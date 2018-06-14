import { environment } from '../../../environments/environment';

export class CommonHelpers {
    static writeToConsole(data:any){
        console.log(data);
    }
     static writeExceptionToConsole(ex:any){
         if(!environment.production){
             CommonHelpers.writeToConsole(ex.constructor.name);
             CommonHelpers.writeToConsole(ex.context.component);
             CommonHelpers.writeToConsole(ex.message);
         }
     }     
}
