// @flow
import fetch from "node-fetch";
const HOST = "dummy.ai/api";

type TUser = {
    username: string,
    email: string
}

type TModel = {
    name: string,
    authors: Array<TUser>
};

class WarpAPI {
    host: string;
    accessToken: string;

    constructor(accessToken: string) {
        this.host = HOST;
        this.accessToken = accessToken;
    }

    signup(username: string, password_hash: string) {
        return fetch.get(this.host + `/signup`)
            .then((res, err) => res.json());
    }

    authenticate(username: string, password_hash: string) {
        return fetch.get(this.host + `/auth`)
            .then((res, err) => res.json());
    }

    listUsers() {
        return fetch.get(this.host + `/users`)
            .then((res, err) => res.json());
    }

    listModels(username: string) {
        return fetch.get(this.host + `/users/${username}`).then((res, err): TModel => res.json());
    }

    listUserModels(username: string) {
        return fetch.get(this.host + `/users/${username}/models/`);
    }

    getModel(username: string, model_name: string) {
        return fetch.get(this.host + `/users/${username}/models/${model_name}`);
    }

    getModelDeploymentStatus(username: string, model_name: string, tag?: string) {
        return fetch.get(this.host + `/users/${username}/models/${model_name}/status`);
    }

}
export default WarpAPI;
