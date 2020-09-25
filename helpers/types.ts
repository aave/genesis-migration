import BigNumber from 'bignumber.js';

export enum eEthereumNetwork {
  buidlerevm = 'buidlerevm',
  kovan = 'kovan',
  ropsten = 'ropsten',
  main = 'main',
  coverage = 'coverage',
}

export enum eContractid {
  AaveIncentivesVault = 'AaveIncentivesVault',
  InitializableAdminUpgradeabilityProxy = 'InitializableAdminUpgradeabilityProxy',
  MintableErc20 = 'MintableErc20',
  MockAave = 'MockAave',
  MockStakedAave = 'MockStakedAave',
  MintableERC20 = 'MintableERC20',
  AaveIncentivesVaultImpl = 'AaveIncentivesVaultImpl',
  AaveGenesisExecutor = 'AaveGenesisExecutor',
  AaveGenesisProposalPayload = 'AaveGenesisProposalPayload',
  LendVoteStrategyToken = 'LendVoteStrategyToken',
  AaveVoteStrategyToken = 'AaveVoteStrategyToken',
}

export type tEthereumAddress = string;
export type tStringTokenBigUnits = string; // 1 ETH, or 10e6 USDC or 10e18 DAI
export type tBigNumberTokenBigUnits = BigNumber;
export type tStringTokenSmallUnits = string; // 1 wei, or 1 basic unit of USDC, or 1 basic unit of DAI
export type tBigNumberTokenSmallUnits = BigNumber;

export interface iParamsPerNetwork<T> {
  [eEthereumNetwork.coverage]: T;
  [eEthereumNetwork.buidlerevm]: T;
  [eEthereumNetwork.kovan]: T;
  [eEthereumNetwork.ropsten]: T;
  [eEthereumNetwork.main]: T;
}
