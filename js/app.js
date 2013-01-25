function App() {
	this.isInGecko = typeof navigator.mozApps !== "undefined";
	console.log("isInGecko: " + this.isInGecko);
	this.init();
}
App.prototype.init = function() {
	this.initFirefoxOs();
};
App.prototype.initFirefoxOs = function() {
	
	if (!this.isInGecko) {
		console.log('Firefox OS is not detected.');
		return;
	}
	
	var gManifestName = "/manifest.webapp";

	$(document).ready(function() {
		var request = navigator.mozApps.getSelf();
		request.onsuccess = function() {
			if (request.result) {
				// we're installed
				$("#install_button").text("INSTALLED!").show();
			} else {
				// not installed
				$("#install_button").show();
				$("#install_button").click(function() {
					var req = navigator.mozApps.install(gManifestName);
					req.onsuccess = function() {
						$("#install_button").text("INSTALLED!").unbind('click');
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
	});
};
