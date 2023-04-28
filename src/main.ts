import * as dotenv from "dotenv";

dotenv.config();

import * as http from "http";
import MattermostApi, {MattermostAttachment, MattermostMessage} from "./MattermostApi";

import WebhookRequest, {IssueWebhookEvent, PingWebhookEvent} from "./SpaceApi/WebhookRequest";
import IssueUpdated_Send from "./Messages/IssueUpdated";
import IssueCreated_Send from "./Messages/IssueCreated";
import {banIp, isIpBanned, isLocalIp} from "./Utils/IpBanlist";
import {ERROR_COLOR} from "./Utils/Colors";
import * as https from "https";
import checkForNewVersion from "./Github";

if (!process.env.MATTERMOST_SERVER_URL) {
    console.log("No mattermost server url found");
    process.exit(1);
}

if (!process.env.MATTERMOST_TOKEN) {
    console.log("No mattermost token found");
    process.exit(1);
}

if (!process.env.MATTERMOST_CHANNEL_ID) {
    console.log("No mattermost channel id found");
    process.exit(1);
}

const mattermostApi = new MattermostApi(process.env.MATTERMOST_SERVER_URL, process.env.MATTERMOST_TOKEN);

function handlePingWebhookEvent(request: PingWebhookEvent, response: http.ServerResponse) {
    mattermostApi.CreateMessage(
        process.env.MATTERMOST_CHANNEL_ID,
        "Ping"
    ).then(() => {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write('Pong!');
        response.end();
    }).catch((error) => {
        console.log(error);
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write("Error creating ping message");
        response.end();
    });
}

function handleIssueWebhookEvent(request: IssueWebhookEvent, response: http.ServerResponse) {
    if (request.meta.method.toLowerCase() === "updated") {
        IssueUpdated_Send(request, response, mattermostApi);
    } else if (request.meta.method.toLowerCase() === "created") {
        IssueCreated_Send(request, response, mattermostApi);
    } else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write('Not implemented');
        response.end();
    }
}

function createServer() {
    const server = http.createServer((req, res) => {
        let ip = req.socket.remoteAddress;
        if (req.headers['x-forwarded-for']) {
            ip = req.headers['x-forwarded-for'] as string;
        }

        if (!isLocalIp(ip) && isIpBanned(ip)) {
            res.writeHead(403, {'Content-Type': 'text/plain'});
            res.write('Forbidden');
            res.end();
            return;
        }

        if (!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1
            || req.headers.authorization.split(' ')[1] !== process.env.AUTHORIZATION_TOKEN
        ) {
            let message = `Blocked unauthorized request from ${ip} using token ${req.headers.authorization}`;
            console.log(message);
            if (process.env.REPORT_UNAUTHORIZED === "true") {
                let mattermostMessage = new MattermostMessage();
                mattermostMessage.channel_id = process.env.MATTERMOST_CHANNEL_ID;
                mattermostMessage.message = message;
                let mattermostAttachment = new MattermostAttachment();
                mattermostAttachment.title = "Headers";
                // headers dict to string
                let headers = "";
                for (let header in req.headers) {
                    headers += `${header}: ${req.headers[header]}\n`;
                }
                mattermostAttachment.text = headers;
                mattermostAttachment.color = ERROR_COLOR;
                mattermostMessage.AddAttachment(mattermostAttachment);

                // noinspection JSIgnoredPromiseFromCall
                mattermostApi.CreateMattermostMessage(mattermostMessage);
            }

            banIp(ip);

            res.writeHead(401, {'Content-Type': 'text/plain'});
            res.write('Unauthorized');
            res.end();
            return;
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {

                const webhookData = JSON.parse(body);
                const webhookRequest = WebhookRequest.fromJSON(webhookData);

                switch (webhookRequest.payload.className) {
                    case "PingWebhookEvent":
                        handlePingWebhookEvent(webhookRequest.payload, res);
                        break;

                    case "IssueWebhookEvent":
                        handleIssueWebhookEvent(webhookRequest.payload, res);
                        break;

                    default:
                        console.log("Unknown webhook event");
                        console.log(webhookRequest);
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.write("Unknown webhook event");
                        res.end();
                        break;
                }
            } catch (e) {
                console.log(e);

                // noinspection JSIgnoredPromiseFromCall
                mattermostApi.CreateMessage(process.env.MATTERMOST_CHANNEL_ID, "Uncaught exception: " + e);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write("Error: " + e + "\n\n" + body + "\n\n");
                res.end();
            }
        });
    });

    let port = process.env.PORT || 3000;
    server.listen(port);
    console.log(`Server running at ${port}`);

    server.on('error', (e) => {
        console.log(e);
        mattermostApi.CreateMessage(process.env.MATTERMOST_CHANNEL_ID, "Server error: " + e).then(() => {
            process.exit(1);
        });
    });

    process.on('uncaughtException', (e) => {
        console.log(e);
        mattermostApi.CreateMessage(process.env.MATTERMOST_CHANNEL_ID, "Uncaught exception: " + e).then(() => {
            process.exit(1);
        });
    });

    const packageJson = require('../package.json');
    // noinspection JSIgnoredPromiseFromCall
    mattermostApi.CreateMessage(process.env.MATTERMOST_CHANNEL_ID, `SpaceMattermost Bridge v${packageJson.version} started!\nPlease report any issues to https://github.com/IT-Hock/space-mattermost/issues`);
}

createServer();

setInterval(async () => {
    let newVersion = await checkForNewVersion().catch((error) => {
        console.log("Failed to check for new version");
        if (process.env.REPORT_ERRORS === "true") {
            mattermostApi.CreateMessage(process.env.MATTERMOST_CHANNEL_ID, `Failed to check for new version:\n${error}`);
        }
    });
    if (newVersion) {
        await mattermostApi.CreateMessage(process.env.MATTERMOST_CHANNEL_ID, `New version of SpaceMattermost Bridge available: ${newVersion}\nPlease update to the latest version!`);
    }
}, 1000 * 60 * 60 * 24);