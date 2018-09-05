var b = require('bonescript');
var http = require('http');
var fs = require('fs');

var BYOD = {
   options: {
      macAddress: "BYOD1",
      fname: "./gps_data.csv",
      httpOptions: {
         //host: "sawarecomm-base.ute.fedex.com",
         host: "10.250.12.152",
         port: "10008",
         path: "/pt400_report",
         method: 'POST'
      }
   },
   
   // PUBLIC

   sendTransaction: function() {
      var me = this;
      
      // Read the last known latitude/longitude (being outputted by GPS Python script)
      console.log("Attemping to read Last Known Location from "+this.options.fname);
      fs.readFile(this.options.fname, 'utf-8', function(err, data) {
         try {
            if (err) {
               throw err;
            }
         
            var lines = data.trim().split('\n');
            var lastLine = lines.slice(-1)[0];
            // Last line may be a blank, get the next one.
            if (!lastLine) {
               lastLine = lines.slice(-2)[0];
            }
            var fields = lastLine.split(',');
             
            var data = {
               alt:    fields[0],
               lat:    fields[1],
               lat_ns: fields[2],
               lng:    fields[3],
               lng_ew: fields[4],
               fix:    fields[5]
            };
            
            console.log("Last Known Location ="+JSON.stringify(data));
            
            me.sendDataToServer(data);
         }
         catch (err) {
            console.log(err);
         }
      });
   },
  
   sendDataToServer: function(position) {
      var req = http.request(this.options.httpOptions, this._fnResponseCallback);
      var today = new Date();
      var transaction;
      
      console.log("Sending SensaTalk Transaction...");
      
      var h = today.getHours();
      var m = today.getMinutes();
      var s = today.getSeconds();
      var y = today.getFullYear();
      var mon = today.getMonth()+1;
      var d = today.getDate();
      
      // sats in view 4+
      // fix has to be 3 to recognize (this is # of sats to SenseAware)
      
      // if lat_ns = S, negate lat
      // if lng_ew = W, negate lng
     
      position.lat *= position.lat_ns==="S" ? -1 : 1;
      position.lng *= position.lng_ew==="W" ? -1 : 1;
      
      transaction = '<rpt><data tag="protoVer">2.0</data><data tag="devId">'+this.options.macAddress+'</data>'+
                    '<data tag="devCfgVer">1.1.1</data>'+
                    '<data tag="rptReq">'+y+'/'+mon+'/'+d+','+h+':'+m+':'+s+',PT400,0</data>'+
                    '<data tag="loc">'+position.lat+','+position.lng+','+position.alt+',,,0,,'+position.fix+',,0,0,0</data>'+
                    '<data tag="env">1014,PRESSURE,-999,"",-999,"",2690,TEMPERATURE,-999,"",-999,"",49,HUMIDITY,-999,"",-999,"",,,1,0,,,,,0,0x00</data>'+
                    '</rpt>';
                        
      console.log(transaction);
      
      req.write(transaction);
      req.end(); 
   },
   
   // PRIVATE
   
   _fnResponseCallback: function(response) {
      var str = ''
      
      response.on('data', function (chunk) {
         str += chunk;
      });
      
      response.on('end', function () {
         console.log("CommServer Response="+str);
         console.log("End SensaTalk Transaction.");
      });
   }
}

BYOD.sendTransaction();

/*var path = [
   {alt:5,lat:35.03633,lat_ns:'',lng:89.72342,lng_ew:'W',fix:6},
   {alt:5,lat:35.03858,lat_ns:'',lng:89.72356,lng_ew:'W',fix:6},
   {alt:5,lat:35.03943,lat_ns:'',lng:89.72156,lng_ew:'W',fix:6},
   {alt:5,lat:35.03922,lat_ns:'',lng:89.71954,lng_ew:'W',fix:6},
   {alt:5,lat:35.03767,lat_ns:'',lng:89.71886,lng_ew:'W',fix:6},
   {alt:5,lat:35.03630,lat_ns:'',lng:89.71823,lng_ew:'W',fix:6},
   {alt:5,lat:35.03535,lat_ns:'',lng:89.71862,lng_ew:'W',fix:6},
   {alt:5,lat:35.03359,lat_ns:'',lng:89.71903,lng_ew:'W',fix:6},
   {alt:5,lat:35.03221,lat_ns:'',lng:89.71937,lng_ew:'W',fix:6},
   {alt:5,lat:35.03226,lat_ns:'',lng:89.72332,lng_ew:'W',fix:6},
   {alt:5,lat:35.03465,lat_ns:'',lnt:89.72383,lng_ew:'W',fix:6},
   {alt:5,lat:35.03623,lat_ns:'',lng:89.72047,lng_ew:'W',fix:6}
];*/

//BYOD.sendDataToServer(path[11]);