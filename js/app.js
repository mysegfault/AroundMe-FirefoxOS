function App() {
	this.isInGecko = typeof navigator.mozApps !== "undefined";
	console.log("isInGecko: " + this.isInGecko);
	this.init();
}
App.prototype.init = function() {
	var that = this;

	this.initEventListeners();

	this.loadStations();

	Zepto(function($) {
		that._sendEvent('dom-ready');
	});
};
App.prototype.initEventListeners = function() {
	var that = this;
	this.evStationLoaded = false;
	this.evDomLoaded = false;

	var onAppAllReady = function() {
		that.showApp();
		that.hideLoader();
	};

	this._bindEvent('stations-loaded', function() {
		console.log("Oui les stations sont chargées");
		that.evStationLoaded = true;

		if (that.evDomLoaded) {
			onAppAllReady();
		}
	});
	this._bindEvent('dom-ready', function() {
		that.evDomLoaded = true;
		that.showLoader();
		that.initFirefoxOs();

		if (that.evStationLoaded) {
			onAppAllReady();
		}
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
App.prototype.loadStations = function() {
	console.log('load stations');
	var that = this;

	$.getJSON('/data/2011_trafic_annuel.json', function(remoteData) {
//		console.log(remoteData);
		that.stations = remoteData;

		setTimeout(function() {
			that._sendEvent('stations-loaded');
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
App.prototype.showApp = function() {
	console.log("showApp because it's all ready");
	var stations = $('#stations');

	for (var i = 0,
			max = this.stations.length; i < max; i++) {
		var current = this.stations[i];

		if (current['Réseau'] !== 'Métro') {
			continue;
		}
		if (current['Ville'] !== 'Paris') {
			continue;
		}

		stations.append(
				'<p class="reset"><span class="left bold">' + current.Station + '</span>' +
				'<span class="right">' + current.Trafic + '</span></p>'
				);
	}
};

