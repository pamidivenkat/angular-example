import { CitationAtlasWebappPage } from './app.po';

describe('citation-atlas-webapp App', function() {
  let page: CitationAtlasWebappPage;

  beforeEach(() => {
    page = new CitationAtlasWebappPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
