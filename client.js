// let socket = io();
let fileData = []

window.addEventListener("load", function(){
	document.getElementById('UploadButton').addEventListener('click', function(arg){
		console.log("event: click", arg);
		console.log("Sending ", fileData);
		socket.emit("sendData", fileData);
	});  
	document.getElementById('FileBox').addEventListener('change', function(arg){
		let files = arg.target.files,
			reader = new FileReader();
			console.log(files)
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
});


// socket.on("connection", () => {
    // console.log("Connected to server");
// });

// socket.on("statusUpdate", (a) => {
    // console.log("Server status : " + a)
// });

// socket.on("results", (arg) => {
    // console.log("Response : \n");
    // console.log(arg);
// })
