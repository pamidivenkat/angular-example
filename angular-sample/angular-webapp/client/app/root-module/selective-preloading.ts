import { Observable } from 'rxjs/Rx';
import { PreloadingStrategy, Route } from '@angular/router';

export class SelectivePreLoading implements PreloadingStrategy{
    preload(route:Route, load:Function):Observable<any>{
        if(route.data && route.data["preload"]) 
        {
            // add delay for preloading modules.
            setTimeout(function(){
                return load();
            }
            ,5000);
            
        }
        
        return Observable.of(null)
    }
}