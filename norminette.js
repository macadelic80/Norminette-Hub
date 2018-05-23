
class Norminette {

	constructor(_name, _content, index){
		this.name = _name;
		this.content = _content;
		this.errors = [];
		this.lines = _content.split(/\r?\n/);
	}

    checkLineLength(lineContent, lineNumber) {
        lineContent = lineContent.replace(new RegExp("\t", "g"), "    ");

        if(lineContent.length > 80) {
            this.addError("Too many characters on the line (" + lineContent.length + ")", lineNumber);
        }
    }

    addError(errorText, lineNumber) {
        this.errors.push({
			line: lineNumber,
			error: errorText
		});
    }
	
	analyse(){
		let currentLine = 0;
		lines.forEach((item, index)=>{		
			currentLine = (index + 1)
			this.checkLineLength(item, currentLine);
			//others analysis
			
		})
	}
	send(){
		this.socket.emit("results", {
			name: this.name,
			errors: this.errors
		})
		if(index[0] === index[1]){
			this.socket.emit("finish")
		} else { 
			this.socket.emit("patience", {
				name: index[1] - index[0],
			})
		}
	}
}

module.exports = Norminette;
