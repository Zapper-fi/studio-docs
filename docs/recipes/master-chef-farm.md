---
sidebar_position: 5
---

# Master Chef Farm

**SushiSwap** developed a yield farming implementation for multiple farms on the same smart contract called `MasterChef` during DeFi Summer 2020. It quickly became a very popular way to incentivize liquidity providers to provide their assets to SushiSwap, pulling liquidity away from Uniswap V2 in the process. This event was referred to as the **SushiSwap Vampire Attack**.

Each of farm on a `MasterChef` contract is called a **pool** (not to be confused with an decentralized exchange pool). Each pool has a token that can be accepted as a deposit, and one or more tokens that are emitted as a reward as a claimable amount to the yield farmers.

## Using the `MasterChefFarmContractPositionHelper`

The `MasterChefFarmContractPositionHelper` helper class can be used to build a list of `ContractPosition` objects that represent farms on a `MasterChef` fork contract. In this example, we'll look at **Stargate** LP token staking. We'll also look at **SushiSwap** `MasterChefV2` LP token staking to complement the lesson.

**Stargate** enables cross-chain bridging by incentivizing stablecoin holders on different L1s and L2s to pool their assets. In return for pooling their assets, these liquidity providers receive LP tokens that represent their positions. These LP tokens can be staked in the Stargate `MasterChef` contract to earn `STG` rewards.

First, let's generate a new contract position fetcher with `yarn studio create-contract-position-fetcher stargate`. When prompted for a group, select `Create New`, then enter `farm` as the ID and `Farms` as the label. When prompted for a network, select `arbitrum`.

Let's now open up our newly generator boilerplate in `src/apps/synthetix/arbitrum/stargate.farm.contract-position-fetcher.ts`:

```ts
import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { PositionFetcher } from '~position/position-fetcher.interface';
import { ContractPosition } from '~position/position.interface';
import { Network } from '~types/network.interface';

import { StargateContractFactory } from '../contracts';
import { STARGATE_DEFINITION } from '../stargate.definition';

const appId = STARGATE_DEFINITION.id;
const groupId = STARGATE_DEFINITION.groups.farm.id;
const network = Network.ARBITRUM_MAINNET;

@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return [];
  }
}
```

## Reference the helper class through the AppToolkit

We'll use the `MasterChefFarmContractPositionHelper` helper class registered in our `AppToolkit` to quickly build the farm contract positions. We'll call the `getPositions` method on this helper class.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions({
      // ...
    });
  }
}
```

## Add `appId`, `groupId`, and `network` parameters

We'll specify our `appId`, `groupId`, and `network` identifiers. These should match the values specified in the `@Register.ContractPositionFetcher` decorator.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions({
      network: Network.ARBITRUM_MAINNET,
      appId: STARGATE_DEFINITION.id,
      groupId: STARGATE_DEFINITION.groups.farm.id,
      // ...
    });
  }
}
```

## Add `dependencies` parameter

We'll use the `dependencies` parameter to specify which token groups are required as dependencies for building this set of contract positions. In the case of **Stargate** farms, the user deposits Stargate **Pool** tokens into the farms, so we'll reference this app group in the `dependencies` array.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions({
      network: Network.ARBITRUM_MAINNET,
      appId: STARGATE_DEFINITION.id,
      groupId: STARGATE_DEFINITION.groups.farm.id,
      dependencies: [{ appId: STARGATE_DEFINITION.id, groupIds: [STARGATE_DEFINITION.groups.pool.id], network }],
      // ...
    });
  }
}
```

## Add `address` parameter

The `address` is the deployed address of the `MasterChef` fork contract. On `Arbitrum`, the contract is deployed [here](https://arbiscan.io/address/0xea8dfee1898a7e0a59f7527f076106d7e44c2176). Let's go ahead and add this property:

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions({
      address: '0xea8dfee1898a7e0a59f7527f076106d7e44c2176',
      network: Network.ARBITRUM_MAINNET,
      appId: STARGATE_DEFINITION.id,
      groupId: STARGATE_DEFINITION.groups.farm.id,
      dependencies: [{ appId: STARGATE_DEFINITION.id, groupIds: [STARGATE_DEFINITION.groups.pool.id], network }],
      // ...
    });
  }
}
```

## Add `resolveContract` parameter

We'll need to know what contract to use to make requests to the chef address. Grab the ABI JSON from [here](https://arbiscan.io/address/0xea8dfee1898a7e0a59f7527f076106d7e44c2176), then put it in `src/apps/stargate/contracts/abi/stargate-master-chef.json`. Next, run `pnpm studio generate:contract-factory stargate` to rebuild the contract factory.

Now, we'll reference `StargateMasterChef` as a generic to the `getPositions` call, allowing us to safely type our `resolveContract` callback. Let's see what this looks like:

