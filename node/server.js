import { WebSocketServer } from "ws";
import fetch from "node-fetch";
import winston from "winston";
import "winston-daily-rotate-file";

import dotenv from 'dotenv';

dotenv.config();

const appUrl = process.env.APP_URL;

// ------------------------
// Winston logger with daily rotation
// ------------------------
const transport = new winston.transports.DailyRotateFile({
    filename: 'logs/server-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(
            ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
        )
    ),
    transports: [
        new winston.transports.Console(),
        transport
    ],
});

// ------------------------
// Failed attempts tracking
// ------------------------
const failedAttempts = new Map();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 min
const ENTRY_TTL = 10 * 60 * 1000;       // 10 min TTL

function canAttempt(ip) {
    const now = Date.now();
    const entry = failedAttempts.get(ip) || { count: 0, lastAttempt: now };
    if (now - entry.lastAttempt > 60000) entry.count = 0;
    entry.count += 1;
    entry.lastAttempt = now;
    failedAttempts.set(ip, entry);
    return entry.count <= 5;
}

function recordFailure(ip) {
    const now = Date.now();
    const entry = failedAttempts.get(ip) || { count: 0, lastAttempt: now };

    if (now - entry.lastAttempt > 60000) entry.count = 0;

    entry.count += 1;
    entry.lastAttempt = now;
    failedAttempts.set(ip, entry);

    return entry.count <= 5;
}

function resetAttempts(ip) {
    failedAttempts.delete(ip);
}

// Periodic cleanup
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of failedAttempts.entries()) {
        if (now - entry.lastAttempt > ENTRY_TTL) {
            failedAttempts.delete(ip);
            logger.info(`Removed old failedAttempts entry for IP ${ip}`);
        }
    }
}, CLEANUP_INTERVAL);

// ------------------------
// Validate Laravel token
// ------------------------
async function validateToken(token) {
    if (!token) return null;
    try {
        const res = await fetch(`${appUrl}/api/user`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status !== 200) return null;
        return await res.json();
    } catch (err) {
        logger.error(`Token validation error: ${err}`);
        return null;
    }
}

// ------------------------
// WebSocket server
// ------------------------
const wss = new WebSocketServer({
  port: 3001,
  host: "127.0.0.1"
});

// Heartbeat function
function heartbeat() {
    this.isAlive = true;
}

wss.on("connection", async (ws, req) => {
    const ip = req.socket.remoteAddress;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");
    const appId = url.searchParams.get("appid");

    if (!token || !appId) {
        if (!recordFailure(ip)) {
            logger.warn(`IP ${ip} blocked due to too many invalid attempts`);
            ws.close();
            return;
        }

        logger.warn(`Missing token/appId from IP ${ip}`);
        ws.close();
        return;
    }

    const user = await validateToken(token);
    if (!user) {
        if (!recordFailure(ip)) {
            logger.warn(`IP ${ip} blocked due to too many invalid attempts`);
            ws.close();
            return;
        }

        logger.warn(`Invalid token from IP ${ip}`);
        ws.close();
        return;
    }

    resetAttempts(ip);
    ws.user = user;
    ws.appId = appId;
    ws.isAuthenticated = true;
    ws.isAlive = true;
    ws.meta = {};

    ws.on("pong", heartbeat);

    logger.info(`User connected: ${ws.user.name} from IP ${ip} for App ${appId}`);

    // ------------------------
    // MESSAGE HANDLER
    // ------------------------
    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);

            // ------------------------
            // SAFETY CHECK
            // ------------------------
            if (!ws.isAuthenticated) {
                logger.warn(`Unauthenticated message attempt from IP ${ip}`);
                ws.close();
                return;
            }

            // ------------------------
            // TOKEN EVENT (NOT AUTH)
            // ------------------------
            if (data.type === "token") {
                const { t, pt, ct, st, lid, sid } = data;

                // Validate structure
                if (
                    !st
                ) {
                    logger.warn(`Invalid token message from ${ws.user.name}`);
                    return;
                }

                // Broadcast to other clients with same user id
                wss.clients.forEach((client) => {

                    if (
                        client !== ws &&
                        client.readyState === 1 &&
                        client.isAuthenticated &&
                        client.user?.id === ws.user?.id &&
                        client.appId !== ws.appId
                    ) {
                        client.send(JSON.stringify({
                            type: "token",
                            t,
                            pt,
                            ct,
                            st,
                            lid,
                            sid
                        }));
                    }
                });

                return;
            }

            // ------------------------
            // NORMAL MESSAGE
            // ------------------------
            if (data.type === "message") {
                wss.clients.forEach((client) => {
                    if (
                        client.readyState === 1 &&
                        client.isAuthenticated &&
                        client.user?.id === ws.user?.id
                    ) {
                        client.send(JSON.stringify({
                            type: "message",
                            user: ws.user.name,
                            message: data.message,
                            timestamp: Date.now()
                        }));
                    }
                });

                return;
            }

            // ------------------------
            // PING
            // ------------------------
            if (data.type === "ping") {
                ws.send(JSON.stringify({ type: "pong" }));
                return;
            }

        } catch (err) {
            logger.error(`Message error from ${ws.user?.name}: ${err}`);
        }
    });

    ws.on("close", () => {
        logger.info(`User disconnected: ${ws.user?.name || "unknown"}`);
    });
});

// ------------------------
// Ping clients periodically to detect dead connections
// ------------------------
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            logger.info(`Terminating dead connection for user: ${ws.user?.name || 'unknown'}`);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000); // ping every 30 seconds

wss.on("close", () => {
    clearInterval(interval);
});

logger.info("WebSocket server running on ws://localhost:3001");