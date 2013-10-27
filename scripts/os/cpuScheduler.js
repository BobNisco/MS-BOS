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
CpuScheduler.prototype.contextSwitch = function() {

}
