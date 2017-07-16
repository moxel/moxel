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
        const data = {username, password_hash};
        return fetch(this.host + `/signup`, {method: "POST", body})
            .then((res, err) => res.json()).catch(function (err) {
                console.log(err);
            });
    }

    authenticate(username: string, password_hash: string) {
        return fetch(this.host + `/auth`, {method: "GET"})
            .then((res, err) => res.json());
    }

    listUsers() {
        return fetch(this.host + `/users`, {method: "GET"})
            .then((res, err) => res.json());
    }

    listModels(username: string) {
        return fetch(this.host + `/users/${username}`, {method: "GET"})
            .then((res, err): TModel => res.json());
    }

    listUserModels(username: string) {
        return fetch(this.host + `/users/${username}/models/`, {method: "GET"});
    }

    getModel(username: string, model_name: string) {
        return fetch(this.host + `/users/${username}/models/${model_name}`, {method: 'GET'});
    }

    getModelDeploymentStatus(username: string, model_name: string, tag?: string) {
        return fetch(this.host + `/users/${username}/models/${model_name}/status`,
            {method: "GET"});
    }

}
export default WarpAPI;
