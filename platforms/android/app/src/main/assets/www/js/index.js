$( document ).ready(function() {
    let dodaj = $('#dodaj');
    let form = dodaj.closest('form');
    let inputs = form.find('input');
    let action = form.attr('action');
    let method = form.attr('method');
    if(!method)
        method = 'POST';

    dodaj.click(function(event){
        event.preventDefault();
        let postObject = {};
        inputs.each(function( index ) {
            if($(this).attr('type') == 'file'){
                console.log(this.files);
                postObject[$(this).attr('id')] = $(this)[0].files[0];
            } else {
                postObject[$(this).attr('id')] = $(this).val();
            }
        });
        var form_data = new FormData();
        for ( var key in postObject ) {
            form_data.append(key, postObject[key]);
        }
        $.ajax({
            method: method,
            url: action,
            data: form_data,
            processData: false, 
            contentType: false
        })
        .done(function( msg ) {
            alert( "Data Saved: " + msg );
        });
    });

});
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var gumb = document.getElementById("gumbNFC");
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
	onDeviceReady: function() {
		app.receivedEvent('deviceready');

		// Read NDEF formatted NFC Tags
		nfc.addNdefListener (
			function (nfcEvent) {
				var tag = nfcEvent.tag,
					ndefMessage = tag.ndefMessage;

				alert(nfcEvent.tag);
				// dump the raw json of the message
				// note: real code will need to decode
				// the payload from each record
				alert(JSON.stringify(ndefMessage));
	
				// assuming the first record in the message has
				// a payload that can be converted to a string.
				alert(nfc.bytesToString(ndefMessage[0].payload).substring(3));
			},
			function () { // success callback
				alert("Čakanje na NFC kontakt!");
			},
			function (error) { // error callback
				alert("Napaka pri iskanju NFC " + JSON.stringify(error));
			}
		);
		
	},

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();