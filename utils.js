//UTILS
function numFromRGB(str) {
	let sep = str.indexOf(",") > -1 ? "," : " ";
	return str.substr(4).split(")")[0].split(sep).map(Number);
}

function median(arr /* array */) {
	const mid = Math.floor(arr.length / 2),
		nums = [...arr].sort((a, b) => a - b);
	return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

function RGBToHSL(rgb) {
	let sep = rgb.indexOf(",") > -1 ? "," : " ";
	rgb = rgb.substr(4).split(")")[0].split(sep);

	for (let R in rgb) {
		let r = rgb[R];
		if (r.indexOf("%") > -1) rgb[R] = Math.round((r.substr(0, r.length - 1) / 100) * 255);
	}

	// Make r, g, and b fractions of 1
	let r = rgb[0] / 255,
		g = rgb[1] / 255,
		b = rgb[2] / 255;

	// Find greatest and smallest channel values
	let cmin = Math.min(r, g, b),
		cmax = Math.max(r, g, b),
		delta = cmax - cmin,
		h = 0,
		s = 0,
		l = 0;

	// Calculate hue
	// No difference
	if (delta == 0) h = 0;
	// Red is max
	else if (cmax == r) h = ((g - b) / delta) % 6;
	// Green is max
	else if (cmax == g) h = (b - r) / delta + 2;
	// Blue is max
	else h = (r - g) / delta + 4;

	h = Math.round(h * 60);

	// Make negative hues positive behind 360°
	if (h < 0) h += 360;

	// Calculate lightness
	l = (cmax + cmin) / 2;

	// Calculate saturation
	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

	// Multiply l and s by 100
	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);

	return [h, s, l]; //"hsl(" + h + "," + s + "%," + l + "%)";
}

function throttle(callback, delay = 250) {
	let shouldWait = false;
	let buffArgs;

	const timeouter = () => {
		if (buffArgs == null) {
			shouldWait = false;
		} else {
			callback(...buffArgs);
			buffArgs = null;
			setTimeout(timeouter, delay);
		}
	};

	return (...args) => {
		if (shouldWait) {
			buffArgs = args;
			return;
		}

		callback(...args);
		shouldWait = true;
		setTimeout(timeouter, delay);
	};
}

function debounce(callback, delay = 250) {
	let timeout;

	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			callback(...args);
		}, delay);
	};
}

function filter(selector, func) {
	// Array.prototype.filter.call(document.querySelectorAll(selector), func);
	Array.prototype.filter.call(selector, func);
}

function createEnum(values) {
	const enumObject = {};
	for (const val of values) {
		enumObject[val] = val;
	}
	return Object.freeze(enumObject);
}

function showHide(boolVal, element) {
	// console.log(
	// 	'showHide: ' + boolVal + ': ' + element.firstElementChild.innerText
	// );
	if (boolVal) {
		element.classList.add("hide");
	} else {
		element.classList.remove("hide");
	}
}
//END UTILS

export { throttle, debounce, filter, createEnum, showHide, RGBToHSL };
