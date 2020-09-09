import { FileSizeExp } from './enums';

export function convertFileSize(value: number): string {

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

export function parseFileSizeInBytes(value: string): number {

	const _value = parseFloat(value);
	const _exp = value.match(/(B|KB|MB|GB)/i);

	if (!!isNaN(_value) || !_exp || !_value)
		return 0;

	return Math.round(Math.pow(2, FileSizeExp[_exp[0].toUpperCase()]) * _value);

}

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
