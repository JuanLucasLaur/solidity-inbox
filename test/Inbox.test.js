const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
// Create instance of web3 connected to local test ethereum network.
const web3 = new Web3(ganache.provider());
// Get compiled contract and it's interface.
const {abi, evm} = require('../compile');

const INITIAL_MESSAGE = 'Initial message';

/**
 * Array of mock accounts for testing purposes.
 * @var {string[]} accounts
 */
let accounts;

/**
 * Instance of deployed test contract.
 * @var {Contract} inbox
 */
let inbox;

beforeEach(async () => {
    // Get a list of test accounts
    accounts = await web3.eth.getAccounts();

    // Use test account to deploy contract
    inbox = await new web3.eth.Contract(abi)
        .deploy({
            data: evm.bytecode.object,
            arguments: [INITIAL_MESSAGE]
        })
        .send({from: accounts[0], gas: '1000000'});
});

describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(inbox.options.address);
    });

    it('has a default message', async () => {
        const message = await inbox.methods.message().call();
        assert.strictEqual(message, INITIAL_MESSAGE);
    });

    it('can change the message', async () => {
        const NEW_MESSAGE = 'New message';

        await inbox.methods.setMessage(NEW_MESSAGE).send({from: accounts[0]});

        const message = await inbox.methods.message().call();
        assert.strictEqual(message, NEW_MESSAGE);
    });
});
