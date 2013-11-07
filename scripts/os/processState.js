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
}

// Define some constants for the possible states
ProcessState.NEW = 0;
ProcessState.READY = 1;
ProcessState.RUNNING = 2;
ProcessState.WAITING = 3;
ProcessState.TERMINATED = 4;

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
			'<td class="psbLimitDisplay">' + this.pcb.limit + '</td></tr>'
};

ProcessState.prototype.stateIntToString = function(stateInt) {
	var stateInt = parseInt(stateInt);
	if (stateInt === 0) {
		return "New";
	} else if (stateInt === 1) {
		return "Ready";
	} else if (stateInt === 2) {
		return "Running";
	} else if (stateInt === 3) {
		return "Waiting";
	} else if (stateInt === 4) {
		return "Terminated";
	}
	return "Invalid State Code";
}
