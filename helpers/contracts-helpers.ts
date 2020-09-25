import {BigNumberish, Contract, Signer, utils} from 'ethers';

import {getDb, BRE} from './misc-utils';
import {tEthereumAddress, eContractid} from './types';
import {AaveIncentivesVault} from '../types/AaveIncentivesVault';
import {InitializableAdminUpgradeabilityProxy} from '../types/InitializableAdminUpgradeabilityProxy';
import {MintableErc20} from '../types/MintableErc20';
import {verifyContract} from './etherscan-verification';
import {verify} from 'crypto';
import {AaveGenesisExecutor} from '../types/AaveGenesisExecutor';
import {AaveGenesisProposalPayload} from '../types/AaveGenesisProposalPayload';
import {LendVoteStrategyToken} from '../types/LendVoteStrategyToken';
import {AaveVoteStrategyToken} from '../types/AaveVoteStrategyToken';

export const registerContractInJsonDb = async (contractId: string, contractInstance: Contract) => {
  const currentNetwork = BRE.network.name;
  if (currentNetwork !== 'buidlerevm' && !currentNetwork.includes('coverage')) {
    console.log(`*** ${contractId} ***\n`);
    console.log(`Network: ${currentNetwork}`);
    console.log(`tx: ${contractInstance.deployTransaction.hash}`);
    console.log(`contract address: ${contractInstance.address}`);
    console.log(`deployer address: ${contractInstance.deployTransaction.from}`);
    console.log(`gas price: ${contractInstance.deployTransaction.gasPrice}`);
    console.log(`gas used: ${contractInstance.deployTransaction.gasLimit}`);
    console.log(`\n******`);
    console.log();
  }

  await getDb()
    .set(`${contractId}.${currentNetwork}`, {
      address: contractInstance.address,
      deployer: contractInstance.deployTransaction.from,
    })
    .write();
};

export const insertContractAddressInDb = async (id: eContractid, address: tEthereumAddress) =>
  await getDb()
    .set(`${id}.${BRE.network.name}`, {
      address,
    })
    .write();

export const getEthersSigners = async (): Promise<Signer[]> =>
  await Promise.all(await BRE.ethers.getSigners());

export const getEthersSignersAddresses = async (): Promise<tEthereumAddress[]> =>
  await Promise.all((await BRE.ethers.getSigners()).map((signer) => signer.getAddress()));

export const getCurrentBlock = async () => {
  return BRE.ethers.provider.getBlockNumber();
};

export const decodeAbiNumber = (data: string): number =>
  parseInt(utils.defaultAbiCoder.decode(['uint256'], data).toString());

export const deployContract = async <ContractType extends Contract>(
  contractName: string,
  args: any[]
): Promise<ContractType> => {
  const contract = (await (await BRE.ethers.getContractFactory(contractName)).deploy(
    ...args
  )) as ContractType;

  await registerContractInJsonDb(<eContractid>contractName, contract);
  return contract;
};

export const getContract = async <ContractType extends Contract>(
  contractName: string,
  address: string
): Promise<ContractType> => (await BRE.ethers.getContractAt(contractName, address)) as ContractType;

export const deployAaveIncentivesVaultImpl = async (verify?: boolean) => {
  const id = eContractid.AaveIncentivesVault;
  const args: string[] = [];

  const instance = await deployContract<AaveIncentivesVault>(id, args);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(id, instance.address, args);
  }
  await registerContractInJsonDb(eContractid.AaveIncentivesVaultImpl, instance);
  return instance;
};

export const deployInitializableAdminUpgradeabilityProxy = async (verify?: boolean) => {
  const id = eContractid.InitializableAdminUpgradeabilityProxy;
  const args: string[] = [];

  const instance = await deployContract<InitializableAdminUpgradeabilityProxy>(id, args);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(id, instance.address, args);
  }
  return instance;
};

export const deployMintableErc20 = async ([name, symbol, decimals]: [string, string, number]) =>
  await deployContract<MintableErc20>(eContractid.MintableErc20, [name, symbol, decimals]);

export const getMintableErc20 = async (address: tEthereumAddress) => {
  return await getContract<MintableErc20>(
    eContractid.MintableERC20,
    address ||
      (await getDb().get(`${eContractid.MintableERC20}.${BRE.network.name}`).value()).address
  );
};

export const getMockAave = async (address?: tEthereumAddress) => {
  return await getContract<MintableErc20>(
    eContractid.MintableErc20,
    address || (await getDb().get(`${eContractid.MockAave}.${BRE.network.name}`).value()).address
  );
};

export const getMockStakedAave = async (address?: tEthereumAddress) => {
  return await getContract<MintableErc20>(
    eContractid.MintableErc20,
    address ||
      (await getDb().get(`${eContractid.MockStakedAave}.${BRE.network.name}`).value()).address
  );
};

