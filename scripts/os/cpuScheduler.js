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
		// Set mode bit to user mode
		_Mode = 1;
		_CurrentProgram = _ReadyQueue.dequeue();
		_CPU.init();
		_CPU.isExecuting = true;
	}
}

// Does the switch between active processes
CpuScheduler.prototype.contextSwitch = function() {
	// Check to see that there is another process in the ready queue
	var nextProcess = _ReadyQueue.dequeue();
	if (nextProcess !== null) {
		krnTrace("Current cycle count > quantum of " + QUANTUM + ". Switching context.");
		// Update the PCB for the currently executing program
		_CurrentProgram.pcb.pc = _CPU.PC;
		_CurrentProgram.pcb.acc = _CPU.Acc;
		_CurrentProgram.pcb.xReg = _CPU.Xreg;
		_CurrentProgram.pcb.yReg = _CPU.Yreg;
		_CurrentProgram.pcb.zFlag = _CPU.Zflag;
		// If the currently executing program has a state of terminated,
		// do not put it back on the queue
		if (_CurrentProgram.state !== ProcessState.TERMINATED) {
			// Put the ProcessState back on the ready queue
			_ReadyQueue.enqueue(_CurrentProgram);
		}
		// Set the CurrentProgram to the next process
		_CurrentProgram = nextProcess;
		_CPU.init(_CurrentProgram, true);
	} else if (_CurrentProgram.state === ProcessState.TERMINATED) {
		// If we do not need to switch processing to next program on ready queue,
		// we'll determine if the currently executing program has a state of terminated.
		// If so, we will halt the CPU as we know that there is nothing else on the
		// ready queue, and our running process is terminated.
		_CPU.isExecuting = false;
		// Set the mode bit back to kernel mode, as the user processes are over
		_Mode = 0;
	}
	// Reset the cycle counter
	_CycleCounter = 0;
}
