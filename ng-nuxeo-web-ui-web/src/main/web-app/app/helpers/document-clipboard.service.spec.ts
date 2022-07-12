import { TestBed } from '@angular/core/testing';

import { DocumentClipboardService } from './document-clipboard.service';

describe('DocumentClipboardService', () => {
  let service: DocumentClipboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentClipboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
