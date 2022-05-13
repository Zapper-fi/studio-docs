---
sidebar_position: 2
---

# Single Staking Farm

Web3 applications often incentivize holding tokens through _yield farming_. A **Single Staking Farm** is a smart contract that allows a user to deposit a single token and accumulate rewards over time. These rewards are claimable through the same smart contract interface.

For example, a user can deposit their **Curve** liquidity pool tokens in a **Gauge** staking contract. Over time, the user will accumulate `CRV` tokens as an incentive for providing liquidity to Curve.

## Using the `SingleStakingFarmContractPositionHelper`

The `SingleStakingFarmContractPositionHelper` helper class can be used to build a list of `ContractPosition` objects for a farm contract position group. In this example, we'll look at **Curve** LP token staking. 

**Curve** allows Curve LP token holders to stake their position to receive `CRV` and potentially other bonus reward tokens. Curve supports several different implementations of farm contracts, so for the purposes of this recipe, we'll specifically look at the `nGauge` implementation. This implementation is used for many newer Curve opportunities like the `rETH / ETH` pool.

First, let's generate a new contract position fetcher with `yarn studio create-contract-position-fetcher curve`. When prompted for a group, select `Create New`, then enter `farm` as the ID and `Farms` as the label. When prompted for a network, select `ethereum`.

Let's now open up our newly generator boilerplate in `src/apps/curve/ethereum/curve.farm.contract-position-fetcher.ts`:

```ts
import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { PositionFetcher } from '~position/position-fetcher.interface';
import { ContractPosition } from '~position/position.interface';
import { Network } from '~types/network.interface';

import { CurveContractFactory } from '../contracts';
import { CURVE_DEFINITION } from '../curve.definition';

const appId = CURVE_DEFINITION.id;
const groupId = CURVE_DEFINITION.groups.farm.id;
const network = Network.ETHEREUM_MAINNET;

@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(CurveContractFactory) private readonly curveContractFactory: CurveContractFactory,
  ) {}

  async getPositions() {
    return [];
  }
}
```

## Reference the helper class through the AppToolkit

We'll use the `SingleStakingFarmContractPositionHelper` helper class registered in our `AppToolkit` to quickly build the farm contract positions. We'll call the `getPositions` method on this helper class, and pass in the generated **Ethers** contract interface for the **nGauge** contract.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(CurveContractFactory) private readonly curveContractFactory: CurveContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      // ...
    });
  }
}
```

## Add `appId`, `groupId`, and `network` parameters

We'll specify our `appId`, `groupId`, and `network` identifiers. These should match the values specified in the `@Register.ContractPositionFetcher` decorator.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(CurveContractFactory) private readonly curveContractFactory: CurveContractFactory,
  ) {}

  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      appId: CURVE_DEFINITION.id,
      groupId: CURVE_DEFINITION.groups.farm.id,
      network: Network.ETHEREUM_MAINNET,
      // ...
    });
  }
}
```

## Add `dependencies` parameter

We'll use the `dependencies` parameter to specify which token groups are required as dependencies for building this set of farm contract positions. In the case of **Curve**, we deposit LP tokens into the Gauge staking contracts, so we'll reference the group in the `dependencies` array.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      appId: CURVE_DEFINITION.id,
      groupId: CURVE_DEFINITION.groups.farm.id,
      network: Network.ETHEREUM_MAINNET,
      dependencies: [{ appId: CURVE_DEFINITION.id, groupIds: [CURVE_DEFINITION.groups.pool.id], network }],
      // ...
    });
  }
}
```

## Add `resolveFarmAddresses` parameter

We'll use the `resolveFarmAddresses` factory method to specify the addresses for the farm contracts. We could define these statically, but that static list would then need to be updated every time Curve adds a new farm contract.

Instead, we'll resolve the addresses from the Curve **factory contract**. Let's build a method to resolve the guage addresses.

> **_NOTE:_** We build helper classes to encapsulate and reuse this logic in the implementation for Curve in Studio; the example displayed here is simplified.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      appId: CURVE_DEFINITION.id,
      groupId: CURVE_DEFINITION.groups.farm.id,
      network: Network.ETHEREUM_MAINNET,
      dependencies: [{ appId: CURVE_DEFINITION.id, groupIds: [CURVE_DEFINITION.groups.pool.id], network }],
      resolveFarmAddresses: () => {
        const multicall = this.appToolkit.getMulticall(network);
        const factoryAddress = '0xb9fc157394af804a3578134a6585c0dc9cc990d4';
        const factoryContract = this.curveContractFactory.curveFactoryV2({ address: factoryAddress, network });

        const poolTokens = await this.appToolkit.getAppTokenPositions<CurvePoolTokenDataProps>({
          appId: CURVE_DEFINITION.id,
          groupIds: [CURVE_DEFINITION.groups.pool.id],
          network,
        });

        const maybeGaugeAddresses = await Promise.all(
          poolTokens.map(async poolToken => {
            const gaugeAddressRaw = await multicall.wrap(factoryContract).get_gauge(poolTokens.address);
            const gaugeAddress = gaugeAddressRaw.toLowerCase();
            return gaugeAddress;
          }),
        );

        return maybeGaugeAddresses.filter(v => v !== ZERO_ADDRESS);
      },
      // ...
    });
  }
}
```

