import * as bitcoin from 'bitcoinjs-lib';

export class Utility {

	public static keyPair: bitcoin.ECPair;

	static applyECDSASig(input): any {
		return this.keyPair.sign(bitcoin.crypto.sha256(input));
	}

	static verifyECDSASig(input, sign): boolean {
		return this.keyPair.verify(bitcoin.crypto.sha256(input), sign);
	}
}