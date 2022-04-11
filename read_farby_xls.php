<?php
/*
Klasa FarbyXls
Odczytuje zawartosc pliku FARBY.xls znajdujacego sie na serwerze **etiko_srv/farby/
i zwraca w postaci sformatowanej do html tablicy farb.
**) Domyslnie przez polaczenie serwera archiwum (etykiet na przygotowalni) 
	z etiko_srv w katalogu Graficy/Farby/ na serwerze archiwum
	
wymagane (require_once):
	
- lib/excel/excel_reader2.php
*/		

	//error_reporting(E_ALL ^ E_NOTICE);
	//ini_set('display_errors',1); 


/* Przepisac na nowo - sekcja odpowiedzialna za selektywne dzialanie skryptu, tj filtrowanie zwracanych danych
	ini_set('display_errors',1); 
	
	///$status = array();
	
	///$status[0] = 1;
	///$status[1] = 0;
	
	
	///$status_tab = array();
	
	///$status_tab[0] = "pokaż tylko istniejące";
	///$status_tab[1] = "pokaż wszystkie";
	
///	$akt_status = 0;
	
///	if(isset($_GET['status'])){
///		$akt_status = $_GET['status'];	
///	}
*/
//Klasa odczytujaca plik FARBY.xls znajdujacy sie na etiko_srv/farby/. 
//Domyslnie przez polaczenie serwera archiwum (etykiet na przygotowalni) z etiko_srv w katalogu Graficy/Farby/
class FarbyXls 
{
	public $path='./FARBY.xls'; //sciezka do pliku FARBY.xls domyslnie bedzie = '../../Graficy/Farby/FARBY.xls';
	public $pantone_path="lib/pantone_rgb.list"; //sciezka do pliku z lista kolorow Pantone w formacie nazwa C\tR\tG\tB 
	public $id = 'tabela_farby';
	private $sheet_index=1; //przechowuje numer arkusza zawierajacego spis farb
	private $readed_cols=array(1,2,4,5); //tablica kolumn od pierwszej, ktora ma byc uwzgledniona przy formatowaniu
	public $row_offset = 2; //od ktorego wiersza ma sie rozpoczynac odczyt
	private $num_cols; //liczba kolumn sformatowanej tablicy html
	private $num_extra_cols=2;//liczba dodatkowych kolumn dla prezentacji koloru i nazwy PANTONE
	private $num_rows; //liczba wszystkich wierszy w arkuszu farb
	private $table_sheet=array(); //przechowuje odczytane z arkusza rekordy z wybranymi kolumnami jako tablice [wiersz][kolumna]
	public $html_table=''; //przechowuje w Stringu tabele farb sformatowana do html
	public $Tpantone_rgb; //Tablica kolorow Pantone (r,g,b) odczytana z pliku referencyjnego - domyslnie: lib/pantone_rgb.list
	public $Tspec_colors; //Tablica nazw/indexow Pantone, kolorow o nietypowych indeksach/nazwach
	public $Tspec_color_names; // Tablica nazw nietypowych i przyporządkowanych właściwych wartości dla danego koloru- wszystkie znaki małe;
	public $css_class="";//klasy css dla tabeli (tag table)
	private $max_rows = 550;//index ostatniej lini, do ktorej ma zostac wczytany arkusz z FARBY.xls
	public $Ttrash_val;
	public $metalize_cs = "background-image: linear-gradient(-65deg, rgba(255,255,255,0.05), rgba(255,255,255,0.15), rgba(255,255,255,0.32), rgba(255,255,255,0.05),rgba(255,255,255,0.05), rgba(255,255,255,0.05), rgba(255,255,255,0.25),rgba(255,255,255,0.05), rgba(255,255,255,0.17),rgba(255,255,255,0.15),rgba(255,255,255,0.35), rgba(255,255,255,0.05)), radial-gradient(circle, rgba(255,255,255,0.5),rgba(255,255,255,0.05))";
	public $css_class_metalize = "metalize";
	public $css_class_old_paint ="old";
	public $Tnot_metalize = array('801','809');
	
