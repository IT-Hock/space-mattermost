export default function getIssueUrl(issueId: string): string {
    return `${process.env.SPACE_URL}/p/${process.env.SPACE_PROJECT_ID}/issues/${issueId}`;
}