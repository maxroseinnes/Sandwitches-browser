const HOSTNAME = "127.0.0.1"; // localhost ip
const PORT = 3000;
const socket = new WebSocket("ws://" + HOSTNAME + ":" + PORT);
socket.onopen = () => {
    socket.send("Hello server!");
};