import rawBRE from '@nomiclabs/buidler';
import {constants, utils, ethers} from 'ethers';

import {BRE, waitForTx, increaseTime} from '../helpers/misc-utils';
import {IAaveProtoGovernanceFactory} from '../types/IAaveProtoGovernanceFactory';
import {ILendToAaveMigratorImplWithInitializeFactory} from '../types/ILendToAaveMigratorImplWithInitializeFactory';
import {Ierc20DetailedFactory} from '../types/Ierc20DetailedFactory';
import {IStakedAaveImplWithInitializeFactory} from '../types/IStakedAaveImplWithInitializeFactory';
import {AaveGenesisExecutorFactory} from '../types';
import {eventChecker, getHashedProposalType, mineBlocks} from './helpers/mainnet-helpers';
import {MAX_UINT_AMOUNT} from '../helpers/constants';

const bs58 = require('bs58');
const {expect} = require('chai');
const DEFAULT_GAS_LIMIT = 7000000;
const COOLDOWN_SECONDS = 864000;
const UNSTAKE_WINDOW = 172800; // In seconds
const ONE_DAY_SECONDS = 86400;

const LEND_TOKEN = '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03';

const LEND_HOLDERS = [
  '0x3dfd23a6c5e8bbcfc9581d2e864a68feb6a076d3',
  '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8',
  '0xf977814e90da44bfa03b6295a0616a897441acec',
];

const PROPOSITION_POWER_HOLDER = '0xB9062896ec3A615a4e4444DF183F0531a77218AE';
const GOVERNANCE = '0x8a2efd9a790199f4c94c6effe210fce0b4724f52';
const ASSET_VOTING_WEIGHT_PROVIDER = '0x5ac493b8c2cef1f02f117b9ba2797e7da95574aa';
const LEND_VOTE_STRATEGY_TOKEN = '0x0671ca7e039af2cf2d2c5e7f1aa261ae78b3ffdf';
const AAVE_VOTE_STRATEGY_TOKEN = '0xa5e83c1a6e56f27f7764e5c5d99a9b8786e3a391';

const PROPOSAL_PAYLOAD = '0x66c812e4b6e889b638ff548c8c02c803f640d6d5';
const AAVE_GENESIS_EXECUTOR = '0xa133459b2502b0137e85a446fa8d4e300877a007';

const LEND_TO_AAVE_MIGRATOR_PROXY = '0x317625234562b1526ea2fac4030ea499c5291de4';
const LEND_TO_AAVE_MIGRATOR_IMPL = '0x86241b6c526998582556f7c0342d8863b604b17b';

const AAVE_TOKEN_PROXY = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9';
const AAVE_TOKEN_IMPL = '0xea86074fdac85e6a605cd418668c63d2716cdfbc';

const AAVE_INCENTIVES_VAULT_PROXY = '0x25f2226b597e8f9514b3f68f00f494cf4f286491';
const AAVE_INCENTIVES_VAULT_IMPL = '0x91abd2708b6b83359e7da5c4bda1df9c42ed334b';

const STAKED_AAVE_PROXY = '0x4da27a545c0c5b758a6ba100e3a049001de870f5';

enum EventName {
  Upgraded = 'Upgraded',
  AdminChanged = 'AdminChanged',
  Transfer = 'Transfer',
  Approval = 'Approval',
  AssetWeightSet = 'AssetWeightSet',
  AssetConfigUpdated = 'AssetConfigUpdated',
  StatusChangeToExecuted = 'StatusChangeToExecuted',
}

before(async () => {
  await rawBRE.run('set-bre');
  console.log('\n***************');
  console.log('Setup and snapshot finished');
  console.log('***************\n');
});

