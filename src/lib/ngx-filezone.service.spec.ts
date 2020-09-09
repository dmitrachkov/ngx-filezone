import { TestBed } from '@angular/core/testing';

import { NgxFilezoneService } from './ngx-filezone.service';

describe('NgxFilezoneService', () => {
	let service: NgxFilezoneService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(NgxFilezoneService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
