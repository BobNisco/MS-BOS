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
