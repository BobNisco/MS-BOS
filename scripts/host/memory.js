/* ------------
	memory.js
	 _ __ ___    ___  _ __ ___    ___   _ __  _   _
	| '_ ` _ \  / _ \| '_ ` _ \  / _ \ | '__|| | | |
	| | | | | ||  __/| | | | | || (_) || |   | |_| |
	|_| |_| |_| \___||_| |_| |_| \___/ |_|    \__, |
											  |___/

	Sweet ASCII art always makes a source file
	feel super legit.

	A representation of hardware memory.
------------ */

// Memory of any size. Takes the amount of bytes as a parameter.
function Memory(bytes) {
	// The array representing the bytes in our memory
	this.data = new Array();
	this.bytes = bytes;

	// Initialize the data array
	this.init();
	// Print out the memory array to the screen
	this.printToScreen();
}

Memory.prototype.init = function() {
	for (var i = 0; i < this.bytes; i++) {
		// Initialize each location to 00
		this.data[i] = "00";
	}
}

// Loads the program into memory at a given location.
Memory.prototype.loadProgram = function(program, location) {
	var splitProgram = program.split(' '),
		offsetLocation = location * 256;

	this.clearProgramSection(location);

	for (var i = 0; i < splitProgram.length; i++) {
		this.data[i + offsetLocation] = splitProgram[i];
	}
}

// Clears the program section for the given location.
Memory.prototype.clearProgramSection = function(location) {
	var offsetLocation = location * 256;

	for (var i = 0; i < 256; i++) {
		this.data[i + offsetLocation] = "00";
	}
}

// Function to print out all of the memory to the memory div
Memory.prototype.printToScreen = function() {
	var memoryDiv = $('#divMemory'),
		output = "",
		numDigits = this.getNumberOfDigitsOfBytes();

	for (var i = 0; i < this.bytes; i++) {
		// We are going to print rows of 8 columns each
		if (i % 8 == 0) {
			output += '<br>' + this.formatHexRowHeader(i, numDigits) + ' ';
		}
		output += this.data[i] + ' ';
	}
	memoryDiv.html(output);
}

// WARNING: Possible over-engineering ahead:
// Formats the leading hex digits for each row in the Memory div.
// Returns '0x' + padded hex of current memory location.
// Works with any amount of bytes (even though we will only be
// working with maximum of 768) by padding the hex number
// uniformly based on the amount of hex digits.
Memory.prototype.formatHexRowHeader = function(baseTenNum, numOfDigits) {
	var baseSixteenNum = baseTenNum.toString(16).toUpperCase(),
		paddedNumber = '' + baseSixteenNum;

	while (paddedNumber.length < numOfDigits) {
		paddedNumber = '0' + paddedNumber;
	}
	return '0x' + paddedNumber;
}

// Returns the number of hex digits in the number of bytes
Memory.prototype.getNumberOfDigitsOfBytes = function() {
	return ('' + this.bytes.toString(16)).length;
}
