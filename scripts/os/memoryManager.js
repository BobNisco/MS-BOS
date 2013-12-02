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
			base: i * PROGRAM_SIZE,
			limit: (i + 1) * PROGRAM_SIZE,
		};
	}
	// Print out the memory array to the screen
	this.printToScreen();
}

MemoryManager.prototype.loadProgram = function(program, priority) {
	// Determine which program location this going to go into
	var programLocation = this.getOpenProgramLocation();
	if (programLocation === null) {
		// Main memory is full, let's try to put it into the file system
		var newProcessState = new ProcessState();
		newProcessState.pcb = new Pcb();
		var newFile = _FileSystem.createFile(newProcessState.processSwapName());
		if (newFile.status === 'error') {
			_StdIn.putText('No available program locations in memory nor in the file system');
			return null;
		}
		var writeToFs = _FileSystem.writeFile(newProcessState.processSwapName(), program);
		if (writeToFs.status === 'error') {
			_StdIn.putText(writeToFs.message);
			return null;
		}
		newProcessState.location = ProcessState.INFILESYSTEM;
		newProcessState.priority = priority;
		_ResidentList[newProcessState.pcb.pid] = newProcessState;
		return newProcessState.pcb.pid;
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
		newProcessState.location = ProcessState.INMEMORY;
		newProcessState.priority = priority;
		_ResidentList[thisPcb.pid] = newProcessState;
		// Actually load the program into memory
		this.loadProgramIntoMemory(program, programLocation);
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
	// Set this location as active
	this.locations[location].active = true;
}

MemoryManager.prototype.rollOut = function(program) {
	krnTrace('Rolling out PID ' + program.pcb.pid);
	// 1. Create the file on disk
	var createFile = _FileSystem.createFile(program.processSwapName());
	if (createFile.status === 'error') {
		return false;
	}
	// 2. Find the location that this program takes in memory
	var locationInMemory = this.findLocationByBase(program.pcb.base);
	if (locationInMemory === -1) {
		return false;
	}
	// 3. Write the file to disk
	var writeFile = _FileSystem.writeFile(program.processSwapName(),
			this.readProgramAtLocation(locationInMemory));
	if (writeFile.status === 'error') {
		return false;
	}
	// 4. Mark the location as inactive
	this.locations[locationInMemory].active = false;
	// 5. Update the process state to reflect the changes in base/limit
	program.pcb.base = -1;
	program.pcb.limit = -1;
	program.location = ProcessState.INFILESYSTEM;
	// 6. Update the view
	this.printToScreen();
	program.printToScreen();
	return true;
}

MemoryManager.prototype.rollIn = function(program) {
	krnTrace('Rolling in PID ' + program.pcb.pid + ' from file system');
	// 1. Ensure that there is a spot in memory to fit a program
	var programLocation = this.getOpenProgramLocation();
	if (programLocation === null) {
		return false;
	}
	// 2. Read in the program from the file system
	var fileFromDisk = _FileSystem.readFile(program.processSwapName());
	if (fileFromDisk.status === 'error') {
		return false;
	}
	// 3. Bring the program into memory
	this.loadProgramIntoMemory(fileFromDisk.data, programLocation);
	// 4. Remove the program from file system
	var deleteFromDisk = _FileSystem.deleteFile(program.processSwapName(), true);
	if (deleteFromDisk.status === 'error') {
		return false;
	}
	// 5. Update the process state
	program.pcb.base = this.locations[programLocation].base;
	program.pcb.limit = this.locations[programLocation].limit;
	program.location = ProcessState.INMEMORY;
	// 6. Update the view
	this.printToScreen();
	program.printToScreen();
	return true;
}

MemoryManager.prototype.readProgramAtLocation = function(location) {
	var program = "";
	for (var i = this.locations[location].base; i < this.locations[location].limit; i++) {
		program += this.memory.data[i] + " ";
	}
	return $.trim(program);
}

MemoryManager.prototype.findLocationByBase = function(base) {
	for (var i = 0; i < this.locations.length; i++) {
		if (this.locations[i].base === base) {
			return i;
		}
	}
	return -1;
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
	if (address >= _CurrentProgram.pcb.limit ||
		address < _CurrentProgram.pcb.base) {
		_KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, {address : address}));
	}
	return this.memory.data[address];
};

// Puts the data parameter in the given address
MemoryManager.prototype.putDataAtAddress = function(data, address) {
	// Need to account for different memory sections
	address += _CurrentProgram.pcb.base;
	if (address >= _CurrentProgram.pcb.limit ||
		address < _CurrentProgram.pcb.base) {
		_KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, {address : address}));
	}
	// Nicely format bytes
	if (data.length < 2) {
		data = ('00' + data).slice(-2);
	}
	this.memory.data[address] = data.toUpperCase();
	this.updateByteOutput(address);
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
			var location = this.findLocationByBase(_ResidentList[i].pcb.base);
			if (location === -1) {
				// Delete the process on the hard drive
				_FileSystem.deleteFile(_ResidentList[i].processSwapName(), true);
			} else {
				// Mark the location in memory as available
				this.locations[location].active = false;
			}
			// Remove it from the ResidentList
			_ResidentList.splice(i, 1);
			removed = true;
		}
	}
	return removed;
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
		output += '<td data-id="' + i + '"> ' + this.memory.data[i] + '</td>';
	}
	output += "</tbody>";
	memoryDiv.find('tbody').replaceWith(output);
};

// Updates a single byte in the output of the memory.
// This reduces the massive overhead of calling printToScreen when
// you are only updating a single byte in certain CPU functions.
MemoryManager.prototype.updateByteOutput = function(location) {
	var memoryDiv = $('#divMemory'),
		theLocation = memoryDiv.find('[data-id="' + location + '"]');
	theLocation.html(this.memory.data[location]);
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
};

// Returns the number of hex digits in the number of bytes
MemoryManager.prototype.getNumberOfDigitsOfBytes = function() {
	return ('' + this.memory.bytes.toString(16)).length;
};
