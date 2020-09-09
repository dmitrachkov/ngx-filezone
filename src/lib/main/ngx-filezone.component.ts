import {
	Component,
	OnInit,
	OnDestroy,
	AfterViewInit,
	Inject,
	HostListener,
	NgZone,
	ViewChild,
	ElementRef,
	Host,
	Input,
	Output,
	EventEmitter,
	HostBinding
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FileService } from '../file.service';
import { Subscription, Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { convertFileSize } from '../utils';
import { trigger, style, transition, animate, query, stagger, animateChild } from '@angular/animations';
import { CollectionSorted } from 'ng-reorder';
import { FileError } from '../interfaces';

@Component({
	selector: 'ngx-filezone',
	templateUrl: './ngx-filezone.component.html',
	styleUrls: ['./common.styles.sass', './drop-area.styles.sass', './file-area.styles.sass'],
	providers: [FileService],
	animations: [
		trigger('openClose', [
			transition('void => *', [
				style({ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, transform: 'translateY(-10px)' }),
				animate('250ms ease-out', style({ opacity: 1, position: 'absolute', top: 0, left: 0, right: 0, transform: 'translateY(0)' }))
			]),
			transition('* => void', [
				style({ opacity: 1, position: 'absolute', top: 0, left: 0, right: 0, transform: 'scale(1)' }),
				animate('3000ms ease-out', style({ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, transform: 'scale(.5)' }))
			])
		]),
		trigger('list', [
			transition(':enter', [
				query('@card', stagger(150, animateChild()))
			])
		]),
		trigger('card', [
			transition(':enter', [
				style({ opacity: 0, width: 0, height: 0, margin: 0, padding: 0, transform: 'scale(0)', position: 'relative' }),
				animate('250ms cubic-bezier(.8,-0.6,.2,1)', style({ opacity: 1, width: '*', height: '*', margin: '*', padding: '*', transform: 'scale(1)', position: 'relative' }))
			]),
		])
	]
})
export class NgxFilezoneComponent implements OnInit, AfterViewInit, OnDestroy {

	private _maxFileSize: number;

	private _maxFileNumber: number;

	private _destroy = new Subject<void>();

	private fileSubscription: Subscription;

	private errorSubscription: Subscription;

	public files: Array<File>;

	public allowAddFiles: boolean;

	public restrictions: string;

	public readonly destroy: Observable<void>;

	private tracker: number;

	private dropAllowed: boolean;


	@Input() set accept(value: string) {
		this.fileService.setAcceptableTypes(value);
	}

	@Input() set maxFileSize(value: string) {
		this._maxFileSize = this.fileService.setMaxFileFize(value);
	}

	@Input() set maxFileNumber(value: number) {
		this._maxFileNumber = this.fileService.setMaxFileNumber(value);
	}

	@ViewChild('input') private _inputField: ElementRef<HTMLInputElement>;

	@Output() private filesChange: EventEmitter<Array<File>> = new EventEmitter<Array<File>>();

	@Output() private errors: EventEmitter<Array<FileError>> = new EventEmitter<Array<FileError>>();

	@HostBinding('class.highlighted') private highlighted: boolean;

	@HostListener('dragover', ['$event']) private allowCopy(e: DragEvent) {
		this.dropAllowed = true;
	}

	@HostListener('dragleave') private disallowCopy() {
		this.dropAllowed = false;
	}

	@HostListener('drop', ['$event']) public receiveFiles($event: any) {
		const $files: FileList = $event.target.files ? $event.target.files : $event.dataTransfer.files;
		this.tracker = 0;
		this.unhighlight();
		this.fileService.receiveFiles($files);
	}

	@HostListener('window:dragenter', ['$event']) private countUp(event: DragEvent) {
		if (!this.tracker) {
			this.highlight();
		}
		++this.tracker;
	}

	@HostListener('window:dragleave', ['$event']) private countDown() {
		--this.tracker;
		if (!this.tracker) this.unhighlight();
	}

	@HostListener('window:dragover', ['$event']) private windragover(e: DragEvent) {
		if (this.dropAllowed) e.dataTransfer.dropEffect = 'copy';
		else e.dataTransfer.dropEffect = 'none';
		e.preventDefault();
	}

	@HostListener('window:drop', ['$event']) private windrop(e: DragEvent) {
		e.preventDefault();
		this.tracker = 0;
		this.unhighlight();
	}

	constructor(@Inject(DOCUMENT) private _document: Document, private _zone: NgZone, @Host() public fileService: FileService) {
		this.files = new Array<File>();
		this.tracker = 0;
		this._maxFileSize = this._maxFileNumber = 0;
		this.highlighted = false;
		this.destroy = this._destroy.asObservable();
	}

	ngOnInit(): void {

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
			next: (x: Array<FileError>) => {
				this.errors.emit(x);
			}
		});

	}

	ngAfterViewInit(): void {
		// this._inputField.nativeElement.addEventListener('change', this.receiveFiles.bind(this));
	}

	ngOnDestroy(): void {
		this._destroy.next();
		this._destroy.complete();
	}

	public clear() {
		this.fileService.clear();
	}

	public getAccept(): string {
		return this.fileService.getAcceptableTypes();
	}

	public addFile(file?: File) {
		const input = this._document.createElement('input');
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
		this.highlighted = true;
	}

	private unhighlight() {
		this.highlighted = false;
	}
}
