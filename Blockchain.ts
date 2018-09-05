import { Block } from './Block';
import { Wallet } from './Wallet';
import { Transaction, TransactionOutput, TransactionInput } from './Transaction';

export class Blockchain {

	blockchain: Array<Block> = [];
	difficulty:number = 6;
	static UTXOs = {};
	static minimumTransaction: number = 1;

	isChainValid(): boolean {
		let currentBlock: Block;
		let previousBlock: Block;
		let hashTarget: string = Array(this.difficulty + 1).join("0");

		for(let i = 1; i < this.blockchain.length; i++) {
			currentBlock = this.blockchain[i];
			previousBlock = this.blockchain[i - 1];

			// check current hash
			if(currentBlock.hash !== currentBlock.calculateHash()) {
				console.log('Current hashes not equal.');
				return false;
			}

			// check previous block's hash with current block's previous hash property
			if(previousBlock.hash !== currentBlock.previousHash) {
				console.log('Previous hashes not equal.');
				return false;
			}

			// check if current block is mined
			if(currentBlock.hash.substring(0, this.difficulty) !== hashTarget) {
				console.log('the current block is not mined yet.');
				return false;
			}
		};

		return true;
	}

	addBlock(newBlock: Block): void {
		newBlock.mineBlock(this.difficulty);
		this.blockchain.push(newBlock);
	}
}

// create new wallets
var walletA = new Wallet();
var walletB = new Wallet();
var coinbase = new Wallet();

//create genesis transaction, which sends 100 coins to walletA: 
var genesisTransaction: Transaction = new Transaction(coinbase.publicKey, walletA.publicKey, 1000, []);
genesisTransaction.generateSignature();  //manually sign the genesis transaction
genesisTransaction.transactionId = "0";
genesisTransaction.outputs.push(new TransactionOutput(genesisTransaction.recipient, genesisTransaction.value, genesisTransaction.transactionId));

let firstOutput: TransactionOutput = genesisTransaction.outputs[0];
Blockchain.UTXOs[firstOutput.id] = firstOutput; //its important to store our first transaction in the UTXOs list.

console.log("Creating and Mining Genesis block... ");
var genesis = new Block("00000000");
genesis.addTransaction(genesisTransaction);
new Blockchain().addBlock(genesis);

//testing
var block1 = new Block(genesis.hash);
console.log("\nWalletA's balance is: " + walletA.getBalance());
console.log("\nWalletA is Attempting to send funds (40) to WalletB...");
block1.addTransaction(walletA.sendFunds(walletB.publicKey, 40));
new Blockchain().addBlock(block1);
console.log("\nWalletA's balance is: " + walletA.getBalance());
console.log("WalletB's balance is: " + walletB.getBalance());

var block2 = new Block(block1.hash);
console.log("\nWalletA Attempting to send more funds (1000) than it has...");
block2.addTransaction(walletA.sendFunds(walletB.publicKey, 1000));
new Blockchain().addBlock(block2);
console.log("\nWalletA's balance is: " + walletA.getBalance());
console.log("WalletB's balance is: " + walletB.getBalance());

var block3 = new Block(block2.hash);
console.log("\nWalletB is Attempting to send funds (20) to WalletA...");
block3.addTransaction(walletB.sendFunds( walletA.publicKey, 20));
console.log("\nWalletA's balance is: " + walletA.getBalance());
console.log("WalletB's balance is: " + walletB.getBalance());