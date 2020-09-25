import {task} from '@nomiclabs/buidler/config';
import {deployLendVoteStrategyToken} from '../../helpers/contracts-helpers';

import {setBRE} from '../../helpers/misc-utils';

task(`deploy-lend-vote-strategy.ts`, `Deploys the token strategies`)
  .addFlag('verify', 'Verify the contracts via Etherscan API')
  .addParam('lendTokenAddress', 'Use Lend Token proxy address')
  .addParam('aLendTokenAddress', 'Use aLEND Token proxy address')
  .setAction(async ({lendTokenAddress, aLendTokenAddress, verify}, BRE) => {
    setBRE(BRE);

    await deployLendVoteStrategyToken([lendTokenAddress, aLendTokenAddress], verify);
  });