describe('Proposal execution tests', async function () {
  const PROPOSAL_ID = '0';

  it('Refills proposition power holder with ETH', async () => {
    const ethHolderSigner = BRE.ethers.provider.getSigner(LEND_HOLDERS[0]);
    await ethHolderSigner.sendTransaction({
      from: LEND_HOLDERS[0],
      to: PROPOSITION_POWER_HOLDER,
      value: utils.parseEther('100'),
      gasLimit: 700000,
      gasPrice: utils.parseUnits('5000', 'gwei'),
    });
  });

  it('Create proposal', async () => {
    const propositionPowerHolderSigner = BRE.ethers.provider.getSigner(PROPOSITION_POWER_HOLDER);
    const governance = IAaveProtoGovernanceFactory.connect(
      GOVERNANCE,
      propositionPowerHolderSigner
    );
    const ipfsEncoded = `0x${bs58
      .decode('QmdyjnyjdcueEqrBWMiY1oWGJNPYEMFg4DKvT5AmYPZcf2')
      .slice(2)
      .toString('hex')}`;

    await waitForTx(
      await governance.newProposal(
        getHashedProposalType('UPGRADE_ADDRESS_PROPOSAL'),
        ipfsEncoded,
        '13000000000000000000000000',
        PROPOSAL_PAYLOAD,
        '1660',
        '1660',
        '3',
        {gasLimit: DEFAULT_GAS_LIMIT, gasPrice: utils.parseUnits('5000', 'gwei')}
      )
    );
  });

  it('Vote for proposal', async () => {
    for (let lendHolder of LEND_HOLDERS) {
      const lendHolderSigner = BRE.ethers.provider.getSigner(lendHolder);
      const governance = IAaveProtoGovernanceFactory.connect(GOVERNANCE, lendHolderSigner);

      await waitForTx(
        await governance.submitVoteByVoter(PROPOSAL_ID, 1, LEND_VOTE_STRATEGY_TOKEN, {
          gasLimit: DEFAULT_GAS_LIMIT,
          gasPrice: utils.parseUnits('5000', 'gwei'),
        })
      );
    }
  });

  it('Mine 1660 blocks to finish voting period', async () => {
    await mineBlocks(1660);
  });

  it('Should move proposal to validation state', async () => {
    const signer = BRE.ethers.provider.getSigner(LEND_HOLDERS[0]);
    const governance = IAaveProtoGovernanceFactory.connect(GOVERNANCE, signer);

    await waitForTx(
      await governance.tryToMoveToValidating(PROPOSAL_ID, {
        gasLimit: DEFAULT_GAS_LIMIT,
        gasPrice: utils.parseUnits('5000', 'gwei'),
      })
    );
  });

  it('Mine 1660 blocks to finish voting period', async () => {
    await mineBlocks(1660);
  });

  it('Execute proposal', async () => {
    const propositionPowerHolderSigner = BRE.ethers.provider.getSigner(LEND_HOLDERS[0]);
    const governance = IAaveProtoGovernanceFactory.connect(
      GOVERNANCE,
      propositionPowerHolderSigner
    );

    const tx = await waitForTx(
      await governance.resolveProposal(PROPOSAL_ID, {
        gasLimit: DEFAULT_GAS_LIMIT,
        gasPrice: utils.parseUnits('5000', 'gwei'),
      })
    );

    let eventIndex = 0;
    const events = tx.events || [];

    [
      LEND_TO_AAVE_MIGRATOR_PROXY,
      AAVE_TOKEN_PROXY,
      AAVE_INCENTIVES_VAULT_PROXY,
      STAKED_AAVE_PROXY,
    ].forEach((contract) => {
      eventChecker(events[eventIndex], EventName.AdminChanged, contract, {
        newAdmin: AAVE_GENESIS_EXECUTOR,
      });
      eventIndex += 1;
    });

    eventChecker(events[eventIndex], EventName.AssetWeightSet, ASSET_VOTING_WEIGHT_PROVIDER, {
      asset: LEND_VOTE_STRATEGY_TOKEN,
      weight: '0',
    });
    eventIndex += 1;

    eventChecker(events[eventIndex], EventName.AssetWeightSet, ASSET_VOTING_WEIGHT_PROVIDER, {
      asset: AAVE_VOTE_STRATEGY_TOKEN,
      weight: '1',
    });
    eventIndex += 1;

    eventChecker(events[eventIndex], EventName.AssetConfigUpdated, STAKED_AAVE_PROXY, {
      asset: STAKED_AAVE_PROXY,
      emission: utils.parseEther('0.00462962962962963').toString(),
    });
    eventIndex += 1;
  });

  it('Mine 6500 blocks to be able to start migration', async () => {
    await mineBlocks(6500);
  });

  it('Reverts trying to move back admins of proxies to the governance', async () => {
    const signer = BRE.ethers.provider.getSigner(LEND_HOLDERS[0]);
    const genesysExecutor = AaveGenesisExecutorFactory.connect(AAVE_GENESIS_EXECUTOR, signer);

    await expect(genesysExecutor.returnAdminsToGovernance()).to.be.reverted;
  });

  it('Start migration', async () => {
    const signer = BRE.ethers.provider.getSigner(LEND_HOLDERS[0]);
    const genesysExecutor = AaveGenesisExecutorFactory.connect(AAVE_GENESIS_EXECUTOR, signer);

    const tx = await waitForTx(await genesysExecutor.startMigration({gasLimit: DEFAULT_GAS_LIMIT}));
    const events = tx.events || [];

    let eventIndex = 0;

    eventChecker(events[eventIndex], EventName.Upgraded, LEND_TO_AAVE_MIGRATOR_PROXY, {
      implementation: LEND_TO_AAVE_MIGRATOR_IMPL,
    });
    eventIndex += 1;

    eventChecker(events[eventIndex], EventName.Upgraded, AAVE_TOKEN_PROXY, {
      implementation: AAVE_TOKEN_IMPL,
    });
    eventIndex += 2;

    eventChecker(events[eventIndex], EventName.Transfer, AAVE_TOKEN_PROXY, {
      from: constants.AddressZero,
      to: LEND_TO_AAVE_MIGRATOR_PROXY,
      value: utils.parseEther('13000000'),
    });
    eventIndex += 2;

    eventChecker(events[eventIndex], EventName.Transfer, AAVE_TOKEN_PROXY, {
      from: constants.AddressZero,
      to: AAVE_INCENTIVES_VAULT_PROXY,
      value: utils.parseEther('3000000'),
    });
    eventIndex += 1;

    eventChecker(events[eventIndex], EventName.Upgraded, AAVE_INCENTIVES_VAULT_PROXY, {
      implementation: AAVE_INCENTIVES_VAULT_IMPL,
    });
    eventIndex += 1;

    eventChecker(events[eventIndex], EventName.Approval, AAVE_TOKEN_PROXY, {
      owner: AAVE_INCENTIVES_VAULT_PROXY,
      spender: STAKED_AAVE_PROXY,
      value: '38000000000000000000000',
    });
    eventIndex += 1;

    [
      LEND_TO_AAVE_MIGRATOR_PROXY,
      AAVE_TOKEN_PROXY,
      AAVE_INCENTIVES_VAULT_PROXY,
      STAKED_AAVE_PROXY,
    ].forEach((contract) => {
      eventChecker(events[eventIndex], EventName.AdminChanged, contract, {
        newAdmin: GOVERNANCE,
      });
      eventIndex += 1;
    });
  });

  it('Migrate LEND to AAVE', async () => {
    const lendHolderAddress = LEND_HOLDERS[0];
    const lendHolderSigner = BRE.ethers.provider.getSigner(lendHolderAddress);
    const migrator = ILendToAaveMigratorImplWithInitializeFactory.connect(
      LEND_TO_AAVE_MIGRATOR_PROXY,
      lendHolderSigner
    );
    const lend = Ierc20DetailedFactory.connect(LEND_TOKEN, lendHolderSigner);
    const aave = Ierc20DetailedFactory.connect(AAVE_TOKEN_PROXY, lendHolderSigner);
    const lendBalanceBefore = await lend.balanceOf(lendHolderAddress);
    const aaveBalanceBefore = await aave.balanceOf(lendHolderAddress);

    await lend.approve(LEND_TO_AAVE_MIGRATOR_PROXY, lendBalanceBefore, {
      gasLimit: DEFAULT_GAS_LIMIT,
    });
    await migrator.migrateFromLEND(lendBalanceBefore, {gasLimit: DEFAULT_GAS_LIMIT});

    const lendBalanceAfter = await lend.balanceOf(lendHolderAddress);
    const aaveBalanceAfter = await aave.balanceOf(lendHolderAddress);
    expect(lendBalanceAfter.toString()).to.be.equal('0', 'lend balance after are not 0');
    expect(aaveBalanceBefore.add(lendBalanceBefore.div(100)).toString()).to.be.equal(
      aaveBalanceAfter.toString(),
      'aave balance after are not correct'
    );
  });

  it('Stake AAVE', async () => {
    const aaveHolderAddress = LEND_HOLDERS[0];
    const aaveHolderSigner = BRE.ethers.provider.getSigner(aaveHolderAddress);
    const stakedAave = IStakedAaveImplWithInitializeFactory.connect(
      STAKED_AAVE_PROXY,
      aaveHolderSigner
    );
    const aave = Ierc20DetailedFactory.connect(AAVE_TOKEN_PROXY, aaveHolderSigner);
    const aaveBalanceBefore = await aave.balanceOf(aaveHolderAddress);
    const stakedAaveBalanceBefore = await stakedAave.balanceOf(aaveHolderAddress);

    await aave.approve(STAKED_AAVE_PROXY, aaveBalanceBefore, {gasLimit: DEFAULT_GAS_LIMIT});
    await stakedAave.stake(aaveHolderAddress, aaveBalanceBefore, {gasLimit: DEFAULT_GAS_LIMIT});

    const aaveBalanceAfter = await aave.balanceOf(aaveHolderAddress);
    const stakedAaveBalanceAfter = await stakedAave.balanceOf(aaveHolderAddress);
    expect(aaveBalanceAfter.toString()).to.be.equal('0', 'aave balance after are not 0');
    expect(stakedAaveBalanceBefore.add(aaveBalanceBefore).toString()).to.be.equal(
      stakedAaveBalanceAfter.toString(),
      'staked aave balance after are not correct'
    );
  });

  it(`Increase time 1 day (in seconds) seconds and claim rewards`, async () => {
    await increaseTime(ONE_DAY_SECONDS);

    const aaveHolderAddress = LEND_HOLDERS[0];
    const aaveHolderSigner = BRE.ethers.provider.getSigner(aaveHolderAddress);
    const stakedAave = IStakedAaveImplWithInitializeFactory.connect(
      STAKED_AAVE_PROXY,
      aaveHolderSigner
    );
    const aave = Ierc20DetailedFactory.connect(AAVE_TOKEN_PROXY, aaveHolderSigner);
    const aaveBalanceBefore = await aave.balanceOf(aaveHolderAddress);

    await stakedAave.claimRewards(aaveHolderAddress, MAX_UINT_AMOUNT, {
      gasLimit: DEFAULT_GAS_LIMIT,
    });

    const aaveBalanceAfter = await aave.balanceOf(aaveHolderAddress);

    const aaveRewards = aaveBalanceAfter.sub(aaveBalanceBefore);
    expect(
      aaveRewards.gte(ethers.utils.parseEther('400')) &&
        aaveRewards.lte(ethers.utils.parseEther('400.05'))
    ).to.be.true;
  });

  it('Activates the cooldown period to redeem', async () => {
    const aaveHolderAddress = LEND_HOLDERS[0];
    const aaveHolderSigner = BRE.ethers.provider.getSigner(aaveHolderAddress);
    const stakedAave = IStakedAaveImplWithInitializeFactory.connect(
      STAKED_AAVE_PROXY,
      aaveHolderSigner
    );

    await stakedAave.cooldown({gasLimit: DEFAULT_GAS_LIMIT});
  });

  it(`Increase ${COOLDOWN_SECONDS} + 1 seconds to reach the unstake windows`, async () => {
    await increaseTime(COOLDOWN_SECONDS + 1);
  });

  it('Unstake AAVE after waiting the cooldown period', async () => {
    const aaveHolderAddress = LEND_HOLDERS[0];
    const aaveHolderSigner = BRE.ethers.provider.getSigner(aaveHolderAddress);
    const stakedAave = IStakedAaveImplWithInitializeFactory.connect(
      STAKED_AAVE_PROXY,
      aaveHolderSigner
    );
    const aave = Ierc20DetailedFactory.connect(AAVE_TOKEN_PROXY, aaveHolderSigner);
    const aaveBalanceBefore = await aave.balanceOf(aaveHolderAddress);
    const stakedAaveBalanceBefore = await stakedAave.balanceOf(aaveHolderAddress);
    await stakedAave.redeem(aaveHolderAddress, stakedAaveBalanceBefore, {
      gasLimit: DEFAULT_GAS_LIMIT,
    });

    const aaveBalanceAfter = await aave.balanceOf(aaveHolderAddress);
    const stakedAaveBalanceAfter = await stakedAave.balanceOf(aaveHolderAddress);
    expect(aaveBalanceBefore.add(stakedAaveBalanceBefore).toString()).to.be.equal(
      aaveBalanceAfter,
      'AAVE balance after is not correct'
    );
    expect(stakedAaveBalanceAfter.toString()).to.be.equal('0', 'stkAAVE balance after is not 0');
  });

  it('Create a new proposal', async () => {
    const propositionPowerHolderSigner = BRE.ethers.provider.getSigner(PROPOSITION_POWER_HOLDER);
    const governance = IAaveProtoGovernanceFactory.connect(
      GOVERNANCE,
      propositionPowerHolderSigner
    );
    const ipfsEncoded = `0x${bs58
      .decode('QmdyjnyjdcueEqrBWMiY1oWGJNPYEMFg4DKvT5AmYPZcf2')
      .slice(2)
      .toString('hex')}`;

    await waitForTx(
      await governance.newProposal(
        getHashedProposalType('NEW_PROPOSAL'),
        ipfsEncoded,
        '13000000000000000000000000',
        PROPOSAL_PAYLOAD,
        '1660',
        '1660',
        '3',
        {gasLimit: DEFAULT_GAS_LIMIT, gasPrice: utils.parseUnits('5000', 'gwei')}
      )
    );
  });

  it('Vote for new proposal with AAVE+stkAAVE', async () => {
    const aaveHolderAddress = LEND_HOLDERS[0];
    const aaveHolderSigner = BRE.ethers.provider.getSigner(aaveHolderAddress);
    const governance = IAaveProtoGovernanceFactory.connect(GOVERNANCE, aaveHolderSigner);

    await waitForTx(
      await governance.submitVoteByVoter('1', 1, AAVE_VOTE_STRATEGY_TOKEN, {
        gasLimit: DEFAULT_GAS_LIMIT,
        gasPrice: utils.parseUnits('5000', 'gwei'),
      })
    );
  });
});
