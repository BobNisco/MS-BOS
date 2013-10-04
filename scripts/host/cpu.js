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
};

// LDA
// Load the accumulator with a constant
Cpu.prototype.loadAccumulatorConstant = function() {
	this.Acc = _MemoryManager.getMemoryAtAddress(++this.PC);
	this.PC++;
};

// LDA
// Load the accumulator from memory
Cpu.prototype.loadAccumulatorFromMemory = function() {

};

// STA
// Store the accumulator in memory
Cpu.prototype.storeAccumulatorInMemory = function() {

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
