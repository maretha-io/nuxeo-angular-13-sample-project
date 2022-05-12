import { TestBed } from '@angular/core/testing';

import { WebpackTranslateLoaderService } from './webpack-translate-loader.service';

describe('WebpackTranslateLoaderService', () => {
  let service: WebpackTranslateLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebpackTranslateLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
