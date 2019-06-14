let vsota = 0;
let arrayPodatkov = [];
var chart = null;
$(document).ready(function() {
	fileSelector();	
	$('#myModal').on('shown.bs.modal', function () {
		$('#myInput').trigger('focus')
	})
  });

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

				reader.addEventListener('load', function(e) {
					let returnedObject = processXML(e.target.result);
					/*$.post( "xml",
									{'name' : returnedObject['name'],
										'timestamp' : returnedObject['datum'].toISOString().slice(0, 10),
										'amount' : returnedObject['znesek'],
										'raw_xml_data' : e.target.result }
					);*/
					arrayPodatkov.push(returnedObject);

					aggregateByMonths();
					renderTable();
					myLineChart.update();

				});
				reader.readAsText(file);
				output.push(file);
			}
		}
	}
	fileInputEl.addEventListener('change', handleFileSelect, false);
}

// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}


function processXML(xmlStr){
	let parser = new DOMParser();
	let xmlRep = xmlStr.replace(/xmlns(:.+)?=".+"/g, '');
	let xmlDoc = parser.parseFromString(xmlRep, "text/xml");
	let retObj = {};

	while(xmlDoc.firstChild.attributes.length > 0)
		xmlDoc.firstChild.removeAttribute(xmlDoc.firstChild.attributes[0].name);

	var ime = xmlDoc.evaluate("/Invoice/M_INVOIC/G_SG2[S_NAD/D_3035='SE']/S_NAD/C_C080/D_3036/text()", xmlDoc, null, XPathResult.STRING_TYPE, null);
	var znesek = xmlDoc.evaluate("/Invoice/M_INVOIC/G_SG50[S_MOA/C_C516/D_5025='9']/S_MOA/C_C516/D_5004/text()", xmlDoc, null, XPathResult.STRING_TYPE, null);
	var ddv = xmlDoc.evaluate("/Invoice/M_INVOIC/G_SG50[S_MOA/C_C516/D_5025='176']/S_MOA/C_C516/D_5004/text()", xmlDoc, null, XPathResult.STRING_TYPE, null);	
	var datum = xmlDoc.evaluate("/Invoice/M_INVOIC/S_DTM[C_C507/D_2005='137']/C_C507/D_2380/text()", xmlDoc, null, XPathResult.STRING_TYPE, null);

	if(ime.stringValue != null){
		retObj["name"] = ime.stringValue;
	}
	
	if(znesek.stringValue != null){
		retObj["znesek"] = parseInt(znesek.stringValue);
	}

	if(ddv.stringValue != null){
		retObj["ddv"] = ddv.stringValue;
	}

	if(datum.stringValue != null){
		retObj["datum"] = new Date(datum.stringValue);
	}
	vsota += retObj["znesek"];
	return retObj;
} 

function updateIzdatke(){
	const maksEl = document.getElementById("maks_sum");
	maksEl.innerHTML = parseInt(maks).toFixed(2) + "€";
	const vpisiEl = document.getElementById("sum_znesek");
	vpisiEl.innerHTML = vsota.toFixed(2) + "€";
	const stEl = document.getElementById("st_rac");
	stEl.innerHTML = arrayPodatkov.length;
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
		updateIzdatke();
	}

	function renderTable(){
		const tabelaEl = document.getElementById('dataTable');
		const tbodyEl = tabelaEl.getElementsByTagName('tbody')[0];
		tbodyEl.innerHTML = "";
		vsota = 0;
		arrayPodatkov.forEach(function(obj, idx){
			let trEl = document.createElement("tr");
			let tdZnesekEl = document.createElement("td");
			let tdDatumEl  = document.createElement("td");
			let tdDdvEl  = document.createElement("td");
			let tdNameEl  = document.createElement("td");
			tdNameEl.innerText = obj["name"];
			tdZnesekEl.innerText = obj["znesek"];
			tdDdvEl.innerText = obj["ddv"];
			tdDatumEl.innerText = obj["datum"].toLocaleDateString('en-GB');
				trEl.appendChild(tdNameEl);
				tbodyEl.appendChild(trEl);
				trEl.appendChild(tdZnesekEl);
				tabelaEl.appendChild(trEl);
				trEl.appendChild(tdDdvEl);
				tbodyEl.appendChild(trEl);
				trEl.appendChild(tdDatumEl);
				tbodyEl.appendChild(trEl);
				vsota += obj["znesek"];
		});
	}

	function updateTable(){
		const vpisiEl = document.getElementById("ime_trg");
		const spentEl = document.getElementById('znesek');
		const whenEl = document.getElementById('datum');

		let racIn = spentEl.value;
		let datIn = whenEl.value;
		let namIn = vpisiEl.value;
		if(!isNaN(racIn)){
			racIn = parseFloat(racIn);
			datIn = new Date(datIn);
		if(datIn.getYear() == 119){
			let retObj = {"znesek":racIn, "datum":datIn, "name":namIn};
			arrayPodatkov.push(retObj);
			aggregateByMonths();
			renderTable();
						}
					}
	}

	// Area Chart Example
	var ctx = document.getElementById("myAreaChart");
	aggregateByMonths();
	var myLineChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
		datasets: [{
		label: "Izdatki",
		lineTension: 0.3,
		backgroundColor: "rgba(78, 115, 223, 0.05)",
		borderColor: "rgba(78, 115, 223, 1)",
		pointRadius: 3,
		pointBackgroundColor: "rgba(78, 115, 223, 1)",
		pointBorderColor: "rgba(78, 115, 223, 1)",
		pointHoverRadius: 3,
		pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
		pointHoverBorderColor: "rgba(78, 115, 223, 1)",
		pointHitRadius: 10,
		pointBorderWidth: 2,
		data: dictMesecev,
		}],
	},
	options: {
		maintainAspectRatio: false,
		layout: {
		padding: {
			left: 10,
			right: 25,
			top: 25,
			bottom: 0
		}
		},
		scales: {
		xAxes: [{
			time: {
			unit: 'date'
			},
			gridLines: {
			display: false,
			drawBorder: false
			},
		}],
		yAxes: [{
			ticks: {
				beginAtZero: true,
			maxTicksLimit: 5,
			padding: 10,
			callback: function(value, index, values) {
				return '€' + number_format(value);
			}
			},
			gridLines: {
			color: "rgb(234, 236, 244)",
			zeroLineColor: "rgb(234, 236, 244)",
			drawBorder: false,
			borderDash: [2],
			zeroLineBorderDash: [2]
			}
		}],
		},
		legend: {
		display: false
		},
		tooltips: {
		backgroundColor: "rgb(255,255,255)",
		bodyFontColor: "#858796",
		titleMarginBottom: 10,
		titleFontColor: '#6e707e',
		titleFontSize: 14,
		borderColor: '#dddfeb',
		borderWidth: 1,
		xPadding: 15,
		yPadding: 15,
		displayColors: false,
		intersect: false,
		mode: 'index',
		caretPadding: 10,
		callbacks: {
			label: function(tooltipItem, chart) {
			var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
			return datasetLabel + ': €' + number_format(tooltipItem.yLabel);
			}
		}
		}
	}
	
	});