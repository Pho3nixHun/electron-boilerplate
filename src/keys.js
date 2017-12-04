'use strict';

class Keys extends Array {
    constructor(keys = []) {
        if (Array.isArray(keys)) {
            super(0);
            this.push(...keys);    
        } else {
            super(arguments);
        }
    }
    findByKeyCode(keyCode = '') {
        if (keyCode === '') return undefined;
        const keyCodeLowerCase = keyCode.toLowerCase();
        return this.find(({ key }) => key.toLowerCase() === keyCodeLowerCase);
    }
}

export default Keys;