	//Konstruktor obiektu
	function __construct()
    {
		$spreadsheet = new Spreadsheet_Excel_Reader();
		//$spreadsheet = new PhpExcelReader();
		$spreadsheet->setOutputEncoding('UTF-8');
		$spreadsheet->read($this->path);
		
		$this->num_rows = $spreadsheet->rowcount($this->sheet_index);//$xls->sheets[$sheet]['numRows'];
		$this->num_cols = count($this->readed_cols);//liczba kolumn wyswietlanej tabeli (+2: kolumna z pdladem koloru i nazwa Pantone)
				
		//wczytanie arkusza	
		for($r=0; $r<=$this->num_rows; $r++){
			$this->table_sheet[$r] = array();
			foreach($this->readed_cols as $key => $val){
				if($spreadsheet->sheets[$this->sheet_index]['cells'][$r][$val]=="")
					$this->table_sheet[$r][$key] ="-";
				else
					$this->table_sheet[$r][$key] = $spreadsheet->sheets[$this->sheet_index]['cells'][$r][$val];
			}
		}
		
		$this->Tspec_colors = array('-'=>'','Process Cyan'=>'2100','Process Magenta'=>'0100','Process Yellow'=>'3100','Process Black'=>'7100','Warm Red'=>'001','Rubine Red'=>'002','Rhodamine Red'=>'003','Violet'=>'010','Violet 0631'=>'013','Purple'=>'011','Yellow 012'=>'012','Red 032'=>'032','Reflex Blue'=>'021','Orange 021'=>'033','Orange 021'=>'033021','Green'=>'051','Transp. White'=>'091','Transp. White'=>'061','Bright Green'=>'bright green','Blue 072'=>'072');
		
		$this->Ttrash_val = array('RAZEM:','nr farby','UV  RELEASE COATING ','Super Clean','Silicone','Do zrobiebia z UFO2-0724-408N','Inicjator UV','Klej Laminacja','Klej Złocenie','Lak. Beczka','Lak. SATIN','Lakier HR','Lakier MATT','Lakier TTR','Odpieniacz HK','Odpieniacz UV','Opóźnicz HK','Proszek do Matowienia','FOILBOND 002','UV RELEASE COATING ','RED POWDER PET','FARBY HK','Biała INK','Biała IVORY','BIO BEIGE','BACKING BLACK',' AMBIENT RED','ALDI RICH GOLD','AQUA BREEZE BLUE','GOLD 06','061 TRANSP WHITE');
		
		$this->Tspec_color_names = array('033  orange 021'=>'242,104,0',' ambient red'=>'255,0,0','backing black'=>'0,0,0','blue drag cream'=>'254,250,233','dense black'=>'0,0,0','carbon black'=>'0,0,0');
		
		$this->pantoneReference();

		$this->formatToHtmlTable();
		
		

    }//end function __construct() 

	//Metoda formatuje dane z $this->$table_sheet[row][col] do tablicy html i zapisuje wynik w $this->$html_table
	public function formatToHtmlTable(){
	
		//preformatowanie html dla elementow tablicy do uzycie w metodzie php: sprintf()
		$table_format = "\n<table class=\"%s\" id='$this->id'>%s%s\n</table>";
		$th_format = "\n\t\t\t<th>%s</th>";
		$td_format = "\n\t\t\t<td>%s</td>";
		$tr_format = "\n\t\t<tr %s>%s\n\t\t</tr>";
		$tbody_format = "\n\t<tbody class=''>%s\n\t</tbody>";
		$thead_format = "\n\t<thead id='thead_marg'>%s\n\t</thead>";
		
		$th_columns = '';//zmienna pomocnicza przechowujaca sformatowany ciag kolumn th
		$td_columns = '';//zmienna pomocnicza przechowujaca sformatowany ciag kolumn td
		$thead = "";
		$tbody = "";
		$td_rows = "";
		$table = "";
		
		$tr_css_class = "class=\"%s\"";
		
		
		$row_offset = 1;
			
		//formatuje th_format i td_format do ilosci wskazanych kolumn w zmniennej $this->$num_cols
		for($col=0; $col < $this->num_cols; $col++) {
				
			$th_columns .= $th_format;
			$td_columns .= $td_format;
		}

		//wypelnienie naglowka tabeli html
		$thead = vsprintf($th_columns, $this->table_sheet[0]);
		$thead .= $this->expandColumns('','th','-');//zmienne wyznaczyc w polach klasy
		
		$thead = sprintf($tr_format,'', $thead);
		$thead = sprintf($thead_format, $thead);
		
		if($this->row_offset<=0)
			{$row_offset=1;}
		else
			{$row_offset = $this->row_offset;}
	
		//wypelnienie wierszy tabeli html wartosciami. Index wiersza = 1 to nagłówek - wypelniony powyzej	
		for ($row = $row_offset; $row <=$this->num_rows; $row++) {
			
			if(in_array($this->table_sheet[$row][0],$this->Ttrash_val)){
				continue;
			}
			
			if(preg_match("/^HK/",$this->table_sheet[$row][0])){
				continue;
			}
			
			$css_class = "";

			if($this->isMetalize($this->table_sheet[$row][0])){
				$css_class = $this->css_class_metalize;
			}


			if($this->isOld($this->table_sheet[$row][0])){
				$css_class .= " ".$this->css_class_old_paint ;
			}

			if($this->isEmpty($this->table_sheet[$row][1])){
				$css_class .= " empty";
			}

			$tr_css_class = sprintf("class=\"%s\"",$css_class);
			
			$td_rows = vsprintf($td_columns, $this->table_sheet[$row]);
			$td_rows .= $this->expandColumns($this->table_sheet[$row][0]);
			$tbody .= sprintf($tr_format, $tr_css_class, $td_rows);
			if($row>=$this->max_rows||$this->table_sheet[$row][0]=="X- RED")
				break;
		}	

		$tbody = sprintf($tbody_format, $tbody);
		
		$table = sprintf($table_format, $this->css_class, $thead, $tbody);
		
		$this->html_table = $table;
		
	}//end function formatHtmlTable()
	
