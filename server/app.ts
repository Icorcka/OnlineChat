import WebSocket from 'ws';
import Web3 from 'web3';

const wss = new WebSocket.Server({ port: 8080 });
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

const chats = new Map();

for (let i = 0; i < 10; i++) {
    chats.set(`chat_${i}`, new Set());
}

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
    const messageString = message.toString();

    const data = JSON.parse(messageString);

        if (data.type === 'register') {
            const chatId = data.chatId;
            const userName = data.userName;
            if (chats.has(chatId)) {
                const chat = chats.get(chatId);
                chat.add({ userName, ws });
                broadcastSystemMessage(chatId, `${userName} joined chat.`);
            }
        }

        if (data.type === 'message') {
            if (data.message.includes('txid:')) {
                const txid = extractTxid(data.message);

                if (txid) {
                    const txDetails = await getTransactionDetails(txid);
                    if (txDetails) {
                        broadcastChatMessage(data.chatId, data.userName, `Txid: ${txDetails.txid}, Date: ${txDetails.date}, Сума ETH: ${txDetails.value}, WalletFrom: ${txDetails.from}, WalletTo: ${txDetails.to}`);
                    }
                }
            } else {
                const chatId = data.chatId;
                const message = data.message;
                const userName = data.userName;
                broadcastChatMessage(chatId, userName, message);
            }
        }
    });
});

async function getTransactionDetails(txid: string) {
    try {
        const tx = await web3.eth.getTransaction(txid);
        if (tx && 'transactionHash' in tx) {
            return {
                txid: tx.transactionHash,
                date: new Date(),
                value: web3.utils.fromWei(tx.value, 'ether'),
                from: tx.from,
                to: tx.to
            };
        }
    } catch (error) {
        console.error("Error fetching transaction details:", error);
    }
    return null;
}

function extractTxid(message: string): string | null {
    const match = message.match(/txid:\s*(\w+)/);
    return match ? match[1] : null;
}

function broadcastSystemMessage(chatId, message) {
    if (chats.has(chatId)) {
        const chat = chats.get(chatId);
        chat.forEach(user => {
            user.ws.send(JSON.stringify({ type: 'system', message: message }));
        });
    }
}

function broadcastChatMessage(chatId, userName, message) {
    if (chats.has(chatId)) {
        const chat = chats.get(chatId);
        chat.forEach(user => {
            user.ws.send(JSON.stringify({ type: 'chat', userName: userName, message: message }));
        });
    }
}
