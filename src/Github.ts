import https from "https";

export default function checkForNewVersion(): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: '/repos/IT-Hock/space-mattermost/releases/latest',
            method: 'GET',
            headers: {
                'User-Agent': 'SpaceMattermostBridge'
            }
        };

        const req = https.request(options, res => {
            if (res.statusCode !== 200) {
                reject(new Error(`Non-200 status code from Github: ${res.statusCode}`));
                return;
            }

            let body = '';
            res.on('data', chunk => {
                body += chunk.toString();
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve(json.tag_name);
                }
                catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', error => {
            reject(error);
        });

        req.end();
    });
}