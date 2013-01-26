function App() {
	this.isInGecko = typeof navigator.mozApps !== "undefined";
	console.log("isInGecko: " + this.isInGecko);
	this.init();
}
App.prototype.init = function() {
	var that = this;

	this.initEventListeners();

	Zepto(function($) {
		that._sendEvent('dom-ready');
	});
};
App.prototype.initEventListeners = function() {
	var that = this;
	this._stateMapCreated = false;
	this._stateStationDetailsLoaded = false;
	this._stateCurrentPosition = false;

	var onAppAllReady = function() {
		that.hideLoader();

		that.ui.header('Around Me');

		that.showMap();

		that.loadStationDetails();
	};

	var checkStationsDetailsAndMapCreated = function() {
		if (that._stateMapCreated && that._stateStationDetailsLoaded && that._stateCurrentPosition) {
			console.log('===> Tout est chargé, i now print an icon');
			that.addAllMarkers();
		}
	};

	this._bindEvent('station-details-loaded', function() {
		console.log("Oui les stations sont chargées");
		that._stateStationDetailsLoaded = true;

		checkStationsDetailsAndMapCreated();
	});
	this._bindEvent('map-created', function() {
		console.log("Oui la carte est créée");
		that._stateMapCreated = true;

		checkStationsDetailsAndMapCreated();
	});
	this._bindEvent('got-current-position', function() {
		console.log("Oui la carte est créée");
		that._stateCurrentPosition = true;

		checkStationsDetailsAndMapCreated();
	});

	this._bindEvent('dom-ready', function() {
		that.ui = new Ui();
		that.showLoader();
		that.initFirefoxOs();

		// start the application
		onAppAllReady();
	});
};
App.prototype.initFirefoxOs = function() {

	if (!this.isInGecko) {
		console.log('Firefox OS is not detected.');
		return;
	}

	var request = navigator.mozApps.getSelf();
	request.onsuccess = function() {
		var button = $('#install-button');
		var description = $('#install-description');

		if (request.result) {
			// we're installed
			description.text('This application is installed.');
			button.text("INSTALLED!").show();
		} else {
			// not installed
			description.text('This application is not yet installed.');
			button.show();
			button.on('click touchstart', function() {
				var req = navigator.mozApps.install('/manifest.webapp');
				req.onsuccess = function() {
					button.text("INSTALLED!").unbind('click');
				};
				req.onerror = function(errObj) {
					alert("Couldn't install (" + errObj.code + ") " + errObj.message);
				};
			});
		}
	};
	request.onerror = function() {
		alert('Error checking installation status: ' + this.error.message);
	};
};
App.prototype._bindEvent = function(eventName, callback) {
	document.addEventListener(eventName, callback, false);
};
App.prototype._unbindEvent = function(eventName, callback) {
	document.removeEventListener(eventName, callback, false);
};
App.prototype._sendEvent = function(eventName, elem) {
	elem = elem || document;
	var evt = document.createEvent('Event');
	evt.initEvent(eventName, true, false);
	elem.dispatchEvent(evt);
};
App.prototype.loadStationDetails = function() {
	console.log('load station details');
	var that = this;

	$.getJSON('/data/ratp_arret_graphique.json', function(remoteData) {
		that.stationDetails = remoteData;

		setTimeout(function() {
			that._sendEvent('station-details-loaded');
		}, 10);
	});
};
App.prototype.loadStationActivity = function() {
	console.log('load station activity');
	var that = this;

	$.getJSON('/data/2011_trafic_annuel.json', function(remoteData) {
		that.stationActivity = remoteData;

		setTimeout(function() {
			that._sendEvent('station-actitivy-loaded');
		}, 10);
	});
};
App.prototype.showLoader = function() {
	var cl = new CanvasLoader('canvasloader-container');
	this.loader = cl;
	cl.show();

	// This bit is only for positioning - not necessary
	var loaderObj = document.getElementById("canvasLoader");
	loaderObj.style.position = "absolute";
	loaderObj.style["top"] = cl.getDiameter() * -0.5 + "px";
	loaderObj.style["left"] = cl.getDiameter() * -0.5 + "px";
};
App.prototype.hideLoader = function() {
	console.log(this.loader);
	this.loader.hide();
};
//App.prototype.showApp = function() {
//	console.log("showApp because it's all ready");
//	var stations = $('#stations');
//
//	for (var i = 0,
//			max = this.stations.length; i < max; i++) {
//		var current = this.stations[i];
//
//		if (current['Réseau'] !== 'Métro') {
//			continue;
//		}
//		if (current['Ville'] !== 'Paris') {
//			continue;
//		}
//
//		stations.append(
//				'<p class="reset"><span class="left bold">' + current.Station + '</span>' +
//				'<span class="right">' + current.Trafic + '</span></p>'
//				);
//	}
//};
App.prototype.showMapCb = function() {
	console.log('--- Show Map Callback ---');
	var mapOptions = {
		// default localization in Paris center
		center: new google.maps.LatLng(48.930254, 2.28403),
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	this.googleMap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

	this._sendEvent('map-created');
	this.getUserPosition();
};
App.prototype.showMap = function() {
	console.log('--- Show Map ---');
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyBAyQ2dkZJstlf9VlEKHYFs3DP_kzDvVRQ&sensor=false&callback=appInstance.showMapCb";
	document.body.appendChild(script);
};
App.prototype.getUserPosition = function() {
	var that = this;

	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(function(position) {
			console.log('Réponse de la geoloc');
			console.log(position.coords.latitude, position.coords.longitude);

			var pos = new google.maps.LatLng(position.coords.latitude,
					position.coords.longitude);

			that.currentCenter = position.coords;
			that.googleMap.setCenter(pos);
			that._sendEvent('got-current-position');

//			new google.maps.InfoWindow({
//				map: that.googleMap,
//				position: pos,
//				content: 'You are here'
//			});

			that.googleMap.setZoom(14);
		});
	} else {
		alert("Je suis désolé, mais les services de géolocalisation de sont pas pris en charge par votre navigateur.");
	}
};
App.prototype.addAllMarkers = function() {

	this.openedMarker = [];

	for (var i = 0,
			max = this.stationDetails.length; i < max; i++) {
		var item = this.stationDetails[i];

		if (item.type !== "metro") {
			continue;
		}

		this.addMarker(item.lat, item.long, item);
	}
};
App.prototype.addMarker = function(lat, long, data) {
	var that = this;

//	console.log('dans add marker dans ' + lat + ' / ' + long);

	var image = '/images/metro-icon.png';
	var myLatLng = new google.maps.LatLng(lat, long);
	var marker = new google.maps.Marker({
		position: myLatLng,
		map: that.googleMap,
		title: data.name,
		icon: image
	});

	// Info
	var template = $('.template-info');
	template.find('h1').text(data.name);
	template.find('.tplinfo-type').text(data.type === 'metro' ? "Métro" : data.type);

	var center = that.googleMap.getCenter();
	console.log(center.Ya + ' / ' + center.Za);

	console.log(this.currentCenter);

	template.find('.tplinfo-distance').text(
			tools.geo.distance(
			data.lat, data.long,
			center.Ya, center.Za
			)
			);

	var contentString = template.html();
//	console.log(contentString);

	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});

	google.maps.event.addListener(marker, 'click', function() {
		for (var i = 0,
				max = that.openedMarker.length; i < max; i++) {
			var elem = that.openedMarker[i];
			elem.close();
		}

		infowindow.open(that.googleMap, marker);
		that.openedMarker.push(infowindow);
	});
};