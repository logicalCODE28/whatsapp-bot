const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// caesarCipher
function caesarCipher(text, shift, mode = "encrypt") {
    const abc = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';

    for (let char of text) {
        if (/[a-zA-Z]/.test(char)) {
            const wasUpper = char === char.toUpperCase();
            const letter = char.toLowerCase();
            const index = abc.indexOf(letter);

            let newIndex;

            if (mode === "encrypt") {
                newIndex = (index + shift) % 26;
            } else {
                newIndex = (index - shift + 26) % 26;
            }

            let newLetter = abc[newIndex];

            if (wasUpper) {
                newLetter = newLetter.toUpperCase();
            }

            result += newLetter;
        } else {
            result += char;
        }
    }

    return result;
}

client.on("message", async (message) => {
    const chat = await message.getChat();
    const body = message.body.trim();

    // Ping
    if (body.toLowerCase() === 'ping') {
        await message.reply('pong');
    }

    // Sticker
    else if (body.toLowerCase() === 'que') {
        const url =
            "https://images7.memedroid.com/images/UPLOADED574/625f4dd6290b4.jpeg";
        try {
            const media = await MessageMedia.fromUrl(url);
            await client.sendMessage(message.from, media, {
                sendMediaAsSticker: true,
                stickerAuthor: "yo",
                stickerName: "sticker"
            });
        } catch (error) {
            console.error('Error sending sticker:', error);
        }
    }

    // 🔐 Cipher commands
    else if (body.startsWith('!cypher') || body.startsWith('!decypher')) {

        const parts = body.split(" ");

        if (parts.length !== 3) {
            return message.reply("Formato correcto:\n!cypher WORD SHIFT\n!decypher WORD SHIFT");
        }

        const command = parts[0].toLowerCase();
        const word = parts[1];
        const shift = parseInt(parts[2]);

        if (isNaN(shift)) {
            return message.reply("El SHIFT debe ser un número.");
        }

        let result;

        if (command === '!cypher') {
            result = caesarCipher(word, shift, "encrypt");
        } else if (command === '!decypher') {
            result = caesarCipher(word, shift, "decrypt");
        }

        await message.reply(result);
    }
});

client.initialize();