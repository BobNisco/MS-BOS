/* ------------
   Globals.js

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global CONSTANTS
//
var APP_NAME = "MS-BOS";
var APP_VERSION = "0.02";

var CPU_CLOCK_INTERVAL = 100;   // This is in ms, or milliseconds, so 1000 = 1 second.

var TIMER_IRQ = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                    // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var SYS_OPCODE_IRQ = 2;
var STEP_CPU_IRQ = 3;
var UNKNOWN_OPCODE_IRQ = 4;
var CONTEXT_SWITCH_IRQ = 5;

//
// Global Variables
//
var _CPU = null;
var _CpuScheduler = null;
var _CycleCounter = 0;

// The Round Robin Quantum value
var QUANTUM = 6;

// We want to be able to store 3 programs in memory
var NUMBER_OF_PROGRAMS = 3;
// Our programs will be 256 bytes of memory each
var PROGRAM_SIZE = 256;
// Our total memory size will be the number of programs times the program size.
// Scalability!
var MEMORY_SIZE = NUMBER_OF_PROGRAMS * PROGRAM_SIZE;
var _MemoryManager = null;

var _OSclock = 0;       // Page 23.
var _StepEnabled = false;

var _Mode = 0;   // 0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas = null;               // Initialized in hostInit().
var _DrawingContext = null;       // Initialized in hostInit().
var _Taskbar = null;			  // Initialized in hostInit().
var _DefaultFontFamily = "sans";  // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;        // Additional space added to font size when advancing a line.

// Default the OS trace to be on.
var _Trace = true;

// OS queues
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;
var _ResidentQueue = null;
var _ReadyQueue = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// Globals for currently executing program
var _CurrentProgram = null;

// UI
var _Console = null;
var _OsShell = null;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var krnKeyboardDriver = null;

// For testing...
var _GLaDOS = null;
