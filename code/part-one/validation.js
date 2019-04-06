'use strict';

const { createHash } = require('crypto');
const signing = require('./signing');

/**
 * A simple validation function for transactions. Accepts a transaction
 * and returns true or false. It should reject transactions that:
 *   - have negative amounts
 *   - were improperly signed
 *   - have been modified since signing
 */
const isValidTransaction = transaction => {
  // Enter your solution here
  if(transaction.amount < 0){
    return false;
  }
  let message = transaction.source + transaction.recipient + transaction.amount;
  return signing.verify(transaction.source, message, transaction.signature);
};

/**
 * Validation function for blocks. Accepts a block and returns true or false.
 * It should reject blocks if:
 *   - their hash or any other properties were altered
 *   - they contain any invalid transactions
 */
const isValidBlock = block => {
  // Your code here
  for(let transaction of block.transactions){
    if(!isValidTransaction(transaction)){
      return false;
    }
  }
  let trueHash = createHash('sha512').update(block.transactions + block.previousHash + block.nonce).digest().toString('base64');
  return trueHash === block.hash;
};

/**
 * One more validation function. Accepts a blockchain, and returns true
 * or false. It should reject any blockchain that:
 *   - is a missing genesis block
 *   - has any block besides genesis with a null hash
 *   - has any block besides genesis with a previousHash that does not match
 *     the previous hash
 *   - contains any invalid blocks
 *   - contains any invalid transactions
 */
const isValidChain = blockchain => {
  // Your code here
  for(let i = 0; i < blockchain.blocks.length; i++){
    if(blockchain.blocks[i].previousHash === null &&  i != 0){
      return false;
    }
    if(blockchain.blocks[i + 1] !== undefined && blockchain.blocks[i + 1].previousHash !== blockchain.blocks[i].hash){
      return false;
    }
    if(!isValidBlock(blockchain.blocks[i])){
      return false;
    }
    
  }
  return blockchain.blocks[0].previousHash === null;
};

/**
 * This last one is just for fun. Become a hacker and tamper with the passed in
 * blockchain, mutating it for your own nefarious purposes. This should
 * (in theory) make the blockchain fail later validation checks;
 */
const breakChain = blockchain => {
  // Your code here
  let myWalletKey = signing.getPublicKey(signing.createPrivateKey());
  for(let block of blockchain.blocks){
    for(let tran of block.transactions){
      tran.recipient = myWalletKey;
      // set every transaction to be sent to my wallet huehuehue
    }
  }
};

module.exports = {
  isValidTransaction,
  isValidBlock,
  isValidChain,
  breakChain
};
