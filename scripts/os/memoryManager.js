/* ------------
	memoryManager.js
	 _ __ ___   ___ _ __ ___   ___  _ __ _   _ _ __ ___   __ _ _ __   __ _  __ _  ___ _ __
	| '_ ` _ \ / _ \ '_ ` _ \ / _ \| '__| | | | '_ ` _ \ / _` | '_ \ / _` |/ _` |/ _ \ '__|
	| | | | | |  __/ | | | | | (_) | |  | |_| | | | | | | (_| | | | | (_| | (_| |  __/ |
	|_| |_| |_|\___|_| |_| |_|\___/|_|   \__, |_| |_| |_|\__,_|_| |_|\__,_|\__, |\___|_|
										 |___/                             |___/

	Handles communication with main memory.
------------ */

function MemoryManager() {
	// Make some new hardware!
	this.memory = new Memory(MEMORY_SIZE);
	// Print out the memory array to the screen
	this.printToScreen();
}

// Loads the program into memory at a given location.
MemoryManager.prototype.loadProgram = function(program, location) {
	var splitProgram = program.split(' '),
		offsetLocation = location * 256;

	this.clearProgramSection(location);

	for (var i = 0; i < splitProgram.length; i++) {
		this.memory.data[i + offsetLocation] = splitProgram[i];
	}
}

// Clears the program section for the given location.
MemoryManager.prototype.clearProgramSection = function(location) {
	var offsetLocation = location * 256;

	for (var i = 0; i < 256; i++) {
		this.memory.data[i + offsetLocation] = "00";
	}
}

// Function to print out all of the memory to the memory div
MemoryManager.prototype.printToScreen = function() {
	var memoryDiv = $('#divMemory'),
		output = "",
		numDigits = this.getNumberOfDigitsOfBytes();

	for (var i = 0; i < this.memory.bytes; i++) {
		// We are going to print rows of 8 columns each
		if (i % 8 == 0) {
			output += '<br>' + this.formatHexRowHeader(i, numDigits) + ' ';
		}
		output += this.memory.data[i] + ' ';
	}
	memoryDiv.html(output);
}

// WARNING: Possible over-engineering ahead:
// Formats the leading hex digits for each row in the Memory div.
// Returns '0x' + padded hex of current memory location.
// Works with any amount of bytes (even though we will only be
// working with maximum of 768) by padding the hex number
// uniformly based on the amount of hex digits.
MemoryManager.prototype.formatHexRowHeader = function(baseTenNum, numOfDigits) {
	var baseSixteenNum = baseTenNum.toString(16).toUpperCase(),
		paddedNumber = '' + baseSixteenNum;

	while (paddedNumber.length < numOfDigits) {
		paddedNumber = '0' + paddedNumber;
	}
	return '0x' + paddedNumber;
}

// Returns the number of hex digits in the number of bytes
MemoryManager.prototype.getNumberOfDigitsOfBytes = function() {
	return ('' + this.memory.bytes.toString(16)).length;
}
