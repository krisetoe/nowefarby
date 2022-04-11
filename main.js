import { filter, throttle, debounce, showHide } from './utils';
/* 
wersja: 2022-04-08
WYMAGANE BIBLIOTEKI: - jeszcze narazie!

lib\ac-colors.min.js
lib\jquery.min.js (3.4.1)
*/

const T_SELECTORS = {
	textInput: '#input_filtruj',
	table: '#tabela_farby',
	tbody: '#tabela_farby tbody',
	row: '#tabela_farby tbody tr',
	nameCol: '#tabela_farby tbody tr:first',
	checkOld: '#check_hide_old',
	checkEmpty: '#check_empty',
	ind: '#indicator',
	plus: '#plus_range',
	minus: '#minus_range',
};
Object.freeze(T_SELECTORS);

function syncFilters() {
	const inputText = document
		.querySelector(T_SELECTORS.textInput)
		.value.toLowerCase();
	const rows = document
		.querySelector(T_SELECTORS.tbody)
		.getElementsByTagName('tr');

	const oldChecked = document.querySelector(T_SELECTORS.checkOld).checked;

	const emptyChecked = document.querySelector(T_SELECTORS.checkEmpty).checked;

	filter(rows, (el) => {
		//console.log(el.nodeName);
		let text = el.firstElementChild.innerText.toLowerCase();
		let filterPatern = '';
		filterPatern +=
			inputText != '' && text.indexOf(inputText) == -1 ? 0 : 1;
		filterPatern += el.classList.contains('old') && oldChecked ? 0 : 1;
		filterPatern += el.classList.contains('empty') && emptyChecked ? 0 : 1;
		const isOut = filterPatern.indexOf('0') > -1;
		console.log(
			isOut ? 'ukrty(e)' : text + ': filterPatern: ' + filterPatern
		);
		showHide(isOut, el);
	});

	/* $('#tabela_farby tbody tr').filter(function () {
		$(this).toggle(
			$(this).children(':first').text().toLowerCase().indexOf(value) > -1
		);
	}); */

	/* if ($("#check_metalic").prop("checked")) {
		$("#tabela_farby tbody tr").filter(":not(.metalize)").hide(); //function() {
	} */

	/* if (document.querySelector(T_SELECTORS.checkOld).checked) {
		filter(rows, (el) => {
			showHide(el.classList.contains('old'), el);
		});
	} */

	/* 	if ($('#check_hide_old').prop('checked')) {
		$('#tabela_farby tbody tr').filter('.old').hide(); //function() {
	} */
	/*else if(!$("#check_hide_old").prop("checked")){
		
	}*/

	/* if ($('#check_empty').prop('checked')) {
		$('#tabela_farby tbody tr').filter('.empty').hide(); //function() {
	} */
}

let strip = document.querySelector('#color_strip');
let ind = document.querySelector('#indicator');
let plus = document.querySelector('#plus_range');
let minus = document.querySelector('#minus_range');

