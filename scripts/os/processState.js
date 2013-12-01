/* ------------
	processState.js
	                                         _        _
	 _ __  _ __ ___   ___ ___  ___ ___   ___| |_ __ _| |_ ___
	| '_ \| '__/ _ \ / __/ _ \/ __/ __| / __| __/ _` | __/ _ \
	| |_) | | | (_) | (_|  __/\__ \__ \ \__ \ || (_| | ||  __/
	| .__/|_|  \___/ \___\___||___/___/ |___/\__\__,_|\__\___|
	|_|

	Each program on the ready queue and the currently running program
	require some extra info about it.
------------ */

function ProcessState() {
	// Hold a program's PCB
	this.pcb = null;
	// Hold a program's current state
	this.state = 0;
	// Hold where the program currently resides
	this.location = null;
	// Hold the program's priority, only used in priority scheduling
	this.priority = null;
}

// Define some constants for the possible states
ProcessState.NEW = 0;
ProcessState.READY = 1;
ProcessState.RUNNING = 2;
ProcessState.WAITING = 3;
ProcessState.TERMINATED = 4;
// Constants to determine where processes currently reside
ProcessState.INMEMORY = 0;
ProcessState.INFILESYSTEM = 1;

ProcessState.prototype.printToScreen = function() {
	var table = $('#readyQueueDisplay').find('table'),
		tbody = table.find('tbody'),
		thisTr = tbody.children('[data-id="' + this.pcb.pid + '"]');

	if (thisTr.length) {
		// It is already on the table
		thisTr.replaceWith(this.createDisplayRow());
	} else {
		// We need to add it to the table
		tbody.append(this.createDisplayRow());
	}

	if (this.state === ProcessState.TERMINATED && !_ShowTerminatedProcesses) {
		thisTr = tbody.children('[data-id="' + this.pcb.pid + '"]');
		thisTr.hide('fast');
	}
};

ProcessState.prototype.createDisplayRow = function() {
	return '<tr data-id="' + this.pcb.pid + '" data-state="' + this.state +'">' +
			'<td class="pcbPidDisplay">' + this.pcb.pid + '</td>' +
			'<td class="processStateDisplay">' + this.stateIntToString(this.state) + '</td>' +
			'<td class="pcbPcDisplay">' + this.pcb.pc + '</td>' +
			'<td class="pcbAccDisplay">' + this.pcb.acc + '</td>' +
			'<td class="pcbxRegDisplay">' + this.pcb.xReg + '</td>' +
			'<td class="pcbyRegDisplay">' + this.pcb.yReg + '</td>' +
			'<td class="pcbzRegDisplay">' + this.pcb.zFlag + '</td>' +
			'<td class="pcbBaseDisplay">' + this.pcb.base + '</td>' +
			'<td class="psbLimitDisplay">' + this.pcb.limit + '</td>' +
			'<td class="psbLocationDisplay">' + this.locationIntToString(this.location) + '</td>' +
			'<td class="psbPriorityDisplay">' + this.priority + '</td></tr>';
};

ProcessState.prototype.stateIntToString = function(stateInt) {
	var stateInt = parseInt(stateInt);
	if (stateInt === ProcessState.NEW) {
		return "New";
	} else if (stateInt === ProcessState.READY) {
		return "Ready";
	} else if (stateInt === ProcessState.RUNNING) {
		return "Running";
	} else if (stateInt === ProcessState.WAITING) {
		return "Waiting";
	} else if (stateInt === ProcessState.TERMINATED) {
		return "Terminated";
	}
	return "Invalid State Code";
};

ProcessState.prototype.locationIntToString = function(locationInt) {
	var locationInt = parseInt(locationInt);
	if (locationInt === ProcessState.INMEMORY) {
		return "In Memory";
	} else if (locationInt === ProcessState.INFILESYSTEM) {
		return "In File System";
	}
	return "Invalid Location Code";
};

ProcessState.prototype.updatePcbWithCpu = function() {
	this.pcb.pc = _CPU.PC;
	this.pcb.acc = _CPU.Acc;
	this.pcb.xReg = _CPU.Xreg;
	this.pcb.yReg = _CPU.Yreg;
	this.pcb.zFlag = _CPU.Zflag;
};

// The format for the swap name of a given process will simply be
// swapX where X is the pid of the process.
ProcessState.prototype.processSwapName = function() {
	return 'swap' + this.pcb.pid;
}
