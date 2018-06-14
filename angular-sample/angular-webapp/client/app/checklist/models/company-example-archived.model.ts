import { SectorModel } from './sector.model';
import { Workspace } from './workspace.model';
export class CompanyOrExampleOrArchivedChecklist {
    Id: string;
    IsExample: boolean;
    IsArchived: boolean;
    Name: string;
    SiteId: string;
    SiteLocation: string;
    SiteName: string;
    WorkspaceTypes:Array<Workspace>;
    Sectors: Array<SectorModel>;
}