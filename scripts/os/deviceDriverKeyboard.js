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
    if ( ((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
         ((keyCode >= 97) && (keyCode <= 123)) )   // a..z
    {
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
    } else if ((keyCode >= 48) && (keyCode <= 57)) {
        _KernelInputQueue.enqueue(handleNumberChar(keyCode, isShifted));
    }
    else if ((keyCode == 32)                     ||   // space
             (keyCode == 13) )                        // enter
    {
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr);
    } else if (isPunctuationChar(keyCode)) {
        _KernelInputQueue.enqueue(handlePunctuationChar(keyCode, isShifted));
    } else if (keyCode == 8) {
        var deletedChar = _Console.buffer.charAt(_Console.buffer.length - 1);
        // Test to see if the buffer is blank
        if (deletedChar === "") {
            return;
        }
        var startX = _Console.CurrentXPosition - _DrawingContext.measureText(_Console.CurrentFont, _Console.CurrentFontSize, deletedChar),
            startY = _Console.CurrentYPosition - (_DefaultFontSize - 1)
        // Trim the buffer
        _Console.buffer = _Console.buffer.substring(0, _Console.buffer.length - 1);
        // Draw a rectangle over the letter that was deleted
        _DrawingContext.clearRect(startX, startY, _Console.CurrentXPosition, _Console.CurrentYPosition);
        // Move the current X position since we've removed a character
        _Console.CurrentXPosition -= _DrawingContext.measureText(_Console.CurrentFont, _Console.CurrentFontSize, deletedChar);
    }
}

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