```ts
// ...
import { StargateMasterChef } from '../contracts';
// ...

@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions<StargateMasterChef>({
      address: '0xea8dfee1898a7e0a59f7527f076106d7e44c2176',
      network: Network.ARBITRUM_MAINNET,
      appId: STARGATE_DEFINITION.id,
      groupId: STARGATE_DEFINITION.groups.farm.id,
      dependencies: [{ appId: STARGATE_DEFINITION.id, groupIds: [STARGATE_DEFINITION.groups.pool.id], network }],
      resolveFactoryContract: ({ address, network }) =>
        this.stargateContractFactory.stargateMasterChef({ address, network }),
      // ...
    });
  }
}
```

## Add `resolvePoolLength` parameter

We'll use the `resolvePoolLength` parameter to define how our helper class will retrieve the number of farming pools. In our case, we'll call the `poolLength` method on the chef contract.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions<StargateMasterChef>({
      address: '0xea8dfee1898a7e0a59f7527f076106d7e44c2176',
      network: Network.ARBITRUM_MAINNET,
      appId: STARGATE_DEFINITION.id,
      groupId: STARGATE_DEFINITION.groups.farm.id,
      dependencies: [{ appId: STARGATE_DEFINITION.id, groupIds: [STARGATE_DEFINITION.groups.pool.id], network }],
      resolveFactoryContract: ({ address, network }) =>
        this.stargateContractFactory.stargateMasterChef({ address, network }),
      resolvePoolLength: ({ multicall, contract }) => multicall.wrap(contract).poolLength(),
      // ...
    });
  }
}
```

## Add `resolveDepositTokenAddress` parameter

We'll use the `resolveDepositTokenAddress` parameter to define how our helper class will resolve the staked token address for a given pool index. In our case, we'll call the `poolInfo` method with the pool index, and return the `lpToken` value from the result.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions<StargateMasterChef>({
      address: '0xea8dfee1898a7e0a59f7527f076106d7e44c2176',
      network: Network.ARBITRUM_MAINNET,
      appId: STARGATE_DEFINITION.id,
      groupId: STARGATE_DEFINITION.groups.farm.id,
      dependencies: [{ appId: STARGATE_DEFINITION.id, groupIds: [STARGATE_DEFINITION.groups.pool.id], network }],
      resolveFactoryContract: ({ address, network }) =>
        this.stargateContractFactory.stargateMasterChef({ address, network }),
      resolvePoolLength: ({ multicall, contract }) => multicall.wrap(contract).poolLength(),
      resolveDepositTokenAddress: ({ poolIndex, contract, multicall }) =>
        multicall
          .wrap(contract)
          .poolInfo(poolIndex)
          .then(v => v.lpToken),
      // ...
    });
  }
}
```

## Add `resolveRewardTokenAddresses` parameter

