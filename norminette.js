
class Norminette {

	constructor(){
		this.errors = [];
		this.lines = [];
		this.elements = [];
		this.currentLine = 0;
		this.currentElementIndex = 0;
		this.blockLevel = 0;
		this.parenthesisLevel = 0;
		this.inlineComment = false;
		this.blockComment = false;
		this.stringChain = false;
		this.macro = false;
		this.stringOpeningCharacter = "";
		this.readingInstruction = false;
		this.instructionCountOnLine = 0;
		this.standardHeaderInvalid = false;
		this.treatingFunctionArguments = false;
		this.functionInTreatment = {};
		this.functionDefs = [];
	}

    analyze(data, callback) {
        this.lines = data.split(/\r?\n/);
        this.elements = this.breakElements(data);
        this.cleanElements(this.elements);
        this.repairOperators(this.elements);

        for (var i = 0 ; i < this.lines.length ; i++) {
            this.currentLine = i + 1;

            this.checkStandardHeader(this.lines[i]);
            this.checkLineLength(this.lines[i]);
            this.checkLineEnding(this.lines[i]);
            this.checkEmptyLines(this.lines[i]);
        }

        this.currentLine = 1;

        this.elements.forEach((item, index, array) => {
            this.currentElementIndex = index;

            this.checkCurrentContext(item);

            if(!this.blockComment && !this.inlineComment && !this.stringChain) {
                this.checkForbiddenKeywords(item);
                this.checkSpaceAfterKeywords(item);
                this.checkSpaceAfterComa(item);

                if(!this.macro) {
                    this.checkSpaceAroundOperators(item);
                    this.checkBlockDelimitersPosition(item);
                    this.checkInstructionCount(item);
                    this.detectFunction(item);
                }
            }

            this.updateLineNumber(item);
        });

        this.functionDefs.forEach((item) => {
            this.defineFunctionDefContent(item);
            this.checkFunctionDefLineCount(item);
        });


        callback(this);
    }

    breakElements(data) {
	    let elements = [];
	    var currentElement = "";

	    for(var i = 0 ; i < data.length ; i++) {
	        if(data.charAt(i).match(/\w|\d|_|\./)) {
	            currentElement += data.charAt(i);
            }

            else {
	            if(currentElement.length != 0) {
                    elements.push(currentElement);
                }

                elements.push(data.charAt(i));
	            currentElement = "";
            }
        }

        if(currentElement.length != 0) {
            elements.push(currentElement);
        }

	    return elements;
    }

    cleanElements(elements) {
        elements.forEach((item, index, array) => {
            switch (item) {
                case "\r" :
                    array.splice(index, 1);
                    break;
            }
        });
    }

