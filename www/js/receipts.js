let vsota = 0;
let arrayPodatkov = [];
var chart = null;
$(document).ready(function() {
	fileSelector();	
	$('#myModal').on('shown.bs.modal', function () {
		$('#myInput').trigger('focus')
	})
  });


function processXML(xmlDoc){
    let retObj = {};
	let ss = xmlDoc.getElementsByTagName("payment_data");
	let vr = xmlDoc.getElementsByTagName("doc_data");
	let nm = xmlDoc.getElementsByTagName("sender");
	if(nm.length > 0){
		let nr = nm[0].getElementsByTagName("name");
		if(nr.length > 0){
						retObj["name"] = nr[0].textContent ;
		}
	}
    if(ss.length > 0){
		let zr = ss[0].getElementsByTagName("amount");
	if(zr.length > 0){
		retObj["znesek"] = parseFloat(zr[0].textContent);
	}
    }
    if(vr.length > 0){
		let dr = vr[0].getElementsByTagName("timestamp");
		if(dr.length > 0){
			retObj["datum"] = new Date(dr[0].textContent);
		}
	}
	return retObj;
} 

function fileSelector(){
	const fileInputEl = document.getElementById('file_input');
	function handleFileSelect(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		let files = [];

		// file select input functionality
		if (files.length <= 0){
			files = this.files;
		}

		let output = [];
		for (let i = 0, file; file = files[i]; i++) {
			if(files[i].type == "text/xml"){
				let reader = new FileReader();
				let parser = new DOMParser();

				reader.addEventListener('load', function(e) {
					let xmlDoc = parser.parseFromString(e.target.result, "text/xml");
					let returnedObject = processXML(xmlDoc);
					/*$.post( "xml",
									{'name' : returnedObject['name'],
										'timestamp' : returnedObject['datum'].toISOString().slice(0, 10),
										'amount' : returnedObject['znesek'],
										'raw_xml_data' : e.target.result }
					);*/
					arrayPodatkov.push(returnedObject);

					aggregateByMonths();
					myLineChart.update();
					renderTable();
					//renderCanvas();
				});
				reader.readAsText(file);
				output.push(file);
			}
		}
	}
	fileInputEl.addEventListener('change', handleFileSelect, false);
}

let maks = 0;
let dict = {};
let dictMesecev = new Array(12).fill(0);
function aggregateByMonths(){
    let month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    let sum = 0;
    for(m in month){
        dict[month[m]] = [];
    }
    for(let x in arrayPodatkov){
        dict[month[arrayPodatkov[x].datum.getMonth()]].push(arrayPodatkov[x].znesek);
        sum = dict[month[arrayPodatkov[x].datum.getMonth()]].reduce((previous, current) => current += previous);
        dictMesecev[arrayPodatkov[x].datum.getMonth()] = sum;
    }
		for(x in dictMesecev){
			if(dictMesecev[x] >= maks){
							maks = dictMesecev[x];
			}
		}
		//myLineChart.update();
		//updateIzdatke();
	}

