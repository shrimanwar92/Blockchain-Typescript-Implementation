import * as bitcoin from 'bitcoinjs-lib';
import { Transaction } from './Transaction';
import { Merkle } from './merkle';
import { sha256 } from 'js-sha256';

export class Block {

	hash: string;
	previousHash: string;
	merkleRoot: string;
	transactions: Array<Transaction> = [];
	timestamp: number;
	nonce: number = 0;

	constructor(previousHash: string) {
		this.previousHash = previousHash;
		this.timestamp = Date.now();
		this.hash = this.calculateHash(); //Making sure we do this after we set the other values.
	}

	//Calculate new hash based on blocks contents
	calculateHash(): string {
		let calculatedHash = `${this.merkleRoot}${this.previousHash}${this.timestamp}${this.nonce}`;
		return sha256(calculatedHash);
	}

	//Increases nonce value until hash target is reached.
	mineBlock(difficulty: number) {
		this.merkleRoot = Merkle.getMerkleRoot(this.transactions);
		let target = Array(difficulty + 1).join("0");

		console.log(this.hash);
		while(this.hash.substring(0, difficulty) !== target) {
			this.nonce++;
			this.hash = this.calculateHash();
		}
		console.log("BLOCK MINED: " + this.hash);
	}

	// Add transaction to this block
	addTransaction(transaction: Transaction): boolean {
		if(transaction == undefined) {
			return false;
		}

		if (this.previousHash != "0") {
			if(!transaction.processTransaction()) {
				return false;
			}
		}

		this.transactions.push(transaction);
		return true;
	}
}

/*let genesisBlock = new Block("Hi im the first block", "0");
console.log("Hash for block 1 : " + genesisBlock.hash);

let secondBlock = new Block("Yo im the second block", genesisBlock.hash);
console.log("Hash for block 2 : " + secondBlock.hash);

let thirdBlock = new Block("Hey im the third block", secondBlock.hash);
console.log("Hash for block 3 : " + thirdBlock.hash);*/