function setIndicator(e) {
	if (e.target.id === 'reset_range') {
		ind.style.width = '10px';
		ind.style.display = 'none';
		return;
	}

	if (ind.style.display === 'none') {
		ind.style.display = 'block';
		ind.style.width = '10px';
		ind.style.left = '180px';
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

	ind.style.left =
		sclicked.x + indc >= target.clientWidth
			? target.clientWidth - ind.clientWidth + 'px'
			: sclicked.x - indc <= 0
			? 0
			: sclicked.x - indc + 'px';

	//console.log('sclicked.x + indc = ' + (sclicked.x + indc))
	//console.log('sclicked.x = ' + sclicked.x)
	//console.log('indc = ' + indc)
	console.log('indicator pos: ' + sclicked.x);
}

function setIndPos(left, offset, center) {
	console.log('left: ' + left, 'offset: ' + offset + ' center: ' + center);

	const indc = offset / 2;
	let pos = left - indc + center;

	if (pos + offset >= strip.offsetWidth - ind.offsetWidth) {
		pos = strip.offsetWidth - ind.offsetWidth - offset;
	}

	if (pos < 0) {
		pos = 0;
	}

	ind.dataset.position = pos;
	ind.style.left = pos + 'px';
}

function waitWithClick(target, delay = 250) {
	setTimeout(() => {
		//console.log('after delay clicked before = ' + target.dataset.clicked);
		target.dataset.clicked = -1;
	}, delay);
}

function setRangeInd(e) {
	const button = e.target;

	changeRangeInd(ind, button.dataset.mod);
}

function changeRangeInd(e) {
	let el = e.target;
	let mouseX = e.clientX;
	const id = el.id;
	let center;
	//console.log(e);
	//console.log(el.nodeName);
	let offset = 0;
	switch (el) {
		case ind:
			center =
				mouseX - el.getBoundingClientRect().left - el.offsetWidth / 2;
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
		el.style.width = newWidth + 'px';
		//console.log("el.style.width = " + el.style.width);
	}

	//console.log("mouseX: " + mouseX);
	//center = mouseX - rect.left - center;

	setIndPos(baseleft, offset, center);

	waitWithClick(el, 250);
}
//After document content is loaded
window.addEventListener('DOMContentLoaded', (event) => {
	//console.log('DOM fully loaded and parsed');
	$('#input_filtruj').val('');
	$('#check_metalic').prop('checked', false);
	$('#check_hide_old').prop('checked', false);
	$('#check_empty').prop('checked', false);

	$('#input_filtruj').on('keyup', syncFilters);
	$('#check_metalic').on('click', syncFilters);
	$('#check_hide_old').on('click', syncFilters);
	$('#check_empty').on('click', syncFilters);

	strip = document.querySelector('#color_strip');
	ind = document.querySelector('#indicator');
	plus = document.querySelector('#plus_range');
	minus = document.querySelector('#minus_range');
	plus.addEventListener('click', changeRangeInd);
	minus.addEventListener('click', changeRangeInd);
	ind.addEventListener('click', changeRangeInd);

	/*ind.addEventListener('mouseup', (e) => {
		e.target.onmousemove = null;
		//console.log(e.target.id + ' - mousemove usunięte?')
	});*/
	// strip.addEventListener('mousedown', moveIndTo);
	strip.addEventListener('mousedown', setIndicator);
	document
		.querySelector('#reset_range')
		.addEventListener('mouseup', setIndicator);
});

//stare śmieciowate

/* function filterRange() {
	$('#tabela_farby tbody tr')
		.filter(function () {
			let el = $(this).find('.cprev');

			let color_attr = el.css('background-color').toLowerCase();

			let hsl = [0, 0, 0];
			hsl = RGBToHSL(color_attr);
			console.log(hsl);

			let scope = '';

			if (el.hasClass('metalize')) {
				if ($('div#metalic_range').attr('data-cr-choose') < 0) {
					return true;
					//$("#tabela_farby tbody tr").filter(":not(.metalize)").hide(); //function() {
				}
				//console.log(el);
				return false;
			}

			ranges_map.forEach((el) => {
				if (el.tag.getAttribute('data-cr-choose') < 0) {
					scope += '0';
				} else {
					scope += '1';
				}
			});
			console.log('scope: ' + scope);
			return scope.indexOf('0') > 0 ? true : false;
			//TODO: Oprogramować filtrowanie
		})
		.hide();
}

function changeRangeFiltering(e) {
	let ranges = $('#color_range fieldset').children('div');

	if (e.altKey) {
		this.dataset.crChoose = 1;
		[...ranges].forEach((el, index, arr) => {
			if (arr[index].id != this.id) {
				arr[index].dataset.crChoose = -1;
			}
		});
	} else if (e.ctrlKey) {
		[...ranges].forEach((el, index, arr) => {
			arr[index].dataset.crChoose = 1;
		});
	} else {
		this.dataset.crChoose = -this.dataset.crChoose;
	}
	//this.dataset.crChoose = -this.dataset.crChoose;

	syncFilters();
}
 */