export const getAaveIncentivesVault = async (address?: tEthereumAddress) => {
  return await getContract<AaveIncentivesVault>(
    eContractid.AaveIncentivesVault,
    address ||
      (await getDb().get(`${eContractid.AaveIncentivesVault}.${BRE.network.name}`).value()).address
  );
};

export const getAaveIncentivesVaultImpl = async (address?: tEthereumAddress) => {
  return await getContract<AaveIncentivesVault>(
    eContractid.AaveIncentivesVault,
    address ||
      (await getDb().get(`${eContractid.AaveIncentivesVaultImpl}.${BRE.network.name}`).value())
        .address
  );
};

type AaveGenesisExecutorParams = [
  tEthereumAddress,
  string,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress
];

export const deployAaveGenesisExecutor = async (
  [
    aaveGovernance,
    aaveAllowanceForStake,
    lendToAaveMigratorProxy,
    lendToAaveMigratorImpl,
    aaveTokenProxy,
    aaveTokenImpl,
    aaveIncentivesVaultProxy,
    aaveIncentivesVaultImpl,
    stakedAaveProxy,
  ]: AaveGenesisExecutorParams,
  verify?: boolean
) => {
  const id = eContractid.AaveGenesisExecutor;
  const args: string[] = [
    aaveGovernance,
    aaveAllowanceForStake,
    lendToAaveMigratorProxy,
    lendToAaveMigratorImpl,
    aaveTokenProxy,
    aaveTokenImpl,
    aaveIncentivesVaultProxy,
    aaveIncentivesVaultImpl,
    stakedAaveProxy,
  ];

  const instance = await deployContract<AaveGenesisExecutor>(id, args);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(id, instance.address, args);
  }
  return instance;
};

type AaveGenesisProposalPayloadParams = [
  string,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress,
  tEthereumAddress
];

export const deployAaveGenesisProposalPayload = async (
  [
    activationBlockDelay,
    assetVotingWeightProvider,
    aaveGenesisExecutor,
    lendToAaveMigratorProxy,
    aaveTokenProxy,
    aaveIncentivesVaultProxy,
    stakedAaveProxy,
    lendVoteStrategyToken,
    aaveVoteStrategyToken,
  ]: AaveGenesisProposalPayloadParams,
  verify?: boolean
) => {
  const id = eContractid.AaveGenesisProposalPayload;
  const args: string[] = [
    activationBlockDelay,
    assetVotingWeightProvider,
    aaveGenesisExecutor,
    lendToAaveMigratorProxy,
    aaveTokenProxy,
    aaveIncentivesVaultProxy,
    stakedAaveProxy,
    lendVoteStrategyToken,
    aaveVoteStrategyToken,
  ];

  const instance = await deployContract<AaveGenesisExecutor>(id, args);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(id, instance.address, args);
  }
  return instance;
};

export const getAaveGenesisExecutor = async (address?: tEthereumAddress) => {
  return await getContract<AaveGenesisExecutor>(
    eContractid.AaveGenesisExecutor,
    address ||
      (await getDb().get(`${eContractid.AaveGenesisExecutor}.${BRE.network.name}`).value()).address
  );
};

export const getAaveAaveGenesisProposalPayload = async (address?: tEthereumAddress) => {
  return await getContract<AaveGenesisProposalPayload>(
    eContractid.AaveGenesisProposalPayload,
    address ||
      (await getDb().get(`${eContractid.AaveGenesisProposalPayload}.${BRE.network.name}`).value())
        .address
  );
};

export const deployLendVoteStrategyToken = async (
  [lendAddress, aLendAddress]: [tEthereumAddress, tEthereumAddress],
  verify?: boolean
) => {
  const id = eContractid.LendVoteStrategyToken;
  const args: string[] = [lendAddress, aLendAddress];

  const instance = await deployContract<LendVoteStrategyToken>(id, args);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(id, instance.address, args);
  }
  return instance;
};

export const deployAaveVoteStrategyToken = async (
  [aaveAddres, stkAaveAddress]: [tEthereumAddress, tEthereumAddress],
  verify?: boolean
) => {
  const id = eContractid.AaveVoteStrategyToken;
  const args: string[] = [aaveAddres, stkAaveAddress];

  const instance = await deployContract<AaveVoteStrategyToken>(id, args);
  await instance.deployTransaction.wait();
  if (verify) {
    await verifyContract(id, instance.address, args);
  }
  return instance;
};

export const getLendVoteStrategyToken = async (address?: tEthereumAddress) => {
  return await getContract<LendVoteStrategyToken>(
    eContractid.LendVoteStrategyToken,
    address ||
      (await getDb().get(`${eContractid.LendVoteStrategyToken}.${BRE.network.name}`).value())
        .address
  );
};

export const getAaveVoteStrategyToken = async (address?: tEthereumAddress) => {
  return await getContract<AaveVoteStrategyToken>(
    eContractid.AaveVoteStrategyToken,
    address ||
      (await getDb().get(`${eContractid.AaveVoteStrategyToken}.${BRE.network.name}`).value())
        .address
  );
};
