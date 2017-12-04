'use strict';

class Request {
    static get METHODS() {
        return {
            GET: 'GET',
            POST: 'POST',
            PUT: 'PUT',
            DELETE: 'DELETE',
            HEAD: 'HEAD',
            OPTIONS: 'OPTIONS',
            CONNECT: 'CONNECT'
        };
    }
    static get defaultOptions() {
        return {
            url: null,
            method: Request.METHODS.GET,
            headers: {},
            data: null,
            query: null,
            json: false
        };
    }

    constructor(defaults = Request.defaultOptions) {
        this.defaultOptions = defaults;
        this.pending = new Map();
        const methods = Object.keys(Request.METHODS).reduce((acc, method) => {
            acc[method.toLowerCase()] = {
                value(settings) {
                    return this.request(Object.assign(this.defaultOptions, settings, { method }));
                }
            }
            return acc;
        }, {});
        Object.defineProperties(this, methods);
    }

    request(settings) {
        return Request.request(Object.assign({}, this.defaultOptions, settings));
    }

    static setRequestHeader(xhr, options) {
        const headers = Object.assign({
            'Content-type': (options.query && 'application/x-www-form-urlencoded') || (options.data && 'application/json'),
            'Accept': options.json && 'application/json'
        }, options.headers);
        Object.keys(headers)
            .forEach(key => xhr.setRequestHeader(key, options.headers[key]));
    }

    static createBody(options) {
        if (options.query) {
            return Object.keys(options.query)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options.query[key])}`).join('&');
        } else if (options.data) {
            return JSON.stringify(options.data);
        }
        return '';
    }

    static request(settings = Request.defaultOptions) {
        const xhr = new XMLHttpRequest();
        const options = Object.assign(Request.defaultOptions, settings);
        const result = {
            options,
            xhr,
            response: null,
            promise: new Promise((resolve, reject) => {
                const rejectXhr = (error) => reject({ status: xhr.status, statusText: xhr.statusText, error });
                xhr.open(options.method, options.url, true, options.user, options.password);
                xhr.addEventListener('error', rejectXhr, { once: true });
                xhr.addEventListener('load', () => {
                    if (xhr.status.toString()[0] === '2') resolve(xhr.response);
                    else rejectXhr();
                }, { once: true });
                Request.setRequestHeader(xhr, options);
                xhr.send(Request.createBody(options));
            }).then((data) => options.json ? JSON.parse(data) : data)
        };
        result.promise.then(data => result.response = data);
        return result;
    }
}

export default Request;
