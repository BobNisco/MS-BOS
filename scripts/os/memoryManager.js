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
	// Create program locations in memory
	this.locations = new Array(NUMBER_OF_PROGRAMS);
	for (var i = 0; i < this.locations.length; i++) {
		this.locations[i] = {
			active: false,
		};
	}
	// Print out the memory array to the screen
	this.printToScreen();
}

MemoryManager.prototype.loadProgram = function(program) {
	// Determine which program location this going to go into
	var programLocation = this.getOpenProgramLocation();
	if (programLocation === null) {
		_StdIn.putText("No available program locations in memory");
		return null;
	} else {
		// Create a new PCB
		var thisPcb = new Pcb();
		// Set the base and limit of the program in the PCB
		// To determine base, we will add 1 to the programLocation to handle the
		// 0-indexed nature of arrays, multiply it by the program size, then subtract
		// the program size.
		thisPcb.base = ((programLocation + 1) * PROGRAM_SIZE) - PROGRAM_SIZE;
		// To determine limit, we will add 1 to the programLocation to handle the
		// 0-indexed nature of arrays, multiply it by the program size, then subtract
		// 1 to handle the 0-indexed nature of arrays.
		thisPcb.limit = ((programLocation + 1) * PROGRAM_SIZE) - 1;

		// Make a new ProcessState instance and put it on the ResidentList
		var newProcessState = new ProcessState();
		newProcessState.pcb = thisPcb;
		_ResidentList[thisPcb.pid] = newProcessState;
		// Actually load the program into memory
		this.loadProgramIntoMemory(program, programLocation);
		// Set this location as active
		this.locations[programLocation].active = true;
		// Return the pid
		return thisPcb.pid;
	}
}

// Loads the program into memory at a given location.
MemoryManager.prototype.loadProgramIntoMemory = function(program, location) {
	var splitProgram = program.split(' '),
		offsetLocation = location * PROGRAM_SIZE;

	this.clearProgramSection(location);

	for (var i = 0; i < splitProgram.length; i++) {
		this.memory.data[i + offsetLocation] = splitProgram[i].toUpperCase();
	}
}

// Finds the next open program location
// Returns an integer of the next open program location if there are
// available locations, else it returns null;
MemoryManager.prototype.getOpenProgramLocation = function() {
	for (var i = 0; i < this.locations.length; i++) {
		if (this.locations[i].active === false) {
			return i;
		}
	}
	return null;
}

// Returns the value stored at the given address.
// Is used in the CPU Fetch stage
MemoryManager.prototype.getMemoryAtAddress = function(address) {
	// Need to account for different memory sections
	address += _CurrentProgram.pcb.base;
	if (address > _CurrentProgram.pcb.limit) {
		_KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, {address : address}));
	}
	return this.memory.data[address];
};

// Puts the data parameter in the given address
MemoryManager.prototype.putDataAtAddress = function(data, address) {
	// Need to account for different memory sections
	address += _CurrentProgram.pcb.base;
	if (address > _CurrentProgram.pcb.limit) {
		_KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, {address : address}));
	}
	// Nicely format bytes
	if (data.length < 2) {
		data = ('00' + data).slice(-2);
	}
	this.memory.data[address] = data.toUpperCase();
	this.printToScreen();
};

// Translates memory at given hex location into base 10
MemoryManager.prototype.translateAddress = function(hex) {
	return parseInt(hex, 16);
};

// Clears the program section for the given location.
MemoryManager.prototype.clearProgramSection = function(location) {
	var offsetLocation = location * PROGRAM_SIZE;

	for (var i = 0; i < PROGRAM_SIZE; i++) {
		this.memory.data[i + offsetLocation] = "00";
	}
	// Set this location to inactive
	this.locations[location].active = false;
};

MemoryManager.prototype.removeFromResidentList = function(pid) {
	// We will return a boolean saying if we found the element
	// to remove from the ResidentList
	var removed = false;
	// Find the element in the ResidentList with the given pid
	for (var i = 0; i < _ResidentList.length; i++) {
		if (_ResidentList[i] && _ResidentList[i].pcb.pid === pid) {
			var location = this.determineProgramSection(_ResidentList[i].pcb.base);
			this.locations[location].active = false;
			// Remove it from the ResidentList
			_ResidentList.splice(i, 1);
			removed = true;
		}
	}
	return removed;
}

// Given a base address, find which program section it belongs to.
// Useful for dealing with residentList
MemoryManager.prototype.determineProgramSection = function(base) {
	return Math.floor(base / PROGRAM_SIZE);
}

// Function to print out all of the memory to the memory div
MemoryManager.prototype.printToScreen = function() {
	var memoryDiv = $('#divMemory'),
		output = "<tbody>",
		numDigits = this.getNumberOfDigitsOfBytes();

	for (var i = 0; i < this.memory.bytes; i++) {
		// We are going to print rows of 8 columns each
		if (i % 8 === 0) {
			output += '</tr><tr><td>' + this.formatHexRowHeader(i, numDigits) + '</td>';
		}
		output += '<td> ' + this.memory.data[i] + '</td>';
	}
	output += "</tbody>";
	memoryDiv.find('tbody').replaceWith(output);
};

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
};

// Returns the number of hex digits in the number of bytes
MemoryManager.prototype.getNumberOfDigitsOfBytes = function() {
	return ('' + this.memory.bytes.toString(16)).length;
};
