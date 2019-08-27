function processXML(xmlStr) {
	let parser = new DOMParser();
    let xmlRep = xmlStr.replace(/xmlns(:.+)?=".+"/g, '');
    let xmlDoc = parser.parseFromString(xmlRep, "text/xml");
	let retObj = {};

	while (xmlDoc.firstChild.attributes.length > 0)
		xmlDoc.firstChild.removeAttribute(xmlDoc.firstChild.attributes[0].name);

	var ime = xmlDoc.evaluate("/Invoice/M_INVOIC/G_SG2[S_NAD/D_3035='SE']/S_NAD/C_C080/D_3036/text()", xmlDoc, null, XPathResult.STRING_TYPE, null);
	var znesek = xmlDoc.evaluate("/Invoice/M_INVOIC/G_SG50[S_MOA/C_C516/D_5025='9']/S_MOA/C_C516/D_5004/text()", xmlDoc, null, XPathResult.STRING_TYPE, null);
	var ddv = xmlDoc.evaluate("/Invoice/M_INVOIC/G_SG50[S_MOA/C_C516/D_5025='176']/S_MOA/C_C516/D_5004/text()", xmlDoc, null, XPathResult.STRING_TYPE, null);
	var datum = xmlDoc.evaluate("/Invoice/M_INVOIC/S_DTM[C_C507/D_2005='137']/C_C507/D_2380/text()", xmlDoc, null, XPathResult.STRING_TYPE, null);
    
	if (ime.stringValue != null) {
		retObj["name"] = ime.stringValue;
	}

	if (znesek.stringValue != null) {
		retObj["znesek"] = parseInt(znesek.stringValue);
	}

	if (ddv.stringValue != null) {
		retObj["ddv"] = parseInt(ddv.stringValue);
	}

	if (datum.stringValue != null) {
		retObj["datum"] = new Date(datum.stringValue);
	}


	//vsotaDDV += retObj["ddv"];
	//vsota += retObj["znesek"];
	return retObj;
}