import { filter, throttle, debounce, showHide, RGBToHSL } from "./utils";
/* 
wersja: 2022-04-08
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
	ind: "#indicator",
	plus: "#plus_range",
	minus: "#minus_range",
};
Object.freeze(T_SELECTORS);

function syncFilters() {
	const inputText = document.querySelector(T_SELECTORS.textInput).value.toLowerCase();
	const rows = document.querySelector(T_SELECTORS.tbody).getElementsByTagName("tr");

	const oldChecked = document.querySelector(T_SELECTORS.checkOld).checked;

	const emptyChecked = document.querySelector(T_SELECTORS.checkEmpty).checked;

	filter(rows, (el) => {
		//console.log(el.nodeName);
		let colorPrev = el.querySelector(".cprev");
		let text = el.firstElementChild.innerText.toLowerCase();
		let filterPatern = "";
		filterPatern += inputText != "" && text.indexOf(inputText) == -1 ? 0 : 1;
		filterPatern += el.classList.contains("old") && oldChecked ? 0 : 1;
		filterPatern += el.classList.contains("empty") && emptyChecked ? 0 : 1;
		if (ind.style.display != "none") {
			filterPatern += filterColor(colorPrev);
		}
		const isOut = filterPatern.indexOf("0") > -1;

		//console.log(text + ": " + colorPrev.style.backgroundColor);
		//console.log(isOut ? "ukrty(e)" : text + ": filterPatern: " + filterPatern);
		showHide(isOut, el);
	});
	strip.dataset.info = "";
	/* $("#tabela_farby tbody tr").filter(function () {
		$(this).toggle($(this).children(":first").text().toLowerCase().indexOf(value) > -1);
	});

	if ($("#check_metalic").prop("checked")) {
		$("#tabela_farby tbody tr").filter(":not(.metalize)").hide(); //function() {
	}

	if (document.querySelector(T_SELECTORS.checkOld).checked) {
		filter(rows, (el) => {
			showHide(el.classList.contains("old"), el);
		});
	}

	if ($("#check_hide_old").prop("checked")) {
		$("#tabela_farby tbody tr").filter(".old").hide(); //function() {
	} else if (!$("#check_hide_old").prop("checked")) {
	}

	if ($("#check_empty").prop("checked")) {
		$("#tabela_farby tbody tr").filter(".empty").hide(); //function() {
	} */
}

let strip = document.querySelector("#color_strip");
let ind = document.querySelector("#indicator");
let plus = document.querySelector("#plus_range");
let minus = document.querySelector("#minus_range");

function setIndicator(e) {
	if (e.target.id === "reset_range") {
		ind.style.width = "300px";
		ind.style.left = "0px";
		ind.dataset.position = 0;
		ind.style.display = "none";
		setTimeout(syncFilters, 150);
		return;
	}

	if (ind.style.display === "none") {
		ind.style.display = "block";
		ind.style.width = "10px";
		ind.dataset.position = 180;
		ind.style.left = "180px";
	}

	moveIndTo(e);
}

function moveIndTo(e) {
	// Get the target
	const target = e.target;
	//const ind = document.querySelector('#indicator')

	// Get the bounding rectangle of target
	const rect = target.getBoundingClientRect();

	// Mouse clicked position at strip
	const sclicked = {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top,
	};
	//indicator
	//const ind = strip.children[0];
	const indc = ind.offsetWidth / 2; //indicator center
	const indl = ind.offsetLeft;

	//setIndPos(indl, sclicked.x + indl - indc)
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
	//console.log('sclicked.x + indc = ' + (sclicked.x + indc))
	//console.log('sclicked.x = ' + sclicked.x)
	//console.log('indc = ' + indc)
	//console.log("[mIT] indicator pos: " + pos);
}

function setIndPos(left, offset, center) {
	//console.log("left: " + left, "offset: " + offset + " center: " + center);

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

	//console.log("[sIP] indicator pos: " + pos);
}

function waitWithClick(target, delay = 100) {
	setTimeout(() => {
		//console.log('after delay clicked before = ' + target.dataset.clicked);

		target.dataset.clicked = -1;
	}, delay);
}

