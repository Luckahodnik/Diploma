let vsota = 0;
let arrayPodatkov = [];
var chart = null;
$(document).ready(function() {
	//$('.datepicker').datepicker();
	fileSelector();	
	$('#myModal').on('shown.bs.modal', function () {
		$('#myInput').trigger('focus')
	})
	
  });
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
				myLineChart.update();
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
					//renderTable();
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