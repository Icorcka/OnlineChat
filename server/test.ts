import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
    console.log("Підключено до сервера");

    ws.send(JSON.stringify({ type: 'register', userName: 'User1', chatId: 'chat_0' }));

    setTimeout(() => {
        ws.send(JSON.stringify({ type: 'message', userName: 'User1', chatId: 'chat_0', message: 'Привіт, це тест!' }));
    }, 1000);
});

ws.on('message', function incoming(data) {
    const messageString = data.toString();

    const message = JSON.parse(messageString);
    console.log("Повідомлення від сервера: ", message);
});

ws.on('error', function error(error) {
    console.log('Помилка WebSocket: ', error);
});
