const express = require('express');
const app = express();
const file_system = require('fs');
const io = require('socket.io');
const port = process.env.PORT || 4219;
const path = require("path");
const norminette = require("./norminette.js");


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/client.js", (req, res) => {
    res.sendFile(path.join(__dirname + "/client.js"));
})

let server = app.listen(port, () => {
	console.log("Serveur lancé sur le port: " + port)
});
app.use(express.static('css'));
app.use(express.static('fonts'));
app.use(express.static('colors'));
let socket = io(server);

socket.on("connection", socket => {
	console.log("Client connected : " + socket.handshake.address);
	socket.emit("connected");
	socket.on("sendData", arg=>{
		console.log(arg);
		socket.emit("statusUpdate", arg);
	})
});
