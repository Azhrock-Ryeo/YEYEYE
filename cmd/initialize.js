const net = require("net");
const fs = require("fs");

async function findPort(start, end) {
    for (let port = start; port <= end; port++) {
        const free = await new Promise(resolve => {
            const server = net.createServer();
            server.once("error", () => resolve(false));
            
            server.once("listening", () => {
                server.close(() => resolve(true));
            });

            server.listen(port, "0.0.0.0");
        });

        if (free) return port;
    }

    throw new Error(`No free port between ${start}-${end}`);
}

(async () => {
    const frontend = await findPort(3000, 3999);
    const backend = await findPort(5000, 5999);
    const documents = await findPort(4001, 4999);

    fs.writeFileSync(
        ".env",
        `FRONTEND_PORT=${frontend}\nBACKEND_PORT=${backend}\nDOCUMENTS_PORT=${documents}\n`
    );

    console.log(`Frontend: ${frontend}`);
    console.log(`Backend: ${backend}`);
    console.log(`Documents: ${documents}`);
})();