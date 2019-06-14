function renderTable(){
	const tabelaEl = document.getElementById('dataTable');
	const tbodyEl = tabelaEl.getElementsByTagName('tbody')[0];
	tbodyEl.innerHTML = "";

	vsota = 0;
	arrayPodatkov.forEach(function(obj, idx){
	let trEl = document.createElement("tr");
	let tdZnesekEl = document.createElement("td");
						let tdDatumEl  = document.createElement("td");
						let tdNameEl  = document.createElement("td");
						tdNameEl.innerText = obj["name"];
	tdZnesekEl.innerText = obj["znesek"];
						tdDatumEl.innerText = obj["datum"].toLocaleDateString('en-GB');
						trEl.appendChild(tdNameEl);
	tbodyEl.appendChild(trEl);
	trEl.appendChild(tdZnesekEl);
	tabelaEl.appendChild(trEl);
	trEl.appendChild(tdDatumEl);
	tbodyEl.appendChild(trEl);
	vsota += obj["znesek"];
	});
	//updateIzdatke();
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