import { Store } from "@ngrx/store";
import { Procedure } from "./../../../method-statements/procedures/models/procedure";
import { isNullOrUndefined } from "util";
import { BehaviorSubject } from "rxjs";

export class ProcedureServiceStub {
    // public documentDetails: BehaviorSubject<DocumentDetails> = new BehaviorSubject<DocumentDetails>(null);
private _isExampleProcedure: boolean;

  set isExampleProcedure(val: boolean) {
    this._isExampleProcedure = val;
  }
  get isExampleProcedure(): boolean {
    return this._isExampleProcedure;
  }

  
  saveProcedureDetails(procedure: Procedure) {
    // this._store.dispatch(new procedureActions.AddProcedureAction(procedure));
  }
  updateProcedureDetails(procedure: Procedure) {
    // this._store.dispatch(new procedureActions.UpdateProcedureAction(procedure));
  }
  copyProcedureDetails(procedure: Procedure) {
    // this._store.dispatch(new procedureActions.CopyProcedureAction(procedure));
  }

  validateProcedureName(name: string): any {
    // let params: URLSearchParams = new URLSearchParams;
    // return this._data.get(`Procedure`, { search: null }).map((res) => {return res.json()});
    
  //  return false
  }



  private mergeProcedureWithProcedure(procedureOldEntitiy: any, procedureNewEntity: Procedure): Procedure {
    if (!isNullOrUndefined(procedureNewEntity)) {
      procedureOldEntitiy.Name = procedureNewEntity.Name;
      procedureOldEntitiy.Id = ''; // As this is new object to save
    }

    return procedureOldEntitiy;
  }

  ngOnInit() {
  }
}