	//Metoda dodaje dodatkowe kolumny na etapie tworzenia tabeli html w metodzie formatHtmlTable()
	private function expandColumns($paint_name='', $col_type='td', $value='&nbsp;'){//return extra_cols_str = "<$col_type $style_bg_rgb >".$val."</$col_type>"
			
			$extra_cols_str = '';
			//$css_class = '';
			//$col_css_class ='';
			
			
			$cell_values = explode(",", $value);
			
			for($c=0; $c < $this->num_extra_cols; $c++){
				
				$css_class = '';

				list($pantone_name, $rgb) = $this->recognizePaintColor($paint_name);
				
				if($c<count($cell_values))
					$val = $cell_values[$c];
				else
					$val = "&nbsp;";
				
				if($col_type=='td'&&$c!=0){
					$val = $pantone_name;
				}
				
				
				if($paint_name!=''&&$c==0){
					
					$style_bg_rgb = "style=\"background-color:rgb(".$rgb.");%s\"";
					$css_class = 'cprev';
					$dataset = "data-color-space=0";
				}
				else{
					$style_bg_rgb = '';
					$css_class = '';
					$dataset = '';
				}
				
				
				if($style_bg_rgb!=''){

					

					if($this->isOld($paint_name)){
						$css_class .= " ".$this->css_class_old_paint;
					}
					
					if($this->isMetalize($paint_name)){
						$style_bg_rgb = sprintf($style_bg_rgb, '');
						$css_class .= " ".$this->css_class_metalize; 
					}
					else{
						$style_bg_rgb = sprintf($style_bg_rgb, '');
					}
				}

				$col_css_class = sprintf("class=\"%s\"", $css_class);

				$extra_cols_str.="<$col_type $style_bg_rgb $col_css_class $dataset >".$val."</$col_type>";
			}
	
		return $extra_cols_str;
	}// end function expandColumns()

	//Metoda odczytuje plik z lista kolorow Pantone  w formacie: nazwa C\tR\tG\tB - domyslny plik: pantone_rgb.list 
	//i zapisuje w tablicy $this->Tpantone_rgb w formacie ('nazwa', 'r,g,b')
	private function pantoneReference(){
			
		$Tpantone_file = array(); //plik, w ktorym zapisana jest lista kolorow Pantone
		$read_offset = 1;//liczac od gory, po tej linii zacznie sie odczyt pliku
		$name_index ='';//przechowuje nazwe Pantone zapisywanego koloru (bez C)
		$Tpantone_color = array();//przechowuje odczytana linie z pliku w formacie tablicy (0:'nazwa C',1:'r',2:'g',3:'b')
		
						
		/*Dodac obsluge wyjatkow zwiazana z odczytem pliku */
		
		$Tpantone_file = file($this->pantone_path);
		$num_lines = sizeof($Tpantone_file);
		
		
		//zapis listy kolorow do tablicy $this->Tpantone_rgb w formacie: [index=nazwa koloru] = 'r,g,b';
		for($i=$read_offset; $i<$num_lines; $i++){
	
			$Tpantone_color = preg_split("/\t/",$Tpantone_file[$i]);

			$name_index = preg_replace("/\sC$/i","", $Tpantone_color[0]);
			
			$this->Tpantone_rgb[$name_index] = $Tpantone_color[1].",".$Tpantone_color[2].",".$Tpantone_color[3];
		}
	
	}//end function pantoneReference()

