var tools = {
    
    geo : {
    
        distance : function (lat1,lon1,lat2,lon2) {
            var R = 6371; // km (change this constant to get miles)
            var dLat = (lat2-lat1) * Math.PI / 180;
            var dLon = (lon2-lon1) * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            if (d>1) return Math.round(d)+"km";
            else if (d<=1) return Math.round(d*1000)+"m";
            return d;
        },
        
        
         distanceM : function (lat1,lon1,lat2,lon2) {
            var R = 6371; // km (change this constant to get miles)
            var dLat = (lat2-lat1) * Math.PI / 180;
            var dLon = (lon2-lon1) * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            if (d>1) return Math.round(d*1000);
            else if (d<=1) return Math.round(d);
            return d;
        },
        
        nearStation : function (position, remoteData) {
    
            var data = remoteData,
            i = 0,
            length = data.length,
            station = null,
            distance = 0,
            resultHash = {},
            resultArr = [],
            result = [];
    
            for (i = 0; i < length-1; i++) {
                station = data[i];
            
                distance = tools.geo.distanceM(position.lat, position.long, station.lat, station.long);
                resultHash[distance] = station;
                resultArr.push(distance)                
            }
        
            // clean result
            resultArr = resultArr.sort();
            for (i = 0; i < 10; i++) {
                result.push(resultHash[resultArr[i]]);
            }
        
            return result;
        }
    
    }

}