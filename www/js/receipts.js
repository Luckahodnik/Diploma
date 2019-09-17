let vsota = 0;
let vsotaDDV = 0;
let podatki = {};
var chart = null;

let serverIP = "";

let deleteEl = '<td><input type="button" value="X" onclick="deleteRow(this)"></td>';
let downloadEl = '<td><form method="GET" action="%SERVER_IP%/xmls/%ACTION%"><button type="submit">Prenos</button></form></td>';

function deleteRow(r) {
	let dataTable = $('#dataTable').DataTable();

	let row = dataTable.row(r.parentNode.parentNode);
	let id = row.data()[0];
	$.ajax( {'url': serverIP + "/xmls/" + id, method: "DELETE"})
	.done( () => {
		row.remove();
		$.toast({
			heading: 'Obvestilo',
			text: 'Vnos je bil uspešno odstranjen',
			showHideTransition: 'slide',
			icon: 'info'
		});
		dataTable.draw();
		delete podatki[id];
		aggregateByMonths();
	})
	.fail( (err) => {
		$.toast({
			heading: 'Napaka',
			text: err.responseText,
			showHideTransition: 'slide',
			icon: 'error'
		})
	});
}

$(document).ready(function () {

	serverIP = $("#serverIP").html();

	fileSelector();
	updateOnKeypress();
	$('#myModal').on('shown.bs.modal', function () {
		$('#myInput').trigger('focus')
	})
	$('.carousel').carousel({
		interval: 8000
	})

	$('#preveri').validator().on('submit', function (e) {
		if (e.isDefaultPrevented()) {
		} else {
			e.preventDefault();
			$("#myModal").modal("hide");
		}
	})
	let dataTable = $('#dataTable').DataTable( {
		"columnDefs": [
			{ "visible": false, "targets": [0,1] }
		]
	});

	$.ajax( {'url': serverIP + "/xmls", method: "GET"})
	.done( (data) => {
		if(data && data.length){
			data.forEach( (racun, index, arr) => {
				let downloadElSpec = racun.XMLName? downloadEl.replace('%ACTION%', racun.idRacuna).replace('%SERVER_IP%', serverIP) : null;
				dataTable.row.add( [racun.idRacuna, racun.XMLName, racun.izdajateljRacuna, racun.znesek, racun.ddv, racun.datum, 
					downloadElSpec, deleteEl ] );
				podatki[racun.idRacuna] = racun;
			});
			aggregateByMonths();
			dataTable.draw();
		}
	})
	.fail( (err) => {
		$.toast({
			heading: 'Opozorilo',
			text: err.responseText,
			showHideTransition: 'slide',
			icon: 'warning'
		})
	});


	$.ajax( {'url': serverIP + "/users", method: "GET"})
	.done( (user) => {
		$('#userDropdown>span').html(user.ime + " " + user.priimek);
	})
	.fail( (err) => {
		$.toast({
			heading: 'Napaka',
			text: err.responseText,
			showHideTransition: 'slide',
			icon: 'error'
		})
		window.location.replace($("#redirect").html());
	});
});

function fileSelector() {
	const fileInputEl = document.getElementById('file_input');
	function handleFileSelect(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		let files = [];

		// file select input functionality
		if (files.length <= 0) {
			files = this.files;
		}

		let output = [];
		for (let i = 0, file; file = files[i]; i++) {
			if (files[i].type == "text/xml") {
				let reader = new FileReader();

				reader.addEventListener('load', function (e) {
					let returnedObject = processXML(e.target.result);
					console.log(returnedObject);
					let timestamp = returnedObject['datum'];
					if (timestamp && !isNaN(timestamp.getTime())){
						timestamp = timestamp.toISOString().slice(0, 10);
					} else {
						timestamp = null;
					}
					var formData = new FormData();
					formData.set('raw_xml_data', new Blob([e.target.result], {'type' : 'text/xml'}), file.name);
					$.ajax( {'url': serverIP + "/xmls", method: "POST", 'data' : formData,
						processData: false, contentType: false
					}).done( (racun) => {
						let dataTable = $('#dataTable').DataTable();
						dataTable.row.add( [racun.idRacuna, racun.XMLName, racun.izdajateljRacuna, racun.znesek, racun.ddv, racun.datum, 
							downloadEl.replace('%ACTION%', racun.idRacuna).replace('%SERVER_IP%', serverIP), deleteEl] );
						dataTable.draw();
						podatki[racun.idRacuna] = racun;
						aggregateByMonths();
						$.toast({
							heading: 'Izvedeno',
							text: 'Datoteka je bila uspešno naložena',
							showHideTransition: 'slide',
							icon: 'success'
						});
					})
					.fail( (err) => {
						$.toast({
							heading: 'Opozorilo',
							text: err.responseText,
							showHideTransition: 'slide',
							icon: 'warning'
						})
					});

					aggregateByMonths();

				});
				reader.readAsText(file);
				output.push(file);
			}
		}
	}
	fileInputEl.addEventListener('change', handleFileSelect, false);
}


function updateIzdatke() {
	const maksEl = document.getElementById("maks_sum");
	maksEl.innerHTML = parseInt(maks).toFixed(2) + "€";
	const vpisiEl = document.getElementById("sum_znesek");
	vpisiEl.innerHTML = vsota.toFixed(2) + "€";
	const ddvEl = document.getElementById("sum_ddv");
	ddvEl.innerHTML = vsotaDDV.toFixed(2) + "€";
	const stEl = document.getElementById("st_rac");
	stEl.innerHTML = Object.keys(podatki).length;
	myLineChart.update();
}

