'use strict';

const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions');
const { encode, decode } = require('./services/encoding');
const {
  getCollectionAddress,
  getMojiAddress,
  getSireAddress,
  getOfferAddress } = require('./services/addressing');
const prng = require('./services/prng');
const { createHash } = require('crypto');
const FAMILY_NAME = 'cryptomoji';
const FAMILY_VERSION = '0.1';
const NAMESPACE = '5f4d76';

/**
 * A Cryptomoji specific version of a Hyperledger Sawtooth Transaction Handler.
 */
class MojiHandler extends TransactionHandler {
  /**
   * The constructor for a TransactionHandler simply registers it with the
   * validator, declaring which family name, versions, and namespaces it
   * expects to handle. We'll fill this one in for you.
   */
  constructor () {
    console.log('Initializing cryptomoji handler with namespace:', NAMESPACE);
    super(FAMILY_NAME, [ FAMILY_VERSION ], [ NAMESPACE ]);
  }

  /**
   * The apply method is where the vast majority of all the work of a
   * transaction processor happens. It will be called once for every
   * transaction, passing two objects: a transaction process request ("txn" for
   * short) and state context.
   *
   * Properties of `txn`:
   *   - txn.payload: the encoded payload sent from your client
   *   - txn.header: the decoded TransactionHeader for this transaction
   *   - txn.signature: the hex signature of the header
   *
   * Methods of `context`:
   *   - context.getState(addresses): takes an array of addresses and returns
   *     a Promise which will resolve with the requested state. The state
   *     object will have keys which are addresses, and values that are encoded
   *     state resources.
   *   - context.setState(updates): takes an update object and returns a
   *     Promise which will resolve with an array of the successfully
   *     updated addresses. The updates object should have keys which are
   *     addresses, and values which are encoded state resources.
   *   - context.deleteState(addresses): deletes the state for the passed
   *     array of state addresses. Only needed if attempting the extra credit.
   */
  apply (txn, context) {
    // Enter your solution here
    // (start by decoding your payload and checking which action it has)
    let payload;
    try{
      payload = decode(txn.payload);
    } catch(err) {
      throw new InvalidTransaction('Poorly Encoded Payload');
    }
    const publicKey = txn.header.signerPublicKey;
    const owner = getCollectionAddress(publicKey);
    switch(payload.action){
      case 'CREATE_COLLECTION':{
        
        return context.getState([owner]).then(state => {
          if(state[owner].length !== 0){
            throw new InvalidTransaction('Owner exists');
          } else {
            const hex = createHash('sha512').update(txn.signature).digest('hex')
            let dnaGenerator = prng(hex);
            
            const newState = {};
            let dnaStrings = [];
            for(let i = 0; i < 3; i++){
              dnaStrings.push(createHash('sha512').update(String(dnaGenerator(2**16))).digest('hex').slice(0,36))
            }
            let mojiAddresses = dnaStrings.map(dna => {
              return {dna, mojiAddress: getMojiAddress(publicKey, dna)}
            });
            mojiAddresses.forEach(moji => {
              const mojiObj = {
                dna: moji.dna,
                owner: publicKey,
                breeder: null,
                sire: null,
                bred: [],
                sired: [],
              };
              newState[moji.mojiAddress] = encode(mojiObj);
            })
            const collectionObject = {
              key: publicKey,
              moji: mojiAddresses.map(moji => moji.mojiAddress)
            };
            newState[owner] = encode(collectionObject);
            return context.setState(newState)
          }
        });
      }
      case 'SELECT_SIRE': {
        let sire = payload.sire;
        return context.getState([owner]).then(state => {
          if(state[owner].length === 0){
            throw new InvalidTransaction('Owner does not exist');
          }
          const collection = decode(state[owner]);
          if(!collection.moji.includes(sire)){
            throw new InvalidTransaction('Moji does not belong to owner')
          }
          return context.getState([sire]).then(sireObj => {
            if(sireObj[sire].length === 0){
              throw new InvalidTransaction('Sire does not exist');
            }
            let newSire = {};
            let sireAddress = getSireAddress(publicKey);
            sireObj[sire] = decode(sireObj[sire])
            sireObj[sire].sire = sire;
            newSire[sireAddress] = encode(sireObj[sire]);
            return context.setState(newSire);
          })
        })
        
      }
      case 'BREED_MOJI': {
        let sire = payload.sire;
        let breeder = payload.breeder;
        return context.getState([owner, breeder, sire]).then(state => {
          if(state[owner].length === 0){
            throw new InvalidTransaction('Owner does not exist');
          }
          const collection = decode(state[owner]);
          if(!collection.moji.includes(breeder)){
            throw new InvalidTransaction('Breeder does not belong to owner');
          }
          if(state[sire].length === 0){
            throw new InvalidTransaction('Sire does not exist');
          } 
          if(state[breeder].length === 0){
            throw new InvalidTransaction('Breeder does not exist');
          }
          let hex = createHash('sha512').update(breeder + sire).digest('hex');
          let dnaGen = prng(hex);
          let newMojiDna = createHash('sha512').update(String(dnaGen(2**16))).digest('hex').slice(0,36);
          let newState = {};
          collection.moji.push(getMojiAddress(publicKey, newMojiDna));
          const mojiObj = {
            dna: newMojiDna,
            owner: publicKey,
            breeder,
            sire,
            bred: [],
            sired: [],
          };
          let childAddress = getMojiAddress(publicKey, newMojiDna);
          let breederObj = decode(state[breeder])
          let sireObj = decode(state[sire]);
          breederObj.bred.push(childAddress)
          sireObj.sired.push(childAddress);
          newState[childAddress] = encode(mojiObj);
          newState[owner] = encode(collection);
          newState[breeder] = encode(breederObj);
          newState[sire] = encode(sireObj);
          let sireOwnerAddress = getSireAddress(sireObj.owner)
          return context.getState([sireOwnerAddress]).then(owner => {
            let ownerSireListing;
            try {
              ownerSireListing = decode(owner[sireOwnerAddress]);
            } catch(err) {
              throw new InvalidTransaction('No sire listing')
            }
            if(ownerSireListing.length === 0){
              throw new InvalidTransaction('No owner listing');
            }
            if(ownerSireListing.sire !== sire){
              throw new InvalidTransaction('Moji is not listed as a sire');
            }
            return context.setState(newState)
          })
        })

      }
      default: {
        throw new InvalidTransaction('Invalid Action');
      }
    }
  }
}

module.exports = MojiHandler;
