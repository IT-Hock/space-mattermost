import MattermostApi, {
    AddInfoAttachment,
    MattermostAttachment,
    MattermostAttachmentField,
    MattermostMessage
} from "../MattermostApi";
import {IssueWebhookEvent} from "../SpaceApi/WebhookRequest";
import http from "http";
import getIssueUrl from "../SpaceApi/Space";
import {getIssueId} from "../SpaceApi/Issue";
import GetIssueAttachment from "./IssueAttachment";


export default function IssueUpdated_Send(request: IssueWebhookEvent, response: http.ServerResponse, mattermostApi: MattermostApi) {
    let message: MattermostMessage = new MattermostMessage();
    message.SetChannelId(process.env.MATTERMOST_CHANNEL_ID);
    let username = request.meta.principal.details.user.name.firstName + " " + request.meta.principal.details.user.name.lastName;
    message.SetMessage(`Issue [${request.issue.title} ${getIssueId(request.issue)}](${getIssueUrl(request.issue.id)}) was updated by ${username}`);

    if (request.title) {
        let oldTitle = request.title.old ? request.title.old : "No title";
        let newTitle = request.title.new ? request.title.new : "No title";

        message.AddAttachment(AddInfoAttachment(`From: ${oldTitle}\nTo: ${newTitle}`, "Title was updated"));
    }

    if (request.description) {
        let oldDescription = request.description.old ? request.description.old : "No description";
        let newDescription = request.description.new ? request.description.new : "No description";

        message.AddAttachment(AddInfoAttachment(`From: ${oldDescription}\nTo: ${newDescription}`, "Description was updated"));
    }

    if (request.assignee) {
        let oldAssignee = request.assignee.old ? request.assignee.old.name : "No assignee";
        let newAssignee = request.assignee.new ? request.assignee.new.name : "No assignee";

        message.AddAttachment(AddInfoAttachment(`From: ${oldAssignee}\nTo: ${newAssignee}`, "Assignee was updated"));
    }

    if (request.status) {
        let oldStatus = request.status.old ? request.status.old : "No status";
        let newStatus = request.status.new ? request.status.new : "No status";

        message.AddAttachment(AddInfoAttachment(`From: ${oldStatus}\nTo: ${newStatus}`, "Status was updated"));
    }

    if (request.dueDate) {
        let oldDueDate = request.dueDate.old ? request.dueDate.old : "No due date";
        let newDueDate = request.dueDate.new ? request.dueDate.new : "No due date";

        message.AddAttachment(AddInfoAttachment(`From: ${oldDueDate}\nTo: ${newDueDate}`, "Due date was updated"));
    }

    if (request.tagDelta) {
        let oldTags = request.tagDelta.old?.length > 0 ? request.tagDelta.old.map((data) => data.name).join(", ") : "No tags";
        let newTags = request.tagDelta.new?.length > 0 ? request.tagDelta.new.map((data) => data.name).join(", ") : "No tags";

        message.AddAttachment(AddInfoAttachment(`From: ${oldTags}\nTo: ${newTags}`, "Tags were updated"));
    }

    if (request.topicDelta) {
        let oldTopics = request.topicDelta.old?.length > 0 ? request.topicDelta.old.map((data) => data.name).join(", ") : "No topics";
        let newTopics = request.topicDelta.new?.length > 0 ? request.topicDelta.new.map((data) => data.name).join(", ") : "No topics";

        message.AddAttachment(AddInfoAttachment(`From: ${oldTopics}\nTo: ${newTopics}`, "Topics were updated"));
    }

    if (request.checklistDelta) {
        let oldChecklist = request.checklistDelta.old?.length > 0 ? request.checklistDelta.old.map((data) => data.name).join(", ") : "No checklist";
        let newChecklist = request.checklistDelta.new?.length > 0 ? request.checklistDelta.new.map((data) => data.name).join(", ") : "No checklist";

        message.AddAttachment(AddInfoAttachment(`From: ${oldChecklist}\nTo: ${newChecklist}`, "Checklist was updated"));
    }

    if (request.sprintDelta) {
        let oldSprints = request.sprintDelta.old?.map((sprint) => sprint.name).join(", ") ?? "No sprints";
        let newSprints = request.sprintDelta.new?.map((sprint) => sprint.name).join(", ") ?? "No sprints";

        message.AddAttachment(AddInfoAttachment(`From: ${oldSprints}\nTo: ${newSprints}`, "Sprints were updated"));
    }

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