function changeRangeInd(e) {
	if (ind.style.display == "none") {
		return;
	}
	let el = e.target;
	let mouseX = e.clientX;
	const id = el.id;
	let center;
	//console.log(e);
	//console.log(el.nodeName);
	let offset = 0;
	switch (el) {
		case ind:
			center = mouseX - el.getBoundingClientRect().left - el.offsetWidth / 2;
			//console.log(id + " is clicked");
			if (e.altKey) {
				offset = -10;
			} else if (e.ctrlKey) {
				offset = 10;
			}
			break;
		case plus:
			el = ind;
			//mouseX = el.getBoundingClientRect().left + el.offsetWidth / 2;
			center = 0; //-el.offsetWidth / 2;
			offset = el.offsetWidth < 80 ? 10 : 0;
			break;
		case minus:
			el = ind;
			//mouseX = el.getBoundingClientRect().left + el.offsetWidth / 2;
			center = 0; //el.offsetWidth / 2;
			offset = el.offsetWidth > 10 ? -10 : 0;
			break;
		default:
			return;
			break;
	}
	//console.log(offset, id);

	if (el.dataset.clicked == 1) {
		//console.log("clicked = " + e.target.dataset.clicked);
		//e.target.data.clicked === false;
		return;
	}

	el.dataset.clicked = 1;

	const basewidth = el.offsetWidth;
	const baseleft = el.offsetLeft;
	//const rect = el.getBoundingClientRect();
	//let center = el.offsetWidth / 2;

	let newWidth = basewidth + offset;
	//console.log(newWidth);
	if (newWidth >= 10 && newWidth <= 80 && offset != 0) {
		el.style.width = newWidth + "px";
		//console.log("el.style.width = " + el.style.width);
	}

	//console.log("mouseX: " + mouseX);
	//center = mouseX - rect.left - center;
	strip.dataset.info = T_INFOS.filtering;
	setIndPos(baseleft, offset, center);
	waitWithClick(el, 100);
	setTimeout(syncFilters, 250);
}
//After document content is loaded
window.addEventListener("DOMContentLoaded", (event) => {
	// Events
	// $("#input_filtruj").val("");
	// $("#check_metalic").prop("checked", false);
	// $("#check_hide_old").prop("checked", false);
	// $("#check_empty").prop("checked", false);

	$("#input_filtruj").on("keyup", syncFilters);
	$("#check_metalic").on("click", syncFilters);
	$("#check_hide_old").on("click", syncFilters);
	$("#check_empty").on("click", syncFilters);

	strip = document.querySelector("#color_strip");
	ind = document.querySelector("#indicator");
	plus = document.querySelector("#plus_range");
	minus = document.querySelector("#minus_range");

	ind.style.display = "none";
	plus.addEventListener("click", changeRangeInd);
	minus.addEventListener("click", changeRangeInd);
	ind.addEventListener("click", changeRangeInd);
	strip.addEventListener("mousedown", setIndicator);
	document.querySelector("#reset_range").addEventListener("mouseup", setIndicator);
});

function filterColor(colorPrev) {
	let rgb = colorPrev.style.backgroundColor;

	if (rgb === "") return 0;

	let offset = 0;
	let calibration = 54;
	let indStart = parseInt(ind.dataset.position) - calibration;
	let indEnd = indStart + ind.offsetWidth;
	let [h, s, l] = RGBToHSL(rgb);
	//indStart = indStart < 0 ? 360 + indStart : indStart;
	//indEnd = indEnd < 0 ? 360 + indEnd : indEnd;

	if (indStart < 0) {
		indStart += 360;
	}

	if (indEnd < 0) {
		indEnd + 360;
	}
	// console.log("start,end:" + [indStart, indEnd]);
	/*if (indEnd < indStart) {
		indEnd = indStart + ind.offsetWidth;
		indStart = indEnd - ind.offsetWidth;
	}*/

	//let min = hsl[0] + indStart;
	//let max = indEnd - hsl[0];
	//console.log(rgb);

	if (indStart > indEnd) {
		offset = 360;
	}

	if (h >= indStart - offset && h <= indEnd && l > 10 && l < 82 && s > 10) {
		console.log(
			"ind a,b: " +
				[indStart, indEnd] +
				"/ farba: " +
				colorPrev.parentNode.firstElementChild.innerText +
				" / HSL: " +
				h +
				", " +
				l +
				" , " +
				l
		);

		return 1;
	}

	return 0;
}
