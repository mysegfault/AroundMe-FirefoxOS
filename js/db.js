/*


// structure creation
var aroundMe = {};
aroundMe.db = {
        
    indexedDB : null,
        
    open : function () {            
        var version = '3',             
        request = window.indexedDB.open('aroundme', version);
        
        request.onsuccess = function(e) {
       
            aroundMe.db.indexedDB = e.target.result; 
            console.log('OPEN')
            
            var stationStore = aroundMe.db.indexedDB.createObjectStore("station");
            
            var velibStore = aroundMe.db.indexedDB.createObjectStore("velib",
            {
                keyPath: "name"
            });
            e.target.transaction.oncomplete = function() {
                console.log('ok')
            };
        };
             
               
        request.onerror = function(e) {
            console.log(' not ok');
        }
            
            
    //
     
     
    }
        
     
}


// test
aroundMe.db.open();



    
   */





var req = window.indexedDB.open("around_me", 2);
req.onerror = function () {
    console.log("Could not open database");
};
req.onupgradeneeded = function (event) {
    var db = event.target.result;
    db.createObjectStore("station", {
        keyPath: "name", 
        autoIncrement:true
    });
    db.createObjectStore("velib", {
        keyPath: "name", 
        autoIncrement:true
    });
};


req.onsuccess = function (event) {
    var db = event.target.result;
    
    var transaction = db.transaction(["station"], "readwrite");
    /*
    transaction.oncomplete = function(event) {
        console.log('ok')
    };
 
    transaction.onerror = function(event) {
        console.log('not ok')
    };
 
    var objectStore = transaction.objectStore("station");
    var request = objectStore.add({
        'name':'mairie de Clichy', 
        'city': 'Paris'
    });
    request.onsuccess = function(event) {
        console.log('OK')   
    };*/
    
    var objectStore = transaction.objectStore("station");
    var request = objectStore.get("mairie de Clichy");
    request.onerror = function(event) {
        console.log('error')
    };
    request.onsuccess = function(event) {
        // Do something with the request.result!
        alert("City is " + request.result.city);
    };
    
}
    
    
