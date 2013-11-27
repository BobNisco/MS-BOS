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
	// Number of bytes in a block
	this.numberOfBytes = 64;
	// How many bytes of the block are dedicated to metadata
	this.metaDataSize = 4;
}

function krnFileSystemDriverEntry() {
	// Initialization routine
	this.status = "file system loaded";
	// Show the file system on the page
	this.printToScreen();
}

function krnFileSystemISR(params) {

}

DeviceDriverFileSystem.prototype.dataSize = function() {
	// Number of data bytes in a block
	return this.numberOfBytes - this.metaDataSize;
}

// A function that will create a string of zeroes that are the length
// of the number of bytes in each block of the file system.
DeviceDriverFileSystem.prototype.createZeroedOutData = function() {
	var zeroedOutData = "";
	for (var i = 0; i < this.numberOfBytes; i++) {
		zeroedOutData += "0";
	}
	return zeroedOutData;
}

// Full format, completely zeroes out everything in the file system
DeviceDriverFileSystem.prototype.format = function() {
	if (!this.supportsHtml5Storage()) {
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
	var result = {
		'status' : 'error',
		'message' : '',
		'data' : '',
	};
	// Ensure that the name for this file is not too big.
	if (this.formatString(name).length > this.dataSize()) {
		result.message = 'The file name provided is too long.';
		return result;
	}
	// First, check to ensure that the filesystem is in the proper
	// state and could potentially handle a write to it
	if (!this.fileSystemReady()) {
		result.message = 'The file system is not ready. Please format it and try again.';
		return result;
	}
	// Find the directory with the given file name
	var theDir = this.findDirByName(name);
	if (theDir !== -1) {
		result.message = 'There is already a file with the name "' + name + '"';
		return result;
	}
	// Find the next available directory entry
	var theDirectoryEntry = this.findNextAvailableDirEntry();
	// Ensure that we found an applicable dir entry
	if (theDirectoryEntry === -1) {
		result.message = 'No more available directory entries.';
		return result;
	}
	// Find the next available file entry
	var theFileEntry = this.findNextAvailableFileEntry();
	// Ensure that we found an applicable file entry
	if (theFileEntry === -1) {
		result.message = 'No more available file entries.';
		return result;
	}
	var dirMetaData = "1" + theFileEntry,
		dirData = this.formatStringForSingleBlock(name),
		fileMetaData = "1---",
		fileData = this.formatStringForSingleBlock("");
	// Actually save the data to the file system
	localStorage.setItem(theDirectoryEntry, (dirMetaData + dirData));
	localStorage.setItem(theFileEntry, (fileMetaData + fileData));
	// Update the output
	this.printToScreen();
	// This was a success
	result.status = 'success';
	result.message = 'Successfully created the file with name "' + name + '"';
	return result;
}

DeviceDriverFileSystem.prototype.writeFile = function(name, data) {
	var result = {
		'status' : 'error',
		'message' : '',
		'data' : '',
	};
	// First, check to ensure that the filesystem is in the proper
	// state and could potentially handle a write to it
	if (!this.fileSystemReady()) {
		result.message = 'The file system is not ready. Please format it and try again.';
		return result;
	}
	// Find the directory with the given file name
	var theDir = this.findDirByName(name);
	if (theDir === -1) {
		result.message = 'Could not find a file with the given name "' + name + '"';
		return result;
	}
	var dirBlock = this.readData(theDir),
		// Encode the whole string
		encodedData = this.formatString(data),
		// We will break the data up into a blocks before writing it
		encodedDataBlocks = [];
	// Delete any blocks for this file
	this.deleteFile(name, false);
	// Split the data up into properly sized chunks.
	while (encodedData.length) {
		// Chop the data up into blocks and pad it with zeroes, if needed
		encodedDataBlocks.push(this.padDataString(
			encodedData.slice(0, this.dataSize())));
		encodedData = encodedData.slice(this.dataSize());
	}
	// We will iterate over the encodedDataBlocks array, keeping track of which
	// blocks point to other blocks.
	var currentBlockToWriteTo = this.getChainAddress(dirBlock),
		lastBlock = "---";
	for (var i = 0; i < encodedDataBlocks.length; i++) {
		if (currentBlockToWriteTo === -1) {
			// We ran out of space on our disk! This is bad, now we have a partially
			// written file sitting on the disk. Blame the user.
			result.status = 'error';
			result.message = 'Not enough space on disk to write full file';
			return result;
		}
		// Write this block of data to the filesystem
		localStorage.setItem(currentBlockToWriteTo, ("1---" + encodedDataBlocks[i]));
		// Check if we need to update the metadata for our previously written block of data
		// so that it can point to this block of data in the chain metadata
		if (lastBlock !== '---') {
			var lastBlockData = localStorage.getItem(lastBlock).slice(4),
				lastBlockMetaData = "1" + currentBlockToWriteTo;
			localStorage.setItem(lastBlock, (lastBlockMetaData + lastBlockData));
		}
		// Advance our pointers
		lastBlock = currentBlockToWriteTo;
		currentBlockToWriteTo = this.findNextAvailableFileEntry();
	}
	// Woohoo, update the display and return a success message, we did it!
	this.printToScreen();
	result.status = 'success';
	result.message = 'Successfully wrote the file to disk';
	return result;
}

DeviceDriverFileSystem.prototype.readFile = function(name) {
	var result = {
		'status' : 'error',
		'message' : '',
		'data' : '',
	};
	// First, check to ensure that the filesystem is in the proper
	// state and could potentially handle a write to it
	if (!this.fileSystemReady()) {
		result.message = 'The file system is not ready. Please format it and try again.';
		return result;
	}
	// Find the directory with the given file name
	var theDir = this.findDirByName(name);
	if (theDir === -1) {
		result.message = 'Could not find a file with the given name "' + name + '"';
		return result;
	}
	var dirBlock = this.readData(theDir),
		dirData = this.readBlocks(this.getChainAddress(dirBlock));
	result.status = 'success';
	result.message = 'Successfully read the file contents.';
	result.data = dirData;
	return result;
}

DeviceDriverFileSystem.prototype.deleteFile = function(name, deleteDirListing) {
	var result = {
		'status' : 'error',
		'message' : '',
		'data' : '',
	};
	// First, check to ensure that the filesystem is in the proper
	// state and could potentially handle a write to it
	if (!this.fileSystemReady()) {
		result.message = 'The file system is not ready. Please format it and try again.';
		return result;
	}
	// Find the directory with the given file name
	var theDir = this.findDirByName(name);
	if (theDir === -1) {
		result.message = 'Could not find a file with the given name "' + name + '"';
		return result;
	}
	var currentBlock = this.readData(theDir),
		zeroedOutData = this.createZeroedOutData(),
		affectedBlocks = [this.getChainAddress(currentBlock)];

	// We will be utilizing this function in the shell command for "delete"
	// and as a way to delete the blocks when we are writing over a file.
	// We will want to delete the dir listing in the case of the shell command,
	// and keep the dir listing in the case of writing a file.
	if (deleteDirListing) {
		// Add the dir listing to the affected blocks
		affectedBlocks.push(currentBlock.key);
	}

	// Walk each of the blocks to find which blocks we need to delete
	while (this.blockHasLink(currentBlock.meta)) {
		affectedBlocks.push(this.getChainAddress(currentBlock));
		currentBlock = this.readData(this.getChainAddress(currentBlock));
	}
	// Zero out the data for each block
	for (var i = 0; i < affectedBlocks.length; i++) {
		localStorage.setItem(affectedBlocks[i], zeroedOutData);
	}
	this.printToScreen();
	result.status = 'success';
	result.message = 'Successfully deleted the file.';
	return result;
}

// This function is named readBlocks because it will follow through to all
// of the linked blocks starting with the key that is passed in as a parameter.
DeviceDriverFileSystem.prototype.readBlocks = function(key) {
	var currentData = this.readData(key),
		returnString = currentData.data;
	while (this.blockHasLink(currentData.meta)) {
		currentData = this.readData(this.getChainAddress(currentData));
		returnString += currentData.data;
	}
	return returnString;
}

DeviceDriverFileSystem.prototype.blockHasLink = function(metaData) {
	for (var i = 1; i < this.metaDataSize; i++) {
		if (metaData.charAt(i) !== "-") {
			return true;
		}
	}
	return false;
}

// Formats a string of data to be stored at a single block
DeviceDriverFileSystem.prototype.formatStringForSingleBlock = function(str) {
	return this.padDataString(this.formatString(str));
}

DeviceDriverFileSystem.prototype.formatString = function(str) {
	var formattedString = "";
	for (var i = 0; i < str.length; i++) {
		formattedString += str.charCodeAt(i).toString(16)
	}
	return formattedString;
}

DeviceDriverFileSystem.prototype.readData = function(key) {
	var data = localStorage.getItem(key),
		returnValue = {
			"key" : key,
			"meta" : "",
			"data" : "",
		};
	// Read the first 4 bits and put that into the meta section
	for (var i = 0; i < this.metaDataSize; i++) {
		returnValue.meta += data.charAt(i);
	}
	// We need to read in sets of 2 hex digits at a time
	for (var i = this.metaDataSize; i < data.length; i += 2) {
		var ascii = parseInt(data.charAt(i) + data.charAt(i + 1), 16);
		if (ascii !== 0) {
			returnValue.data += String.fromCharCode(ascii);
		}
	}
	return returnValue;
}

DeviceDriverFileSystem.prototype.padDataString = function(formattedString) {
	var zeroedOutData = this.createZeroedOutData();
	return (formattedString + zeroedOutData).slice(0, this.dataSize());
}

// Returns the key of the metadata area representing the next available directory entry
// if it finds one. Returns -1 if there are no available directory entries left.
DeviceDriverFileSystem.prototype.findNextAvailableDirEntry = function() {
	for (var sector = 0; sector < this.sectors; sector++) {
		for (var block = 0; block < this.blocks; block++) {
			// We will search through the metadata which solely resides in sector 0
			var thisKey = this.makeKey(0, sector, block),
				thisData = this.readData(thisKey);
			if (!this.blockIsActive(thisData)) {
				return thisKey;
			}
		}
	}
	return -1;
}

DeviceDriverFileSystem.prototype.findDirByName = function(name) {
	for (var sector = 0; sector < this.sectors; sector++) {
		for (var block = 0; block < this.blocks; block++) {
			// We will search through the metadata which solely resides in sector 0
			var thisKey = this.makeKey(0, sector, block),
				thisData = this.readData(thisKey);
			if (thisData.data === name) {
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
					thisData = this.readData(thisKey);
				if (!this.blockIsActive(thisData)) {
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
	if (!this.supportsHtml5Storage()) {
		return false;
	}
	try {
		for (var track = 0; track < this.tracks; track++) {
			for (var sector = 0; sector < this.sectors; sector++) {
				for (var block = 0; block < this.blocks; block++) {
					var thisKey = this.makeKey(track, sector, block),
						thisData = localStorage.getItem(thisKey);
					if (thisData === null) {
						// Something isn't properly initialized
						return false;
					}
				}
			}
		}
		return true;
	} catch (e) {
		return false;
	}
}

DeviceDriverFileSystem.prototype.listDirectory = function() {
	var result = {
		'status' : 'error',
		'message' : '',
		'data' : [],
	};
	// First, check to ensure that the filesystem is in the proper
	// state and could potentially handle a write to it
	if (!this.fileSystemReady()) {
		result.message = 'The file system is not ready. Please format it and try again.';
		return result;
	}

	for (var sector = 0; sector < this.sectors; sector++) {
		for (var block = 0; block < this.blocks; block++) {
			// We will search through the metadata which solely resides in sector 0
			var thisKey = this.makeKey(0, sector, block),
				thisData = this.readData(thisKey);
			if (this.blockIsActive(thisData)) {
				result.data.push({'key' : thisData.key, 'name' : thisData.data});
			}
		}
	}
	result.status = 'success';
	result.message = 'Successfully read the file system directory.';
	return result;
}

DeviceDriverFileSystem.prototype.blockIsActive = function(block) {
	var activeBit = block.meta.slice(0, 1);
	if (activeBit === "0") {
		return false;
	}
	return true;
};

DeviceDriverFileSystem.prototype.getChainAddress = function(block) {
	return block.meta.slice(1, this.metaDataSize);
};

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
