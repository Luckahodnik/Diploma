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
				});
				reader.readAsText(file);
				output.push(file);
			}
		}
	}
	fileInputEl.addEventListener('change', handleFileSelect, false);
}

