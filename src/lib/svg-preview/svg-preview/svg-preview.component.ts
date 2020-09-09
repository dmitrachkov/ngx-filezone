import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'fz-svg-preview',
	templateUrl: './svg-preview.component.html',
	styleUrls: ['./svg-preview.component.sass']
})
export class SvgPreviewComponent implements OnInit {

	@Input() public type: string;

	@Input() public extension: string;

	constructor() { }

	ngOnInit(): void {
	}

}
