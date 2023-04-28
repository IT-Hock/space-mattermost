import fs from "fs";

let ipBanlist: IpBan[] = loadIpBanlist();

export function cidrMatch(ipAddress: string, cidr: string): boolean {
    const [cidrIp, cidrMask] = cidr.split("/");
    const cidrIpParts = cidrIp.split(".");
    const cidrMaskParts = cidrMask.split(".");
    const ipParts = ipAddress.split(".");
    for (let i = 0; i < 4; i++) {
        if ((parseInt(cidrIpParts[i]) & parseInt(cidrMaskParts[i])) !== (parseInt(ipParts[i]) & parseInt(cidrMaskParts[i]))) {
            return false;
        }
    }
    return true;
}

export function isLocalIp(ipAddress: string): boolean {
    return cidrMatch(ipAddress, "127.0.0.0/8") ||
        cidrMatch(ipAddress, "10.0.0.0/8") ||
        cidrMatch(ipAddress, "172.16.0.0/12") ||
        cidrMatch(ipAddress, "192.168.0.0/16");
}

export default class IpBan {
    ipAddress: string;
    expiration: number;

    constructor(ipAddress: string, expiration: number) {
        this.ipAddress = ipAddress;
        this.expiration = expiration;
    }

    public static fromJSON(json: any): IpBan {
        return new IpBan(json.ipAddress, json.expiration);
    }
}

function loadIpBanlist(): IpBan[] {
    let ipBanlist: IpBan[] = [];
    if (fs.existsSync(process.env.IP_BANLIST_FILE)) {
        ipBanlist = JSON.parse(fs.readFileSync(process.env.IP_BANLIST_FILE).toString()).map((json: any) => new IpBan(json.ipAddress, json.expiration));
    }
    return ipBanlist;
}

function saveIpBanlist(ipBanlist: IpBan[]) {
    fs.writeFileSync(process.env.IP_BANLIST_FILE, JSON.stringify(ipBanlist));
}

export function isIpBanned(ipAddress: string): boolean {
    const now = Date.now();
    const banned = ipBanlist.find((ipBan: IpBan) => ipBan.ipAddress === ipAddress && ipBan.expiration > now);
    return banned !== undefined;
}

export function banIp(ipAddress: string, expiration: number = Date.now() + 1000 * 60 * 60 * 24 * 7) {
    if (isIpBanned(ipAddress)) {
        const ipBan = ipBanlist.find((ipBan: IpBan) => ipBan.ipAddress === ipAddress);
        if (ipBan !== undefined) {
            ipBan.expiration = expiration;
            saveIpBanlist(ipBanlist);
        }
        return;
    }
    ipBanlist.push(new IpBan(ipAddress, expiration));
    saveIpBanlist(ipBanlist);
}