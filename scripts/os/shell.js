/* ------------
   Shell.js

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

function Shell() {
	// Properties
	this.promptStr   = ">";
	this.commandList = [];
	this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
	this.apologies   = "[sorry]";
	// Methods
	this.init        = shellInit;
	this.putPrompt   = shellPutPrompt;
	this.handleInput = shellHandleInput;
	this.execute     = shellExecute;
}

function shellInit() {
	var sc = null;
	//
	// Load the command list.

	// ver
	sc = new ShellCommand();
	sc.command = "ver";
	sc.description = "- Displays the current version data.";
	sc.function = shellVer;
	this.commandList[this.commandList.length] = sc;

	// help
	sc = new ShellCommand();
	sc.command = "help";
	sc.description = "- This is the help command. Seek help.";
	sc.function = shellHelp;
	this.commandList[this.commandList.length] = sc;

	// shutdown
	sc = new ShellCommand();
	sc.command = "shutdown";
	sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running.";
	sc.function = shellShutdown;
	this.commandList[this.commandList.length] = sc;

	// cls
	sc = new ShellCommand();
	sc.command = "cls";
	sc.description = "- Clears the screen and resets the cursor position.";
	sc.function = shellCls;
	this.commandList[this.commandList.length] = sc;

	// man <topic>
	sc = new ShellCommand();
	sc.command = "man";
	sc.description = "<topic> - Displays the MANual page for <topic>.";
	sc.function = shellMan;
	this.commandList[this.commandList.length] = sc;

	// trace <on | off>
	sc = new ShellCommand();
	sc.command = "trace";
	sc.description = "<on | off> - Turns the OS trace on or off.";
	sc.function = shellTrace;
	this.commandList[this.commandList.length] = sc;

	// rot13 <string>
	sc = new ShellCommand();
	sc.command = "rot13";
	sc.description = "<string> - Does rot13 obfuscation on <string>.";
	sc.function = shellRot13;
	this.commandList[this.commandList.length] = sc;

	// prompt <string>
	sc = new ShellCommand();
	sc.command = "prompt";
	sc.description = "<string> - Sets the prompt.";
	sc.function = shellPrompt;
	this.commandList[this.commandList.length] = sc;

	// date
	sc = new ShellCommand();
	sc.command = "date";
	sc.description = "- Displays the current date and time."
	sc.function = function() {
		if (_SarcasticMode) {
			_StdIn.putText("What does it matter what day and time it is?");
			_StdIn.advanceLine();
			_StdIn.putText("Like you have anywhere to be.");
			_StdIn.advanceLine();
			_StdIn.putText("You're playing with an OS by yourself.");
			_StdIn.advanceLine();
			_StdIn.putText("Fine, I'll tell you anyway.");
			_StdIn.advanceLine();
		}
		_StdIn.putText(getCurrentDateTime());
	};
	this.commandList[this.commandList.length] = sc;

	// whereami
	sc = new ShellCommand();
	sc.command = "whereami";
	sc.description = "- Displays your current location";
	sc.function = function() {
		// Check to see that browser supports geolocation
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				_StdIn.putText("Lat: " + position.coords.latitude + " Long: " +
					position.coords.longitude);
				_StdIn.advanceLine();
				_OsShell.putPrompt();
			}, function(error) {
				_StdIn.putText("Error while trying to geolocate your position.")
				_StdIn.advanceLine();
				_StdIn.putText("You're probably in your parent's basement.");
				_StdIn.advanceLine();
				_OsShell.putPrompt();
			});
		} else {
			_StdIn.putText("You're probably in your parent's basement.");
			_OsShell.putPrompt();
		}
	};
	this.commandList[this.commandList.length] = sc;

	// bsodplz
	sc = new ShellCommand();
	sc.command = "bsodplz";
	sc.description = "- Displays a BSOD, because you asked nicely";
	sc.function = function() {
		if (_SarcasticMode) {
			krnTrapError(rot13('Whfg... shpx bss'));
		} else {
			krnTrapError('Look what you\'ve done this time!');
		}
	};
	this.commandList[this.commandList.length] = sc;

	// uptime
	sc = new ShellCommand();
	sc.command = "uptime";
	sc.description = "- Displays the amount of time that the OS has been active.";
	sc.function = function() {
		var adjustedSeconds = _OSclock / 10.0,
			// I want to pad these numbers with a 0, so it will display the time properly.
			// If the number of seconds is "1", and I have prepended a 0 to it, then
			// it is essentially "01".slice(-2), which will return "01" as expected.
			// If the number of seconds is "32", and I have prepended a 0 to it, then
			// it is essentially "032".slice(-2), which will return "32" as expected
			hours = ('0' + Math.floor(adjustedSeconds / (60 * 60))).slice(-2),
			minutes = ('0' + Math.floor((adjustedSeconds % (60 * 60)) / 60)).slice(-2),
			seconds = ('0' + Math.ceil((adjustedSeconds % (60 * 60) % 60))).slice(-2);
		if (_SarcasticMode) {
			_StdIn.putText("I've been up for " + hours + ":" + minutes + ":" + seconds +
				", which is far too long.")
		} else {
			_StdIn.putText("I've been up for " + hours + ":" + minutes + ":" + seconds +
				", can you believe it!?");
		}
	};
	this.commandList[this.commandList.length] = sc;

	// load
	sc = new ShellCommand();
	sc.command = "load";
	sc.description = "- Checks the User Program Input box for errors";
	sc.function = function() {
		var input = document.getElementById("taProgramInput").value;
		if (input.match(/^[0-9A-F]/i)) {
			_StdIn.putText("Loading program. Please be patient.");
			_StdIn.advanceLine();
			var thisPid = _MemoryManager.loadProgram(input);
			if (thisPid !== null) {
				_StdIn.putText("PID: " + thisPid);
			}
			_MemoryManager.printToScreen();
		} else {
			_StdIn.putText("What kind of input is that!?");
		}
	};
	this.commandList[this.commandList.length] = sc;

	// run
	sc = new ShellCommand();
	sc.command = "run";
	sc.description = "<PID> - Runs the user program located at given PID";
	sc.function = function(args) {
		if (args.length <= 0) {
			_StdIn.putText("Usage: run <PID>  Please specify a valid PID.");
			_StdIn.advanceLine();
		} else if (!_ResidentQueue[args[0]]) {
			_StdIn.putText("Please specify a valid PID.");
			_StdIn.advanceLine();
		} else {
			var requestedProgram = _ResidentQueue[args[0]];
			if (requestedProgram.state !== ProcessState.TERMINATED) {
				_ReadyQueue.enqueue(requestedProgram);
				_CpuScheduler.start();
			}
		}
	};
	this.commandList[this.commandList.length] = sc;

	// status
	sc = new ShellCommand();
	sc.command = "status";
	sc.description = "<string> - Sets the taskbar status message";
	sc.function = function(args) {
		if (args.length > 0)
		{
			var newStatus = "";
			for (var i = 0; i < args.length; i++) {
				newStatus += " " + args[i];
			}
			_Taskbar.setStatus(newStatus);
		}
		else
		{
			_StdIn.putText("Usage: status <string>  Please supply a string.");
		}
	};
	this.commandList[this.commandList.length] = sc;

	// step
	sc = new ShellCommand();
	sc.command = "step";
	sc.description = "<boolean> - Turns step on or off";
	sc.function = function(args) {
		if (args.length > 0)
		{
			var btnStep = $('#btnStep');
			if (args[0] === 'true') {
				btnStep.removeClass('disabled');
				_StepEnabled = true;
			} else if (args[0] === 'false') {
				btnStep.addClass('disabled');
				_StepEnabled = false;
			} else {
				_StdIn.putText("Usage: step <boolean>  Please supply a boolean value.");
			}
		}
		else
		{
			_StdIn.putText("Usage: step <boolean>  Please supply a boolean value.");
		}
	};
	this.commandList[this.commandList.length] = sc;

	// clearall
	sc = new ShellCommand();
	sc.command = "clearall";
	sc.description = " - Clears all program locations in memory";
	sc.function = function(args) {
		_StdIn.putText("Clearing all program locations in memory...");
		_StdIn.advanceLine();
		// Iterate over each program location in memory
		for (var i = 0; i < _MemoryManager.locations.length; i++) {
			// Clear the block of memory
			_MemoryManager.clearProgramSection(i);
			// Set its active flag to false
			_MemoryManager.locations[i].active = false;
		}
		// Update the UI
		_MemoryManager.printToScreen();
		_StdIn.putText("All program locations cleared!");
	};
	this.commandList[this.commandList.length] = sc;

	// runall
	sc = new ShellCommand();
	sc.command = "runall";
	sc.description = " - Enqueues all of the available programs in the resident list onto the ready queue";
	sc.function = function(args) {
		// Iterate over each program in the resident list
		// to enqueue it on the ready queue
		for (var i = 0; i < _ResidentQueue.length; i++) {
			var requestedProgram = _ResidentQueue[i];
			if (requestedProgram.state !== ProcessState.TERMINATED) {
				_ReadyQueue.enqueue(_ResidentQueue[i]);
				_ResidentQueue[i].printToScreen();
			}
		}
		_CpuScheduler.start();
	};
	this.commandList[this.commandList.length] = sc;

	// quantum
	sc = new ShellCommand();
	sc.command = "quantum";
	sc.description = " <int> - Sets the time quantum for the Round Robin scheduler";
	sc.function = function(args) {
		if (args.length > 0) {
			QUANTUM = parseInt(args[0]);
		} else {
			_StdIn.putText("Usage: quantum <int>  Please supply an integer value.");
		}
	};
	this.commandList[this.commandList.length] = sc;


	// processes - list the running processes and their IDs
	// kill <id> - kills the specified process id.

	//
	// Display the initial prompt.
	this.putPrompt();
}

function shellPutPrompt()
{
	_StdIn.putText(this.promptStr);
}

function shellHandleInput(buffer)
{
	krnTrace("Shell Command~" + buffer);
	//
	// Parse the input...
	//
	var userCommand = new UserCommand();
	userCommand = shellParseInput(buffer);
	// ... and assign the command and args to local variables.
	var cmd = userCommand.command;
	var args = userCommand.args;
	//
	// Determine the command and execute it.
	//
	// JavaScript may not support associative arrays in all browsers so we have to
	// iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
	var index = 0;
	var found = false;
	while (!found && index < this.commandList.length)
	{
		if (this.commandList[index].command === cmd)
		{
			found = true;
			var fn = this.commandList[index].function;
		}
		else
		{
			++index;
		}
	}
	if (found)
	{
		this.execute(fn, args);
	}
	else
	{
		// It's not found, so check for curses and apologies before declaring the command invalid.
		if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0)      // Check for curses.
		{
			this.execute(shellCurse);
		}
		else if (this.apologies.indexOf("[" + cmd + "]") >= 0)      // Check for apologies.
		{
			this.execute(shellApology);
		}
		else    // It's just a bad command.
		{
			this.execute(shellInvalidCommand);
		}
	}
}

function shellParseInput(buffer)
{
	var retVal = new UserCommand();

	// 1. Remove leading and trailing spaces.
	buffer = trim(buffer);

	// 2. Lower-case it.
	buffer = buffer.toLowerCase();

	// 3. Separate on spaces so we can determine the command and command-line args, if any.
	var tempList = buffer.split(" ");

	// 4. Take the first (zeroth) element and use that as the command.
	var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
	// 4.1 Remove any left-over spaces.
	cmd = trim(cmd);
	// 4.2 Record it in the return value.
	retVal.command = cmd;

	// 5. Now create the args array from what's left.
	for (var i in tempList)
	{
		var arg = trim(tempList[i]);
		if (arg != "")
		{
			retVal.args[retVal.args.length] = tempList[i];
		}
	}
	return retVal;
}

function shellExecute(fn, args)
{
	// We just got a command, so advance the line...
	_StdIn.advanceLine();
	// ... call the command function passing in the args...
	fn(args);
	// Check to see if we need to advance the line again
	if (_StdIn.CurrentXPosition > 0)
	{
		_StdIn.advanceLine();
	}
	// ... and finally write the prompt again.
	this.putPrompt();
}


//
// The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately),
// as they are not denoted in the constructor.  The idea is that you cannot execute them from
// elsewhere as shell.xxx .  In a better world, and a more perfect JavaScript, we'd be
// able to make then private.  (Actually, we can. have a look at Crockford's stuff and Resig's JavaScript Ninja cook.)
//

//
// An "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function ShellCommand()
{
	// Properties
	this.command = "";
	this.description = "";
	this.function = "";
}

//
// Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function UserCommand()
{
	// Properties
	this.command = "";
	this.args = [];
}


//
// Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
//
function shellInvalidCommand()
{
	_StdIn.putText("Invalid Command. ");
	if (_SarcasticMode)
	{
		_StdIn.putText("Duh. Go back to your Speak & Spell.");
	}
	else
	{
		_StdIn.putText("Type 'help' for, well... help.");
	}
}

function shellCurse()
{
	_StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
	_StdIn.advanceLine();
	_StdIn.putText("Bitch.");
	_SarcasticMode = true;
}

function shellApology()
{
   if (_SarcasticMode) {
	  _StdIn.putText("Okay. I forgive you. This time.");
	  _SarcasticMode = false;
   } else {
	  _StdIn.putText("For what?");
   }
}

function shellVer(args)
{
	_StdIn.putText(APP_NAME + " version " + APP_VERSION);
}

function shellHelp(args)
{
	_StdIn.putText("Commands:");
	for (var i in _OsShell.commandList)
	{
		_StdIn.advanceLine();
		_StdIn.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
	}
}

function shellShutdown(args)
{
	 _StdIn.putText("Shutting down...");
	 // Call Kernel shutdown routine.
	krnShutdown();
	// TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
}

function shellCls(args)
{
	_StdIn.clearScreen();
	_StdIn.resetXY();
}

function shellMan(args)
{
	if (args.length > 0)
	{
		var topic = args[0];
		switch (topic)
		{
			case "help":
				_StdIn.putText("Help displays a list of (hopefully) valid commands.");
				break;
			default:
				_StdIn.putText("No manual entry for " + args[0] + ".");
		}
	}
	else
	{
		_StdIn.putText("Usage: man <topic>  Please supply a topic.");
	}
}

function shellTrace(args)
{
	if (args.length > 0)
	{
		var setting = args[0];
		switch (setting)
		{
			case "on":
				if (_Trace && _SarcasticMode)
				{
					_StdIn.putText("Trace is already on, dumbass.");
				}
				else
				{
					_Trace = true;
					_StdIn.putText("Trace ON");
				}

				break;
			case "off":
				_Trace = false;
				_StdIn.putText("Trace OFF");
				break;
			default:
				_StdIn.putText("Invalid arguement.  Usage: trace <on | off>.");
		}
	}
	else
	{
		_StdIn.putText("Usage: trace <on | off>");
	}
}

function shellRot13(args)
{
	if (args.length > 0)
	{
		_StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
	}
	else
	{
		_StdIn.putText("Usage: rot13 <string>  Please supply a string.");
	}
}

function shellPrompt(args)
{
	if (args.length > 0)
	{
		_OsShell.promptStr = args[0];
	}
	else
	{
		_StdIn.putText("Usage: prompt <string>  Please supply a string.");
	}
}
