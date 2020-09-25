import rawBRE from '@nomiclabs/buidler';
import {
  getEthersSigners,
  deployAaveIncentivesVaultImpl,
  deployInitializableAdminUpgradeabilityProxy,
  deployMintableErc20,
  insertContractAddressInDb,
} from '../helpers/contracts-helpers';
import {ContractTransaction, Signer, ethers} from 'ethers';
import {initializeMakeSuite} from './helpers/make-suite';
import path from 'path';
import fs from 'fs';
import {MOCK_INITIAL_STAKING_DISTRIBUTION} from '../helpers/constants';
import {eContractid} from '../helpers/types';
import {waitForTx} from '../helpers/misc-utils';

const {
  utils: {parseEther},
} = ethers;

['misc'].forEach((folder) => {
  const tasksPath = path.join(__dirname, '../', 'tasks', folder);
  fs.readdirSync(tasksPath).forEach((task) => require(`${tasksPath}/${task}`));
});

const buildTestEnv = async (deployer: Signer, secondaryWallet: Signer) => {
  console.time('setup');

  const incentivesProxyOwner = await deployer.getAddress();

  const aaveIncentivesVaultProxy = await deployInitializableAdminUpgradeabilityProxy();
  const aaveIncentivesVaultImpl = await deployAaveIncentivesVaultImpl();

  const mockAave = await deployMintableErc20(['Aave Token', 'AAVE', 18]);
  await waitForTx(await mockAave.mint(parseEther('1000')));
  const mockStakedAave = await deployMintableErc20(['Staked Aave', 'stkAAVE', 18]);
  await waitForTx(await mockStakedAave.mint(parseEther('1000')));

  const encodedInitializeIncentives = aaveIncentivesVaultImpl.interface.encodeFunctionData(
    'initialize',
    [mockAave.address, mockStakedAave.address, MOCK_INITIAL_STAKING_DISTRIBUTION]
  );

  await waitForTx(
    await aaveIncentivesVaultProxy['initialize(address,address,bytes)'](
      aaveIncentivesVaultImpl.address,
      incentivesProxyOwner,
      encodedInitializeIncentives
    )
  );

  await insertContractAddressInDb(
    eContractid.AaveIncentivesVault,
    aaveIncentivesVaultProxy.address
  );

  await insertContractAddressInDb(eContractid.MockAave, mockAave.address);

  await insertContractAddressInDb(eContractid.MockStakedAave, mockStakedAave.address);

  console.timeEnd('setup');
};

before(async () => {
  await rawBRE.run('set-bre');
  const [deployer, secondaryWallet] = await getEthersSigners();
  console.log('-> Deploying test environment...');
  await buildTestEnv(deployer, secondaryWallet);
  await initializeMakeSuite();
  console.log('\n***************');
  console.log('Setup and snapshot finished');
  console.log('***************\n');
});
