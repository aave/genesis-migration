// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

interface IAaveGenesisExecutor {
  event Upgraded(address indexed implementation);
  event AdminChanged(address previousAdmin, address newAdmin);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);

  event MigrationProgrammedForBlock(uint256 blockNumber);
  event MigrationStarted();

  function setActivationBlock(uint256 blockNumber) external;

  function startMigration() external;

  function returnAdminsToGovernance() external;
}
