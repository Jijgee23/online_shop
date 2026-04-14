import ngrok from "@ngrok/ngrok";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const HOSTNAME = "transrational-tyra-reverent.ngrok-free.dev";

async function start() {
    const listener = await ngrok.forward({
        addr: PORT,
        authtoken: process.env.NGROK_AUTH_TOKEN,
        domain: HOSTNAME,
    });

    console.log(`Tunnel: ${listener.url()} -> http://localhost:${PORT}`);
    console.log("Press Ctrl+C to stop.");

    process.on("SIGINT", async () => {
        console.log("\nShutting down tunnel...");
        await listener.close();
        process.exit(0);
    });

    // Keep process alive
    setInterval(() => {}, 1 << 30);
}

start().catch(console.error);
