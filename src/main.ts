// Create endpoint server for jetbrains space

// Create http server
import * as http from "http";
import axios from "axios";
import MattermostApi, {MattermostAttachment, MattermostMessage} from "./MattermostApi";

import * as dotenv from "dotenv";
import WebhookRequest, {IssueWebhookEvent, PingWebhookEvent} from "./SpaceApi/WebhookRequest";
import IssueUpdated_Send from "./Messages/IssueUpdated";
import IssueCreated_Send from "./Messages/IssueCreated";

dotenv.config();

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
    }else if (request.meta.method.toLowerCase() === "created") {
        IssueCreated_Send(request, response, mattermostApi);
    }else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write('Not implemented');
        response.end();
    }
}

function createServer() {
    const server = http.createServer((req, res) => {
        if(!req.headers.authorization || req.headers.authorization.indexOf('Bearer ') === -1
            || req.headers.authorization.split(' ')[1] !== process.env.AUTHORIZATION_TOKEN
        ) {
            console.log(`Blocked unauthorized request from ${req.socket.remoteAddress} using token ${req.headers.authorization}`);
            mattermostApi.CreateMessage(
                process.env.MATTERMOST_CHANNEL_ID,
                `Blocked unauthorized request from ${req.socket.remoteAddress} using token ${req.headers.authorization}`
            );

            res.writeHead(401, {'Content-Type': 'text/plain'});
            res.write('Unauthorized');
            res.end();
            return;
        }
        // Log req body
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
            }
            catch (e) {
                console.log(e);
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write("Error: " + e + "\n\n" + body + "\n\n");
                res.end();
            }
        });
    });

    server.listen(8080);
    console.log("Server is listening on port 8080");
}

createServer();