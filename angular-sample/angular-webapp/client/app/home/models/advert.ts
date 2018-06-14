export class Advert {
    Id: string;
    Name: string;
    Url: string;
    Description: string;
    AdvertType: AdvertType;
    PictureId: string;
    Text: string;
}

export enum AdvertType {
    Referral = 1,
    Redirect = 2
}