import { TestBed } from '@angular/core/testing';

import { IoTService } from './io-t.service';

describe('IoTService', () => {
  let service: IoTService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IoTService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
