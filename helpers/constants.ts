import BigNumber from 'bignumber.js';
import {ethers} from 'ethers';
import {getParamPerNetwork} from './misc-utils';
import {eEthereumNetwork, tEthereumAddress} from './types';

export const TEST_SNAPSHOT_ID = '0x1';

export const BUIDLEREVM_CHAINID = 31337;
export const COVERAGE_CHAINID = 1337;

// ----------------
// MATH
// ----------------

export const WAD = Math.pow(10, 18).toString();
export const HALF_WAD = new BigNumber(WAD).multipliedBy(0.5).toString();
export const RAY = new BigNumber(10).exponentiatedBy(27).toFixed();
export const HALF_RAY = new BigNumber(RAY).multipliedBy(0.5).toFixed();
export const WAD_RAY_RATIO = Math.pow(10, 9).toString();
export const oneEther = new BigNumber(Math.pow(10, 18));
export const oneRay = new BigNumber(Math.pow(10, 27));
export const MAX_UINT_AMOUNT =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export const MOCK_INITIAL_STAKING_DISTRIBUTION = ethers.utils.parseEther('500');
export const ZERO_ADDRESS: tEthereumAddress = '0x0000000000000000000000000000000000000000';

// AaveProtoGovernance address as admin
export const getAaveAdminPerNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: ZERO_ADDRESS,
      [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: '0x6940B44a8eFBc625e1309d79F8dea34f155D4330',
      [eEthereumNetwork.ropsten]: '0x85e4A467343c0dc4aDAB74Af84448D9c45D8ae6F',
      [eEthereumNetwork.main]: '0x8a2Efd9A790199F4c94c6effE210fce0B4724f52',
    },
    network
  );

export const getActivationBlockDelay = (network: eEthereumNetwork): string =>
  getParamPerNetwork<string>(
    {
      [eEthereumNetwork.coverage]: '0',
      [eEthereumNetwork.buidlerevm]: '0',
      [eEthereumNetwork.kovan]: '100',
      [eEthereumNetwork.ropsten]: '100',
      [eEthereumNetwork.main]: '6500', // This must be filled
    },
    network
  );

export const getAaveAllowanceForStake = (network: eEthereumNetwork): string =>
  getParamPerNetwork<string>(
    {
      [eEthereumNetwork.coverage]: MOCK_INITIAL_STAKING_DISTRIBUTION.toString(),
      [eEthereumNetwork.buidlerevm]: MOCK_INITIAL_STAKING_DISTRIBUTION.toString(),
      [eEthereumNetwork.kovan]: '38000000000000000000000', // This must be filled
      [eEthereumNetwork.ropsten]: '38000000000000000000000', // This must be filled
      [eEthereumNetwork.main]: '38000000000000000000000', // This must be filled
    },
    network
  );

export const getAssetVotingWeightProvider = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: ZERO_ADDRESS,
      [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: '0xf533a03e7280886eB7B059F9F3690CF82A5b707D',
      [eEthereumNetwork.ropsten]: ZERO_ADDRESS,
      [eEthereumNetwork.main]: '0x5aC493b8C2cEf1F02F117B9BA2797e7DA95574aa',
    },
    network
  );

export const getAaveIncentivesVaultImplByConfig = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: '',
      [eEthereumNetwork.buidlerevm]: '',
      [eEthereumNetwork.kovan]: '',
      [eEthereumNetwork.ropsten]: '',
      [eEthereumNetwork.main]: '',
    },
    network
  );

export const getAaveIncentivesVaultProxyByConfig = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: '',
      [eEthereumNetwork.buidlerevm]: '',
      [eEthereumNetwork.kovan]: '',
      [eEthereumNetwork.ropsten]: '',
      [eEthereumNetwork.main]: '',
    },
    network
  );

// Aave Stake proxy address
export const getAaveStakePerNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: ZERO_ADDRESS,
      [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: ZERO_ADDRESS,
      [eEthereumNetwork.ropsten]: ZERO_ADDRESS,
      [eEthereumNetwork.main]: '0x3b42cd463D247AAeffB38CFF5d5eE42e9DdC4430',
    },
    network
  );

export const getAaveTokenProxyPerNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: ZERO_ADDRESS,
      [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: '0xe4483afcf0d612c011679C76B61F5b0d27bAF93C',
      [eEthereumNetwork.ropsten]: '0x74dA004A1B81b4d0C79F5820f9FF22647cb1dD95',
      [eEthereumNetwork.main]: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    },
    network
  );

export const getAaveTokenImpl = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: ZERO_ADDRESS,
      [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: ZERO_ADDRESS,
      [eEthereumNetwork.ropsten]: ZERO_ADDRESS,
      [eEthereumNetwork.main]: '0xea86074fdac85e6a605cd418668c63d2716cdfbc',
    },
    network
  );

export const getLendToAaveMigratorProxy = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: ZERO_ADDRESS,
      [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: ZERO_ADDRESS,
      [eEthereumNetwork.ropsten]: ZERO_ADDRESS,
      [eEthereumNetwork.main]: '0x317625234562b1526ea2fac4030ea499c5291de4',
    },
    network
  );
export const getLendToAaveMigratorImpl = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: ZERO_ADDRESS,
      [eEthereumNetwork.buidlerevm]: ZERO_ADDRESS,
      [eEthereumNetwork.kovan]: ZERO_ADDRESS,
      [eEthereumNetwork.ropsten]: ZERO_ADDRESS,
      [eEthereumNetwork.main]: '0x86241b6c526998582556f7c0342d8863b604b17b',
    },
    network
  );

export const getLendTokenAddressByNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: '',
      [eEthereumNetwork.buidlerevm]: '',
      [eEthereumNetwork.kovan]: '0x690eaca024935aaff9b14b9ff9e9c8757a281f3c',
      [eEthereumNetwork.ropsten]: '',
      [eEthereumNetwork.main]: '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03',
    },
    network
  );
export const getALendTokenAddressByNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: '',
      [eEthereumNetwork.buidlerevm]: '',
      [eEthereumNetwork.kovan]: '0xcBa131C7FB05fe3c9720375cD86C99773faAbF23',
      [eEthereumNetwork.ropsten]: '',
      [eEthereumNetwork.main]: '0x7D2D3688Df45Ce7C552E19c27e007673da9204B8',
    },
    network
  );

export const getLendVoteStrategyTokenByNetwork = (network: eEthereumNetwork): tEthereumAddress =>
  getParamPerNetwork<tEthereumAddress>(
    {
      [eEthereumNetwork.coverage]: '',
      [eEthereumNetwork.buidlerevm]: '',
      [eEthereumNetwork.kovan]: '0x8aca987620760408f116915a0138cbc8981fe32f',
      [eEthereumNetwork.ropsten]: '',
      [eEthereumNetwork.main]: '0x0671CA7E039af2cF2D2c5e7F1Aa261Ae78B3ffDF',
    },
    network
  );
