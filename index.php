<?php
	require_once 'lib/excel_reader2.php';
	//require_once 'lib/excel_reader/excel_reader.php';
	require_once 'read_farby_xls.php';

	error_reporting(E_ALL ^ E_NOTICE);
	ini_set('display_errors',1); 

	$Farby = new FarbyXls();
?>
<!DOCTYPE html>
<html lang="pl">

<head>
	<meta charset="utf-8">
	<title>Baza Farb</title>
	<link rel="stylesheet" href="lib/bootstrap-4.4.1-dist/css/bootstrap.min.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
	<script src="lib/bootstrap-4.4.1-dist/js/bootstrap.min.js"></script>
	<script src="lib\ac-colors.min.js"></script>
	<link rel="stylesheet" href="main.css">
	<script src="main.js" type='module'></script>
</head>

<body style="color: black; font: 12px arial, sans-serif;" onload="document.getElementById('input_filtruj').focus()">
	<div class="container fixed-top w-100 bg-light h-kp">
		<div class="row">
			<div class="col">
				<h5>Farby</h5>
			</div>
			<div class="col">
				<span class="small text-secondary float-right">aktualizacja:
					<?php $Farby->actualizationTimestamp(); ?>
				</span>
			</div>
		</div>
		<form class="form-inline">
			<div class="input-group mb-2 w-20 find">
				<div class="input-group-prepend"><span class="input-group-text">Szukaj:</span></div>
				<input type="text" class="form-control text-secondary bg-white" placeholder="nazwa lub numer farby"
					id="input_filtruj" name="input_filtruj">
			</div>
			<div class="d-flex flex-column ml-3 mr-3 justify-content-start mb-2">
				<!-- <label class="form-check-label m-2">
					<input type="checkbox" class="form-check-input" value="" id="check_metalic">tylko metaliczne
					</label>-->
				<fieldset class="field1">
					<legend>ukryj:</legend>
					<div class="pl-1"><label class="form-check-label justify-content-start">
							<input type="checkbox" class="form-check-input" value="" id="check_hide_old">stare
						</label></div>
					<div class="p-1"><label class="form-check-label justify-content-start">
							<input type="checkbox" class="form-check-input" value="" id="check_empty">stan = 0
						</label></div>


				</fieldset>

			</div>
			<div id="color_range" class="">
				<fieldset class="field2">
					<legend>pokaż tylko odcienie:<span class="questionmark">?
							<div class="tooltip">
								<u>Kliknięcie w pole przestrzeni barw</u> <br>
								ustawia wskaźnik na wskazanym zakresie<br>
								<u>Kliknięcie we wskaźnik z [<b> ctrl </b>]</u> lub <u>przycisk [<b>+</b>]</u> <br>
								rozszerza zakres o 1 poziom<br>
								<u>Kliknięcie we wskaźnik z [<b> alt </b>]</u> lub <u>przycisk [<b>-</b>]</u> <br>
								zmniejsza zakres o 1 poziom <br>
								<u>Kliknięcie przycisku <b>reset</b> </u> <br>
								Usuwa wskaźnik zakresu <br> (zakres obejmuje całą przestrzeń barw)

							</div>
						</span>
					</legend>
					<div id="ranger">
						<div id="indicator" data-clicked=-1 data-position=0></div>
						<div id="color_strip"></div>
						<div><button id="reset_range" type="button">resetuj</button></div>
						<div>
							<button id="plus_range" type="button" data-mod=1>+</button>
							<button id="minus_range" type="button" data-mod=-1>-</button>
						</div>
					</div>
					<div id="strip-buttons">
						
				</fieldset>

			</div>
		</form>
		<div class="mx-auto">
			<table class="table table-bordered table-striped table-condensed bg-dark text-light table-sm">
				<thead>
					<tr>
						<th>farba <i class='small'>(nr / nazwa)</i></th>
						<th>ANI</th>
						<th>magazyn</th>
						<th>stare</th>
						<th>kolor</th>
						<th>PANTONE</th>
					</tr>
				</thead>
			</table>
		</div>
	</div>
	<div class="container w-100">

		<div class="mt-kp">
			<?php 

				echo "\n<br/>\n";
				$Farby->css_class = "table table-bordered table-striped table-condensed mx-auto table-sm mt-4";
				$Farby->printHtmlTable();

			?>
		</div>
	</div>
</body>

</html>