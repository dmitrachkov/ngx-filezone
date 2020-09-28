import { FileSizeExp } from './enumerations';

/** Transforms value in bytes to readable string using base 2 (binary) system -
 * 1 KB equal to 1024 bytes
 * @example convertFileSize(5833523) => '5.56 MB'
 */
export function convertFileSizeToString(value: number): string {

	let exp = Math.log2(value);

	exp = exp < 10 ? 0 : Math.round(exp - exp % 10);

	if (value < 1000) {
		return `${value} ${FileSizeExp[exp]}`;
	}

	if (exp >= FileSizeExp.TB) return `> 1 TB`;

	else {
		let result = value / Math.pow(2, exp);
		if (result >= 970) {
			exp += 10;
			result = value / Math.pow(2, exp);
		}
		result = result >= 100 ? parseFloat(result.toFixed(1)) : parseFloat(result.toFixed(2));
		return `${result} ${FileSizeExp[exp]}`;
	}
}

/** Converting string representing size of file (4 MB, 5.35 KB, etc) to numeric value using base 2 (binary) system -
 * 1 KB equal to 1024 bytes
 * @returns Numeric value in bytes or 0 if no value has found
 * @example parseFileSizeInBytes('2.85MB') => 2988442
 */
export function convertFileSizeToBytes(value: string): number {

	const _value = parseFloat(value);
	const _exp = value.match(/(B|KB|MB|GB)/i);

	if (!!isNaN(_value) || !_exp || !_value)
		return 0;

	return Math.round(Math.pow(2, FileSizeExp[_exp[0].toUpperCase()]) * _value);

}

/** Transforms numeric value in seconds to HH:MM:SS string or MM:SS if hours is equal to 0 */
export function secondsToTimeString(time: number): string {
	const value = Math.round(time);
	let hours: number | string = Math.floor(value / 3600);
	let minutes: number | string = Math.floor((value - (hours * 3600)) / 60);
	let seconds: number | string = value - (hours * 3600) - (minutes * 60);

	if (hours < 10 && hours > 0) hours = '0' + hours;
	if (minutes < 10) minutes = '0' + minutes;
	if (seconds < 10) seconds = '0' + seconds;

	if (!hours) return [minutes, seconds].join(':');
	return [hours, minutes, seconds].join(':');
}

/**
 * @param array array to reorder
 * @param begin the index which is moving in the array
 * @param end the index where the array[begin] is moving to
 */
export function reorderItems<T = any>(array: T[], begin: number, end: number): T[] {

	if (array.length === 0) {
		return;
	}

	begin = fit(begin, array.length - 1);

	end = fit(end, array.length - 1);

	if (begin === end || end === -1 || begin === -1) {
		return array;
	}

	const shift = begin < end ? 1 : -1;
	const anchor = array[begin];

	for (let i = begin; i !== end; i += shift) {
		array[i] = array[i + shift];
	}

	array[end] = anchor;

	return array;
}

/**
 * @param array array to reorder
 * @param a the index of first element
 * @param b the index of second element
 */

/** To ensure to get a number not less than zero and not greater than a given max value
 * @param value number to check
 * @param max max value
 */
export function fit(value: number, max: number): number {
	if (isNaN(value) || value === null) {
		return -1;
	}
	return Math.max(0, Math.min(value, max));
}
