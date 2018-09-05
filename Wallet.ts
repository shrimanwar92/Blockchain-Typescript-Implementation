import * as bitcoin from 'bitcoinjs-lib';
import { Utility } from './utility';
import { Blockchain } from './Blockchain'; 
import { Transaction, TransactionOutput, TransactionInput } from './Transaction';

export class Wallet {

	public publicKey: string;
	public privateKey: string;
	public UTXOs = {};

	constructor() {
		this.generateKeyPair();
	}

	generateKeyPair(): void {
		let keyPair = bitcoin.ECPair.makeRandom();
		this.publicKey = keyPair.getAddress();
		this.privateKey = keyPair.toWIF();
		Utility.keyPair = keyPair;
	}

	getBalance(): number {
		let total: number = 0;

		for(let prop in Blockchain.UTXOs) {
			let utxo: TransactionOutput = Blockchain.UTXOs[prop];

			if(utxo.isMine(this.publicKey)) { //if output belongs to me ( if coins belong to me )
				this.UTXOs[utxo.id] = utxo; //add it to our list of unspent transactions
				total += utxo.value;
			}
		}

		return total;
	}

	sendFunds(recipient: string, value: number): Transaction {
		if(value > this.getBalance()) {
			console.log("#Not Enough funds to send transaction. Transaction Discarded.");
			return;
		}

		let inputs: Array<TransactionInput> = [];

		let total: number = 0;

		for(let prop in this.UTXOs) {
			let utxo: TransactionOutput = this.UTXOs[prop];
			total += utxo.value;
			inputs.push(new TransactionInput(utxo.id));
			if(total > value) break;
		}

		let tx: Transaction = new Transaction(this.publicKey, recipient, value, inputs);
		tx.generateSignature();

		//remove transaction inputs from UTXO lists as spent
		inputs.forEach(input => {
			delete this.UTXOs[input.transactionOutputId];
		});

		return tx;
	}

	// Feel free to add some other functionalities to your wallet, like keeping a record of your transaction history.
}

/*var w = new Wallet();
console.log(w.publicKey, w.privateKey);*/