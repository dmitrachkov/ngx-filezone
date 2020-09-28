import { Observable, Subject } from 'rxjs';

export class Queue<T> {

	private readonly _queue: Array<T> = new Array();

	private processing = false;

	private _currentIndex = 0;

	private _move: Subject<T> = new Subject();

	public readonly move: Observable<T>;

	constructor() {
		this.move = this._move.asObservable();
	}

	private _clear() {
		this._queue.length = this._currentIndex = 0;
		this.processing = false;
	}

	private next() {
		this._move.next(this._queue[this._currentIndex]);
	}

	public rest() {
		return this._queue.slice(this._currentIndex);
	}

	public add(key: T) {

		if (!this._queue.includes(key)) {
			this._queue.push(key);
			if (!this.processing) {
				this.processing = true;
				this.next();
			}
		} else console.warn(`Element ${key} already in the queue`);
	}

	public done(key: T) {
		if (this._queue.includes(key)) {
			const index = this._queue.indexOf(key);
			this._queue[index] = null;
			this._currentIndex = index + 1;
			if (this._currentIndex === this._queue.length) this._clear();
			else {
				this.next();
			}
		} else console.error(`Element ${key} is not in the queue`);
	}
}
