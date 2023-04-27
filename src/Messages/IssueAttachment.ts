import Issue from "../SpaceApi/Issue";
import {MattermostAttachment, MattermostAttachmentField} from "../MattermostApi";

export default function GetIssueAttachment(issue: Issue): MattermostAttachment {
    let issueAttachment = new MattermostAttachment();
    issueAttachment.AddField(new MattermostAttachmentField("Title", issue.title));
    issueAttachment.AddField(new MattermostAttachmentField("Status", issue.status.name, true));
    issueAttachment.AddField(new MattermostAttachmentField("Assignee", issue.assignee ? issue.assignee.name.firstName + " " + issue.assignee.name.lastName : "No assignee", true));
    if (issue.description) {
        issueAttachment.AddField(new MattermostAttachmentField("Description", issue.description));
    }

    return issueAttachment;
}