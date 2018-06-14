import { Sector } from '../../shared/models/sector';
import { WorkspaceTypes } from '../../shared/models/lookup.models';
import { ChecklistWorkspaceTypes } from './checklistworkspacetypes.model';
import { CheckListAssignment } from './checklist-assignment.model';
import { CheckItem } from './checkitem.model';
import { Workspace } from './workspace.model';
export class Checklist {
	Id: string;
	CheckListId: string;
	Status: number;
	AssignedToId: string;
	IsExample: boolean;
	Name: string;
	NextDueDate: string;
	Periodicity: number;
	ScheduledDate: string;
	SiteId: string;
	SiteLocation: string;
	SiteName: string;
	WorkspaceTypes: Array<Workspace>;
	Sectors: Array<Sector>;
	firstname: string;
	lastname: string;
	CheckItems: CheckItem[];
	CheckListAssignments: CheckListAssignment[];
	IsArchived: boolean;
	Site: Site;
	CompanyId: string;
	CreatedBy: string;
	CreatedOn: Date;
	IsDeleted: boolean;
	LCid: number;
	ModifiedBy: string;
	ModifiedOn: string;
	Modifier: string;
	Version: string;

}

export class Site {
	Id: string;
	Name: string;
	CompanyId: string;
	RegionId: string
	Region: string
	IsHeadOffice: false;
	AddressId: string
	Address: string
	SalesforceSiteID: string
	AddressMultiLine: string;
	AddressNewlineMultiLine: string;
	AddressLine: string;
	IsActive: boolean
	SectorId: string
	Sector: any
	Description: string;
	Notes: any
	SiteNameAndPostcode: string
	IsCQCProPurchased: string
	CQCProProduct: string
	CQCProPackage: string
	NoOfCQCProSiteUsers: string
	CQCProAPIKey: string
	LogoId: string
	Logo: string;
	CreatedOn: Date;
	ModifiedOn: Date;
	CreatedBy: string;
	ModifiedBy: string;
	IsDeleted: boolean
	LCid: number;
	Version: string
	Author: string
	Modifier: string
}