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
	// Constants for the sizes of various file system components
	this.tracks = 4;
	this.sectors = 8;
	this.blocks = 8;
	this.numberOfBytes = 64;
	this.metaDataSize = 4;
}

function krnFileSystemDriverEntry() {
	// Initialization routine
	this.status = "loaded";
	this.printToScreen();
}

function krnFileSystemISR(params) {

}

// A function that will create a string of zeroes that are the length
// of the number of bytes in each sector of the file system.
DeviceDriverFileSystem.prototype.createZeroedOutData = function() {
	var zeroedOutData = "";
	for (var i = 0; i < this.numberOfBytes; i++) {
		zeroedOutData += "0";
	}
	return zeroedOutData;
}

// Full format, completely zeroes out everything in the file system
DeviceDriverFileSystem.prototype.format = function() {
	if (this.supportsHtml5Storage() === false) {
		return false;
	}
	var zeroedOutData = this.createZeroedOutData();
	for (var track = 0; track < this.tracks; track++) {
		for (var sector = 0; sector < this.sectors; sector++) {
			for (var block = 0; block < this.blocks; block++) {
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

DeviceDriverFileSystem.prototype.createFile = function(name) {
	// Ensure that the name for this file is not too big.
	// We subtract the size of the metadata to ensure that the name will fit
	if (name.length > (this.numberOfBytes - this.metaDataSize)) {
		return false;
	}
	// First, check to ensure that the filesystem is in the proper
	// state and could potentially handle a write to it
	if (!this.fileSystemReady()) {
		return false;
	}
	// Find the next available directory entry
	var theDirectoryEntry = this.findNextAvailableDirEntry();
	// Ensure that we found an applicable dir entry
	if (theDirectoryEntry === -1) {
		return false;
	}
	// Find the next available file entry
	var theFileEntry = this.findNextAvailableFileEntry();
	// Ensure that we found an applicable file entry
	if (theFileEntry === -1) {
		return false;
	}
	var dirMetaData = "1" + theFileEntry,
		dirData = this.formatString(name),
		fileMetaData = "1---",
		fileData = this.formatString("");
	// Actually save the data to the file system
	localStorage.setItem(theDirectoryEntry, (dirMetaData + dirData));
	localStorage.setItem(theFileEntry, (fileMetaData + fileData));
	// Update the output
	this.printToScreen();
	// This was a success
	return true;
}

// Formats a string of data to be stored at a single sector
DeviceDriverFileSystem.prototype.formatString = function(str) {
	var formattedString = "";
	for (var i = 0; i < str.length; i++) {
		formattedString += str.charCodeAt(i).toString(16)
	}
	return this.padDataString(formattedString);
}

DeviceDriverFileSystem.prototype.padDataString = function(formattedString) {
	var zeroedOutData = this.createZeroedOutData();
	return (formattedString + zeroedOutData).slice(0, this.numberOfBytes - this.metaDataSize);
}

// Returns the key of the metadata area representing the next available directory entry
// if it finds one. Returns -1 if there are no available directory entries left.
DeviceDriverFileSystem.prototype.findNextAvailableDirEntry = function() {
	for (var sector = 0; sector < this.sectors; sector++) {
		for (var block = 0; block < this.blocks; block++) {
			// We will search through the metadata which solely resides in sector 0
			var thisKey = this.makeKey(0, sector, block),
				thisData = localStorage.getItem(thisKey);
			if (thisData[0] === "0") {
				return thisKey;
			}
		}
	}
	return -1;
}

// Returns the key of the next available file entry.
// Returns -1 if there are no available file entries left.
DeviceDriverFileSystem.prototype.findNextAvailableFileEntry = function() {
	// Our metadata lives in track 0, and the file data starts in track 1
	for (var track = 1; track < this.tracks; track++) {
		for (var sector = 0; sector < this.sectors; sector++) {
			for (var block = 0; block < this.blocks; block++) {
				var thisKey = this.makeKey(track, sector, block),
					thisData = localStorage.getItem(thisKey);
				if (thisData[0] === "0") {
					return thisKey;
				}
			}
		}
	}
	return -1;
}

// A test to ensure that all of the Tracks, Sectors, and Blocks
// are present in the filesystem
DeviceDriverFileSystem.prototype.fileSystemReady = function() {
	try {
		for (var track = 0; track < this.tracks; track++) {
			for (var sector = 0; sector < this.sectors; sector++) {
				for (var block = 0; block < this.blocks; block++) {
					var thisKey = this.makeKey(track, sector, block),
						thisData = localStorage.getItem(thisKey);
				}
			}
		}
		return true;
	} catch (e) {
		return false;
	}
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
		for (var track = 0; track < this.tracks; track++) {
			for (var sector = 0; sector < this.sectors; sector++) {
				for (var block = 0; block < this.blocks; block++) {
					var thisKey = this.makeKey(track, sector, block),
						thisData = localStorage.getItem(thisKey);
					output += '<tr><td>' + thisKey + '</td>' +
						'<td>' + thisData.substring(0, 4) + '</td>'+
						'<td>' + thisData.substring(4) + '</td></tr>';
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
