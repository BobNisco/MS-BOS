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

Pcb.prototype.printToScreen = function() {
	var table = $('#pcbDisplay').find('table'),
		tbody = table.find('tbody'),
		thisTr = tbody.children('[data-id="' + this.pid + '"]');

	if (thisTr.length) {
		// It is already on the table
		thisTr.replaceWith(this.createDisplayRow());
	} else {
		// We need to add it to the table
		tbody.append(this.createDisplayRow());
	}
};

Pcb.prototype.createDisplayRow = function() {
	return '<tr data-id="' + this.pid + '"><td class="pcbPidDisplay">' + this.pid + '</td>' +
			'<td class="pcbPcDisplay">' + this.pc + '</td>' +
			'<td class="pcbAccDisplay">' + this.acc + '</td>' +
			'<td class="pcbxRegDisplay">' + this.xReg + '</td>' +
			'<td class="pcbyRegDisplay">' + this.yReg + '</td>' +
			'<td class="pcbzRegDisplay">' + this.zFlag + '</td>' +
			'<td class="pcbBaseDisplay">' + this.base + '</td>' +
			'<td class="psbLimitDisplay">' + this.limit + '</td></tr>'
};

// A way of keeping track of the last pid
Pcb.pid = 0;
