"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin = require("bitcoinjs-lib");
const utility_1 = require("./utility");
const Blockchain_1 = require("./Blockchain");
const Transaction_1 = require("./Transaction");
class Wallet {
    constructor() {
        this.UTXOs = {};
        this.generateKeyPair();
    }
    generateKeyPair() {
        let keyPair = bitcoin.ECPair.makeRandom();
        this.publicKey = keyPair.getAddress();
        this.privateKey = keyPair.toWIF();
        utility_1.Utility.keyPair = keyPair;
    }
    getBalance() {
        let total = 0;
        for (let prop in Blockchain_1.Blockchain.UTXOs) {
            let utxo = Blockchain_1.Blockchain.UTXOs[prop];
            if (utxo.isMine(this.publicKey)) { //if output belongs to me ( if coins belong to me )
                this.UTXOs[utxo.id] = utxo; //add it to our list of unspent transactions
                total += utxo.value;
            }
        }
        return total;
    }
    sendFunds(recipient, value) {
        if (value > this.getBalance()) {
            console.log("#Not Enough funds to send transaction. Transaction Discarded.");
            return;
        }
        let inputs = [];
        let total = 0;
        for (let prop in this.UTXOs) {
            let utxo = this.UTXOs[prop];
            total += utxo.value;
            inputs.push(new Transaction_1.TransactionInput(utxo.id));
            if (total > value)
                break;
        }
        let tx = new Transaction_1.Transaction(this.publicKey, recipient, value, inputs);
        tx.generateSignature();
        //remove transaction inputs from UTXO lists as spent
        inputs.forEach(input => {
            delete this.UTXOs[input.transactionOutputId];
        });
        return tx;
    }
}
exports.Wallet = Wallet;
/*var w = new Wallet();
console.log(w.publicKey, w.privateKey);*/ 
