/* ------------
	deviceDriverFileSystem.js

	     _            _             ___      _
	  __| | _____   _(_) ___ ___   /   \_ __(_)_   _____ _ __
	 / _` |/ _ \ \ / / |/ __/ _ \ / /\ / '__| \ \ / / _ \ '__|
	| (_| |  __/\ V /| | (_|  __// /_//| |  | |\ V /  __/ |
	 \__,_|\___| \_/ |_|\___\___/___,' |_|  |_| \_/ \___|_|

	   ___ _ _      __           _
	  / __(_) | ___/ _\_   _ ___| |_ ___ _ __ ___
	 / _\ | | |/ _ \ \| | | / __| __/ _ \ '_ ` _ \
	/ /   | | |  __/\ \ |_| \__ \ ||  __/ | | | | |
	\/    |_|_|\___\__/\__, |___/\__\___|_| |_| |_|
	                   |___/

------------ */

// "Inherit" from prototype DeviceDriver in deviceDriver.js.
DeviceDriverFileSystem.prototype = new DeviceDriver;

function DeviceDriverFileSystem() {
	// Override the base method pointers.
	this.driverEntry = krnFileSystemDriverEntry;
	this.isr = krnFileSystemISR;
}

function krnFileSystemDriverEntry() {
	// Initialization routine
	this.status = "loaded";
	this.printToScreen();
}

function krnFileSystemISR(params) {

}

DeviceDriverFileSystem.prototype.format = function() {
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
	this.printToScreen();
	return true;
}

DeviceDriverFileSystem.prototype.makeKey = function(t, s, b) {
	return String(t) + String(s) + String(b);
}

// Method to determine if the browser that the user is using supports
// the HTML5 localStorage
// Taken from http://diveintohtml5.info/storage.html
DeviceDriverFileSystem.prototype.supportsHtml5Storage = function() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

DeviceDriverFileSystem.prototype.printToScreen = function() {
	var diskDiv = $('#divFileSystemWrapper'),
		output = '<tbody>';

	try {
		for (var track = 0; track < FS_TRACKS; track++) {
			for (var sector = 0; sector < FS_SECTORS; sector++) {
				for (var block = 0; block < FS_BLOCKS; block++) {
					var thisKey = this.makeKey(track, sector, block),
						thisData = localStorage.getItem(thisKey);
					output += '<tr><td>' + thisKey + '</td>' +
						'<td>' + thisData.substring(0, 4) + '</td>'+
						'<td>' + thisData.substring(5) + '</td></tr>';
				}
			}
		}
		output += '</tbody>';
		diskDiv.find('tbody').replaceWith(output);
		// Ensures that the fileSystem table is shown and the error is hidden
		diskDiv.find('#divFileSystem').show();
		diskDiv.find('#fileSystemError').hide();
	} catch (e) {
		// We hit an error. Most likely the file system (localStorage)
		// was not formatted. Let's tell the user that they should format.
		diskDiv.find('#divFileSystem').hide();
		diskDiv.append('<p id="fileSystemError">File system needs to be formatted.</p>');
	}
}
