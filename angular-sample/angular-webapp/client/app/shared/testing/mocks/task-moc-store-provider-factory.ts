import { TaskCategory } from '../../../task/models/task-categoy';
import { TasksView } from '../../../task/models/task';

export class TaskMocStoreProviderFactory {

    public static getTaskCategories(): Array<TaskCategory> {
        let json = '[ { "Id": "2ee3fe1f-b502-4e0b-b14e-cc0e51fa212e", "Name": "Accident Log" }, { "Id": "062e7807-1f64-4c03-88a5-c4075509ebbe", "Name": "Checklist" }, { "Id": "e4cb4fe8-c551-492c-b08d-3edeb277a0c5", "Name": "Documents" }, { "Id": "8954a05d-82ae-49f3-9979-02ebdd7b933b", "Name": "Employee" }, { "Id": "c0a7ca1e-5ee7-4bd8-b591-3ff0cc8fc03b", "Name": "General" }, { "Id": "9fc1f7a0-a671-47c7-92ec-c67dd670a706", "Name": "Holiday & Absence requests" }, { "Id": "8f6190a9-8d2c-4972-ae5b-d0f3bc584d4f", "Name": "Method Statement" }, { "Id": "c48e39ef-1273-479a-bc28-26ddfcb9e921", "Name": "Personal" }, { "Id": "e469fc29-886a-44bc-8378-26002f480d52", "Name": "Risk Assessment" }, { "Id": "3c1ba2c4-a32a-4428-8473-43d8b48a47bd", "Name": "Site Visit" }, { "Id": "dea7cf6e-6921-42dc-93cd-d65774a19f71", "Name": "Training" } ]';
        let categories = <Array<TaskCategory>>JSON.parse(json);
        return categories;
    }

    public static getTaskDetails(): TasksView {
        let json = '{"Id":"e28d7c37-f4c6-4ab5-ab3e-4a67882ac141","Title":"A new document has been distributed and requires action","Status":0,"Priority":1,"CreatedOn":"2017-12-11T10:08:02.433","DueDate":"2017-12-18T10:07:53.467","Description":"<p>A new document has been distributed to you and can be found by clicking</p>","AssignedTo":"b0623072-c372-4488-83a6-910e6ba434d1","AssignedUserName":"David-up Clark-up","CreatedBy":"ec69e0db-078a-4d86-a44d-8dc4ab876026","CreatedByUserName":"System User","TaskCategoryId":"e4cb4fe8-c551-492c-b08d-3edeb277a0c5","TaskCategoryName":"Documents","CorrectiveActionTaken":null,"CostOfRectification":null,"PercentageCompleted":null,"CompanyId":"5ae84046-482c-4ce3-980b-6a1f6385a8d3","RegardingObjectId":"55328375-f826-460a-81fe-f1abdf36c920"}';
        let task = <TasksView>JSON.parse(json);
        return task;
    }

    public static getSitevisitTaskDetails(): TasksView {
        let json = '{"Id":"2716d529-aae7-4594-aad8-b196376d2c39","Title":"sitevisit task","Status":0,"Priority":0,"CreatedOn":"2017-12-15T12:30:44.733","DueDate":"2017-12-15T12:30:00.493","Description":"recommendation","AssignedTo":"b0623072-c372-4488-83a6-910e6ba434d1","AssignedUserName":"David-up Clark-up","CreatedBy":"b0623072-c372-4488-83a6-910e6ba434d1","CreatedByUserName":"David-up Clark-up","TaskCategoryId":"3c1ba2c4-a32a-4428-8473-43d8b48a47bd","TaskCategoryName":"Site Visit","CorrectiveActionTaken":"","CostOfRectification":90.00,"PercentageCompleted":0.0,"CompanyId":"5ae84046-482c-4ce3-980b-6a1f6385a8d3","RegardingObjectId":null}';
        let task = <TasksView>JSON.parse(json);
        return task;
    }
}
