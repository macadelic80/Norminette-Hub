let socket = io();
let fileData = [];

window.addEventListener("load", function(){
	document.getElementById('UploadButton').addEventListener('click', function(arg){
		// console.log("event: click", arg);
        document.getElementById("norminette-results").innerHTML = "";
		console.log("Sending this :", fileData);
		socket.emit("test", "null");
		socket.emit("sendData", fileData);
		fileData = [];
        document.getElementById("NameBox").innerText = "No file selected yet\n"
        document.querySelector("#FileBox").value = ""
	});
	document.getElementById('FileBox').addEventListener('change', function(arg){
		let files = arg.target.files;
		let reader = new FileReader();

		console.log(files);

		document.getElementById("NameBox").textContent = files.length + ' file(s) :\n' + Object.keys(files).map(x=>files[x].name).join(" | ");
		(function readFile(nb){
			reader.readAsText(files[nb], "utf-8");
			reader.onload = () =>{
				fileData.push({
					name: files[nb].name,
					content: reader.result
				})
				if(nb < (files.length-1)){
					nb++;
					readFile(nb);
				}
			}
		})(0)
	});

	let dropper = document.querySelector('#UploadBox');

	dropper.addEventListener('dragover', function(e) {
		e.preventDefault();
	});

	dropper.addEventListener('drop', function(e) {
		console.log('Vous avez bien déposé votre élément !');
		dropper.style.borderStyle = '';

	});
	dropper.addEventListener('dragenter', function() {
		dropper.style.borderStyle = 'dashed';

	});
	document.querySelector('#CancelButton').addEventListener("click", function(){
		fileData = [];
		document.getElementById("NameBox").innerText = "No file selected yet\n"
		document.querySelector("#FileBox").value = ""
	})

	//Sockets

    socket.on("statusUpdate", (a) => {
        console.log("Server status : " + a);
    });

    socket.on("results", (data) => {
        console.log("Response : \n");
        console.log(data);

        var html = "<h2 class=\"inner-title wow fadeInUp\" data-wow-delay=\"0.4s\">" + data.name + "</h2><table class='results-table'>";
        html += "<tr><th>Line</th><th>Error text</th></tr>"
		var lastLine = 0;

        data.results.forEach((item) => {
            html += "<tr";

            if(lastLine != item.line) {
                html += " class='top-bar'"
            }

            html += ">";
            html += "<td class='results-table-line'>";

            if(lastLine != item.line) {
                html += item.line;
            }

            html += "</td><td>";
            html += item.error;
			html += "</td></tr>";

			lastLine = item.line;
		});

        html += "</table>";

        document.getElementById("norminette-results").innerHTML = html;
    });
});



socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});