	//Metoda rozpoznaje farby zapisane w arkuszu farb i dopasowuje nazwe Pantone i odpowiedni kolor w systemie rgb
	private function recognizePaintColor($paint_name){//return array ('nazwa pantone','r,g,b')
		
		$index_color ='';
		$pantone_name ='';
		
			if(preg_match("/^HK\s/i",$paint_name)){
				return;
			}
		
			if(preg_match("/(cool gray)|(cool grey)/i",$paint_name))
				$index_color = 'Cool Gray '; 
			elseif(preg_match("/(warm gray)|(warm grey)/i",$paint_name))
				$index_color = 'Warm Gray '; 
			elseif(preg_match("/^black/i",$paint_name))
				$index_color = 'Black '; 
			else
				$index_color = '';
				
			$index_color .= preg_replace("/[ąćńśółĄĆŃŚÓŁźżŹŻa-zA-Z\s\-\,\.\&\*]/","",$paint_name);
				
			$spec_color = array_search(strtolower($index_color), $this->Tspec_colors);
		
			if($spec_color!=false){
				if($paint_name==='100')
					$index_color = '100';
				 else
					$index_color = $spec_color;
			}
				
			if(array_key_exists($index_color, $this->Tpantone_rgb)){
				$pantone_name = $index_color;
				$rgb = $this->Tpantone_rgb[$index_color];
			}
			else{
				$pantone_name = '-';//$this->Tspec_color_names[strtolower($paint_name)]. "/".$paint_name;//
				$rgb = "";
			}

			if(array_key_exists(strtolower($paint_name), $this->Tspec_color_names)){
				//$pantone_name = strtolower($paint_name);
				$rgb = $this->Tspec_color_names[strtolower($paint_name)];
			}
			
		$id_row = str_replace(" ", "_", $index_color);
		
		return array($pantone_name, $rgb);

	}//end function recognizePaintColor()
	
	private function hkColors(){
		$hk_name ="";
		$rgb = "";
		return array($hk_name, $rgb);
	}
	
	private function isMetalize($paint_name){
		$paint_name = str_replace("*","",$paint_name);
		if(preg_match("/^(8\d{2,3})|^(10\d{2,3})/i",$paint_name)&&!in_array($paint_name,$this->Tnot_metalize))
			return true;
		else
			return false;
	}//end function isMetalize()
	
	private function isOld($paint_name){

		if(preg_match("/.\*$/i",$paint_name))
			return true;
		else
			return false;
	}//end function isOld()

	private function isEmpty($stan){

		if($stan=='-')
			return true;
		else
			return false;
	}//end function isOld()

	//Metoda drukuje (zwraca na wyjscie skryptu) tabele farb sformatowana do html
	public function printHtmlTable(){
		
		$this->formatToHtmlTable();
		print($this->html_table);	
		
	}//end function printHtmlTable()

	//Metoda pokazuje date ostatniej zmiany pliku FARBY.xls
	public function actualizationTimestamp(){
		
		$dzien = date('d');
		$dzien_tyg = date('l');
		$miesiac = date('n');
		$rok = date('Y');
					
		$miesiac_pl = array(1 => 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia');
					
		$dzien_tyg_pl = array('Monday' => 'poniedziałek', 'Tuesday' => 'wtorek', 'Wednesday' => 'środa', 'Thursday' => 'czwartek', 'Friday' => 'piątek', 'Saturday' => 'sobota', 'Sunday' => 'niedziela');
					
		$mod_time = filemtime($this->path);
					
		//echo $dzien_tyg_pl[$dzien_tyg].", ".$dzien." ".$miesiac_pl[$miesiac]." ".$rok."r.";
		echo "" . date ("d.m.Y, H:i ", $mod_time);
		echo "&nbsp&nbsp( ".intval((time()-$mod_time)/86400)." dni temu )";
		
	}//end function actualizationTimestamp()
	

}//end class FarbyXls

?>