## Add `resolveFarmContract` parameter

We'll use the `resolveFarmContract` method as a factory that returns an instance of the `CurveNGauge` contract for a given address and network.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      appId: CURVE_DEFINITION.id,
      groupId: CURVE_DEFINITION.groups.farm.id,
      network: Network.ETHEREUM_MAINNET,
      dependencies: [{ appId: CURVE_DEFINITION.id, groupIds: [CURVE_DEFINITION.groups.pool.id], network }],
      resolveFarmAddresses: () => { /* ... */ },
      resolveFarmContract: ({ address, network }) => this.curveContractFactory.curveNGauge({ address, network }),
      // ....
    });
  }
}
```

## Add `resolveStakedTokenAddress` parameter

We'll use the `resolveStakedTokenAddress` method to resolve the address of the token that can be staked in this contract. In the case of the Curve nGauge contracts, we can simply call the `lp_token` method on the contract to get this value.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      appId: CURVE_DEFINITION.id,
      groupId: CURVE_DEFINITION.groups.farm.id,
      network: Network.ETHEREUM_MAINNET,
      dependencies: [{ appId: CURVE_DEFINITION.id, groupIds: [CURVE_DEFINITION.groups.pool.id], network }],
      resolveFarmAddresses: () => { /* ... */ },
      resolveFarmContract: ({ address, network }) => this.curveContractFactory.curveNGauge({ address, network }),
      resolveStakedTokenAddress: ({ contract, multicall }) => multicall.wrap(contract).lp_token(),
      // ...
    });
  }
}
```

## Add `resolveRewardTokenAddresses` parameter

We'll use the `resolveStakedTokenAddress` method to resolve the address(es) of the tokens that can be claimed as rewards in this contract. In the case of the Curve nGauge contracts, we know that there is an emission of `CRV` tokens, and possibly a bonus reward token. This bonus reward token can be resolved by calling the `reward_tokens` method on the smart contract.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      appId: CURVE_DEFINITION.id,
      groupId: CURVE_DEFINITION.groups.farm.id,
      network: Network.ETHEREUM_MAINNET,
      dependencies: [{ appId: CURVE_DEFINITION.id, groupIds: [CURVE_DEFINITION.groups.pool.id], network }],
      resolveFarmAddresses: () => { /* ... */ },
      resolveFarmContract: ({ address, network }) => this.curveContractFactory.curveNGauge({ address, network }),
      resolveStakedTokenAddress: ({ contract, multicall }) => multicall.wrap(contract).lp_token(),
      resolveRewardTokenAddresses: async ({ contract, multicall }) => {
        const CRV_TOKEN_ADDRESS = '0xd533a949740bb3306d119cc777fa900ba034cd52';
        const bonusRewardTokenAddress = await multicall.wrap(contract).reward_tokens(0);
        return [CRV_TOKEN_ADDRESS, bonusRewardTokenAddress].filter(v => v !== ZERO_ADDRESS);
      },
    });
  }
}
```

## Add `resolveTotalValueLocked` parameter

<!-- @TODO: The name `totalValueLocked` implies USD... refactor the name  -->

We'll use the `resolveTotalValueLocked` method to resolve the total amount of tokens locked in the contract. In the case of the nGauge contracts, this amount can be retrieved using the `totalSupply()` method on the smart contract. The helper class will use this value and the price of the staked token to determine the total value locked in USD.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      appId: CURVE_DEFINITION.id,
      groupId: CURVE_DEFINITION.groups.farm.id,
      network: Network.ETHEREUM_MAINNET,
      dependencies: [{ appId: CURVE_DEFINITION.id, groupIds: [CURVE_DEFINITION.groups.pool.id], network }],
      resolveFarmAddresses: () => { /* ... */ },
      resolveFarmContract: ({ address, network }) => this.curveContractFactory.curveNGauge({ address, network }),
      resolveStakedTokenAddress: ({ contract, multicall }) => multicall.wrap(contract).lp_token(),
      resolveRewardTokenAddresses: ({ /* ... */ }) => { /* ... */ },
      resolveTotalValueLocked: ({ contract, multicall }) => multicall.wrap(contract).totalSupply(),
      // ...
    });
  }
}
```

