import {evmRevert, evmSnapshot, BRE} from '../../helpers/misc-utils';
import {Signer} from 'ethers';
import {
  getEthersSigners,
  getMockAave,
  getMockStakedAave,
  getAaveIncentivesVault,
} from '../../helpers/contracts-helpers';
import {tEthereumAddress} from '../../helpers/types';
import {MintableErc20} from '../../types/MintableErc20';

import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import {AaveIncentivesVault} from '../../types/AaveIncentivesVault';
chai.use(bignumberChai());

export interface SignerWithAddress {
  signer: Signer;
  address: tEthereumAddress;
}
export interface TestEnv {
  deployer: SignerWithAddress;
  users: SignerWithAddress[];
  aaveIncentivesVault: AaveIncentivesVault;
  mockAave: MintableErc20;
  mockStakedAave: MintableErc20;
}

let buidlerevmSnapshotId: string = '0x1';
const setBuidlerevmSnapshotId = (id: string) => {
  if (BRE.network.name === 'buidlerevm') {
    buidlerevmSnapshotId = id;
  }
};

const testEnv: TestEnv = {
  deployer: {} as SignerWithAddress,
  users: [] as SignerWithAddress[],
  aaveIncentivesVault: {} as AaveIncentivesVault,
  mockAave: {} as MintableErc20,
  mockStakedAave: {} as MintableErc20,
} as TestEnv;

export async function initializeMakeSuite() {
  const [_deployer, ...restSigners] = await getEthersSigners();
  const deployer: SignerWithAddress = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };

  for (const signer of restSigners) {
    testEnv.users.push({
      signer,
      address: await signer.getAddress(),
    });
  }
  testEnv.deployer = deployer;
  testEnv.aaveIncentivesVault = await getAaveIncentivesVault();

  testEnv.mockAave = await getMockAave();
  testEnv.mockStakedAave = await getMockStakedAave();
}

export function makeSuite(name: string, tests: (testEnv: TestEnv) => void) {
  describe(name, () => {
    before(async () => {
      setBuidlerevmSnapshotId(await evmSnapshot());
    });
    tests(testEnv);
    after(async () => {
      await evmRevert(buidlerevmSnapshotId);
    });
  });
}
