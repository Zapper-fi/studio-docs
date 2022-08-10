---
sidebar_position: 4
---

# Uniswap V2 Fork Pool Token

[Uniswap V2](https://learn.zapper.fi/articles/what-is-a-liquidity-pool) is one
of the most well known _decentralized exchanges_ in Web3. It pioneered the
automated market maker space, enabling users to quickly spin up their own token
pairs to enable swaps and earn fees.

The protocol itself is quite simple, and consists of a `Router`, a `Factory`,
and any number of `Pairs` created by the factory. Because of its simplicity and
success, Uniswap V2 is often forked to spin up DEXes, especially on other L2s
and sidechains. For example, **PancakeSwap** began as a Uniswap V2 fork on
**Binance Smart Chain**, and quickly even outgrew the total number of pairs that
Uniswap V2 had registered.

## Add a dependency to the `UniswapV2AppModule` in your app module

The `UniswapV2AppModule` exposes the helper class that we need to build these
positions. Let's open our app module in
`src/apps/trader-joe/trader-joe.module.ts` and modify the `imports` key in the
module decorator.

```ts
@Register.AppModule({
  appId: TRADER_JOE_DEFINITION.id,
  imports: [UniswapV2AppModule],
  providers: [
    // ...
  ],
})
export class TraderJoeAppModule extends AbstractApp() {}
```

## Using the `UniswapV2PoolTokenHelper`

The `UniswapV2PoolTokenHelper` helper class can be used to build a list of
`AppTokenPosition` objects for a Uniswap V2 fork pool token group. In this
example, we'll look at **TraderJoe**, the largest DEX on the **Avalanche**
network at the time of writing.

First, let's generate a new token fetcher with
`pnpm studio create-token-fetcher trader-joe`. When prompted for a group, select
`Create New`, then enter `pool` as the ID and `Pools` as the label. When
prompted for a network, select `avalanche`.

Let's now open up our newly generator boilerplate in
`src/apps/trader-joe/avalanche/trader-joe.pool.token-fetcher.ts`:

```ts
import { Inject } from "@nestjs/common";

import { IAppToolkit, APP_TOOLKIT } from "~app-toolkit/app-toolkit.interface";
import { Register } from "~app-toolkit/decorators";
import { PositionFetcher } from "~position/position-fetcher.interface";
import { AppTokenPosition } from "~position/position.interface";
import { Network } from "~types/network.interface";

import { TraderJoeContractFactory } from "../contracts";
import { TRADER_JOE_DEFINITION } from "../trader-joe.definition";

const appId = TRADER_JOE_DEFINITION.id;
const groupId = TRADER_JOE_DEFINITION.groups.pool.id;
const network = Network.AVALANCHE_MAINNET;

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory
  ) {}

  async getPositions() {
    return [];
  }
}
```

## Inject and reference the helper class through the `UniswapV2PoolTokenHelper`

We'll inject the `UniswapV2PoolTokenHelper` exported by the
`UniswapV2AppModule`. We'll call the `getPositions` method on this helper class.

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens({
      // ...
    });
  }
}
```

## Add `appId`, `groupId`, and `network` parameters

We'll specify our `appId`, `groupId`, and `network` identifiers. These should
match the values specified in the `@Register.TokenPositionFetcher` decorator.

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      // ...
    });
  }
}
```

## Add `dependencies` parameter