## Add `resolveIsActive` parameter

We'll use the `resolveIsActive` method to resolve if the farm is active, that is, if the farm is still emitting rewards to users with staked tokens. In the case of Curve nGauge contracts, there's an `inflation_rate` that dictates the rate at which `CRV` token is emitted on this contract. If this is non-zero, we can consider the farm active.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      appId: CURVE_DEFINITION.id,
      groupId: CURVE_DEFINITION.groups.farm.id,
      network: Network.ETHEREUM_MAINNET,
      dependencies: [{ appId: CURVE_DEFINITION.id, groupIds: [CURVE_DEFINITION.groups.pool.id], network }],
      resolveFarmAddresses: () => { /* ... */ },
      resolveFarmContract: ({ address, network }) => this.curveContractFactory.curveNGauge({ address, network }),
      resolveStakedTokenAddress: ({ contract, multicall }) => multicall.wrap(contract).lp_token(),
      resolveRewardTokenAddresses: ({ /* ... */ }) => { /* ... */ },
      resolveTotalValueLocked: ({ contract, multicall }) => multicall.wrap(contract).totalSupply(),
      resolveIsActive: async ({ contract, multicall }) => {
        const inflationRate = await multicall.wrap(contract).inflation_rate();
        return Number(inflationRate) > 0;
      },
      // ...
    });
  }
}
```

## Add `resolveRois` parameter

We'll use the `resolveRois` method to resolve the return on investment as a percentage of the total staked value. For the sake of simplicity, we'll only consider the ROI on the emitted `CRV` token. The gauge has a weight relative to the total working supply, so we'll use this as a fraction to determine the percentage of the emitted `CRV` token for this farm.

```ts
@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumCurveFarmContractPositionFetcher implements PositionFetcher<ContractPosition> {
  async getPositions() {
    return this.appToolkit.helpers.singleStakingFarmContractPositionHelper.getContractPositions<CurveNGauge>({
      appId: CURVE_DEFINITION.id,
      groupId: CURVE_DEFINITION.groups.farm.id,
      network: Network.ETHEREUM_MAINNET,
      dependencies: [{ appId: CURVE_DEFINITION.id, groupIds: [CURVE_DEFINITION.groups.pool.id], network }],
      resolveFarmAddresses: () => { /* ... */ },
      resolveFarmContract: ({ address, network }) => this.curveContractFactory.curveNGauge({ address, network }),
      resolveStakedTokenAddress: ({ contract, multicall }) => multicall.wrap(contract).lp_token(),
      resolveRewardTokenAddresses: ({ /* ... */ }) => { /* ... */ },
      resolveTotalValueLocked: ({ contract, multicall }) => multicall.wrap(contract).totalSupply(),
      resolveIsActive: ({ /* ... */ }) => { /* ... */ },
      resolveRois: async ({ address, contract, multicall, rewardTokens, stakedToken, network }) => {
        const controllerContract = this.curveContractFactory.curveController({
          address: '0x2f50d538606fa9edd2b11e2446beb18c9d5846bb',
          network,
        });

        const [inflationRate, workingSupply, relativeWeight] = await Promise.all([
          multicall.wrap(gaugeContract).inflation_rate().then(v => Number(v) / 10 ** 18),
          multicall.wrap(gaugeContract).working_supply().then(v => Number(v) / 10 ** 18),
          multicall.wrap(controllerContract)['gauge_relative_weight(address)'](address).then(v => Number(v) / 10 ** 18),
        ]);

        const dailyROI =
          ((((inflationRate * relativeWeight * 86400) / workingSupply) * 0.4) / stakedToken.price) *
          rewardTokens[0].price;
        const weeklyROI =
          ((((inflationRate * relativeWeight * 604800) / workingSupply) * 0.4) / stakedToken.price) *
          rewardTokens[0].price;
        const yearlyROI =
          ((((inflationRate * relativeWeight * 31536000) / workingSupply) * 0.4) / stakedToken.price) *
          rewardTokens[0].price;

        return {
          dailyROI,
          weeklyROI,
          yearlyROI,
        };
      }
    });
  }
}
```

We're done! The helper will do most of the work for you to build the farm contract positions.