function updateTable() {
	const vpisiEl = document.getElementById("ime");
	const spentEl = document.getElementById('znesek');
	const ddvEl = document.getElementById('vn_ddv');
	const whenEl = document.getElementById('datum');

	let racIn = spentEl.value;
	let datIn = whenEl.value;
	let ddvIn = ddvEl.value;
	let namIn = vpisiEl.value;
	if (!isNaN(racIn)) {
		racIn = parseFloat(racIn);
		ddvIn = parseFloat(ddvIn)
		datIn = new Date(datIn);
		
		let retObj = { "znesek": racIn, "ddv": ddvIn, "datum": datIn, "ime": namIn };
		
		var formData = new FormData();
        for ( var key in retObj ) {
            formData.append(key, retObj[key]);
        }

		$.ajax( {'url': serverIP + "/formdata", method: "POST", 'data' : formData,
			processData: false, contentType: false
		}).done( (racun) => {
			let dataTable = $('#dataTable').DataTable();
			dataTable.row.add( [racun.idRacuna, null, racun.izdajateljRacuna, racun.znesek, racun.ddv, racun.datum, 
				null, deleteEl] );
			dataTable.draw();
			podatki[racun.idRacuna] = racun;
			aggregateByMonths();
			$.toast({
				heading: 'Izvedeno',
				text: 'Račun uspešno poslan',
				showHideTransition: 'slide',
				icon: 'success'
			});
		})
		.fail( (err) => {
			$.toast({
				heading: 'Opozorilo',
				text: err.responseText,
				showHideTransition: 'slide',
				icon: 'warning'
			})
		});
	}
}

function updateOnKeypress() {
	const vpisiEl = document.getElementById("ime");
	const spentEl = document.getElementById('znesek');
	const ddvEl = document.getElementById('vn_ddv');
	const whenEl = document.getElementById('datum');
	const submitEl = document.getElementById('dodaj');

	let funcOnKeypress = function (e) {
		e.stopPropagation();
		let key = e.which || e.keyCode;
		if (key == 13) {
			updateTable();
		}
	}

	submitEl.onclick = updateTable;
	spentEl.addEventListener('keypress', funcOnKeypress);
	whenEl.addEventListener('keypress', funcOnKeypress);
	vpisiEl.addEventListener('keypress', funcOnKeypress);
	ddvEl.addEventListener('keypress', funcOnKeypress);

}

var min = 2015,
	max = min + 9,
	izbrano,
    select = document.getElementById('selectElementId');

for (var i = min; i<=max; i++){
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
	select.appendChild(opt);
	izbrano = opt;
}

let maks = 0;
let dict = {};
let dictMesecev = new Array(12).fill(0);
function aggregateByMonths() {
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
	for (m in month) {
		dict[month[m]] = [];
	}

	vsota = 0;
	vsotaDDV = 0;
	for (let k in dictMesecev){
		dictMesecev[k] = 0;
	}

	for (let x in podatki) {
		let dat = new Date(podatki[x].datum);
		dict[month[dat.getMonth()]].push(podatki[x].znesek);
		sum = dict[month[dat.getMonth()]].reduce((previous, current) => current += previous);
		dictMesecev[dat.getMonth()] = sum;
		vsota += podatki[x].znesek;
		vsotaDDV += podatki[x].ddv;
	}
	for (x in dictMesecev) {
		if (dictMesecev[x] >= maks) {
			maks = dictMesecev[x];
		}
	}
	updateIzdatke();
}


function number_format(number, decimals, dec_point, thousands_sep) {
	number = (number + '').replace(',', '').replace(' ', '');
	var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
		s = '',
		toFixedFix = function (n, prec) {
			var k = Math.pow(10, prec);
			return '' + Math.round(n * k) / k;
		};
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

// Area Chart Example
var ctx = document.getElementById("myAreaChart");
var myLineChart = new Chart(ctx, {
	type: 'bar',
	data: {
		labels: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
		datasets: [{
			label: "Izdatki",
			lineTension: 0.3,
			backgroundColor:[  
				"rgba(255, 99, 132, 0.8)",
				"rgba(255, 159, 64, 0.8)",
				"rgba(255, 205, 86, 0.8)",
				"rgba(75, 192, 192, 0.8)",
				"rgba(54, 162, 235, 0.8)",
				"rgba(153, 102, 255, 0.8)",
				"rgba(201, 203, 207, 0.8)",
				"rgba(255, 99, 132, 0.8)",
				"rgba(215, 159, 64, 0.8)",
				"rgba(255, 243, 86, 0.8)",
				"rgba(175, 195, 192, 0.8)",
				"rgba(48, 162, 235, 0.8)",
			 ],
			data: dictMesecev,
		}],
	},
	options: {
		maintainAspectRatio: false,
		layout: {
			padding: {
				left: 10,
				right: 25,
				top: 30,
				bottom: 5
			}
		},
		scales: {
			xAxes: [{
				stacked: true,
				time: {
					unit: 'date'
				},
				gridLines: {
					display: false,
					drawBorder: false
				},
			}],
			yAxes: [{
				stacked: true,
				ticks: {
					beginAtZero: true,
					maxTicksLimit: 5,
					padding: 10,
					callback: function (value, index, values) {
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
				label: function (tooltipItem, chart) {
					var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
					return datasetLabel + ': €' + number_format(tooltipItem.yLabel);
				}
			}
		}
	}

});
