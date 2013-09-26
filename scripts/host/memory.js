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

function Memory() {
	// The array representing the bytes in our memory
	this.data = new Array();
	// We will need 3 sections of 256 bytes of memory each
	// to hold our 3 user programs.
	// 256 * 3 = 768. Mathematical!
	for (var i = 0; i < 768; i++) {
		// Initialize each location to 00
		this.data[i] = "00";
	}
}
