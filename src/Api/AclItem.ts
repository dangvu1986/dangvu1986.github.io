/**
 * Class for an ACL item in solid pod
 */
export class AclItem {
    _key: number;
    _agent: string;
    _accessTo: string;
    _read: boolean;
    _write: boolean;
    _append: boolean;
    _control: boolean;
    _isGroup: boolean;

    constructor(key: number, agent: string, accessTo: string, read: boolean, write: boolean, append: boolean, control: boolean, isGroup: boolean) {
        this._key = key;
        this._agent = agent;
        this._accessTo = accessTo;
        this._read = read;
        this._write = write;
        this._append = append;
        this._control = control;
        this._isGroup = isGroup;
    }

    // Make properties readonly
    get agent() { return this._agent; }
    get accessTo() { return this._accessTo; }
    get isGroup() { return this._isGroup; }
    get read() { return this._read; }
    get write() { return this._write; }
    get append() { return this._append; }
    get control() { return this._control; }
}

