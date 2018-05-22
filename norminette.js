
class Norminette {

	constructor(){
		this.errors = [];
		this.currentLine = 0;
	}

    parseData(data, callback) {
        let lines = data.split(/\r?\n/);

        for (var i = 0 ; i < lines.length ; i++) {
            this.currentLine = i + 1;
            this.checkLineLength(lines[i]);
        }

        callback(this);
    }

    checkLineLength(lineContent) {
        lineContent = lineContent.replace(new RegExp("\t", "g"), "    ");

        if(lineContent.length > 80) {
            this.addError("Too many characters on the line");
        }
    }

    addError(errorText) {
        this.errors.push({
			line: this.currentLine,
			error: errorText
		});
    }
	get errorList(){
		return this.errors.map(x=> x.line + ": " + x.error + "\n");
	}

}

module.exports = Norminette;
