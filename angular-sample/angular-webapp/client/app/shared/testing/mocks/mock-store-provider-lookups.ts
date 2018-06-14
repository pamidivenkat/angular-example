export class MockStoreProviderLookups{
    public static getCountryDataStub(){
        let countries = JSON.parse('{"Entities":[{"Id":"712b53a8-a4a3-48ff-8d2e-2948a7809fb7","Name":"Northern Ireland"},{"Id":"e3db97ca-c86e-411e-bb2b-8a37838b07d7","Name":"Ireland"},{"Id":"244a7b8b-8b39-4254-91ae-95d3e1a143b1","Name":"Wales"},{"Id":"6975ab8a-c4b9-4bc8-b240-b4a4e79a69e0","Name":"England"},{"Id":"8f2833c4-f9c0-4d7e-8d6c-dd3cc27f0452","Name":"Scotland"}],"PagingInfo":null,"OtherInfo":null}');
        return countries;
    }
}