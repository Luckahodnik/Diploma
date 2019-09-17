//let serverIP = "";
var app = {
   /*
      Application constructor
   */
       initialize: function() {
         //serverIP = $("#serverIP").html();
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
               app.display("Poslušanje za NFC značke");
            },
            function (error) {       // listener fails to initialize
               app.display("NFC bralec se ni inicaliziral "
                  + JSON.stringify(error));
            }
         );
   
         nfc.addNdefFormatableListener(
            app.onNonNdef,           // tag successfully scanned
            function (status) {      // listener successfully initialized
               app.display("Poslušanje za NDEF značke");
            },
            function (error) {       // listener fails to initialize
               app.display("NFC bralec se ni inicaliziral"
                  + JSON.stringify(error));
            }
         );
   
         nfc.addNdefListener(
            app.onNfc,               // tag successfully scanned
            function (status) {      // listener successfully initialized
               app.display("Poslušanje za NDEF sporočila");
            },
            function (error) {       // listener fails to initialize
               app.display("NFC bralec se ni inicaliziral "
                  + JSON.stringify(error));
            }
         );
   
         nfc.addMimeTypeListener(
            "text/plain",
            app.onNfc,               // tag successfully scanned
            function (status) {      // listener successfully initialized
               app.display("Poslušanje za MIME vrsto");
            },
            function (error) {       // listener fails to initialize
               app.display("NFC bralec se ni inicaliziral "
                  + JSON.stringify(error));
            }
         );
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
        // app.display("Tip NFC značke: " + nfcEvent.type);
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
         //app.display("Event Type: " + nfcEvent.type);
         //var tag = nfcEvent.tag;
         //app.display("Tag ID: " + nfc.bytesToHexString(tag.id));
         //app.display("Tech Types: ");
         /*for (var i = 0; i < tag.techTypes.length; i++) {
            app.display("  * " + tag.techTypes[i]);
         }*/
      },
   
   /*
      writes @tag to the message div:
   */
   
      showTag: function(tag) {
         // display the tag properties:
        /* app.display("Tag ID: " + nfc.bytesToHexString(tag.id));
         app.display("Tag Type: " +  tag.type);
         app.display("Max Size: " +  tag.maxSize + " bytes");
         app.display("Is Writable: " +  tag.isWritable);
         app.display("Can Make Read Only: " +  tag.canMakeReadOnly);
   */
         // if there is an NDEF message on the tag, display it:
         var thisMessage = tag.ndefMessage;
         if (thisMessage !== null) {
            // get and display the NDEF record count:
            //app.display("Prejetih " + thisMessage.length
             //  + " sporočil");
            // switch is part of the extended example
            var type =  nfc.bytesToString(thisMessage[0].type);
            switch (type) {
               case nfc.bytesToString(ndef.RTD_TEXT):
                  app.display("Znakovno sporočilo"+"\n");
                  break;
               case nfc.bytesToString(ndef.RTD_URI):
                  app.display("URI datoteka");
                  break;
               case nfc.bytesToString(ndef.RTD_SMART_POSTER):
                  app.display("Golly!  That's a smart poster.");
                  break;
               case nfc.bytesToString(ndef.TNF_MIME_MEDIA):
                  app.display("To je MIME vrsta");
                  break;
               case 'android.com:pkg':
                  app.display("To je AAR vrsta");
                  break;
               default:
                  //app.display("Vrsta sporočila: " +
                  //   type);
                  break;
            }
            // end of extended example
            
            app.showMessage(thisMessage);
         }
      },
   /*
      iterates over the records in an NDEF message to display them:
   */
      showMessage: function(message) {
         for (var i=0; i < message.length; i++) {
            // get the next record in the message array:
            var record = message[i];
            app.showRecord(record);          // show it
         }
      },
   /*
      writes @record to the message div:
   */
      showRecord: function(record) {
         // display the TNF, Type, and ID:
   
         // if the payload is a Smart Poster, it's an NDEF message.
         // read it and display it (recursion is your friend here):
         if (nfc.bytesToString(record.type) === "Sp") {
            var ndefMessage = ndef.decodeMessage(record.payload);
            app.showMessage(ndefMessage);
   
         // if the payload's not a Smart Poster, display it:
         } else {
            var zip = new JSZip();
            zip.loadAsync(nfc.bytesToString(record.payload)).then( (contents) => {
               Object.keys(contents.files).forEach(function(filename) {
                  zip.file(filename).async("string").then(function(content) {
                     // FILE

                     app.display("Ime datoteke: " + filename);
                     app.display(" ");
                     objXML = processXML(content);
                     app.display("Ime izdajatelja: " + objXML.ime);
                     app.display("Datum: " + (objXML.datum).toLocaleString());
                     app.display("Znesek: " + objXML.znesek + "€");
                     app.display("DDV: " + objXML.ddv + "€");


                     var formData = new FormData();
                     formData.set('raw_xml_data', new Blob([content], {'type' : 'text/xml'}), filename);
                     app.display("POMOC MI");
                     $.ajax( {'url': serverIP.innerHTML + "/xmls", method: "POST", 'data' : formData,
                        processData: false, contentType: false
                     }).done( (racun) => {
                        app.display("POMOC");
                        $.toast({
                           heading: 'Izvedeno',
                           text: 'Datoteka je bila uspešno naložena',
                           showHideTransition: 'slide',
                           icon: 'success'
                        });
                        setTimeout( () => {
                           window.location.replace(redirectPage.innerHTML);
                        }, 2000);

                     })
                     .fail( (err) => {
                        $.toast({
                           heading: 'Opozorilo',
                           text: err.responseText,
                           showHideTransition: 'slide',
                           icon: 'warning'
                        })
                     });
                  });
              });
           });
         }
      }
   };     // end of app