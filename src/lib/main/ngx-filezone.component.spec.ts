import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxFilezoneComponent } from './ngx-filezone.component';

describe('NgxFilezoneComponent', () => {
	let component: NgxFilezoneComponent;
	let fixture: ComponentFixture<NgxFilezoneComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [NgxFilezoneComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(NgxFilezoneComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
