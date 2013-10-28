/* ------------
	pcb.js
				_
	 _ __   ___| |__
	| '_ \ / __| '_ \
	| |_) | (__| |_) |
	| .__/ \___|_.__/
	|_|

	A process control block
------------ */

function Pcb() {
	// The PID for this PCB.
	// Needs to be incremented after it is used.
	this.pid   = Pcb.pid++;
	// Very similar to the fields in cpu.js
	this.pc    = 0;     // Program Counter
	this.acc   = 0;     // Accumulator
	this.xReg  = 0;     // X register
	this.yReg  = 0;     // Y register
	this.zFlag = 0;     // Z-ero flag (Think of it as "isZero".)
	// For memory
	this.base  = 0;     // Starting location of memory
	this.limit = 0;     // Maximum location in memory
};

// A way of keeping track of the last pid
Pcb.pid = 0;
