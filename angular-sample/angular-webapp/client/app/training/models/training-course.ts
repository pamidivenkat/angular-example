export class TrainingCourse {
	Id: string;
	Title: string;
	Description: string;
	Version: string;
	Type: string;
	CreatedOn: string;
	IsCompleted: boolean;
	TrainingModules: TrainingModule[];
	IsAtlasTraining: boolean;
	IsExample: boolean;
}


export class TrainingModule {
	Id: string;
	Title: string;
}