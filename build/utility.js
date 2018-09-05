"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin = require("bitcoinjs-lib");
class Utility {
    static applyECDSASig(input) {
        return this.keyPair.sign(bitcoin.crypto.sha256(input));
    }
    static verifyECDSASig(input, sign) {
        return this.keyPair.verify(bitcoin.crypto.sha256(input), sign);
    }
}
exports.Utility = Utility;
