export default class Issue {
    public id: string;
    public archived: boolean;
    public projectId: string;
    public projectRef: { key: { key: string } };
    public trackerRef: { id: string };
    public number: number;
    public createdBy: { name: string, details: { className: string, user: { id: string } } };
    public creationTime: { iso: string, timestamp: number };
    public assignee: { name: { firstName: string, lastName: string } } | null;
    public status: { name: string, color: string };
    public dueDate: { iso: string, timestamp: number } | null;
    public externalEntityInfo: any;
    public tags: { id: string }[];
    public title: string;
    public description: string | null;
    public attachmentsCount: number | null;
    public subItemsCount: number;
    public doneSubItemsCount: number;
    public commentsCount: number | null;
    public deletedBy: any;
    public deletedTime: any;

    constructor(raw: any) {
        this.id = raw.id;
        this.archived = raw.archived;
        this.projectId = raw.projectId;
        this.projectRef = raw.projectRef;
        this.trackerRef = raw.trackerRef;
        this.number = raw.number;
        this.createdBy = raw.createdBy;
        this.creationTime = raw.creationTime;
        this.assignee = raw.assignee;
        this.status = raw.status;
        this.dueDate = raw.dueDate;
        this.externalEntityInfo = raw.externalEntityInfo;
        this.tags = raw.tags;
        this.title = raw.title;
        this.attachmentsCount = raw.attachmentsCount;
        this.subItemsCount = raw.subItemsCount;
        this.doneSubItemsCount = raw.doneSubItemsCount;
        this.commentsCount = raw.commentsCount;
        this.deletedBy = raw.deletedBy;
        this.deletedTime = raw.deletedTime;
    }
}

export function getIssueId(issue: Issue): string {
    let key = issue.projectRef?.key?.key;
    if (!key) {
        return issue.number.toString();
    }
    return key + "-" + issue.number;
}