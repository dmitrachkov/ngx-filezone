import {
	Component,
	Input,
	ViewChild,
	SkipSelf,
	ViewContainerRef,
	ComponentFactoryResolver,
} from '@angular/core';
import { FileService } from '../file.service';
import { SvgPreviewComponent } from '../svg-preview/svg-preview/svg-preview.component';
import { FileProperties } from '../interfaces';

@Component({
	selector: 'fz-card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.sass'],
	entryComponents: [SvgPreviewComponent],
})
export class CardComponent {

	public props: FileProperties;

	@Input() set source(file: File) {
		this._getProperties(file);
	}

	@ViewChild('preview', { read: ViewContainerRef, static: true }) private _preview: ViewContainerRef;

	constructor(
		@SkipSelf() private fileService: FileService,
		private _resolver: ComponentFactoryResolver
	) {
		this.props = {};
	}

	private _getProperties(file: File) {
		this.fileService.getFileProperties(file).then(x => {
			this.props = x;
			if (!this.props.url) this._loadSVGPreview(this.props.type, file.name.match(/\.[0-9a-z]+$/i)[0] || '');
		});
	}

	private _loadSVGPreview(value: string, extention: string) {
		const componentFactory = this._resolver.resolveComponentFactory(SvgPreviewComponent);

		this._preview.clear();

		const componentRef = this._preview.createComponent<SvgPreviewComponent>(componentFactory);
		componentRef.instance.type = value;
		componentRef.instance.extension = extention;
	}

}