We'll use the `dependencies` parameter to specify which token groups are
required as dependencies for building this set of pool tokens. In the case of
**Trader Joe**, there are pools of the `sAVAX` liquid staking token from the
BenQi protocol, so we'll reference this app group in the `dependencies` array.

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      // ...
    });
  }
}
```

## Add `factoryAddress` parameter

In Uniswap V2 forks, the `factoryAddress` is the deployed address of the factory
contract that can be called to create a new pool. Let's go ahead and add this
property:

```ts
@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      factoryAddress: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
      // ...
    });
  }
}
```

## Add `resolveFactoryContract` parameter

We'll need to know what contract to use to make requests to the factory address.
Grab the ABI JSON from
[here](https://snowtrace.io/address/0x9ad6c38be94206ca50bb0d90783181662f0cfa10),
then put it in `src/apps/trader-joe/contracts/abi/trader-joe-pool-factory.json`.
Next, run `pnpm studio generate:contract-factory trader-joe` to rebuild the
contract factory.

Now, we'll reference `TraderJoePoolFactory` as a generic to the `getPositions`
call, allowing us to safely type our `resolveFactoryContract` callback. Let's
see what this looks like:

```ts
// ...
import { TraderJoePoolFactory } from "../contracts";
// ...

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens<TraderJoePoolFactory>({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      factoryAddress: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
      resolveFactoryContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePoolFactory({
          address,
          network,
        }),
      // ...
    });
  }
}
```

## Add `resolvePoolContract` parameter

We'll need to know what contract to use to make requests to each pool address.
Grab the ABI JSON from any pool address,
[here](https://snowtrace.io/address/0xf4003f4efbe8691b60249e6afbd307abe7758adb),
then put it in `src/apps/trader-joe/contracts/abi/trader-joe-pool.json`. Next,
run `pnpm studio generate:contract-factory trader-joe` to rebuild the contract
factory.

Now, we'll reference `TraderJoePool` as the second generic to the `getPositions`
call, allowing us to safely type our `resolvePoolContract` callback. Let's see
what this looks like:

```ts
// ...
import { TraderJoePool } from "../contracts";
// ...

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens<
      TraderJoePoolFactory,
      TraderJoePool
    >({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      factoryAddress: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
      resolveFactoryContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePoolFactory({
          address,
          network,
        }),
      resolvePoolContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePool({ address, network }),
      // ...
    });
  }
}
```

## Add `resolvePoolTokenAddresses` parameter

We'll use the `resolvePoolTokenAddresses` parameter to define how our helper
class will retrieve pool addresses. We have two options available in the Uniswap
V2 module:

- The `UniswapV2TheGraphPoolTokenAddressStrategy` strategy class, which uses
  **TheGraph** to retrieve the pool addresses with the highest liquidity.
- The `UniswapV2OnChainPoolTokenAddressStrategy` strategy class, which uses
  calls to the factory contract to retrieve all pool addresses.

We generally don't care about retrieving _all_ of the pools available on the
protocol because most of the liquidity is usually concentrated in the top 10% of
pools. For example, in **Uniswap V2**, we index the top 3000 pools, even though
there's over sixty thousand pools in the protocol!

We'll follow the same strategy in this example, and use the
`UniswapV2TheGraphPoolTokenAddressStrategy` to query a subgraph that has indexed
all of the Trader Joe pools, and pull the top 500 pools by total value locked.

Inject the `UniswapV2TheGraphPoolTokenAddressStrategy` strategy class that is
also exported by the `UniswapV2AppModule`, and call the `build` function to
create a callback to assign to the `resolvePoolTokenAddresses` parameter.

```ts
// ...
import { UniswapV2TheGraphPoolTokenAddressStrategy } from "~apps/uniswap-v2/helpers/uniswap-v2.the-graph.pool-token-address-strategy";
// ...

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper,
    @Inject(UniswapV2TheGraphPoolTokenAddressStrategy)
    private readonly uniswapV2TheGraphPoolTokenAddressStrategy: UniswapV2TheGraphPoolTokenAddressStrategy
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens<TraderJoePoolFactory>({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      factoryAddress: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
      resolveFactoryContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePoolFactory({
          address,
          network,
        }),
      resolvePoolContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePool({ address, network }),
      resolvePoolTokenAddresses:
        this.uniswapV2TheGraphPoolTokenAddressStrategy.build({
          subgraphUrl:
            "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
          first: 500,
        }),
      // ...
    });
  }
}
```

## Add `resolvePoolTokenSymbol` parameter

We'll use the `resolvePoolTokenSymbol` parameter to define how our helper class
will retrieve the symbol for each pool token. In our case, we'll call the
`symbol` method on the pool token contract.

```ts
// ...
import { UniswapV2TheGraphPoolTokenAddressStrategy } from "~apps/uniswap-v2/helpers/uniswap-v2.the-graph.pool-token-address-strategy";
// ...

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper,
    @Inject(UniswapV2TheGraphPoolTokenAddressStrategy)
    private readonly uniswapV2TheGraphPoolTokenAddressStrategy: UniswapV2TheGraphPoolTokenAddressStrategy
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens<TraderJoePoolFactory>({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      factoryAddress: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
      resolveFactoryContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePoolFactory({
          address,
          network,
        }),
      resolvePoolContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePool({ address, network }),
      resolvePoolTokenAddresses:
        this.uniswapV2TheGraphPoolTokenAddressStrategy.build({
          subgraphUrl:
            "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
          first: 500,
        }),
      resolvePoolTokenSymbol: ({ multicall, poolContract }) =>
        multicall.wrap(poolContract).symbol(),
      // ...
    });
  }
}
```

## Add `resolvePoolTokenSupply` parameter

We'll use the `resolvePoolTokenSupply` parameter to define how our helper class
will retrieve the supply for each pool token. In our case, we'll call the
`totalSupply` method on the pool token contract.

```ts
// ...
import { UniswapV2TheGraphPoolTokenAddressStrategy } from "~apps/uniswap-v2/helpers/uniswap-v2.the-graph.pool-token-address-strategy";
// ...

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper,
    @Inject(UniswapV2TheGraphPoolTokenAddressStrategy)
    private readonly uniswapV2TheGraphPoolTokenAddressStrategy: UniswapV2TheGraphPoolTokenAddressStrategy
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens<TraderJoePoolFactory>({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      factoryAddress: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
      resolveFactoryContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePoolFactory({
          address,
          network,
        }),
      resolvePoolContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePool({ address, network }),
      resolvePoolTokenAddresses:
        this.uniswapV2TheGraphPoolTokenAddressStrategy.build({
          subgraphUrl:
            "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
          first: 500,
        }),
      resolvePoolTokenSymbol: ({ multicall, poolContract }) =>
        multicall.wrap(poolContract).symbol(),
      resolvePoolTokenSupply: ({ multicall, poolContract }) =>
        multicall.wrap(poolContract).totalSupply(),
      // ...
    });
  }
}
```

## Add `resolvePoolUnderlyingTokenAddresses` parameter

We'll use the `resolvePoolReserves` parameter to define how our helper class
will resolve the addresses of the tokens exchanged in our pool. In our case,
we'll call the `token0` and `token1` methods, and return the result as an
ordered tuple.

```ts
// ...
import { UniswapV2TheGraphPoolTokenAddressStrategy } from "~apps/uniswap-v2/helpers/uniswap-v2.the-graph.pool-token-address-strategy";
// ...

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper,
    @Inject(UniswapV2TheGraphPoolTokenAddressStrategy)
    private readonly uniswapV2TheGraphPoolTokenAddressStrategy: UniswapV2TheGraphPoolTokenAddressStrategy
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens<TraderJoePoolFactory>({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      factoryAddress: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
      resolveFactoryContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePoolFactory({
          address,
          network,
        }),
      resolvePoolContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePool({ address, network }),
      resolvePoolTokenAddresses:
        this.uniswapV2TheGraphPoolTokenAddressStrategy.build({
          subgraphUrl:
            "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
          first: 500,
        }),
      resolvePoolTokenSymbol: ({ multicall, poolContract }) =>
        multicall.wrap(poolContract).symbol(),
      resolvePoolTokenSupply: ({ multicall, poolContract }) =>
        multicall.wrap(poolContract).totalSupply(),
      resolvePoolUnderlyingTokenAddresses: async ({
        multicall,
        poolContract,
      }) =>
        Promise.all([
          multicall.wrap(poolContract).token0(),
          multicall.wrap(poolContract).token1(),
        ]),
      // ...
    });
  }
}
```

## Add `resolvePoolReserves` parameter

We'll use the `resolvePoolReserves` parameter to define how our helper class
will retrieve the reserves of each of the tokens in our pool. In our case, we'll
call the `getReserves` method, and return an ordered tuple of the raw reserves
in the same order as the underlying token addresses in the previous step.

```ts
// ...
import { UniswapV2TheGraphPoolTokenAddressStrategy } from "~apps/uniswap-v2/helpers/uniswap-v2.the-graph.pool-token-address-strategy";
// ...

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper,
    @Inject(UniswapV2TheGraphPoolTokenAddressStrategy)
    private readonly uniswapV2TheGraphPoolTokenAddressStrategy: UniswapV2TheGraphPoolTokenAddressStrategy
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens<TraderJoePoolFactory>({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      factoryAddress: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
      resolveFactoryContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePoolFactory({
          address,
          network,
        }),
      resolvePoolContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePool({ address, network }),
      resolvePoolTokenAddresses:
        this.uniswapV2TheGraphPoolTokenAddressStrategy.build({
          subgraphUrl:
            "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
          first: 500,
        }),
      resolvePoolTokenSymbol: ({ multicall, poolContract }) =>
        multicall.wrap(poolContract).symbol(),
      resolvePoolTokenSupply: ({ multicall, poolContract }) =>
        multicall.wrap(poolContract).totalSupply(),
      resolvePoolUnderlyingTokenAddresses: async ({
        multicall,
        poolContract,
      }) =>
        Promise.all([
          multicall.wrap(poolContract).token0(),
          multicall.wrap(poolContract).token1(),
        ]),
      resolvePoolReserves: async ({ multicall, poolContract }) =>
        multicall
          .wrap(poolContract)
          .getReserves()
          .then((v) => [v._reserve0, v._reserve1]),
      // ...
    });
  }
}
```

## Add `resolvePoolReserves` parameter

We'll use the `resolvePoolReserves` parameter to define how our helper class
will retrieve the reserves of each of the tokens in our pool. In our case, we'll
call the `getReserves` method, and return an ordered tuple of the raw reserves
in the same order as the underlying token addresses in the previous step.

```ts
// ...
import { UniswapV2TheGraphPoolTokenAddressStrategy } from "~apps/uniswap-v2/helpers/uniswap-v2.the-graph.pool-token-address-strategy";
// ...

