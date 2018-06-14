import { InvQuestion } from "./incident-inv-question";

export class InvSection {
    Id: string;
    SectionName: string;
    ParentSectionId: string;
    Sequence: number;
    SectorId: string;
    InvQuestions: Array<InvQuestion>;
}