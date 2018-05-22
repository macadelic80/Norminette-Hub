const express = require('express');
const app = express();
const io = require('socket.io');
const port = process.env.PORT || 4219;
const path = require("path");
const Norminette = require("./norminette.js");

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/:target", (req, res) => {
    res.sendFile(path.join(__dirname + "/" + req.params.target));
})

app.get("/:subfolder/:target", (req, res) => {
    res.sendFile(path.join(__dirname + "/" + req.params.subfolder + "/" + req.params.target));
})

let http = app.listen(port, () => {
	console.log("Serveur lancé sur le port: " + port)
});



let server = io(http);
let Instances = [];

server.on("connection", socket => {
	console.log("Client connected : " + socket.handshake.address);
    socket.emit("statusUpdate", "Ready");

    socket.on("test", function(data) {
        console.log("Test successful");
    });
	
    socket.on("sendData", data => {
		let eph = {
			author: socket.handshake.address,
			files: [],
			socket
		}
        console.log(socket.handshake.address + " sent data");
        data.forEach((item, index, array) => {
            socket.emit("statusUpdate", "Analyzing " + item.name);
			
			let instance = new Norminette(item.name, item.content, [index + 1, data.length]);
			
			eph.files.push(instance);
			
			Instances[socket.handshake.address] = eph;
			
			instance.analyse();
        });
    });

});


