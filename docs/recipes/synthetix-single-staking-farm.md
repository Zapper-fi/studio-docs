---
sidebar_position: 2
---

# Synthetix Single Staking Farm

Web3 applications often incentivize holding tokens through _yield farming_. A
**Single Staking Farm** is a smart contract that allows a user to deposit a
single token and accumulate rewards over time. These rewards are claimable
through the same smart contract interface.

A very simple staking contract is the **Synthetix** `StakingRewards` smart
contract. A user can deposit a single token, and can earn another token emitted
over a period of time.

## Using the `SingleStakingFarmContractPositionHelper`

The `SingleStakingFarmContractPositionHelper` helper class can be used to build
a list of `ContractPosition` objects for a farm contract position group. In this
example, we'll look at **Synthetix** LP token staking.

**Synthetix** allows holders of synth tokens or LP tokens of synth tokens to
stake their tokens in return for `SNX` rewards. Although the rewards for these
farms are over, we will integrate these for educational purposes.

First, let's generate a new contract position fetcher with
`yarn studio create-contract-position-fetcher synthetix`. When prompted for a
group, select `Create New`, then enter `farm` as the ID and `Farms` as the
label. When prompted for a network, select `ethereum`.

Let's now open up our newly generator boilerplate in
`src/apps/synthetix/ethereum/synthetix.farm.contract-position-fetcher.ts`:

```ts
import { Inject } from "@nestjs/common";

import { IAppToolkit, APP_TOOLKIT } from "~app-toolkit/app-toolkit.interface";
import { Register } from "~app-toolkit/decorators";
import { PositionFetcher } from "~position/position-fetcher.interface";
import { ContractPosition } from "~position/position.interface";
import { Network } from "~types/network.interface";

import { SynthetixContractFactory } from "../contracts";
import { SYNTHETIX_DEFINITION } from "../synthetix.definition";

const appId = SYNTHETIX_DEFINITION.id;
const groupId = SYNTHETIX_DEFINITION.groups.farm.id;
const network = Network.ETHEREUM_MAINNET;

@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumSynthetixFarmContractPositionFetcher
  implements PositionFetcher<ContractPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(SynthetixContractFactory)
    private readonly synthetixContractFactory: SynthetixContractFactory
  ) {}

  async getPositions() {
    return [];
  }
}
```

## Reference the helper class through the AppToolkit

We'll use the `SingleStakingFarmContractPositionHelper` helper class registered
in our `AppToolkit` to quickly build the farm contract positions. We'll call the
`getPositions` method on this helper class, and pass in the generated **Ethers**
contract interface for the `StakingRewards` contract.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumSynthetixFarmContractPositionFetcher
  implements PositionFetcher<ContractPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(SynthetixContractFactory)
    private readonly synthetixContractFactory: SynthetixContractFactory
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<SynthetixStakingRewards>(
      {
        // ...
      }
    );
  }
}
```

## Add `appId`, `groupId`, and `network` parameters

We'll specify our `appId`, `groupId`, and `network` identifiers. These should
match the values specified in the `@Register.ContractPositionFetcher` decorator.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumSynthetixFarmContractPositionFetcher
  implements PositionFetcher<ContractPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(SynthetixContractFactory)
    private readonly synthetixContractFactory: SynthetixContractFactory
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<SynthetixStakingRewards>(
      {
        network: Network.ETHEREUM_MAINNET,
        appId: SYNTHETIX_DEFINITION.id,
        groupId: SYNTHETIX_DEFINITION.groups.farm.id,
        // ...
      }
    );
  }
}
```

## Add `dependencies` parameter

