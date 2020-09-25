import {task} from '@nomiclabs/buidler/config';
import {getALendTokenAddressByNetwork, getLendTokenAddressByNetwork} from '../../helpers/constants';
import {checkVerification} from '../../helpers/etherscan-verification';
import {setBRE, BRE} from '../../helpers/misc-utils';
import {eEthereumNetwork} from '../../helpers/types';

task('deploy-aave-strategy', 'Full deployment flow on main network')
  .addFlag('verify', 'Verify the contracts via Etherscan API')
  .addParam('aaveTokenAddress', 'Use Aave Token proxy address')
  .addParam('aaveStakedTokenAddress', 'Use Aave Staked Token proxy address')
  .setAction(async ({aaveTokenAddress, aaveStakedTokenAddress, verify}, _BRE) => {
    setBRE(_BRE);
    const {run} = BRE;
    const network = BRE.network.name as eEthereumNetwork;

    // Prevent loss of gas verifying all the needed ENVs for Etherscan verification
    if (verify) {
      checkVerification();
    }

    await run('deploy-aave-vote-strategy', {
      aaveTokenAddress,
      aaveStakedTokenAddress,
      verify,
    });
    console.log(`Finished deployment of ERC20 Strategies at ${network} network.`);
  });
