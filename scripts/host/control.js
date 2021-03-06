/* ------------
   Control.js

   Requires global.js.

   Routines for the hardware simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code that
   s our client OS. But that analogy only goes so far, and the lines are blurred, because we are using JavaScript in
   both the host and client environments.

   This (and other host/simulation scripts) is the only place that we should see "web" code, like
   DOM manipulation and JavaScript event handling, and so on.  (Index.html is the only place for markup.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */


//
// Control Services
//
function hostInit()
{
	// Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
	_Canvas  = document.getElementById('display');

	// Get a global reference to the drawing context.
	_DrawingContext = _Canvas.getContext('2d');

	// Enable the added-in canvas text functions (see canvastext.js for provenance and details).
	CanvasTextFunctions.enable(_DrawingContext);   // TODO: Text functionality is now built in to the HTML5 canvas. Consider using that instead.

	// Clear the log text box.
	document.getElementById("taLog").value="";

	// Set focus on the start button.
	document.getElementById("btnStartOS").focus();

	// Check for our testing and enrichment core.
	if (typeof Glados === "function") {
		_GLaDOS = new Glados();
		_GLaDOS.init();
	};

	// Initialize the global _Taskbar variable
	_Taskbar = document.getElementById('taskbar');
	_Taskbar.datetime = document.getElementById('taskbar-datetime');
	_Taskbar.updateDatetime = function() {
		_Taskbar.datetime.innerText = getCurrentDateTime();
	};
	// Set the current date time right away
	_Taskbar.updateDatetime();
	// Upate the taskbar datetime every second
	setInterval(function() {
		_Taskbar.updateDatetime();
	}, 1000);
	_Taskbar.status = document.getElementById('taskbar-status');
	_Taskbar.setStatus = function(newStatus) {
		_Taskbar.status.innerText = newStatus;
	};
}

function hostLog(msg, source)
{
	// Check the source.
	if (!source) {
		source = "?";
	}

	// Note the OS CLOCK.
	var clock = _OSclock;

	// Note the REAL clock in milliseconds since January 1, 1970.
	var now = new Date().getTime();

	// Build the log div
	var str = "<div class=\"log-row\" data-msg=\"" + msg + "\">" + createLabelForSource(source) +
		" ({ clock:" + clock + ", msg:" + msg + ", now:" + now  + " })</div>";

	// Update the log console.
	var taLog = $('#taLog'),
		lastRow = taLog.children().first();
	if (lastRow.data('msg') === 'Idle' && msg === 'Idle') {
		lastRow.replaceWith(str);
	} else {
		taLog.html(str + taLog.html());
	}
	// Optionally update a log database or some streaming service.
}

function createLabelForSource(source) {
	if (source === 'OS') {
		return '<span class="label label-success">' + source + '</span>';
	} else if (source === 'host') {
		return '<span class="label label-danger">' + source + '</span>';
	} else {
		return '<span class="label label-primary">' + source + '</span>';
	}
}

//
// Control Events
//
function hostBtnStartOS_click(btn)
{
	// Disable the start button...
	btn.disabled = true;
	$(btn).addClass('disabled');

	// .. enable the Halt and Reset buttons ...
	$("#btnHaltOS").removeClass('disabled');
	$("#btnReset").removeClass('disabled');

	// .. set focus on the OS console display ...
	document.getElementById("display").focus();

	// ... Create and initialize the CPU ...
	_CPU = new Cpu();
	printCpuToScreen();

	// ... Create and initialize the memory ...
	_MemoryManager = new MemoryManager();

	// ... then set the host clock pulse ...
	_hardwareClockID = setInterval(hostClockPulse, CPU_CLOCK_INTERVAL);
	// .. and call the OS Kernel Bootstrap routine.
	krnBootstrap();
}

function hostBtnHaltOS_click(btn)
{
	if (!$('#btnHaltOS').hasClass('disabled')) {
		hostLog("emergency halt", "host");
		hostLog("Attempting Kernel shutdown.", "host");
		// Call the OS shutdown routine.
		krnShutdown();
		// Stop the JavaScript interval that's simulating our clock pulse.
		clearInterval(_hardwareClockID);
		// TODO: Is there anything else we need to do here?
	}
}

function hostBtnReset_click(btn)
{
	if (!$('#btnReset').hasClass('disabled')) {
		// The easiest and most thorough way to do this is to reload (not refresh) the document.
		location.reload(true);
		// That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
		// be reloaded from the server. If it is false or not specified, the browser may reload the
		// page from its cache, which is not what we want.
	}
}

function hostBtnStep_click(btn) {
	if (!$('#btnStep').hasClass('disabled')) {
		// Make a software interrupt to step ahead 1 cycle
		_KernelInterruptQueue.enqueue(new Interrupt(STEP_CPU_IRQ));
	}
}

function printCpuToScreen() {
	$('#pcDisplay').html(_CPU.PC);
	$('#accDisplay').html(_CPU.Acc);
	$('#xRegDisplay').html(_CPU.Xreg);
	$('#yRegDisplay').html(_CPU.Yreg);
	$('#zRegDisplay').html(_CPU.Zflag);
};

// jQuery's ondocument ready handler function
$(document).ready(function() {
	// Bind a function to the user-program buttons
	$('.user-program').on('click', function(e) {
		var el = $(this);
		e.preventDefault();
		// Set the userInput textarea to the program of the clicked button.
		document.getElementById('taProgramInput').value = el.data('program');
	});

	var toggleTerminatedProcessesButton = $('#toggleTerminatedProcesses');
	// On click of the toggle terminated processes button, we will
	// toggle the visibility of the table rows who were previously terminated
	toggleTerminatedProcessesButton.on('click', function(e) {
		var table = $('#readyQueueDisplay').find('table'),
			tbody = table.find('tbody'),
			rows = tbody.children();
		// Flip the boolean
		_ShowTerminatedProcesses = !_ShowTerminatedProcesses;
		// Update the button text
		if (_ShowTerminatedProcesses) {
			toggleTerminatedProcessesButton.html('Hide Terminated Processes');
		} else {
			toggleTerminatedProcessesButton.html('Show Terminated Processes');
		}
		// For each of the rows, figure out whether we should hide or show them
		$.each(rows, function(i, val) {
			var el = $(val);
			if (el.data('state') === ProcessState.TERMINATED) {
				if (_ShowTerminatedProcesses) {
					el.show('fast');
				} else {
					el.hide('fast');
				}
			}
		});
	});

	var programToggleButton = $('#program-toggle-button'),
		programList = $('#program-list');
	programToggleButton.on('click', function(e) {
		e.preventDefault();
		if (programList.hasClass('hide')) {
			programList.removeClass('hide');
		} else {
			programList.addClass('hide');
		}
	});
});