We'll use the `dependencies` parameter to specify which token groups are
required as dependencies for building this set of farm contract positions. In
the case of **Synthetix**, users can deposit their Synthetix synth positions in
**Balancer V1** and **Curve**, so we'll reference these two app groups in the
`dependencies` array.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumSynthetixFarmContractPositionFetcher
  implements PositionFetcher<ContractPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(SynthetixContractFactory)
    private readonly synthetixContractFactory: SynthetixContractFactory
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<SynthetixStakingRewards>(
      {
        network: Network.ETHEREUM_MAINNET,
        appId: SYNTHETIX_DEFINITION.id,
        groupId: SYNTHETIX_DEFINITION.groups.farm.id,
        dependencies: [
          {
            appId: BALANCER_V1_DEFINITION.id,
            groupIds: [BALANCER_V1_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
          {
            appId: CURVE_DEFINITION.id,
            groupIds: [CURVE_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
        ],
        // ...
      }
    );
  }
}
```

## Define your farm definitions

We'll simply define our farms statically in this case. We'll need to know the
contract address of the farm, and the addresses for the staked and reward
tokens. Let's define these as follows:

```ts
const FARMS = [
  // iBTC
  {
    address: "0x167009dcda2e49930a71712d956f02cc980dcc1b",
    stakedTokenAddress: "0xd6014ea05bde904448b743833ddf07c3c7837481",
    rewardTokenAddresses: ["0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f"],
  },
  // iETH
  {
    address: "0x6d4f135af7dfcd4bdf6dcb9d7911f5d243872a52",
    stakedTokenAddress: "0xa9859874e1743a32409f75bb11549892138bba1e",
    rewardTokenAddresses: ["0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f"],
  },
  // iETH
  {
    address: "0x3f27c540adae3a9e8c875c61e3b970b559d7f65d",
    stakedTokenAddress: "0xa9859874e1743a32409f75bb11549892138bba1e",
    rewardTokenAddresses: ["0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f"],
  },
  // BPT sUSD / sTSLA
  {
    address: "0xf0de877f2f9e7a60767f9ba662f10751566ad01c",
    stakedTokenAddress: "0x055db9aff4311788264798356bbf3a733ae181c6", // sTSLA
    rewardTokenAddresses: ["0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f"],
  },
  // CRV EURS / sEUR
  {
    address: "0xc0d8994cd78ee1980885df1a0c5470fc977b5cfe",
    stakedTokenAddress: "0x194ebd173f6cdace046c53eacce9b953f28411d1",
    rewardTokenAddresses: ["0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f"],
  },
];
```

## Add `resolveFarmDefinitions` parameter

We'll use the `resolveFarmDefinitions` factory method to specify the definitions
as described in the previous section. We could also have used
`resolveFarmAddresses`, and dynamically resolve the addresses of the staked
token address and the reward token addresses, but since we know these values are
static, we can simply hardcode these in our position fetcher.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumSynthetixFarmContractPositionFetcher
  implements PositionFetcher<ContractPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(SynthetixContractFactory)
    private readonly synthetixContractFactory: SynthetixContractFactory
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<SynthetixStakingRewards>(
      {
        network: Network.ETHEREUM_MAINNET,
        appId: SYNTHETIX_DEFINITION.id,
        groupId: SYNTHETIX_DEFINITION.groups.farm.id,
        dependencies: [
          {
            appId: BALANCER_V1_DEFINITION.id,
            groupIds: [BALANCER_V1_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
          {
            appId: CURVE_DEFINITION.id,
            groupIds: [CURVE_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
        ],
        resolveFarmDefinitions: async () => FARMS,
        // ...
      }
    );
  }
}
```

## Add `resolveFarmContract` parameter

We'll use the `resolveFarmContract` method as a factory that returns an instance
of the `SynthetixStakingRewards` contract for a given address and network.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumSynthetixFarmContractPositionFetcher
  implements PositionFetcher<ContractPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(SynthetixContractFactory)
    private readonly synthetixContractFactory: SynthetixContractFactory
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<SynthetixStakingRewards>(
      {
        network: Network.ETHEREUM_MAINNET,
        appId: SYNTHETIX_DEFINITION.id,
        groupId: SYNTHETIX_DEFINITION.groups.farm.id,
        dependencies: [
          {
            appId: BALANCER_V1_DEFINITION.id,
            groupIds: [BALANCER_V1_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
          {
            appId: CURVE_DEFINITION.id,
            groupIds: [CURVE_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
        ],
        resolveFarmDefinitions: async () => FARMS,
        resolveFarmContract: ({ network, address }) =>
          this.synthetixContractFactory.synthetixStakingRewards({
            network,
            address,
          }),
        // ...
      }
    );
  }
}
```

## Add `resolveIsActive` parameter

We'll use the `resolveIsActive` method to resolve if the farm is active, that
is, if the farm is still emitting rewards to users with staked tokens. In the
case of Synthetix `StakingRewards` contracts, there's a `periodFinish` method
that returns the timestamp at which rewards are over.

We can use the `SynthetixSingleStakingIsActiveStrategy` helper class to build a
method that will check this value against the current time and determine if the
farm is active or not.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher
  implements PositionFetcher<ContractPosition>
{
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<SynthetixStakingRewards>(
      {
        network: Network.ETHEREUM_MAINNET,
        appId: SYNTHETIX_DEFINITION.id,
        groupId: SYNTHETIX_DEFINITION.groups.farm.id,
        dependencies: [
          {
            appId: BALANCER_V1_DEFINITION.id,
            groupIds: [BALANCER_V1_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
          {
            appId: CURVE_DEFINITION.id,
            groupIds: [CURVE_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
        ],
        resolveFarmDefinitions: async () => FARMS,
        resolveFarmContract: ({ network, address }) =>
          this.synthetixContractFactory.synthetixStakingRewards({
            network,
            address,
          }),
        resolveIsActive: this.synthetixSingleStakingIsActiveStrategy.build({
          resolvePeriodFinish: ({ contract, multicall }) =>
            multicall.wrap(contract).periodFinish(),
        }),
        // ...
      }
    );
  }
}
```

## Add `resolveRois` parameter

We'll use the `resolveRois` method to resolve the return on investment as a
percentage of the total staked value. The Synthetix `StakingReward` contracts
expose a `rewardRate` method which specifies the amount of reward token emitted
per second.

We can use the `SynthetixSingleStakingRoiStrategy` helper class to build a
method that will calculate the return on investment as a percentage relative to
the staked amount.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher
  implements PositionFetcher<ContractPosition>
{
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<SynthetixStakingRewards>(
      {
        network: Network.ETHEREUM_MAINNET,
        appId: SYNTHETIX_DEFINITION.id,
        groupId: SYNTHETIX_DEFINITION.groups.farm.id,
        dependencies: [
          {
            appId: BALANCER_V1_DEFINITION.id,
            groupIds: [BALANCER_V1_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
          {
            appId: CURVE_DEFINITION.id,
            groupIds: [CURVE_DEFINITION.groups.pool.id],
            network: Network.ETHEREUM_MAINNET,
          },
        ],
        resolveFarmDefinitions: async () => FARMS,
        resolveFarmContract: ({ network, address }) =>
          this.synthetixContractFactory.synthetixStakingRewards({
            network,
            address,
          }),
        resolveIsActive: this.synthetixSingleStakingIsActiveStrategy.build({
          resolvePeriodFinish: ({ contract, multicall }) =>
            multicall.wrap(contract).periodFinish(),
        }),
        resolveRois: this.synthetixSingleStakingRoiStrategy.build({
          resolveRewardRates: ({ contract, multicall }) =>
            multicall.wrap(contract).rewardRate(),
        }),
      }
    );
  }
}
```

We're done!
