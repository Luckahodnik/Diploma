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
var app = {
    /*
       Application constructor
    */
        initialize: function() {
          this.bindEvents();
          console.log("Starting NDEF Events app");
       },
    /*
       bind any events that are required on startup to listeners:
    */
       bindEvents: function() {
          document.addEventListener('deviceready', this.onDeviceReady, false);
       },
    
    /*
       this runs when the device is ready for user interaction:
    */
       onDeviceReady: function() {
    
          nfc.addTagDiscoveredListener(
             app.onNonNdef,           // tag successfully scanned
             function (status) {      // listener successfully initialized
                app.display("Poslušanje za NFC značke.");
             },
             function (error) {       // listener fails to initialize
                app.display("NFC se ni inicializiral "
                   + JSON.stringify(error));
             }
          );
    
          nfc.addNdefFormatableListener(
             app.onNonNdef,           // tag successfully scanned
             function (status) {      // listener successfully initialized
                app.display("Poslušanje za NDEF značke");
             },
             function (error) {       // listener fails to initialize
                app.display("NFC se ni inicializiral "
                   + JSON.stringify(error));
             }
          );
    
          nfc.addNdefListener(
             app.onNfc,               // tag successfully scanned
             function (status) {      // listener successfully initialized
                app.display("Poslušanje za NDEF sporočila");
             },
             function (error) {       // listener fails to initialize
                app.display("NFC bralec se ni inicializiral "
                   + JSON.stringify(error));
             }
          );
    
          nfc.addMimeTypeListener(
             "text/plain",
             app.onNfc,               // tag successfully scanned
             function (status) {      // listener successfully initialized
                app.display("Poskušanje za MIME vrste.");
             },
             function (error) {       // listener fails to initialize
                app.display("NFC se ni inicializiral "
                   + JSON.stringify(error));
             }
          );
    
          app.display("Prislonite telefon na terminal!");
       },
    
       /*
          appends @message to the message div:
       */
       display: function(message) {
          var label = document.createTextNode(message),
             lineBreak = document.createElement("br");
          messageDiv.appendChild(lineBreak);         // add a line break
          messageDiv.appendChild(label);             // add the text
       },
       /*
          clears the message div:
       */
       clear: function() {
           messageDiv.innerHTML = "";
       },
    
       /*
          Process NDEF tag data from the nfcEvent
       */
       onNfc: function(nfcEvent) {
          app.clear();              // clear the message div
          // display the event type:
          //app.display(" Event Type: " + nfcEvent.type);
          app.showTag(nfcEvent.tag);   // display the tag details
       },
       
       /*
          Process non-NDEF tag data from the nfcEvent
          This includes 
           * Non NDEF NFC Tags
           * NDEF Formatable Tags
           * Mifare Classic Tags on Nexus 4, Samsung S4 
           (because Broadcom doesn't support Mifare Classic)
       */
       onNonNdef: function(nfcEvent) {
          app.clear();              // clear the message div
          // display the event type:
          app.display("Event Type: " + nfcEvent.type);
          var tag = nfcEvent.tag;
          app.display("Tag ID: " + nfc.bytesToHexString(tag.id));
          app.display("Tech Types: ");
          for (var i = 0; i < tag.techTypes.length; i++) {
             app.display("  * " + tag.techTypes[i]);
          }
       },
    
    /*
       writes @tag to the message div:
    */
    
       showTag: function(tag) {
          var thisMessage = tag.ndefMessage;
          if (thisMessage !== null) {

             var type =  nfc.bytesToString(thisMessage[0].type);
             switch (type) {
                case nfc.bytesToString(ndef.RTD_TEXT):
                   app.display("Uspešno prejeta datoteka");
                   break;

             }
            app.display("Vsebina sporočila: ");
            app.showMessage(thisMessage);

          }
       },

      showMessage: function(message) {
          for (var i=0; i < message.length; i++) {
             var record = message[i];
             app.showRecord(record);
          }
       },
       showRecord: function(record) {
          if (nfc.bytesToString(record.type) === "Sp") {
             var ndefMessage = ndef.decodeMessage(record.payload);
             app.showMessage(ndefMessage);
          } else {
             var obj = JSON.parse(nfc.bytesToString(record.payload.splice(3)));
             //app.display(obj);
             for(var x=0; x < obj.length; x++){
                  app.display(Object.values(obj[x]));
                  lineBreak = document.createElement("br");
             }
          }
       }
    };     