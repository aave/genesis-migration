import {task} from '@nomiclabs/buidler/config';
import {
  deployAaveIncentivesVaultImpl,
  deployInitializableAdminUpgradeabilityProxy,
  registerContractInJsonDb,
} from '../../helpers/contracts-helpers';
import {setBRE} from '../../helpers/misc-utils';
import {eContractid} from '../../helpers/types';

const {AaveIncentivesVault} = eContractid;

task(`deploy-${AaveIncentivesVault}`, `Deploys the ${AaveIncentivesVault}`)
  .addFlag('verify', 'Verify the contracts via Etherscan API')
  .setAction(async ({verify}, BRE) => {
    setBRE(BRE);

    // Deploy Implementation
    await deployAaveIncentivesVaultImpl(verify);

    // Deploy Proxy
    const proxy = await deployInitializableAdminUpgradeabilityProxy(verify);
    await registerContractInJsonDb(AaveIncentivesVault, proxy);
  });
