import "node-fetch";
const HOST = "dummy.ai/api";
class WarpAPI {
    constructor(accessToken) {
        this.host = HOST;
        this.accessToken = accessToken;
    }

    listModels(username) {
        return fetch.get(this.host + `/models/${model}`);
    }

    listUserModels(username) {
        return fetch.get(this.host + `/users/${username}/models/${model}`);
    }

    listUsers() {
        return fetch.get(this.host + `/users`);
    }
}
