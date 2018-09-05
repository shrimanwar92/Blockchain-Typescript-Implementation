import { Wallet } from './wallet';
import * as bitcoin from 'bitcoinjs-lib';
import { Utility } from './utility';
import { Blockchain } from './Blockchain';
import { sha256 } from 'js-sha256';

export class Transaction {
	public transactionId: string; // hash of the transaction
	public sender: string; // address/public key of sender
	public recipient: string; // address/public key of recipient
	public value: number; // amount to send
	public signature: any; // this is to prevent anybody to spend funds in our wallet

	public inputs: Array<TransactionInput> = [];
	public outputs: Array<TransactionOutput> = [];

	private sequence: number = 0; // a rough count of how many transactions have been generated.

	constructor(from: string, to: string, amount: number, inputs: TransactionInput[]) {
		this.sender = from;
		this.recipient = to;
		this.value = amount;
		this.inputs = inputs;
	}

	// This Calculates the transaction hash (which will be used as its Id)
	calculateHash(): string {
		this.sequence++; //increase the sequence to avoid 2 identical transactions having the same hash
		return sha256(`${this.sender}${this.recipient}${this.sequence}`);

	}

	//Signs all the data we dont wish to be tampered with.
	generateSignature(): void {
		let input = `${this.sender}${this.recipient}${this.value}`;
		this.signature = Utility.applyECDSASig(input);	
	}

	// Verifies the data we signed hasnt been tampered with
	verifiySignature(): boolean {
		let input = `${this.sender}${this.recipient}${this.value}`;
		return Utility.verifyECDSASig(input, this.signature);
	}

	processTransaction(): boolean {
		if(!this.verifiySignature()) {
			console.log("Transaction signature filed to verify.");
			return false;
		}

		this.inputs.forEach(input => {
			input.UTXO = Blockchain.UTXOs[input.transactionOutputId];
		});

		//check if transaction is valid:
		if(this.getInputsValue() < Blockchain.minimumTransaction) {
			console.log("#Transaction Inputs to small: " + this.getInputsValue());
			return false;
		}

		// generate transaction outputs
		let leftOver: number = this.getInputsValue() - this.value; //get value of inputs then the left over change
		this.transactionId = this.calculateHash();
		this.outputs.push(new TransactionOutput(this.recipient, this.value, this.transactionId)); // send value to recipient
		this.outputs.push(new TransactionOutput(this.sender, leftOver, this.transactionId)); // send the left over 'change' back to sender

		//add outputs to Unspent list
		this.outputs.forEach(output => {
			Blockchain.UTXOs[output.id] = output;
		});

		//remove transaction inputs from UTXO lists as spent
		this.inputs.forEach(input => {
			if(input.UTXO == undefined || input.UTXO == null) {
				return;
			}
			delete Blockchain.UTXOs[input.UTXO.id];
		});

		return true;
	}

	//returns sum of inputs(UTXOs) values
	getInputsValue(): number {
		let total = 0;

		this.inputs.forEach(input => {
			if(input.UTXO == undefined || input.UTXO == null) {
				return;
			}
			total += input.UTXO.value;
		});

		return total;
	}

	// returns sum of outputs
	getOutputsValue(): number {
		let total = 0;

		this.outputs.forEach(output => {
			total += output.value;
		});

		return total;
	}
}

// This class will be used to reference TransactionOutputs that have not yet been spent. 
// The transactionOutputId will be used to find the relevant TransactionOutput, allowing miners to check your ownership.
export class TransactionInput {
	public transactionOutputId: string;
	public UTXO: TransactionOutput;

	constructor(transactionOutputId: string) {
		this.transactionOutputId = transactionOutputId;
	}
}

export class TransactionOutput {
	public id: string;
	public recipient: string; // new owner of the coins
	public value: number; // the amount of coins they own
	public parentTransactionId: string; // the id of transaction this output was created in

	constructor(recipient: string, value: number, parentTransactionId: string) {
		this.recipient = recipient;
		this.value = value;
		this.parentTransactionId = parentTransactionId;
		this.id = sha256(`${recipient}${value}${parentTransactionId}`);
	}

	isMine(publicKey: string) {
		if(this.recipient == publicKey) {
			return true;
		}
		return false;
	}
}

/*var w = new Wallet();
console.log(w.publicKey, w.privateKey);

var t = new Transaction("1","2",3,[]);
var sign = t.applyECDSASig(w.keyPair, "nilay");
console.log(t.verifyECDSASig(w.keyPair, "nilay", sign))*/

