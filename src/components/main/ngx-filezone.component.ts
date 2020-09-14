import {
	Component,
	OnInit,
	OnDestroy,
	HostListener,
	Host,
	Input,
	Output,
	EventEmitter,
	HostBinding
} from '@angular/core';
import { FileService } from '../../file.service';
import { Subscription, Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { convertFileSize } from '../../utils';
import { CollectionSorted } from 'ng-reorder';
import { IFileError } from '../../interfaces';

@Component({
	selector: 'ngx-filezone',
	templateUrl: './ngx-filezone.component.html',
	styleUrls: ['./common.styles.sass', './drop-area.styles.sass', './file-area.styles.sass'],
	providers: [FileService]
})
export class NgxFilezoneComponent implements OnInit, OnDestroy {

	private _maxFileSize: number;

	private _maxFileNumber: number;

	private _destroy = new Subject<void>();

	private fileSubscription: Subscription;

	private errorSubscription: Subscription;

	private _tracker: number;

	private _dropAllowed: boolean;

	private _highlighted: boolean;

	public files: Array<File>;

	public allowAddFiles: boolean;

	public restrictions: string;

	public readonly destroy: Observable<void>;

	@Input() set accept(value: string) {
		this.fileService.setAcceptableTypes(value);
	}

	@Input() set maxFileSize(value: string) {
		this._maxFileSize = this.fileService.setMaxFileFize(value);
	}

	@Input() set maxFileNumber(value: number) {
		this._maxFileNumber = this.fileService.setMaxFileNumber(value);
	}

	@Output() private filesChange: EventEmitter<Array<File>> = new EventEmitter<Array<File>>();

	@Output() private errors: EventEmitter<Array<IFileError>> = new EventEmitter<Array<IFileError>>();

	@HostBinding('class.highlighted') get highlighted() {
		return this._highlighted;
	}

	@HostListener('dragover') public allowCopy() {
		this._dropAllowed = true;
	}

	@HostListener('dragleave') public disallowCopy() {
		this._dropAllowed = false;
	}

	@HostListener('drop', ['$event']) public receiveFiles($event: any) {
		const $files: FileList = $event.target.files ? $event.target.files : $event.dataTransfer.files;
		this._tracker = 0;
		this.unhighlight();
		this.fileService.receiveFiles($files);
	}

	@HostListener('window:dragenter') public countUp() {
		if (!this._tracker) {
			this.highlight();
		}
		++this._tracker;
	}

	@HostListener('window:dragleave') public countDown() {
		--this._tracker;
		if (!this._tracker) this.unhighlight();
	}

	@HostListener('window:dragover', ['$event']) public windragover(e: DragEvent) {
		if (this._dropAllowed) e.dataTransfer.dropEffect = 'copy';
		else e.dataTransfer.dropEffect = 'none';
		e.preventDefault();
	}

	@HostListener('window:drop', ['$event']) public windrop(e: DragEvent) {
		e.preventDefault();
		this._tracker = 0;
		this.unhighlight();
	}

	constructor(@Host() public fileService: FileService) {
		this.files = new Array<File>();
		this._tracker = 0;
		this._maxFileSize = this._maxFileNumber = 0;
		this._highlighted = false;
		this.destroy = this._destroy.asObservable();
	}

	public ngOnInit(): void {

		this.getRestrictionString();

		this.fileSubscription = this.fileService.filesNotifier.pipe(takeUntil(this._destroy)).subscribe({
			next: (x: Array<File>) => {
				this.files = x;
				this.getRestrictionString();
				this.allowAddFiles = !this._maxFileNumber ||
					this._maxFileNumber - this.files.length >= 1;
				this.filesChange.emit(x);
			}
		});

		this.errorSubscription = this.fileService.errorNotifier.pipe(takeUntil(this._destroy)).subscribe({
			next: (x: Array<IFileError>) => {
				this.errors.emit(x);
			}
		});

	}

	public ngOnDestroy(): void {
		this._destroy.next();
		this._destroy.complete();
	}

	public clear() {
		this.fileService.deleteAll();
	}

	public getAccept(): string {
		return this.fileService.getAcceptableTypes();
	}

	public addFile(file?: File) {
		const input = document.createElement('input');
		input.type = 'file';
		if (!this._maxFileNumber || this._maxFileNumber - this.files.length > 1 && !file) input.multiple = true;
		input.onchange = (e) => {
			if (!file) this.fileService.receiveFiles(input.files);
			else this.fileService.replaceFile(file, input.files[0]);
		};

		input.click();
	}

	public deleteFile(file: File) {
		this.fileService.delete(file);
	}

	public sort(e: CollectionSorted) {
		this.fileService.sort(e.previousIndex, e.currentIndex);
	}

	private getRestrictionString() {
		const size = this._maxFileSize ? `Max ${convertFileSize(this._maxFileSize)} per file` : ``;
		const count = this._maxFileNumber > 1 ? `Max ${this._maxFileNumber} files` : this._maxFileNumber === 1 ? `One file only` : ``;
		const count_left = count === `` || this._maxFileNumber - this.files.length === this._maxFileNumber ?
			count : this._maxFileNumber - this.files.length === 1 ?
				`${count} (1 file left)` : `${count} (${this._maxFileNumber - this.files.length} files left)`;

		this.restrictions = [size, count_left].filter(Boolean).join('. ');
	}

	private highlight() {
		this._highlighted = true;
	}

	private unhighlight() {
		this._highlighted = false;
	}
}
