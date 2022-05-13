---
sidebar_position: 1
---

# Vault Token

In DeFi, a **Vault Token** represents an _auto-compounding_ tokenized position. For example, imagine you had a **Curve** liquidity pool token that represented a deposit in the `stETH` and `ETH` pool. You could manually deposit this into the Curve staking contract, and manually harvest the rewards periodically, but this would be costly on gas.

Instead, protocols like **Yearn** build **Vault Tokens** to lump users' funds together, deposit them into a yield-bearing strategy, and periodically harvest the rewards. The harvested rewards are sold to buy more of the deposited token, resulting in the user's deposit increasing over time.

## Using the `VaultTokenHelper`

The `VaultTokenHelper` helper class can be used to build a list of `AppToken` objects for a vault token group. In this example, we'll look at `xJOE`, which is a vault token that progressively gives the holder an increasing amount of `JOE` token over time.

First, let's generate a new token fetcher with `yarn studio create-token-fetcher trader-joe`. When prompted for a group, select `Create New`, then enter `x-joe` as the ID and `xJOE` as the label. When prompted for a network, select `avalanche`.

Let's now open up our newly generator boilerplate in `src/apps/trader-joe/avalanche/trader-joe.x-joe.token-fetcher.ts`:

```ts
import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { PositionFetcher } from '~position/position-fetcher.interface';
import { AppTokenPosition } from '~position/position.interface';
import { Network } from '~types/network.interface';

import { TraderJoeContractFactory } from '../contracts';
import { TRADER_JOE_DEFINITION } from '../trader-joe.definition';

const appId = TRADER_JOE_DEFINITION.id;
const groupId = TRADER_JOE_DEFINITION.groups.xJoe.id;
const network = Network.AVALANCHE_MAINNET;

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoeXJoeTokenFetcher implements PositionFetcher<AppTokenPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory) private readonly traderJoeContractFactory: TraderJoeContractFactory,
  ) {}

  async getPositions() {
    return [];
  }
}
```

## Reference the helper class through the AppToolkit

We'll use the `VaultTokenHelper` helper class registered in our `AppToolkit` to quickly build the vault tokens. We'll call the `getTokens` method on this helper class, and pass in the generated **Ethers** contract interface for the xJOE token.

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoeXJoeTokenFetcher implements PositionFetcher<AppTokenPosition> {
  async getPositions() {
    return this.appToolkit.helpers.vaultTokenHelper.getTokens<TraderJoeXJoe>({
      // ...
    });
  }
}
```

## Add `appId`, `groupId`, and `network` parameters

We'll specify our `appId`, `groupId`, and `network` identifiers. These should match the values specified in the `@Register.TokenPositionFetcher` decorator.

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoeXJoeTokenFetcher implements PositionFetcher<AppTokenPosition> {
  async getPositions() {
    return this.appToolkit.helpers.vaultTokenHelper.getTokens<TraderJoeXJoe>({
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.xJoe.id,
      network: Network.AVALANCHE_MAINNET,
      // ...
    });
  }
}
```

## Add `resolveContract` parameter

We'll use the `resolveContract` method as a factory that returns an instance of the `TraderJoeXJoe` contract for a given address and network.

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoeXJoeTokenFetcher implements PositionFetcher<AppTokenPosition> {
  // ...

  async getPositions() {
    return this.appToolkit.helpers.vaultTokenHelper.getTokens<TraderJoeXJoe>({
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.xJoe.id,
      network: Network.AVALANCHE_MAINNET,
      resolveContract: ({ address, network }) => this.traderJoeContractFactory.traderJoeXJoe({ address, network }),
      // ...
    });
  }
}
```

## Add `resolveVaultAddresses` parameter

We'll use the `resolveVaultAddresses` method as a factory that returns the addresses of the vault tokens that should be part of this group. In the case of `xJOE`, we only have one token. In other cases, you may have many more, and they may be resolved from outside sources like APIs, or smart contracts that serve as an address registry.

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoeXJoeTokenFetcher implements PositionFetcher<AppTokenPosition> {
  // ...

  async getPositions() {
    return this.appToolkit.helpers.vaultTokenHelper.getTokens<TraderJoeXJoe>({
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.xJoe.id,
      network: Network.AVALANCHE_MAINNET,
      resolveContract: ({ address, network }) => this.traderJoeContractFactory.traderJoeXJoe({ address, network }),
      resolveVaultAddresses: () => ['0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33'],
      // ...
    });
  }
}
```

