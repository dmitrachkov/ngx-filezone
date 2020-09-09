import { Injectable } from '@angular/core';
import { NgxFilezoneComponent } from './main/ngx-filezone.component';

@Injectable()
export class NgxFilezoneService {

	private instances: Set<NgxFilezoneComponent>;

	constructor() { }

}
