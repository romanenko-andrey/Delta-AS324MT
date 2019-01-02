const url = 'ws://localhost:3040'
const ws_connection = new WebSocket(url)
var ws_data;

ws_connection.onopen = () => {
  ws_connection.send('hey') 
}

ws_connection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}

ws_connection.onmessage = (e) => {
  console.log(e.data);
  ws_data = e.data;
}