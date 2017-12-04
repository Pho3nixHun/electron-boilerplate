'use strict';

import "./stylesheets/rcu.css";
import "./stylesheets/main.css";

import Request from './request';
import { BrowserWindow } from "electron";
import Keys from './keys';

const config = {
    remote: 'remotes/newRemote.html',
    get ip() {
        const el = document.getElementById('inputIp');
        if (el) {
            return el.value;
        }
        return '';
    },
    set ip(v) {
        const el = document.getElementById('inputIp');
        if (el) {
            el.value = v;
            return true;
        }
        return false;
    },
    get KEY_STATES() {
        return {
            DOWN: 8000,
            UP: 8100
        }
    },
    port: 10014,
    getUrl(keyCode, keyState) { return `http://${this.ip}:${this.port}/keyinjector/emulateuserevent/${keyCode}/${keyState}` },
    keys: new Keys([
        {
            key: 'Power',
            keybinding: 'esc',
            keyCode: 128
        }
    ])
}
const request = new Request({ method: Request.METHODS.PUT });
function sendKey(keyCode) {
    return request.put({ url: config.getUrl(keyCode, config.KEY_STATES.DOWN) }).promise
        .then(data => console.debug('Sendkey KEYDOWN response', data) || data)
        .then(data => request.put({ url: config.getUrl(keyCode, config.KEY_STATES.UP) }).promise)
        .then(data => console.debug('Sendkey KEYUP response', data) || data)
        .catch(err => console.warn('SendKey failed', err));
}
function remoteClickHandler({ target }) {
    const on = () => target.classList.toggle('loading'), off = on;
    const onError = (err) => console.warn('FAILED KeyPress', err) || off();

    on();
    sendKey(target.dataset.keyCode)
        .then(off)
        .catch(onError)
}
function renderRemote(container) {
    console.log(request);
    request.get({ url: config.remote }).promise
    .then((remoteTemplate) => {
        container.innerHTML = remoteTemplate;
        return container;
    })
    .then(setupButtons);
}
function setupButtons(contaier) {
    const buttons = contaier.querySelectorAll(`button`);
    buttons.forEach(btn => {
        btn.addEventListener('click', (evt) => {
            const keyCode = btn.getAttribute('is');
            const key = config.keys.findByKeyCode(keyCode);
            console.log('click', keyCode, key);
            sendKey(keyCode);
        });
    });
}
const container = document.body;
renderRemote(container);