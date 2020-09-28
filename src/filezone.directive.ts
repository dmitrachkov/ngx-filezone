import { DOCUMENT } from '@angular/common';
import {
	ContentChildren, Directive, ElementRef, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, QueryList, Self
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileService } from './file.service';
import { FilezoneButton } from './filezone-button.directive';
import { FilezoneDropArea } from './filezone-drop-area.directive';
import { IFileError } from './interfaces';

@Directive({
	selector: '[filezone]',
	exportAs: 'filezone',
	providers: [FileService],
	host: {
		'[class.filezone]': 'true'
	}
})
export class Filezone implements OnInit, OnDestroy {

	@Input()
	set accept(value: string) {
		this._service.setAllowedFileTypes(value);
	}
	/** Comma-separated list of allowed file extensions or MIME types or an empty string when not defined */
	get accept(): string {
		return this._service.getAllowedFileTypes();
	}

	@Input()
	set sizeLimit(value: string) {
		this._service.setFileSizeLimit(value);
	}
	/** Current limit of size per file or 0 if not defined */
	get sizeLimitInBytes(): number {
		return this._service.getFileSizeLimit();
	}

	@Input()
	set limitOfFiles(value: number) {
		this._service.setLimitOfFiles(value);
	}
	/** Current limit of total amount of files or 0 if not defined */
	get limitOfFiles(): number {
		return this._service.getLimitOfFiles();
	}

	/** Emits after a drag event carrying files has detected on the document */
	@Output('docdragbegin') private _docDragBegin = new EventEmitter<void>();

	/** Emits when user drops files or the draging event is leaving the document */
	@Output('docdragfinish') private _docDragFinish = new EventEmitter<void>();

	/** Same as 'docdragbegin' event but at the host element or restricted drop area */
	@Output('dragbegin') private _dragBegin = new EventEmitter<void>();

	/** Same as 'docdragfinish' event but at the host element or restricted drop area */
	@Output('dragfinish') private _dragFinish = new EventEmitter<void>();

	/** Emits every time whether number of files or file sequence has changed */
	@Output('filechange') private _fileChange = new EventEmitter<Array<File>>();

	/** Emits if some of files don't fit current restrictions after user's input */
	@Output('errors') private _errors = new EventEmitter<Array<IFileError>>();

	@ContentChildren(FilezoneButton, { descendants: true, read: ElementRef }) private _buttons!: QueryList<ElementRef<HTMLElement>>;

	@ContentChildren(FilezoneDropArea, { descendants: true, read: ElementRef }) private _dropAreas!: QueryList<ElementRef<HTMLElement>>;

	private _destroy = new Subject<void>();

	private _hostDragOverTracker = 0;

	private _windowDragOverTracker = 0;

	private _document: HTMLDocument;

	private _dropEffect: 'copy' | 'none' = 'none';

	/** Array of files that currently inside the filezone */
	public files = new Array<File>();

	/** True when user is dragging files over the document */
	get windowHasDraggingEvent(): boolean {
		return this._windowDragOverTracker > 0;
	}

	/** True when user is dragging files over the host element or restricted drop area */
	get hostHasDraggingEvent(): boolean {
		return this._hostDragOverTracker > 0;
	}

	constructor(
		@Self() private _service: FileService, @Inject(DOCUMENT) document: any,
		private _zone: NgZone, private _host: ElementRef
	) {
		this._document = document as HTMLDocument;
	}

	public ngOnInit() {
		this._zone.runOutsideAngular(() => {
			fromEvent(this._document, 'dragenter', { passive: true }).pipe(takeUntil(this._destroy))
				.subscribe((e: DragEvent) => this._onWindowDragEnter(e));

			fromEvent(this._document, 'dragleave', { passive: true }).pipe(takeUntil(this._destroy))
				.subscribe((e: DragEvent) => this._onWindowDragLeave(e));

			fromEvent(this._document, 'dragover', { capture: true }).pipe(takeUntil(this._destroy))
				.subscribe((e: DragEvent) => this._onWindowDragOver(e));

			fromEvent(this._host.nativeElement, 'dragenter', { passive: true }).pipe(takeUntil(this._destroy))
				.subscribe((e: DragEvent) => this._onDragEnter(e));

			fromEvent(this._host.nativeElement, 'dragleave', { passive: true }).pipe(takeUntil(this._destroy))
				.subscribe((e: DragEvent) => this._onDragLeave(e));

			fromEvent(this._host.nativeElement, 'drop', { capture: true }).pipe(takeUntil(this._destroy))
				.subscribe((e: DragEvent) => this._onDrop(e));

			fromEvent(this._host.nativeElement, 'click', { capture: true }).pipe(takeUntil(this._destroy))
				.subscribe((e: MouseEvent) => this._onClick(e));
		});

		this._service.filesNotifier.pipe(takeUntil(this._destroy))
			.subscribe((files: Array<File>) => this._zone.run(() => {
				this.files = files;
				this._fileChange.emit(files);
			}));

		this._service.errorNotifier.pipe(takeUntil(this._destroy))
			.subscribe((errors: Array<IFileError>) => this._emit(this._errors, errors));
	}

