/* ------------
	cpuScheduler.js
	                             _              _       _
	  ___ _ __  _   _   ___  ___| |__   ___  __| |_   _| | ___ _ __
	 / __| '_ \| | | | / __|/ __| '_ \ / _ \/ _` | | | | |/ _ \ '__|
	| (__| |_) | |_| | \__ \ (__| | | |  __/ (_| | |_| | |  __/ |
	 \___| .__/ \__,_| |___/\___|_| |_|\___|\__,_|\__,_|_|\___|_|
	     |_|

------------ */

function CpuScheduler() {
	// TODO: What should go here...
}

CpuScheduler.prototype.start = function() {
	if (_ReadyQueue.getSize() > 0) {
		_CurrentProgram = _ReadyQueue.dequeue();
		_CPU.init();
		_CPU.isExecuting = true;
	}
}

// Does the switch between active processes
CpuScheduler.prototype.contextSwitch = function(processComplete) {
	// Check to see that there is another process in the ready queue
	var nextProcess = _ReadyQueue.dequeue();
	if (nextProcess !== null) {
		krnTrace("Current cycle count > quantum of " + QUANTUM + ". Switching context.");
		if (!processComplete) {
			// Update the PCB for the currently executing program
			_CurrentProgram.pc = _CPU.PC;
			_CurrentProgram.acc = _CPU.Acc;
			_CurrentProgram.xReg = _CPU.Xreg;
			_CurrentProgram.yReg = _CPU.Yreg;
			_CurrentProgram.zFlag = _CPU.Zflag;
			// Put the PCB back on the ready queue
			_ReadyQueue.enqueue(_CurrentProgram);
		}
		// Set the CurrentProgram to the next process
		_CurrentProgram = nextProcess;
		_CPU.init(_CurrentProgram, true);
	}
	// Reset the cycle counter
	_CycleCounter = 0;
}
