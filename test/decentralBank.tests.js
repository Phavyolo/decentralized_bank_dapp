const Tether = artifacts.require("Tether");
const RWD = artifacts.require("RWD");
const DecentralBank = artifacts.require("DecentralBank");

require('chai')
.use(require('chai-as-promised'))
.should()

contract ('DecentralBank', ([owner, customer]) => {
    let tether, rwd, decentralBank

    let tokens = (number) => web3.utils.toWei(number, 'ether');

    before(async () => {
        tether = await Tether.new();
        rwd = await RWD.new();
        decentralBank = await DecentralBank.new(rwd.address, tether.address);

        await rwd.transfer(decentralBank.address, tokens('1000000'));
        
        await tether.transfer(customer, tokens('100'), {from: owner});
    })

    describe('Mock Tether Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await tether.name();
            assert.equal(name, 'Mock Tether Token');
        })
    })

    describe('Reward Token Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await rwd.name();
            assert.equal(name, 'Reward Token');
        })
    })

    describe('Decentral Bank Deployment', async () => {
        it('matches name successfully', async () => {
            const name = await decentralBank.name();
            assert.equal(name, 'Decentral Bank');
        })

        it('contract has tokens', async () => {
            let balance = await rwd.balanceOf(decentralBank.address);
            assert.equal(balance, tokens('1000000'));
        })

        describe('Yield Farming', async () => {
            it('reward tokens for staking', async () => {
                let reward
                
                reward = await tether.balanceOf(customer);
                assert.equal(reward.toString(), tokens('100'), 'customer mock wallet balance before staking');

                await tether.approve(decentralBank.address, tokens('100'), {from: customer});
                await decentralBank.depositTokens(tokens('100'), {from: customer});

                reward = await tether.balanceOf(customer);
                assert.equal(reward.toString(), tokens('0'), 'customer mock wallet balance before staking');

                reward = await decentralBank.stakingBalance(customer);
                assert.equal(reward.toString(), tokens('100'), 'customer mock wallet balance after staking');

                reward = await tether.balanceOf(decentralBank.address);
                assert.equal(reward.toString(), tokens('100'), 'decentral bank mock wallet balance');

                reward = await decentralBank.isStaking(customer);
                assert.equal(reward.toString(), 'true', 'customer staking status');

                await decentralBank.issueTokens({from: owner});

                await decentralBank.issueTokens({from: customer}).should.be.rejected;

                await decentralBank.unstakeTokens({from: customer});

                reward = await tether.balanceOf(customer);
                assert.equal(reward.toString(), tokens('100'), 'customer mock wallet balance before staking');

                reward = await decentralBank.stakingBalance(customer);
                assert.equal(reward.toString(), tokens('0'), 'customer mock wallet balance after staking');

                reward = await tether.balanceOf(decentralBank.address);
                assert.equal(reward.toString(), tokens('0'), 'decentral bank mock wallet balance');

                reward = await decentralBank.isStaking(customer);
                assert.equal(reward.toString(), 'false', 'customer staking status');
            })
        })
    })
})

// contract ('DecentralBank', (accounts) => {
//     describe('Reward Deployment', async () => {
//         it('matches symbol successfully', async () => {
//             let rwd = await RWD.new();
//             const symbol = await rwd.symbol();
//             assert.equal(symbol, 'RWD');
//         })
//     })
// })