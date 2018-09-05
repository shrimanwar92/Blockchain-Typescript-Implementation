"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_sha256_1 = require("js-sha256");
class Merkle {
    static getMerkleRoot(hashes) {
        let concatHashes = [];
        // if the no of elements is odd, append the last element in array
        // to make the hashes array even
        if (hashes.length % 2 == 1) {
            hashes.push(hashes[hashes.length - 1]);
        }
        // concat hashes in a pair of 2
        for (let i = 0; i < hashes.length; i += 2) {
            concatHashes.push(hashes[i] + hashes[i + 1]);
        }
        // pass the concatanated hashes through double hash
        let cH = concatHashes.map(hash => this.doubleHash(hash));
        if (cH.length > 1) {
            this.getMerkleRoot(cH);
        }
        else {
            return cH[0];
        }
    }
    static doubleHash(hash) {
        return js_sha256_1.sha256(js_sha256_1.sha256(hash)).toString();
    }
}
exports.Merkle = Merkle;
