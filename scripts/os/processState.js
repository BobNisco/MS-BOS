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
	this.pcb = new Pcb();
	// Hold a program's current state
	this.state = this.NEW;
}

// Define some constants for the possible states
ProcessState.prototype.NEW = 0;
ProcessState.prototype.READY = 1;
ProcessState.prototype.RUNNING = 2;
ProcessState.prototype.WAITING = 3;
ProcessState.prototype.TERMINATED = 4;