	public ngOnDestroy() {
		this.deleteAllFiles();
		this._destroy.next();
		this._destroy.complete();
	}
	/** Deletes all files from the filezone */
	public deleteAllFiles(): void {
		this._service.deleteAll();
	}

	/** Deletes a specified file with given index in filezone */
	public deleteFile(index: number): void {
		this._service.delete(index);
	}

	/** Gets files to the filezone */
	public recieveFiles(files: FileList | Array<File>): void {
		const $files = Array.from(files);
		this._service.receiveFiles($files);
	}

	/** Method will open the file dialog window (has to be fired by users action) and replace a specified file */
	public replaceFile(index: number): void {
		const input = this._openFileDialogue(false);
		input.onchange = () => {
			this._service.replaceFile(index, input.files[0]);
		};
	}
	/** Method replaces specified file for the new one */
	public replaceFileFor(index: number, file: File): void {
		this._service.replaceFile(index, file);
	}
	/** Move file FROM the given old position in the filezone TO the new position */
	public sort(from: number, to: number): void {
		this._service.sort(from, to);
	}
	/** Swap two files at the given indexes in the filezone */
	public swap(first: number, second: number): void {
		this._service.swap(first, second);
	}

	/** Checks if emitter has observers. If true emits value */
	private _emit<T>(emitter: EventEmitter<T>, parameters?: T) {
		if (emitter.observers.length) this._zone.run(() => emitter.emit(parameters));
	}

	private _isDragEventHasFiles(event: DragEvent) {
		return event.dataTransfer.types.includes('Files');
	}

	private _isEventInside(event: Event, elementList: QueryList<ElementRef<HTMLElement>>) {
		const target = event.target as HTMLElement;
		// if elementList is undefined return true otherwise check the list items if one of them is the target or not
		return !elementList.length ?
			true : !!elementList.toArray().map(e => e.nativeElement).filter((e) => e.contains(target) || e === target).length;
	}

	private _onClick(e: MouseEvent) {
		if (!this._isEventInside(e, this._buttons)) return;
		const multiple = !this.limitOfFiles || this.limitOfFiles - this.files.length > 1 ? true : false;
		const input = this._openFileDialogue(multiple);
		input.onchange = () => this.recieveFiles(input.files);
	}

	private _onDragEnter(e: DragEvent) {
		if (this._isEventInside(e, this._dropAreas) && this._isDragEventHasFiles(e)) {
			if (++this._hostDragOverTracker === 1) {
				this._dropEffect = 'copy';
				this._emit(this._dragBegin);
			}
		}
	}

	private _onDragLeave(e: DragEvent) {
		if (this._isEventInside(e, this._dropAreas) && this._isDragEventHasFiles(e)) {
			if (--this._hostDragOverTracker === 0) {
				this._dropEffect = 'none';
				this._emit(this._dragFinish);
			}
		}
	}

	private _onDrop(e: DragEvent) {
		e.preventDefault();
		this._stopDragSequence();
		if (!this._isEventInside(e, this._dropAreas)) return;
		const files = e.dataTransfer.files;
		this.recieveFiles(files);
	}

	private _onWindowDragEnter(e: DragEvent) {
		if (!this._isDragEventHasFiles(e)) return;
		if (++this._windowDragOverTracker === 1) this._startDragSequence();
	}

	private _onWindowDragLeave(e: DragEvent) {
		if (!this._isDragEventHasFiles(e)) return;
		if (--this._windowDragOverTracker === 0) this._stopDragSequence();
	}

	private _onWindowDragOver(e: DragEvent) {
		e.preventDefault();
		e.dataTransfer.dropEffect = this._dropEffect;
	}

	private _openFileDialogue(multiple = false): HTMLInputElement {
		const input = this._document.createElement('input');
		input.type = 'file';
		input.multiple = multiple;
		input.accept = this.accept;
		input.click();
		return input;
	}

	private _startDragSequence() {
		this._emit(this._docDragBegin);
	}

	private _stopDragSequence() {
		if (this._hostDragOverTracker > 0) this._emit(this._dragFinish);
		this._emit(this._docDragFinish);
		this._hostDragOverTracker = 0;
		this._windowDragOverTracker = 0;
		this._dropEffect = 'none';
	}
}
