/* ------------
     Console.js

     Requires globals.js

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

function CLIconsole() {
    // Properties
    this.CurrentFont      = _DefaultFontFamily;
    this.CurrentFontSize  = _DefaultFontSize;
    this.CurrentXPosition = 0;
    this.CurrentYPosition = _DefaultFontSize;
    this.buffer = "";
    this.history = new Array();
    this.currentHistoryIndex = -1;

    // Methods
    this.init = function() {
        this.clearScreen();
        this.resetXY();
    };

    this.clearScreen = function() {
        _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
    };

    this.resetXY = function() {
        this.CurrentXPosition = 0;
        this.CurrentYPosition = this.CurrentFontSize;
    };

    this.handleInput = function() {
        while (_KernelInputQueue.getSize() > 0)
        {
            // Get the next character from the kernel input queue.
            var chr = _KernelInputQueue.dequeue();
            // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
            if (chr == String.fromCharCode(13))  //     Enter key
            {
                // The enter key marks the end of a console command, so ...
                // ... add it to our shell history
                this.history.push(this.buffer);
                // Reset the currentHistoryIndex
                this.currentHistoryIndex = this.history.length;
                // ... tell the shell ...
                _OsShell.handleInput(this.buffer);
                // ... and reset our buffer.
                this.buffer = "";
            }
            // TODO: Write a case for Ctrl-C.
            else
            {
                // This is a "normal" character, so ...
                // ... draw it on the screen...
                this.putText(chr);
                // ... and add it to our buffer.
                this.buffer += chr;
            }
        }
    };

    this.putText = function(text) {
        // My first inclination here was to write two functions: putChar() and putString().
        // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
        // between the two.  So rather than be like PHP and write two (or more) functions that
        // do the same thing, thereby encouraging confusion and decreasing readability, I
        // decided to write one function and use the term "text" to connote string or char.
        if (text !== "")
        {
            // Draw the text at the current X and Y coordinates.
            _DrawingContext.drawText(this.CurrentFont, this.CurrentFontSize, this.CurrentXPosition, this.CurrentYPosition, text);
            // Move the current X position.
            var offset = _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, text);
            this.CurrentXPosition = this.CurrentXPosition + offset;
        }
    };

    this.advanceLine = function() {
        this.CurrentXPosition = 0;
        this.CurrentYPosition += _DefaultFontSize + _FontHeightMargin;
        // Handle scrolling, if necessary
        if (this.CurrentYPosition >= _Canvas.height) {
            // Get the canvas data, at an offset
            var oldCanvasData = _DrawingContext.getImageData(0, this.CurrentFontSize + 5, _Canvas.width, _Canvas.height);
            // Redraw it
            _DrawingContext.putImageData(oldCanvasData, 0, 0);
            // Move the current Y position
            this.CurrentYPosition = _Canvas.height - this.CurrentFontSize;
        }
    };

    this.clearLetter = function(deletedChar) {
        var startX = this.CurrentXPosition - _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, deletedChar),
            startY = this.CurrentYPosition - _DefaultFontSize - 2;
        // Trim the buffer
        this.buffer = this.buffer.substring(0, this.buffer.length - 1);
        // Draw a rectangle over the letter that was deleted
        _DrawingContext.clearRect(startX, startY, this.CurrentXPosition, this.CurrentYPosition + 2);
        // Move the current X position since we've removed a character
        this.CurrentXPosition -= _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, deletedChar);
    };

    this.clearLine = function() {
        var startX = this.CurrentXPosition,
            startY = this.CurrentYPosition - (_DefaultFontSize - 1);

        for (var i = 0; i < this.buffer.length; i++) {
            startX -= _DrawingContext.measureText(this.CurrentFont, this.CurrentFontSize, this.buffer.charAt(i));
        }
        _DrawingContext.clearRect(startX, startY, this.CurrentXPosition, this.CurrentYPosition);
        this.CurrentXPosition = startX;
    }

    this.drawBSOD = function(msg) {
        // Give it a nice blue background
        _DrawingContext.rect(0, 0, _Canvas.width, _Canvas.height);
        _DrawingContext.fillStyle = "#2067B2";
        _DrawingContext.fill();
        this.resetFillStyle();
        // Draw a sad face
        _DrawingContext.font = '110pt Calibri';
        _DrawingContext.fillText(':(', _Canvas.width / 3.1, _Canvas.height / 2);
        // Draw the error message
        _DrawingContext.font = '12pt Calibri';
        _DrawingContext.fillText(msg, _Canvas.width / 3, _Canvas.height - 200);
    }

    // Reset the fill style to the default color.
    this.resetFillStyle = function() {
        _DrawingContext.fillStyle = "#DFDBC3";
    }

    // Handler for the software interrupt generated by the 
    // SYS opcode "FF" during CPU execution.
    this.handleSysOpCode = function() {
        if (_CPU.Xreg === 1) {
            // Print the contents of the Y register
            // Convert it to an integer first to strip the leading zeroes
            this.putText(parseInt(_CPU.Yreg).toString());
            this.advanceLine();
            _OsShell.putPrompt();
        } else if (_CPU.Xreg === 2) {
            // Print the 00-terminated string stored at the address in the Y-register
            var output = "",
                // The pointer to the location in memory
                curPointer = _CPU.Yreg,
                // The current data at the location in memory
                curData = _MemoryManager.getMemoryAtAddress(curPointer);

            // Iterate until we hit the null termination code
            while (curData !== "00") {
                console.log("CURRENT DATA: " + curData);
                console.log(curPointer + " " + String.fromCharCode(curData));
                // Convert the data into char data
                output += String.fromCharCode(curData);
                // Move the pointer and get the next byte of data
                curData = _MemoryManager.getMemoryAtAddress(++curPointer);
            }
            this.putText(output);
            this.advanceLine();
            _OsShell.putPrompt();
        }
    }
}
