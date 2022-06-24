import { filter, throttle, debounce, showHide, RGBToHSL } from "./utils";
/* 
wersja: 2022-04-15
WYMAGANE BIBLIOTEKI: - jeszcze narazie!

lib\ac-colors.min.js
lib\jquery.min.js (3.4.1)
*/
const T_INFOS = {
	filtering: "- filtrowanie -",
};

const T_SELECTORS = {
	textInput: "#input_filtruj",
	table: "#tabela_farby",
	tbody: "#tabela_farby tbody",
	row: "#tabela_farby tbody tr",
	nameCol: "#tabela_farby tbody tr:first",
	checkOld: "#check_hide_old",
	checkEmpty: "#check_empty",
	strip: "#color_strip",
	metalic: "#metalic_range",
	dark: "#dark_range",
	grays: "#grays_range",
	ind: "#indicator",
	plus: "#plus_range",
	minus: "#minus_range",
	reset: "#reset_range",
};
Object.freeze(T_SELECTORS);

function syncFilters(e = null) {
	const input = document.querySelector(T_SELECTORS.textInput);
	const rows = document.querySelector(T_SELECTORS.tbody).getElementsByTagName("tr");
	const oldChecked = document.querySelector(T_SELECTORS.checkOld).checked;
	const emptyChecked = document.querySelector(T_SELECTORS.checkEmpty).checked;

	let inputText = input.value.toLowerCase();

	if (e?.target.id === "input_filtruj") {
		resetColorFilters("input");
	} else if (e === null) {
		resetColorFilters("indicator");
	}

	filter(rows, (el) => {
		let colorPrev = el.querySelector(".cprev");
		let text = el.firstElementChild.innerText.toLowerCase();
		let filterPatern = "";
		filterPatern += el.classList.contains("old") && oldChecked ? 0 : 1;
		filterPatern += el.classList.contains("empty") && emptyChecked ? 0 : 1;

		if (ind.dataset.filtering === "") {
			filterPatern += inputText != "" && text.indexOf(inputText) == -1 ? 0 : 1;
		} else {
			input.value = "";
			if (ind.style.display != "none" && ind.dataset.filtering === "strip") {
				filterPatern += el.classList.contains("metalize") ? 0 : 1;
				filterPatern += filterColor(colorPrev);
			}
			if (ind.dataset.filtering === "metalic") {
				filterPatern += el.classList.contains("metalize") ? 1 : 0;
			}
			if (ind.dataset.filtering === "dark") {
				filterPatern += filterDark(colorPrev);
				filterPatern += el.classList.contains("metalize") ? 0 : 1;
			}
			if (ind.dataset.filtering === "grays") {
				filterPatern += filterGrays(colorPrev);
				filterPatern += el.classList.contains("metalize") ? 0 : 1;
			}
		}
		const isOut = filterPatern.indexOf("0") > -1;

		showHide(isOut, el);
	});
	toggleButtons(false);
	strip.dataset.info = "";
}

let strip = document.querySelector("#color_strip");
let ind = document.querySelector("#indicator");
let plus = document.querySelector("#plus_range");
let minus = document.querySelector("#minus_range");
let dark = document.querySelector("#dark_range");
let metalic = document.querySelector("#metalic_range");
let grays = document.querySelector("#grays_range");
let reset = document.querySelector(T_SELECTORS.reset);

function resetColorFilters(indicator = null) {
	if (indicator === "input" || indicator === "resetor") {
		ind.style.width = "300px";
		ind.style.left = "0px";
		ind.dataset.position = 0;
		ind.dataset.filtering = "";
		ind.style.display = "none";

		toggleButtons(true);
	}

	if (indicator === "indicator" || indicator === "resetor") {
		const input = document.querySelector(T_SELECTORS.textInput);
		input.value = "";
	}

	return;
}

function setIndicator(e) {
	if (e.target.id === "reset_range") {
		resetColorFilters("resetor");
		//setTimeout(syncFilters, 30);
		const rows = document.querySelector(T_SELECTORS.tbody).getElementsByTagName("tr");
		filter(rows, (el) => {
			showHide(false, el);
		});
		//syncFilters();
		return;
	}

	if (ind.dataset.filtering !== "strip") {
		ind.style.display = "block";
		ind.style.width = "10px";
		ind.dataset.position = 349;
		ind.style.left = "349px";
	}

	setTimeout(moveIndTo, 250, e);
}

function toggleButtons(state = false) {
	if (typeof state !== "boolean") {
		return;
	}
	const displayStat = state ? "hidden" : "visible";
	plus.disabled = state;
	minus.disabled = state;
	reset.disabled = state;
	minus.style.visibility = displayStat;
	plus.style.visibility = displayStat;
	reset.style.visibility = displayStat;
}

function moveIndTo(e) {
	// Get the target
	const target = e.target;

	ind.dataset.filtering = "strip";

	// Get the bounding rectangle of target
	const rect = target.getBoundingClientRect();
	const met = document.querySelector(T_SELECTORS.metalic).getBoundingClientRect();
	let left = rect.left;
	// Mouse clicked position at strip
	const sclicked = {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top,
	};
	//indicator
	const indc = ind.offsetWidth / 2; //indicator center

	const pos =
		sclicked.x + indc >= target.clientWidth
			? target.clientWidth - ind.clientWidth
			: sclicked.x - indc <= 0
			? 0
			: sclicked.x - indc;

	ind.dataset.position = pos;
	ind.style.left = pos + "px";

	strip.dataset.info = T_INFOS.filtering;
	setTimeout(syncFilters, 250);
}

