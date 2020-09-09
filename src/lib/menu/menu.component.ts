import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Component({
	selector: 'fz-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {

	@HostBinding('class.opened')
	public openedMenu: boolean;

	private readonly _document: Document;

	constructor(@Inject(DOCUMENT) document: any) {
		this._document = document as Document;
		this.openedMenu = false;
	}

	ngOnInit(): void {
	}

	public openMenu(e: Event) {
		this.openedMenu = true;

		fromEvent(this._document, 'mousedown').pipe(take(1)).subscribe((x) => {
			this.closeMenu(x);
		});
	}

	public closeMenu(x: Event) {
		if (x.type === 'click') this.openedMenu = false;
		else setTimeout(() => this.openedMenu = false, 250);
	}

}
