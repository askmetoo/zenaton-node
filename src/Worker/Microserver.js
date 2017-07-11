import { get, post, put } from '../Common/Services/index';

let instance = null;

const MICROSERVER_URL = 'http://localhost:4001';

export default class Microserver {
    constructor() {
        // Singleton
        if (instance) {
            return instance
        }

        instance = this;
    }

    setUuid(uuid) {
        this.uuid = uuid;
        return this;
    }

    reset() {

        this.uuid = null;
        this.hash = null;

        return this;
    }

    sendEnv(body) {
        const url = this.microServerUrl('/configuration');

        return new Promise((resolve, reject) => {
            post(url, body)
                .then((response) => {
                    console.log(response.msg);
                    resolve(response.msg)
                })
                .catch((error) => {
                    reject(error);
                });
        });

    }

    stop(body) {
        const url = this.microServerUrl('/stop');

        return new Promise((resolve, reject) => {
            post(url, body)
                .then((response) => {
                    console.log(response.msg);
                    resolve(response.msg)
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    askJob(instanceId, slaveId) {
        const url = this.microServerUrl('/jobs/' + instanceId + '?slave_id=' + slaveId);
        return new Promise((resolve, reject) => {
            get(url)
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    getWorkflowToExecute() {
        return new Promise((resolve, reject) => {
            this.sendDecision({action: 'start'})
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    sendDecision(body) {
        const url = this.microServerUrl('/decisions/' + this.uuid);
        return new Promise((resolve, reject) => {
            post(url, body)
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    microServerUrl(ressource)
    {
        return MICROSERVER_URL + ressource;
    }
}
