import { DocumentArea } from './document-area';
export class DocumentCategory {
Id:string;
Name:string;
Code:number;
DocumentArea:DocumentArea;
OrderNumber?:number;
IsDistributable:boolean;
Service:number;
}