function setIndPos(left, offset, center) {
	const indc = offset / 2;
	let pos = left - indc + center;

	if (pos + offset >= strip.offsetWidth - ind.offsetWidth) {
		pos = strip.offsetWidth - ind.offsetWidth - offset;
	}

	if (pos < 0) {
		pos = 0;
	}

	ind.dataset.position = pos;
	ind.style.left = pos + "px";
}

function waitWithClick(target, delay = 100) {
	setTimeout(() => {
		target.dataset.clicked = -1;
	}, delay);
}

function changeRangeInd(e) {
	if (ind.style.display == "none" || ind.dataset.filtering !== "strip") {
		return;
	}
	let el = e.target;
	let mouseX = e.clientX;
	const id = el.id;
	let center;

	let offset = 0;
	switch (el) {
		case ind:
			center = mouseX - el.getBoundingClientRect().left - el.offsetWidth / 2;

			if (e.altKey) {
				offset = -10;
			} else if (e.ctrlKey) {
				offset = 10;
			}
			break;
		case plus:
			el = ind;
			center = 0; //-el.offsetWidth / 2;
			offset = el.offsetWidth < 80 ? 10 : 0;
			break;
		case minus:
			el = ind;
			center = 0;
			offset = el.offsetWidth > 10 ? -10 : 0;
			break;
		default:
			return;
			break;
	}

	if (el.dataset.clicked == 1) {
		return;
	}

	el.dataset.clicked = 1;

	const basewidth = el.offsetWidth;
	const baseleft = el.offsetLeft;

	let newWidth = basewidth + offset;

	if (newWidth >= 10 && newWidth <= 80 && offset != 0) {
		el.style.width = newWidth + "px";
	}

	strip.dataset.info = T_INFOS.filtering;
	setIndPos(baseleft, offset, center);
	waitWithClick(el, 100);
	setTimeout(syncFilters, 250);
}

function showOnlyMetalic() {
	ind.style.display = "block";
	ind.style.width = "40px";
	ind.style.left = metalic.offsetLeft + "px";
	ind.dataset.filtering = "metalic";
	setTimeout(syncFilters, 150);
}

function showOnlyDark() {
	ind.style.display = "block";
	ind.style.width = "40px";
	ind.style.left = dark.offsetLeft + "px";
	ind.dataset.filtering = "dark";
	setTimeout(syncFilters, 150);
}
function showOnlyGrays() {
	ind.style.display = "block";
	ind.style.width = "40px";
	ind.style.left = grays.offsetLeft + "px";
	ind.dataset.filtering = "grays";
	setTimeout(syncFilters, 150);
}

function filterDark(colorPrev) {
	let rgb = colorPrev.style.backgroundColor;

	if (rgb === "") {
		return 0;
	}

	let [h, s, l] = RGBToHSL(rgb);

	if (l < 16 && s < 50) {
		return 1;
	}

	return 0;
}
function filterGrays(colorPrev) {
	let rgb = colorPrev.style.backgroundColor;

	if (rgb === "") {
		return 0;
	}

	let [h, s, l] = RGBToHSL(rgb);

	if (s <= 10 && l > 14) {
		return 1;
	}

	return 0;
}

function filterColor(colorPrev) {
	let rgb = colorPrev.style.backgroundColor;

	if (rgb === "") {
		return 0;
	}

	let startOffset = 0;
	let endOffset = 0;
	let calibration = 54;
	let indStart = parseInt(ind.dataset.position) - calibration;
	let indEnd = indStart + ind.offsetWidth;
	let [h, s, l] = RGBToHSL(rgb);

	if (indStart < 0) {
		indStart += 360;
	}

	if (indEnd < 0) {
		indEnd += 360;
	}

	if (indStart > indEnd) {
		if (h <= indEnd) {
			startOffset = 360;
		} else {
			endOffset = 360;
		}
	}

	if (h >= indStart - startOffset && h <= indEnd + endOffset && l > 13 && l < 84 && s > 13) {
		return 1;
	}

	return 0;
}

//After document content is loaded
window.addEventListener("DOMContentLoaded", (event) => {
	// Events
	$("#input_filtruj").val("");
	$("#check_hide_old").prop("checked", false);
	$("#check_empty").prop("checked", false);

	$("#input_filtruj").on("keyup", syncFilters);
	$("#check_metalic").on("click", syncFilters);
	$("#check_hide_old").on("click", syncFilters);
	$("#check_empty").on("click", syncFilters);

	strip = document.querySelector("#color_strip");
	metalic = document.querySelector(T_SELECTORS.metalic);
	dark = document.querySelector(T_SELECTORS.dark);
	grays = document.querySelector(T_SELECTORS.grays);
	ind = document.querySelector("#indicator");
	plus = document.querySelector("#plus_range");
	minus = document.querySelector("#minus_range");

	ind.style.display = "none";
	plus.addEventListener("click", changeRangeInd);
	minus.addEventListener("click", changeRangeInd);
	ind.addEventListener("click", changeRangeInd);
	strip.addEventListener("mousedown", setIndicator);
	metalic.addEventListener("click", showOnlyMetalic);
	dark.addEventListener("click", showOnlyDark);
	grays.addEventListener("click", showOnlyGrays);

	document.querySelector("#reset_range").addEventListener("mouseup", setIndicator);

	toggleButtons(true);
});
