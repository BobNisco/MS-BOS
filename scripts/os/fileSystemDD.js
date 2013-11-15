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
