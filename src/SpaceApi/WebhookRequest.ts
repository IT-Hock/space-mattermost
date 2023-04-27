/*
"className": "IssueWebhookEvent",
        "meta": {
            "principal": {
                "name": "subtixx",
                "details": {
                    "className": "CUserPrincipalDetails",
                    "user": {
                        "id": "LtBkG143XHu"
                    }
                }
            },
            "timestamp": {
                "iso": "2023-04-27T12:20:32.490Z",
                "timestamp": 1682598032490
            },
            "method": "Updated"
        },
        "issue": {
            "id": "Xjnhc1sUFYf"
        },
        "title": null,
        "description": null,
        "assignee": null,
        "status": null,
        "dueDate": null,
        "tagDelta": null,
        "topicDelta": null,
        "checklistDelta": null,
        "sprintDelta": {
            "old": null,
            "new": [
                {
                    "id": "43wl6H4NUgCN"
                }
            ]
        },
        "customFieldUpdate": null,
        "deleted": null
 */

import Issue from "./Issue";

export class DefaultMeta {
    public principal: {
        details: {
            className: string;
            user: {
                name: {
                    firstName: string;
                    lastName: string;
                }
            }
        }
    }
    public timestamp: {
        iso: string;
        timestamp: number;
    }
    public method: string;
}

export class IssueWebhookEvent {
    public className: string;
    public meta: DefaultMeta;
    public issue: Issue;
    public title: { old: string, new: string } | null;
    public description: { old: string, new: string } | null;
    public assignee: { old: { name: string } | null, new: { name: string } | null } | null;
    public status: { old: { name: string }, new: { name: string } } | null;
    public dueDate: { old: { name: string }, new: { name: string } } | null;
    public tagDelta: { old: [{ name: string }], new: [{ name: string }] } | null;
    public topicDelta: { old: [{ name: string }], new: [{ name: string }] } | null;
    public checklistDelta: { old: [{ name: string }], new: [{ name: string }] } | null;
    public sprintDelta: { old: [{ name: string }] | null, new: [{ name: string }] | null } | null;
    public customFieldUpdate: any;
    public deleted: any;
}

export class PingWebhookEvent {
    public className: string;
    public webhookName: string;
}

export default class WebhookRequest {
    public className: string;
    public verificationToken: string;
    public clientId: string;
    public webhookId: string;
    public payload: any;

    public payloadClassName(): string {
        return this.payload.className;
    }

    static fromJSON(webhookData: any) {
        const webhookRequest = new WebhookRequest();
        webhookRequest.className = webhookData.className;
        webhookRequest.verificationToken = webhookData.verificationToken;
        webhookRequest.clientId = webhookData.clientId;
        webhookRequest.webhookId = webhookData.webhookId;
        webhookRequest.payload = webhookData.payload;
        return webhookRequest;
    }
}