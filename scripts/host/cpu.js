/* ------------
   CPU.js

   Requires global.js.

   Routines for the host CPU simulation, NOT for the OS itself.
   In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
   that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
   JavaScript in both the host and client environments.

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

function Cpu() {
	this.PC    = 0;     // Program Counter
	this.Acc   = 0;     // Accumulator
	this.Xreg  = 0;     // X register
	this.Yreg  = 0;     // Y register
	this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
	this.isExecuting = false;
}

Cpu.prototype.init = function() {
	this.PC    = 0;
	this.Acc   = 0;
	this.Xreg  = 0;
	this.Yreg  = 0;
	this.Zflag = 0;
	this.isExecuting = false;
}

Cpu.prototype.cycle = function() {
	krnTrace("CPU cycle");
	// TODO: Accumulate CPU usage and profiling statistics here.
	// Do the real work here. Be sure to set this.isExecuting appropriately.
	this.execute(this.fetch());
	this.printToScreen();
};

Cpu.prototype.printToScreen = function() {
	$('#pcDisplay').html(this.PC);
	$('#accDisplay').html(this.Acc);
	$('#xRegDisplay').html(this.Xreg);
	$('#yRegDisplay').html(this.Yreg);
	$('#zRegDisplay').html(this.Zflag);
};

Cpu.prototype.fetch = function() {
	console.log("PC: " + this.PC);
	console.log("Mem At PC: " + _MemoryManager.getMemoryAtAddress(this.PC));
	return _MemoryManager.getMemoryAtAddress(this.PC);
};

Cpu.prototype.execute = function(instruction) {
	if (instruction == 'A9') {
		this.loadAccumulatorConstant();
	} else if (instruction == 'AD') {
		this.loadAccumulatorFromMemory();
	} else if (instruction == '8D') {
		this.storeAccumulatorInMemory();
	} else if (instruction == '6D') {
		this.addWithCarry();
	} else if (instruction == 'A2') {
		this.loadXConstant();
	} else if (instruction == 'AE') {
		this.loadXFromMemory
	} else if (instruction == 'A0') {
		this.loadYConstant();
	} else if (instruction == 'AC') {
		this.loadYFromMemory();
	} else if (instruction == 'EA') {
		this.noOperation();
	} else if (instruction == '00') {
		this.break();
	} else if (instruction == 'EC') {
		this.compareToX();
	} else if (instruction == 'D0') {
		this.branchNotEqual();
	} else if (instruction == 'EE') {
		this.increment();
	} else if (instruction == 'FF') {
		this.systemCall();
	} else {
		// TODO: Error handling
	}
	// Onwards and upwards!
	this.PC++;
};

// LDA
// Load the accumulator with a constant
Cpu.prototype.loadAccumulatorConstant = function() {
	// Get the memory at the next address (increment PC)
	// Translate the value from hex to decimal and store it in the accumulator
	this.Acc = _MemoryManager.translateAddress(_MemoryManager.getMemoryAtAddress(++this.PC));
};

// LDA
// Load the accumulator from memory
Cpu.prototype.loadAccumulatorFromMemory = function() {
	// Load the accumulator with the data from memory
	this.Acc = this.getDataAtNextTwoBytes();
};

// STA
// Store the accumulator in memory
Cpu.prototype.storeAccumulatorInMemory = function() {
	_MemoryManager.putDataAtAddress(this.Acc, this.getNextTwoBytes());
};

// ADC
// Add with carry
Cpu.prototype.addWithCarry = function() {

};

// LDX
// Load the X register with a constant
Cpu.prototype.loadXConstant = function () {

};

// LDX
// Load the X register from memory
Cpu.prototype.loadXFromMemory = function() {

};

// LDY
// Load the Y register with a constant
Cpu.prototype.loadYConstant = function () {

};

// LDY
// Load the Y register from memory
Cpu.prototype.loadYFromMemory = function() {

};

// NOP
// No Operation
Cpu.prototype.noOperation = function() {

};

// BRK
// Break (which is really a system call)
Cpu.prototype.break = function() {
	this.isExecuting = false;
};

// CPX
// Compare a byte in memory to the X reg
// Sets the Z (zero) flag if equal
Cpu.prototype.compareToX = function() {

};

// BNE
// Branch X bytes if Z flag = 0
Cpu.prototype.branchNotEqual = function() {

};

// INC
// Increment the value of a byte
Cpu.prototype.increment = function() {

};

// SYS
// System Call
Cpu.prototype.systemCall = function() {

};

// Returns the decimal representation of the next two bytes
Cpu.prototype.getNextTwoBytes = function() {
	// Because of the ordering of certain opcodes, we need to get the next 2 bytes
	// then reverse the order and concatenate them to get the memory address we want.
	var firstByte = _MemoryManager.getMemoryAtAddress(++this.PC),
		secondByte = _MemoryManager.getMemoryAtAddress(++this.PC),
		hex = (secondByte + firstByte),
		decimal = _MemoryManager.translateAddress(hex);
	return decimal;
};

// TODO: Think of a better function name
Cpu.prototype.getDataAtNextTwoBytes = function() {
	// Gets the data at the next two bytes
	return _MemoryManager.getMemoryAtAddress(this.getNextTwoBytes());
};