    repairOperators(elements) {
	    let operators = /[+*\/=?|-]/;
	    elements.forEach((item, index, array) => {
	        switch(item) {
                case "+":
                    if (array[index + 1].match(/[+=]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;

                case "-":
                    if (array[index + 1].match(/[-=]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;

                case "/":
                    if (array[index + 1].match(/[\/*=]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;

                case "*":
                    if (array[index + 1].match(/[\/=]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;

                case "=":
                    if (array[index + 1].match(/[=]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;

                case "!":
                    if (array[index + 1].match(/[=]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;

                case "&":
                    if (array[index + 1].match(/[&]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;

                case "|":
                    if (array[index + 1].match(/[|]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;

                case "<":
                    if (array[index + 1].match(/[<=]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;

                case ">":
                    if (array[index + 1].match(/[>=]/)) {
                        array[index] += array.slice(index + 1, index + 2);
                        array.splice(index + 1, 1);
                    }
                    break;
            }
        });
    }

    getNextElement() {
	    if(this.currentElementIndex + 1 < this.elements.length) {
	        return this.elements[this.currentElementIndex + 1];
        }

        return undefined;
    }

    getNextSignificantElement(excludeNewLines = false) {
	    var index = this.currentElementIndex + 1;

	    while(index < this.elements.length) {
            if(!this.elements[index].match(" ") && !this.elements[index].match("\t")) {
                if(!excludeNewLines) {
                    return this.elements[index];
                }
                else if(!this.elements[index].match("\n")) {
                    return this.elements[index];
                }
            }

            index++;
        }

        return undefined;
    }

    getNextSignificantElementIndex(excludeNewLines = false) {
        var index = this.currentElementIndex + 1;

        while(index < this.elements.length) {
            if(!this.elements[index].match(" ") && !this.elements[index].match("\t")) {
                if(!excludeNewLines) {
                    return index;
                }
                else if(!this.elements[index].match("\n")) {
                    return index;
                }
            }

            index++;
        }

        return undefined;
    }

    getPreviousElement() {
	    if(this.currentElementIndex > 0) {
	        return this.elements[this.currentElementIndex - 1];
        }

        return undefined;
    }

    getPreviousSignificantElement() {
        var index = this.currentElementIndex - 1;

        while(index >= 0) {
            if(!this.elements[index].match(" ") && !this.elements[index].match("\t")) {
                return this.elements[index];
            }

            index--;
        }

        return undefined;
    }

    checkInstructionCount(element) {
	    if(element.match("\n")) {
	        this.instructionCountOnLine = 0;
	        this.readingInstruction = false;
        }
        else if(element.match(";")) {
	        this.readingInstruction = false;
        }
        else if(element.match(/\w+/)) {
            if(!this.readingInstruction) {
                this.readingInstruction = true;
                this.instructionCountOnLine++;

                if(this.instructionCountOnLine === 2) {
                    this.addError("More than one instruction on the line");
                }
            }
        }
    }

    /*
    ** Line check methods
    *  These methods check basic rules based on line content, and not on elements themselves.
    **/

    checkLineLength(lineContent) {
        lineContent = lineContent.replace(/\t/g, "    ");

        if(lineContent.length > 80) {
            this.addError("Too many characters on the line (> 80)");
        }
    }

    checkLineEnding(lineContent) {
        if(lineContent.endsWith(" ") || lineContent.endsWith("\t")) {
            this.addError("Line ends with a space or a tabulation");
        }
    }

    checkEmptyLines(lineContent) {
        if(this.isLineEmpty(lineContent)) {
            if(lineContent.length !== 0) {
                this.addError("Empty line containing spaces or tabulations");
            }
        }
    }

    checkStandardHeader(lineContent) {
        if(!this.standardHeaderInvalid && this.currentLine <= 11) {
            if(!lineContent.startsWith("/*") || !lineContent.endsWith("*/")) {
                this.standardHeaderInvalid = true;
                this.addError("Standard header invalid or non-existent");
            }
        }
    }

    //Checks if line is empty, without caring about spaces
    isLineEmpty(lineContent) {
        var buffer = lineContent.replace(/\s/g, "");

        return buffer.length === 0;
    }

    updateLineNumber(element) {
        if(element.match(/\n/)) {
            this.currentLine++;
        }
    }

    checkCurrentContext(element) {
        if(element.match(/["']/) && !this.inlineComment && !this.blockComment) {
            if(!this.stringChain) {
                this.stringChain = true;
                this.stringOpeningCharacter = element;
            }
            else if (this.stringOpeningCharacter.match(element)){
                this.stringChain = false;
                this.stringOpeningCharacter = "";
            }
        }
        else if (element.match(/\/\//) && !this.stringChain && !this.blockComment) {
            this.addError("Usage of forbidden inline comment (//)");
            this.inlineComment = true;
        }
        else if (element.match(/\n/)) {
            this.inlineComment = false;
            this.macro = false;
        }
        else if (element.match(/\/\*/) && !this.stringChain && !this.inlineComment) {
            this.blockComment = true;
        }
        else if (element.match(/\*\//) && this.blockComment) {
            this.blockComment = false;
        }
        else if (element.match("#") && !this.inlineComment && !this.stringChain && !this.blockComment) {
            var previousElement = this.getPreviousSignificantElement();
            if(!previousElement || previousElement.match("\n")) {
                this.macro = true;
            }
        }
    }

    checkForbiddenKeywords(element) {
        switch (element) {
            case 'for':
            case 'do':
            case 'switch':
            case 'case':
            case 'goto':
                this.addError("Usage of forbidden keyword : " + element);
        }
    }

    checkSpaceAfterKeywords(element) {
        switch (element) {
            case "if":
            case "while":
            case "return":
            case "break":
            case "continue":
                if ((this.currentElementIndex + 1 < this.elements.length) && (!this.elements[this.currentElementIndex + 1].match(" "))) {
                    this.addError("Space required after keyword " + element);
                }
                break;
        }
    }

    checkSpaceAroundOperators(element) {
        if(this.isOperator(element)) {
            var before = false;
            var after = false;

            if(!this.getNextElement().match(/[\s]/)) {
                after = true;
            }
            if(!this.getPreviousElement().match(/[\s]/)) {
                before = true;
            }

            if(before && !after) {
                this.addError("Space missing before operator " + element);
            }
            else if(!before && after) {
                this.addError("Space missing after operator " + element);
            }
            else if(before && after) {
                this.addError("Space missing before and after operator " + element);
            }

        }
    }

    checkSpaceAfterComa(element) {
        if(element.match(/[;,]/)) {
            if(this.getNextSignificantElement() !== "\n") {
                var nextElement = this.getNextElement();
                if(nextElement !== " " && nextElement !== "\t") {
                    this.addError("Missing space after " + element);
                }
            }
        }
    }

    checkBlockDelimitersPosition(element) {
        if(element.match(/[{}]/)) {
            if(this.getNextSignificantElement() !== "\n" || this.getPreviousSignificantElement() !== "\n") {
                this.addError("Block sign " + element + " must be alone on his line");
            }
        }
    }

    isOperator(element) {
        return  element === "+" ||
                element === "-" ||
                element === "/" ||
                element === "=" ||
                element === "+=" ||
                element === "-=" ||
                element === "*=" ||
                element === "/=" ||
                element === "==" ||
                element === "!=" ||
                element === "|" ||
                element === "||" ||
                element === "&" ||
                element === "&&" ||
                element === "<" ||
                element === "<<" ||
                element === "<=" ||
                element === ">" ||
                element === ">>" ||
                element === ">=" ||
                element === "?" ||
                element === ":";
    }

    isKeyword(element) {
        return element === "if" ||
            element === "while" ||
            element === "for" ||
            element === "switch" ||
            element === "return" ||
            element === "goto";
    }

    detectFunction(element) {
        if(element.match(/\(/)) {
            this.parenthesisLevel++;

            var previousElement = this.getPreviousSignificantElement();
            if(!this.treatingFunctionArguments && !this.isKeyword(previousElement) && !this.isOperator(previousElement) && !previousElement.match(/^[0-9]*$/)) {
                this.functionInTreatment = {
                    name: previousElement,
                    line: this.currentLine,
                    definition: false,
                    blockLevel: this.blockLevel,
                    parenthesisLevel: this.parenthesisLevel,
                    argumentStartElementIndex: this.currentElementIndex,
                    argumentContent: [],
                    arguments: []
                };

                this.treatingFunctionArguments = true;
            }

            else if(this.treatingFunctionArguments) {
                this.functionInTreatment.argumentContent.push(element);
            }
        }

        else if(element.match(/\)/)) {
            if (this.treatingFunctionArguments) {
                if (this.parenthesisLevel === this.functionInTreatment.parenthesisLevel) {
                    if (this.getNextSignificantElement(true) === "{") {
                        this.functionInTreatment.definition = true;
                        this.functionInTreatment.blockStartElementIndex = this.getNextSignificantElementIndex(true);
                        this.functionDefs.push(this.functionInTreatment);
                    }

                    this.treatingFunctionArguments = false;
                    this.treatFunctionArguments(this.functionInTreatment);
                    this.functionInTreatment = {};
                }
                else {
                    this.functionInTreatment.argumentContent.push(element);
                }
            }

            this.parenthesisLevel--;
        }

        else if(this.treatingFunctionArguments) {
            this.functionInTreatment.argumentContent.push(element);
        }
    }

    treatFunctionArguments(functionObject) {
        var currentArgument = "";
        this.currentElementIndex = functionObject.argumentStartElementIndex + 1;
        functionObject.argumentContent.forEach((arg, index, array) => {
            this.detectFunction(arg);

            if(!this.treatingFunctionArguments) {
                if(arg.match(",")) {
                    if(currentArgument.length > 0) {
                        functionObject.arguments.push(currentArgument);
                        currentArgument = "";
                    }
                }

                else {
                    currentArgument += arg;
                }
            }

            this.currentElementIndex++;
        });

        this.currentElementIndex++;

        if(currentArgument.length > 0) {
            functionObject.arguments.push(currentArgument);
        }

        if(functionObject.arguments.length === 0) {
            this.addError("Functions must at least count one argument (void if none)")
        }
        else if(functionObject.arguments.length > 4) {
            this.addError("Functions must count 4 arguments max (this one has " + functionObject.arguments.length + ")");
        }
    }

    defineFunctionDefContent(functionObject) {
        var blockLevel = 1;
        functionObject.content = [];
        for(var i = functionObject.blockStartElementIndex + 1 ; i < this.elements.length ; i++) {
            if(this.elements[i].match("{")) {
                blockLevel++;
            }
            else if(this.elements[i].match("}")) {
                blockLevel--;

                if(blockLevel === 0) {
                    break;
                }
            }

            functionObject.content.push(this.elements[i]);
        }
    }

    checkFunctionDefLineCount(functionObject) {
        var lineCount = 0;

        functionObject.content.forEach((item) => {
            if(item.match("\n")) {
                lineCount++;
            }
        });

        lineCount--;

        if(lineCount > 25) {
            this.currentLine = functionObject.line;
            this.addError("Function " + functionObject.name + " contains more than 25 lines");
        }

    }

    addError(errorText) {
        this.errors.push({
			line: this.currentLine,
			error: errorText
		});
    }

    compareErrorLine(a, b) {
        if(a.line < b.line) {
            return -1;
        }
        else if(a.line > b.line) {
            return 1;
        }

        return 0;
    }

	get errorList(){
        this.errors.sort(this.compareErrorLine);
		return this.errors;
	}

}

module.exports = Norminette;
