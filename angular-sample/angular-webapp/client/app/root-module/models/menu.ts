export interface Menu {
    Id: string
    Title: string;
    LinkTitle: string;
    Description: string;
    CssClass: string;
    PassParams: boolean;
    NavigateTo: string;
    RequireCid: boolean;
    Action: string;
    ParentId: string
    OrderNumber: number;
    LinkOrigin: LinkOrigin;
    Target:LinkTarget;
    MenuItems: Menu[];
}

export enum LinkOrigin {
    AtlasV1 = 1,
    AtlasV2 = 2
}

export enum LinkTarget {
    Self = 1,
    Blank = 2
}