We'll use the `resolveRewardTokenAddresses` parameter to define how our helper class will resolve the reward token address for a given pool index. In our case, the reward is always the `STG` token, so we'll call the `stargate` method on the farm contract.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions<StargateMasterChef>({
      address: '0xea8dfee1898a7e0a59f7527f076106d7e44c2176',
      network: Network.ARBITRUM_MAINNET,
      appId: STARGATE_DEFINITION.id,
      groupId: STARGATE_DEFINITION.groups.farm.id,
      dependencies: [{ appId: STARGATE_DEFINITION.id, groupIds: [STARGATE_DEFINITION.groups.pool.id], network }],
      resolveFactoryContract: ({ address, network }) =>
        this.stargateContractFactory.stargateMasterChef({ address, network }),
      resolvePoolLength: ({ multicall, contract }) => multicall.wrap(contract).poolLength(),
      resolveDepositTokenAddress: ({ poolIndex, contract, multicall }) =>
        multicall
          .wrap(contract)
          .poolInfo(poolIndex)
          .then(v => v.lpToken),
      resolveRewardTokenAddresses: ({ multicall, contract }) => multicall.wrap(contract).stargate(),
      // ...
    });
  }
}
```

In `MasterChef V2`, there is optionally a bonus reward token emitted by a separate contract called a `Rewarder`. We can use the `MasterChefV2ClaimableTokenStrategy` to resolve reward token addresses for this case.

- `resolvePrimaryClaimableToken`: Resolves the reward token emitted by the `MasterChef` contract
- `resolveRewarderAddress`: Resolves the contract address of the rewarder that emits one or more bonus tokens.
- `resolveRewarderContract`: Resolves the typed `Ether.js` contract to be used to make requests to the rewarder contract.
- `resolveSecondaryClaimableToken`: Resolves the reward token emitted by the `Rewarder` contract.

Here's an example in the case of **SushiSwap**:

```ts
async getPositions() {
  return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions<SushiSwapV2MasterChef>({
    // ...
    resolveRewardTokenAddresses: this.masterChefRewarderClaimableTokenStrategy.build<
        SushiSwapMasterChefV2,
        SushiSwapMasterChefV2Rewarder
      >({
        resolvePrimaryClaimableToken: ({ multicall, contract }) => multicall.wrap(contract).SUSHI(),
        resolveRewarderAddress: ({ multicall, contract, poolIndex }) => multicall.wrap(contract).rewarder(poolIndex),
        resolveRewarderContract: ({ network, rewarderAddress }) =>
          this.contractFactory.sushiSwapRewarder({ address: rewarderAddress, network }),
        resolveSecondaryClaimableToken: ({ multicall, poolIndex, rewarderContract }) =>
          multicall
            .wrap(rewarderContract)
            .pendingTokens(poolIndex, ZERO_ADDRESS, 0)
            .then(v => v.rewardTokens[0]),
      }),
    // ...
  });
}
```

## Add `resolveRewardRate` and `rewardRateUnit` parameters

We'll use the `resolveRewardRate` and `rewardRateUnit` parameters to define how our helper class will resolve the rate of reward emissions per block or per second for a given pool index.

`MasterChef` works by assigning weights called **allocation points** to each pool in the contract. One reward rate is defined in the contract, and this is divided up across the pools by weight.

We'll use the `MasterChefDefaultRewardRateStrategy` strategy class in this case.

- `resolvePoolAllocPoints`: Resolves the allocation points for the given pool index
- `resolveTotalAllocPoints`: Resolve the total allocation points for all pools in the contract
- `resolveTotalRewardRate`: Resolves the total reward rate distributed across all the pools in the contract

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class ArbitrumStargateFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(StargateContractFactory) private readonly stargateContractFactory: StargateContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions<StargateMasterChef>({
      address: '0xea8dfee1898a7e0a59f7527f076106d7e44c2176',
      network: Network.ARBITRUM_MAINNET,
      appId: STARGATE_DEFINITION.id,
      groupId: STARGATE_DEFINITION.groups.farm.id,
      dependencies: [{ appId: STARGATE_DEFINITION.id, groupIds: [STARGATE_DEFINITION.groups.pool.id], network }],
      resolveFactoryContract: ({ address, network }) =>
        this.stargateContractFactory.stargateMasterChef({ address, network }),
      resolvePoolLength: ({ multicall, contract }) => multicall.wrap(contract).poolLength(),
      resolveDepositTokenAddress: ({ poolIndex, contract, multicall }) =>
        multicall
          .wrap(contract)
          .poolInfo(poolIndex)
          .then(v => v.lpToken),
      resolveRewardTokenAddresses: ({ multicall, contract }) => multicall.wrap(contract).stargate(),
      rewardRateUnit: RewardRateUnit.BLOCK,
      resolveRewardRate: this.appToolkit.helpers.masterChefDefaultRewardsPerBlockStrategy.build({
        resolvePoolAllocPoints: async ({ poolIndex, contract, multicall }) =>
          multicall
            .wrap(contract)
            .poolInfo(poolIndex)
            .then(v => v.allocPoint),
        resolveTotalAllocPoints: ({ multicall, contract }) => multicall.wrap(contract).totalAllocPoint(),
        resolveTotalRewardRate: ({ multicall, contract }) => multicall.wrap(contract).stargatePerBlock(),
      }),
    });
  }
}
```

In `MasterChef V2`, the `Rewarder` contract mentioned in the previous section also has a reward rate for the bonus reward token. We can use `MasterChefV2RewardRateStrategy` to resolve the primary and secondary reward token reward rates.

- `resolvePoolAllocPoints`: Resolves the allocation points for the primary reward token for the given pool index
- `resolveTotalAllocPoints`: Resolve the total allocation points for the the primary reward token for all pools in the contract
- `resolvePrimaryTotalRewardRate`: Resolves the total reward rate for the primary reward token
- `resolveRewarderAddress`: Resolves the contract address of the rewarder that emits one or more bonus tokens.
- `resolveRewarderContract`: Resolves the typed `Ether.js` contract to be used to make requests to the rewarder contract.
- `resolveSecondaryTotalRewardRate`: Resolves the reward rate for the bonus reward token

Here's an example in the case of **SushiSwap**:

```ts
async getPositions() {
  return this.appToolkit.helpers.masterChefContractPositionHelper.getContractPositions<SushiSwapV2MasterChef>({
    // ...
    resolveRewardRate: this.appToolkit.helpers.masterChefV2RewardRateStrategy.build<
        SushiSwapMasterChefV2,
        SushiSwapMasterChefV2Rewarder
      >({
        resolvePoolAllocPoints: async ({ poolIndex, contract, multicall }) =>
          multicall
            .wrap(contract)
            .poolInfo(poolIndex)
            .then(v => v.allocPoint),
        resolveTotalAllocPoints: ({ multicall, contract }) => multicall.wrap(contract).totalAllocPoint(),
        resolvePrimaryTotalRewardRate: async ({ multicall, contract }) => multicall.wrap(contract).sushiPerBlock(),
        resolveRewarderAddress: ({ multicall, contract, poolIndex }) =>
          multicall
            .wrap(contract)
            .poolInfo(poolIndex)
            .then(v => v.rewarder),
        resolveRewarderContract: ({ network, rewarderAddress }) =>
          this.contractFactory.sushiSwapMasterChefV2Rewarder({ address: rewarderAddress, network }),
        resolveSecondaryTotalRewardRate: async ({ multicall, rewarderContract }) =>
          multicall
            .wrap(rewarderContract)
            .rewardPerSecond()
            .catch(() => '0'),
      }),
    // ...
  });
}
```

We're done!