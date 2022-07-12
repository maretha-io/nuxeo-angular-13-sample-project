import { TestBed } from '@angular/core/testing';

import { DocumentBrowserService } from './document-browser.service';

describe('DocumentBrowserService', () => {
  let service: DocumentBrowserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentBrowserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
