import {IssueWebhookEvent} from "../SpaceApi/WebhookRequest";
import http from "http";
import MattermostApi, {
    AddInfoAttachment,
    MattermostAttachment,
    MattermostAttachmentField,
    MattermostMessage
} from "../MattermostApi";
import {getIssueId} from "../SpaceApi/Issue";
import getIssueUrl from "../SpaceApi/Space";
import GetIssueAttachment from "./IssueAttachment";

export default function IssueCreated_Send(request: IssueWebhookEvent, response: http.ServerResponse, mattermostApi: MattermostApi) {
    let message: MattermostMessage = new MattermostMessage();
    message.SetChannelId(process.env.MATTERMOST_CHANNEL_ID);
    let username = request.meta.principal.details.user.name.firstName + " " + request.meta.principal.details.user.name.lastName;
    message.SetMessage(`Issue [${request.issue.title} ${getIssueId(request.issue)}](${getIssueUrl(request.issue.id)}) was created by ${username}`);

    let issueAttachment = GetIssueAttachment(request.issue);
    message.AddAttachment(issueAttachment);

    mattermostApi.CreateMattermostMessage(
        message
    ).then(() => {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write("Created issue message: " + JSON.stringify(message));
        response.end();
    }).catch((error) => {
        console.log(error);
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write("Error creating issue message");
        response.end();
    });
}