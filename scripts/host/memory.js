/* ------------
	memory.js
	 _ __ ___    ___  _ __ ___    ___   _ __  _   _
	| '_ ` _ \  / _ \| '_ ` _ \  / _ \ | '__|| | | |
	| | | | | ||  __/| | | | | || (_) || |   | |_| |
	|_| |_| |_| \___||_| |_| |_| \___/ |_|    \__, |
											  |___/

	Sweet ASCII art always makes a source file
	feel super legit.

	A representation of hardware memory.
------------ */

// Memory of any size. Takes the amount of bytes as a parameter.
function Memory(bytes) {
	// The array representing the bytes in our memory
	this.data = new Array();
	this.bytes = bytes;

	// Initialize the data array
	this.init();
}

Memory.prototype.init = function() {
	for (var i = 0; i < this.bytes; i++) {
		// Initialize each location to 00
		this.data[i] = "00";
	}
}
