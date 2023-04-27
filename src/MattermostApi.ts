import axios from "axios";
import {ERROR_COLOR, INFO_COLOR, SUCCESS_COLOR, WARNING_COLOR} from "./Utils/Colors";

export class MattermostAttachmentField {
    short: boolean;
    title: string;
    value: string;

    constructor(title: string, value: string, short: boolean = false) {
        this.title = title;
        this.value = value;
        this.short = short;
    }
}

export class MattermostAttachment {
    fallback: string;
    color: string;
    pretext: string;
    text: string;
    author_name: string;
    author_icon: string;
    author_link: string;
    title: string;
    title_link: string;
    fields: MattermostAttachmentField[];
    image_url: string;

    constructor(attachment: {
        fallback: string,
        color: string,
        pretext: string,
        text: string,
        author_name: string,
        author_icon: string,
        author_link: string,
        title: string,
        title_link: string,
        fields: MattermostAttachmentField[],
        image_url: string
    } = {
        fallback: "",
        color: "",
        pretext: "",
        text: "",
        author_name: "",
        author_icon: "",
        author_link: "",
        title: "",
        title_link: "",
        fields: [],
        image_url: ""
    }) {
        this.fallback = attachment.fallback;
        this.color = attachment.color;
        this.pretext = attachment.pretext;
        this.text = attachment.text;
        this.author_name = attachment.author_name;
        this.author_icon = attachment.author_icon;
        this.author_link = attachment.author_link;
        this.title = attachment.title;
        this.title_link = attachment.title_link;
        this.fields = attachment.fields;
        this.image_url = attachment.image_url;
    }

    public AddField(field: MattermostAttachmentField) {
        this.fields.push(field);
    }

    public SetFallback(fallback: string) {
        this.fallback = fallback;
    }

    public SetColor(color: string) {
        this.color = color;
    }

    public SetPretext(pretext: string) {
        this.pretext = pretext;
    }

    public SetText(text: string) {
        this.text = text;
    }

    public SetAuthorName(authorName: string) {
        this.author_name = authorName;
    }

    public SetAuthorIcon(authorIcon: string) {
        this.author_icon = authorIcon;
    }

    public SetAuthorLink(authorLink: string) {
        this.author_link = authorLink;
    }

    public SetTitle(title: string) {
        this.title = title;
    }

    public SetTitleLink(titleLink: string) {
        this.title_link = titleLink;
    }

    public SetImage(image: string) {
        this.image_url = image;
    }
}

export class MattermostMessage {
    channel_id: string;
    message: string;
    props: {
        attachments: MattermostAttachment[],
        from_bot: string
    };

    constructor(message: { channel_id: string, message: string, props: { attachments: MattermostAttachment[], from_bot: string } } | null = null) {
        if (message === null) {
            message = {
                channel_id: "",
                message: "",
                props: {
                    attachments: [],
                    from_bot: "true"
                }
            }
        }
        this.channel_id = message.channel_id;
        this.message = message.message;
        this.props = message.props;
    }

    public AddAttachment(attachment: MattermostAttachment) {
        this.props.attachments.push(attachment);
    }

    public SetMessage(message: string) {
        this.message = message;
    }

    public SetChannelId(channelId: string) {
        this.channel_id = channelId;
    }

    public SetAttachments(attachments: MattermostAttachment[]) {
        this.props.attachments = attachments;
    }
}

export default class MattermostApi {
    private token: string;
    private readonly serverUrl: string;

    constructor(serverUrl: string, token: string) {
        this.serverUrl = serverUrl;
        this.token = token;
    }

    public async CreateMattermostMessage(message: MattermostMessage) {
        const response = await axios.post(
            this.serverUrl + '/api/v4/posts',
            message,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token
                }
            }
        );
    }

    public async CreateMessage(channelId: string, message: string, attachments: MattermostAttachment[] = []) {
        return this.CreateMattermostMessage(new MattermostMessage({
                channel_id: channelId,
                message: message,
                props: {
                    attachments: attachments,
                    from_bot: "true"
                }
            })
        );
    }
}

export function AddInfoAttachment(text: string, title: string = "") {
    return AddAttachment(text, INFO_COLOR, title);
}

export function AddErrorAttachment(text: string, title: string = "") {
    return AddAttachment(text, ERROR_COLOR, title);
}

export function AddSuccessAttachment(text: string, title: string = "") {
    return AddAttachment(text, SUCCESS_COLOR, title);
}

export function AddWarningAttachment(text: string, title: string = "") {
    return AddAttachment(text, WARNING_COLOR, title);
}

export function AddAttachment(text: string, color: string, title: string = "") {
    const attachment = new MattermostAttachment();
    attachment.SetFallback(text);
    attachment.SetColor(color);
    attachment.SetText(text);
    attachment.SetTitle(title);
    return attachment;
}