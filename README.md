[MS-BOS | MS-Bob's Operating System](http://bobnisco.github.io/MS-BOS/)
============

CMPT 422 - Fall 2013 Operating Systems project.

See [http://www.labouseur.com/courses/os/]() for details. Forked from [https://github.com/labouseur/AlanBBOS2013]().

## Objective
Write an interrupt-driven operating system (and shell) in JavaScript that runs user programs written in [6502a](http://labouseur.com/courses/os/instructionset.pdf). Utilize the HTML5 Canvas for shell emulation. Utilize HTML5 localStorage as a persistent file system. CPU, Memory, File System are emulated in JavaScript.

## Features & Details
* Shell that accepts input from keyboard/displays output via HTML5 Canvas
* Run/load/store user programs written in 6502a (user should input the hex representation)
	* Enforced memory locations to ensure programs don't access other program's resources
	* Resident list for programs loaded
	* Ready queue for running programs
		* Ready queue contains an array of Process States which holds a PCB and metadata about where the program is stored in memory/file system.
* CPU is emulated by a JS class with support for Program Counter, Accumulator, X Register, Y Register, and Z Flag
* 768 bytes of Memory emulated by a JS class, with 3 program locations at 256 bytes each (by default, but can be changed)
* Hard Drive/File System emulated by HTML5 localStorage with 4 tracks of 8 sectors of 8 blocks with block size of 64 bytes
	 * Write/read/delete operations on files in the file system
	 * Format operation
	 * `ls` to list all files stored on the file system
* 3 different CPU Schedulers 
	1. Round Robin (Quantum defaulted to 6, but configurable via shell command)
	1. First Come First Served
	1. Priority (lower integer value == higher priority)
* Swapped virtual memory to allow for more than just the 3 programs in memory to run at a time
	* Roll in and roll out routines for processes to move from main memory to the file system
* Device drivers to separate the low-level details from the high-level functionality
	* Keyboard device driver
	* File System device driver
* Blue screen of death! (Although this OS is so good, you'll never run into that problem!)
* Sarcastic mode!