## Add `resolveUnderlyingTokenAddress` parameter

We'll use the `resolveUnderlyingTokenAddress` method as a way to indicate how to retrieve the underlying token for the vault token(s). In the case of `xJOE`, we'll call the `joe()` method on the contract instance.

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoeXJoeTokenFetcher implements PositionFetcher<AppTokenPosition> {
  // ...

  async getPositions() {
    return this.appToolkit.helpers.vaultTokenHelper.getTokens<TraderJoeXJoe>({
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.xJoe.id,
      network: Network.AVALANCHE_MAINNET,
      resolveContract: ({ address, network }) => this.traderJoeContractFactory.traderJoeXJoe({ address, network }),
      resolveVaultAddresses: () => ['0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33'],
      resolveUnderlyingTokenAddress: ({ contract, multicall }) => multicall.wrap(contract).joe(),
      // ...
    });
  }
}
```

## Add `resolveReserve` parameter

We'll use `resolveReserve` to determine the amount of the underlying token that is in this vault. Sometimes, the contract will expose a convenience method to retrieve this balance. Often, the underlying token balance is even held by a different smart contract. In the case of `xJOE`, we'll need to use an `ERC20` Ethers contract instance to retrieve the balance using `balanceOf`. 


```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoeXJoeTokenFetcher implements PositionFetcher<AppTokenPosition> {
  // ...

  async getPositions() {
    return this.appToolkit.helpers.vaultTokenHelper.getTokens<TraderJoeXJoe>({
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.xJoe.id,
      network: Network.AVALANCHE_MAINNET,
      resolveContract: ({ address, network }) => this.traderJoeContractFactory.traderJoeXJoe({ address, network }),
      resolveVaultAddresses: () => ['0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33'],
      resolveUnderlyingTokenAddress: ({ contract, multicall }) => multicall.wrap(contract).joe(),
      resolveReserve: async ({ underlyingToken, multicall, address }) =>
        multicall
          .wrap(this.appToolkit.globalContracts.erc20(underlyingToken))
          .balanceOf(address)
          .then(v => Number(v) / 10 ** underlyingToken.decimals),
    });
  }
}
```

## Add `resolvePricePerShare` parameter

Lastly, we'll resolve the ratio between the price of the vault token and the price of the underlying token using `resolvePricePerShare`. In the case of Yearn tokens, there's a convenience method called `pricePerShare()` that can be used to resolve the ratio (in units of wei). In the case of `xJOE`, we'll simply divide the reserve amount by the vault token supply to get the ratio.

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoeXJoeTokenFetcher implements PositionFetcher<AppTokenPosition> {
  // ...

  async getPositions() {
    return this.appToolkit.helpers.vaultTokenHelper.getTokens<TraderJoeXJoe>({
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.xJoe.id,
      network: Network.AVALANCHE_MAINNET,
      resolveContract: ({ address, network }) => this.traderJoeContractFactory.traderJoeXJoe({ address, network }),
      resolveVaultAddresses: () => ['0x57319d41f71e81f3c65f2a47ca4e001ebafd4f33'],
      resolveUnderlyingTokenAddress: ({ contract, multicall }) => multicall.wrap(contract).joe(),
      resolveReserve: async ({ underlyingToken, multicall, address }) =>
        multicall
          .wrap(this.appToolkit.globalContracts.erc20(underlyingToken))
          .balanceOf(address)
          .then(v => Number(v) / 10 ** underlyingToken.decimals),
      resolvePricePerShare: ({ reserve, supply }) => reserve / supply,
    });
  }
}
```

We're done! The helper will do most of the work for you to build the vault tokens.