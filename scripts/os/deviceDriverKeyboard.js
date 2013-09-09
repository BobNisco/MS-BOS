/* ----------------------------------
   DeviceDriverKeyboard.js

   Requires deviceDriver.js

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverKeyboard()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    this.driverEntry = krnKbdDriverEntry;
    this.isr = krnKbdDispatchKeyPress;
    // "Constructor" code.
}

function krnKbdDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
    // More?
}

function krnKbdDispatchKeyPress(params)
{
    // Parse the params.    TODO: Check that they are valid and osTrapError if not.
    var keyCode = params[0];
    var isShifted = params[1];
    krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
    var chr = "";
    // Check to see if we even want to deal with the key that was pressed.
    if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
        ((keyCode >= 97) && (keyCode <= 123))) {  // a..z
        // Determine the character we want to display.
        // Assume it's lowercase...
        chr = String.fromCharCode(keyCode + 32);
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted)
        {
            chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so.
        _KernelInputQueue.enqueue(chr);
    } else if ((keyCode >= 48) && (keyCode <= 57)) {    // Number keys 0-9
        _KernelInputQueue.enqueue(handleNumberChar(keyCode, isShifted));
    } else if ((keyCode == 32) || (keyCode == 13)) {    // Space or enter
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
    } else if (isPunctuationChar(keyCode)) {        // Punctuation keys
        _KernelInputQueue.enqueue(handlePunctuationChar(keyCode, isShifted));
    } else if (keyCode == 8) {                      // Backspace
        var deletedChar = _Console.buffer.charAt(_Console.buffer.length - 1);
        // Test to see if the buffer is blank
        if (deletedChar === "") {
            return;
        }
        _Console.clearLetter(deletedChar);
    } else if (keyCode == 38 || keyCode == 40) {    // Up or down arrow
        _Console.clearLine();
        _Console.buffer = "";
        // If we are using the up arrow, we will be moving backwards
        // in the console history array, else we are using the down arrow
        // and we will need to advance forward
        var offset = (keyCode == 38) ? -1 : 1;
        _Console.currentHistoryIndex += offset;

        if (_Console.history[_Console.currentHistoryIndex]) {
            // We are in a valid point of the history array,
            // so we will go ahead and queue it up!
            enqueueWord(_Console.history[_Console.currentHistoryIndex]);
        } else if (_Console.currentHistoryIndex < 0) {
            // Handle the beginning of history edge case
            _Console.currentHistoryIndex = -1;
        } else if (_Console.currentHistoryIndex >= _Console.history.length) {
            // Handle the end of history edge case
            _Console.currentHistoryIndex = _Console.history.length;
        }
    }
}

// Enqueues the word, letter by letter, into the _KernelInputQueue
function enqueueWord(word) {
    for (var i = 0; i < word.length; i++) {
        _KernelInputQueue.enqueue(word.charAt(i));
    }
}

// Returns boolean representing if given charcode is a punctuation key
function isPunctuationChar(ch) {
    if ((ch >= 186 && ch <= 192) ||
        (ch >= 219 && ch <= 222)) {
        return true;
    }
    return false;
}

function handlePunctuationChar(keyCode, isShifted) {
    // What is up with charcodes?
    // Is there a function already made for this atrocity?
    // If there is, I can't find it.
    var lookupTable = {
        '186' : ';',
        '187' : '=',
        '188' : ',',
        '189' : '-',
        '190' : '.',
        '191' : '/',
        '192' : '`',
        '219' : '[',
        '220' : '\\',
        '221' : ']',
        '222' : '\''
    }, lookupTableShifted = {
        '186' : ':',
        '187' : '+',
        '188' : '<',
        '189' : '_',
        '190' : '>',
        '191' : '?',
        '192' : '~',
        '219' : '{',
        '220' : '|',
        '221' : '}',
        '222' : '\"'
    };
    chr = lookupTable[keyCode];
    if (isShifted) {
        chr = lookupTableShifted[keyCode];
    }
    return chr;
}

function handleNumberChar(keyCode, isShifted) {
    var lookupTableShifted = {
        '48' : ')',
        '49' : '!',
        '50' : '@',
        '51' : '#',
        '52' : '$',
        '53' : '%',
        '54' : '^',
        '55' : '&',
        '56' : '*',
        '57' : '('
    };
    chr = String.fromCharCode(keyCode);
    if (isShifted) {
        chr = lookupTableShifted[keyCode];
    }
    return chr;
}
