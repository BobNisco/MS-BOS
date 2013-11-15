/* ------------
	fileSystemDD.js
	  __ _ _      __           _                    ___   ___
	 / _(_) | ___/ _\_   _ ___| |_ ___ _ __ ___    /   \ /   \
	| |_| | |/ _ \ \| | | / __| __/ _ \ '_ ` _ \  / /\ // /\ /
	|  _| | |  __/\ \ |_| \__ \ ||  __/ | | | | |/ /_/// /_//
	|_| |_|_|\___\__/\__, |___/\__\___|_| |_| |_/___,'/___,'
				 |___/

------------ */

// "Inherit" from prototype DeviceDriver in deviceDriver.js.
FileSystemDD.prototype = new DeviceDriver;

function FileSystemDD() {
	// Override the base method pointers.
	this.driverEntry = krnFileSystemDriverEntry;
	this.isr = krnFileSystemISR;
}

function krnFileSystemDriverEntry() {
	// Initialization routine
	this.status = "loaded";
}

function krnFileSystemISR(params) {

}

FileSystemDD.prototype.format = function() {
	if (this.supportsHtml5Storage() === false) {
		return false;
	}
	var zeroedOutData = "";
	for (var i = 0; i < FS_NUM_BYTES; i++) {
		zeroedOutData += "0";
	}
	for (var track = 0; track < FS_TRACKS; track++) {
		for (var sector = 0; sector < FS_SECTORS; sector++) {
			for (var block = 0; block < FS_BLOCKS; block++) {
				localStorage.setItem(this.makeKey(track, sector, block), zeroedOutData);
			}
		}
	}
	return true;
}

FileSystemDD.prototype.makeKey = function(t, s, b) {
	return String(t) + String(s) + String(b);
}

// Method to determine if the browser that the user is using supports
// the HTML5 localStorage
// Taken from http://diveintohtml5.info/storage.html
FileSystemDD.prototype.supportsHtml5Storage = function() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}
