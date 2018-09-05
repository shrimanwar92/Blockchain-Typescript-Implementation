"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merkle_1 = require("./merkle");
const js_sha256_1 = require("js-sha256");
class Block {
    constructor(previousHash) {
        this.transactions = [];
        this.nonce = 0;
        this.previousHash = previousHash;
        this.timestamp = Date.now();
        this.hash = this.calculateHash(); //Making sure we do this after we set the other values.
    }
    //Calculate new hash based on blocks contents
    calculateHash() {
        let calculatedHash = `${this.merkleRoot}${this.previousHash}${this.timestamp}${this.nonce}`;
        return js_sha256_1.sha256(calculatedHash);
    }
    //Increases nonce value until hash target is reached.
    mineBlock(difficulty) {
        this.merkleRoot = merkle_1.Merkle.getMerkleRoot(this.transactions);
        let target = Array(difficulty + 1).join("0");
        console.log(this.hash);
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("BLOCK MINED: " + this.hash);
    }
    // Add transaction to this block
    addTransaction(transaction) {
        if (transaction == undefined) {
            return false;
        }
        if (this.previousHash != "0") {
            if (!transaction.processTransaction()) {
                return false;
            }
        }
        this.transactions.push(transaction);
        return true;
    }
}
exports.Block = Block;
/*let genesisBlock = new Block("Hi im the first block", "0");
console.log("Hash for block 1 : " + genesisBlock.hash);

let secondBlock = new Block("Yo im the second block", genesisBlock.hash);
console.log("Hash for block 2 : " + secondBlock.hash);

let thirdBlock = new Block("Hey im the third block", secondBlock.hash);
console.log("Hash for block 3 : " + thirdBlock.hash);*/ 
