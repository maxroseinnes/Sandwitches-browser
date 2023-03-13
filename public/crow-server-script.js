

console.log("wow")


var socket = new WebSocket("ws://localhost:8080/socket")

socket.onopen = () => {
    console.log("socket opened")

    socket.send("connected!")
}

socket.onmessage = (message) => {
    console.log(message.type, JSON.parse(message.data))
    
}

socket.onclose = () => {
    console.log("socket closed!")
}

var testJSON = {
    type: "hello",
    message: "what's good"
}

console.log(JSON.stringify(testJSON))

