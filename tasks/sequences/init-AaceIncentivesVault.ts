import {task} from '@nomiclabs/buidler/config';
import {eContractid} from '../../helpers/types';
import {
  getAaveIncentivesVault,
  getAaveIncentivesVaultImpl,
  getContract,
} from '../../helpers/contracts-helpers';
import {waitForTx} from '../../helpers/misc-utils';
import {InitializableAdminUpgradeabilityProxy} from '../../types/InitializableAdminUpgradeabilityProxy';

const {AaveIncentivesVault} = eContractid;

task(`initialize-${AaveIncentivesVault}`, `Initialize the ${AaveIncentivesVault} proxy contract`)
  .addParam('admin', 'The address to be added as an Admin role in Aave Token Transparent Proxy.')
  .addParam('aaveToken', 'The Aave Token proxy address.')
  .addParam('aaveStake', 'The Aave Stake proxy address.')
  .addParam('initialReward', 'The initial stake of the Aave Incentives Vault.')
  .addFlag('onlyProxy', 'Initialize only the proxy contract, not the implementation contract')
  .setAction(
    async ({admin: aaveAdmin, onlyProxy, aaveToken, aaveStake, initialReward}, localBRE) => {
      await localBRE.run('set-bre');

      if (!aaveAdmin) {
        throw new Error(
          `Missing --admin parameter to add the Admin Role to ${AaveIncentivesVault} Transparent Proxy`
        );
      }

      if (!localBRE.network.config.chainId) {
        throw new Error('INVALID_CHAIN_ID');
      }

      const incentivesVaultImpl = await getAaveIncentivesVaultImpl();
      const incentivesVault = await getAaveIncentivesVault();

      const incentivesVaultProxy = await getContract<InitializableAdminUpgradeabilityProxy>(
        eContractid.InitializableAdminUpgradeabilityProxy,
        incentivesVault.address
      );

      const incentivesVaultInitializeEncoded = incentivesVaultImpl.interface.encodeFunctionData(
        'initialize',
        [
          aaveToken, // AAVE ERC20 PROXY
          aaveStake, // STAKE AAVE PROXY
          initialReward, // INITIAL STAKING REWARD TO APPROVE TO STAKE CONTRACT
        ]
      );

      if (onlyProxy) {
        console.log(
          `\tWARNING: Not initializing the ${AaveIncentivesVault} implementation, only set AAVE_ADMIN to Transparent Proxy contract.`
        );
        await waitForTx(
          await incentivesVaultProxy['initialize(address,address,bytes)'](
            incentivesVaultImpl.address,
            aaveAdmin,
            '0x'
          )
        );
        console.log(
          `\tFinished ${AaveIncentivesVault} Proxy initialization, but not ${AaveIncentivesVault} implementation.`
        );
        return;
      }

      console.log('\tInitializing LendToAaveMigrator Proxy and Implementation ');

      await waitForTx(
        await incentivesVaultProxy['initialize(address,address,bytes)'](
          incentivesVaultImpl.address,
          aaveAdmin,
          incentivesVaultInitializeEncoded
        )
      );

      console.log('\tFinished LendToAaveMigrator Proxy and Implementation initialization.');
    }
  );