@Register.TokenPositionFetcher({ appId, groupId, network })
export class AvalancheTraderJoePoolTokenFetcher
  implements PositionFetcher<AppTokenPosition>
{
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(TraderJoeContractFactory)
    private readonly traderJoeContractFactory: TraderJoeContractFactory,
    @Inject(UniswapV2PoolTokenHelper)
    private readonly uniswapV2PoolTokenHelper: UniswapV2PoolTokenHelper,
    @Inject(UniswapV2TheGraphPoolTokenAddressStrategy)
    private readonly uniswapV2TheGraphPoolTokenAddressStrategy: UniswapV2TheGraphPoolTokenAddressStrategy
  ) {}

  async getPositions() {
    return this.uniswapV2PoolTokenHelper.getTokens<TraderJoePoolFactory>({
      network: Network.AVALANCHE,
      appId: TRADER_JOE_DEFINITION.id,
      groupId: TRADER_JOE_DEFINITION.groups.pool.id,
      dependencies: [
        {
          appId: BENQI_DEFINITION.id,
          groupIds: [BENQI_DEFINITION.groups.sAvax.id],
          network: Network.AVALANCHE,
        },
      ],
      factoryAddress: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10",
      resolveFactoryContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePoolFactory({
          address,
          network,
        }),
      resolvePoolContract: ({ address, network }) =>
        this.traderJoeContractFactory.traderJoePool({ address, network }),
      resolvePoolTokenAddresses:
        this.uniswapV2TheGraphPoolTokenAddressStrategy.build({
          subgraphUrl:
            "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
          first: 500,
        }),
      resolvePoolTokenSymbol: ({ multicall, poolContract }) =>
        multicall.wrap(poolContract).symbol(),
      resolvePoolTokenSupply: ({ multicall, poolContract }) =>
        multicall.wrap(poolContract).totalSupply(),
      resolvePoolUnderlyingTokenAddresses: async ({
        multicall,
        poolContract,
      }) =>
        Promise.all([
          multicall.wrap(poolContract).token0(),
          multicall.wrap(poolContract).token1(),
        ]),
      resolvePoolReserves: async ({ multicall, poolContract }) =>
        multicall
          .wrap(poolContract)
          .getReserves()
          .then((v) => [v._reserve0, v._reserve1]),
    });
  }
}
```

## Add any other optional parameters

We're done, but you may find it useful to use any of the other optional
parameters to adjust the behaviour of the helper class.

- You can use the `fee` parameter to override the default swap fee, which is
  0.3%, the default constant swap fee in Uniswap V2.
- You can use the `hiddenTokens` parameter to ignore pools that have any of
  these as an underlying token.
- You can use the `minLiquidity` parameter to set a floor for the liquidity of
  the pools retrieved.
- You can use `resolveDerivedUnderlyingToken` with the
  `UniswapV2OnChainTokenDerivationStrategy` class to resolve prices for unknown
  tokens with other pools in the same protocol. For example, if `FOO` token is
  found in a pool, but Zapper does not know the price, we can look for a pair
  like `FOO / USDC` or `FOO / WETH` to infer the price.
- You can use `resolvePoolVolumes` with `UniswapV2TheGraphPoolVolumeStrategy` to
  retrieve trading volumes from **TheGraph** for your tokens, to be able to
  capture trending pools in the Zapper UI.
- You can use `resolveTokenDisplayPrefix` and `resolveTokenDisplaySymbol` to
  override the default behaviour of building the token display label.

Remember, we want to build an experience that is friendly and expressive to our
users!
