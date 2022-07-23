---
sidebar_position: 8
---

# TheGraph subgraph GraphQL helper

[The Graph](https://thegraph.com/docs/en/) The Graph is an indexing protocol
for querying networks like Ethereum and IPFS. Anyone can build and publish
open APIs, called subgraphs, making data easily accessible.

## Using the `TheGraphHelper`

The `TheGraphHelper` helper class can be used to query any graphql server
by using the `appToolkit` helpers that is readily provided on all classes

First, let's grab either our `PositionFetcher`, `AppTokenFetcher`, `BalanceFetcher`
or `TvlFetcher` and use `this.appToolkit` to get the instance of `TheGraphHelper`

```ts
import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { PositionFetcher } from '~position/position-fetcher.interface';
import { ContractPosition } from '~position/position.interface';
import { Network } from '~types/network.interface';

import { MeanFinanceContractFactory } from '../contracts';
import { MEAN_FINANCE_DEFINITION } from '../mean-finance.definition';

const appId = MEAN_FINANCE_DEFINITION.id;
const groupId = MEAN_FINANCE_DEFINITION.groups.dcaPosition.id;
const network = Network.POLYGON_MAINNET;

@Register.ContractPositionFetcher({ appId, groupId, network })
export class PolygonMeanFinanceDcaPositionContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(MeanFinanceContractFactory) private readonly meanFinanceContractFactory: MeanFinanceContractFactory,
  ) { }

  async getPositions() {
    const graphHelper = this.appToolkit.helpers.theGraphHelper;
    return [];
  }
}
```

## Create a Graphql query

We'll use this _Graphql_ query to fetch specific data from our subgraph.
Create a `graphql` folder inside your app folder `/src/apps/<YOUR APP>/graphql`,
next we are going to create a file that represents what we are going to fetch.
In our case we are going to fetch all DCA positions from Mean Finance so we'll
be creating the file `/src/apps/<YOUR APP>/graphql/getPositions.ts` and we'll
also create a type for the return of this query.

```ts
import { gql } from 'graphql-request';

type MeanFinancePosition = {
  positions: {
    id: string;
    executedSwaps: string;
    user: string;
    from: {
      address: string;
      decimals: string;
      name: string;
      symbol: string;
    };
    to: {
      address: string;
      decimals: string;
      name: string;
      symbol: string;
    };
    status: string;
    swapInterval: {
      id: string;
      interval: string;
    };
    current: {
      id: string;
      rate: string;
      remainingSwaps: string;
      remainingLiquidity: string;
      idleSwapped: string;
    };
  }[];
};

export const GET_POSITIONS = gql`
  query getPositions {
    positions {
      id
      executedSwaps
      user
      from {
        address: id
        decimals
        name
        symbol
      }
      to {
        address: id
        decimals
        name
        symbol
      }
      status
      swapInterval {
        interval
      }
      current {
        rate
        remainingSwaps
        remainingLiquidity
        idleSwapped
      }
    }
  }
`;
```

## Execute the query

From our fetcher we'll use the `graphHelper` we previously defined to execute
they query using `requestGraph`. This is an async action that will return the
data that we requested on our subgraph.

```ts
import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { PositionFetcher } from '~position/position-fetcher.interface';
import { ContractPosition } from '~position/position.interface';
import { Network } from '~types/network.interface';

import { MeanFinanceContractFactory } from '../contracts';
import { getPositions, MeanFinancePosition } from '../graphql/getPositions'
import { MEAN_FINANCE_DEFINITION } from '../mean-finance.definition';

const appId = MEAN_FINANCE_DEFINITION.id;
const groupId = MEAN_FINANCE_DEFINITION.groups.dcaPosition.id;
const network = Network.POLYGON_MAINNET;

@Register.ContractPositionFetcher({ appId, groupId, network })
export class PolygonMeanFinanceDcaPositionContractPositionFetcher implements PositionFetcher<ContractPosition> {
  constructor(
    @Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit,
    @Inject(MeanFinanceContractFactory) private readonly meanFinanceContractFactory: MeanFinanceContractFactory,
  ) { }

  async getPositions() {
    const graphHelper = this.appToolkit.helpers.theGraphHelper;
    const data = graphHelper.requestGraph<MeanFinancePositions>({
      endpoint: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-polygon',
      query: getPositions,
    })
    const positions = data.positions;

    return [];
  }
}
```

## Execute a query with variables

Lets say that you want your graphql query to just query
the positions created by a specific user, or you want to
send any other variables to the query, you cansend a `variables` property
to the `requestGraph` function.

Lets create our query to get positions for a specific user
this is going to look exactly like the one before, but we are adding
a `user` parameter.

Now we create a `getUserPositions.ts` file inside `/src/apps/<YOUR APP>/graphql`

```ts
import { gql } from 'graphql-request';

type MeanFinancePosition = {
  positions: {
    id: string;
    executedSwaps: string;
    user: string;
    from: {
      address: string;
      decimals: string;
      name: string;
      symbol: string;
    };
    to: {
      address: string;
      decimals: string;
      name: string;
      symbol: string;
    };
    status: string;
    swapInterval: {
      id: string;
      interval: string;
    };
    current: {
      id: string;
      rate: string;
      remainingSwaps: string;
      remainingLiquidity: string;
      idleSwapped: string;
    };
  }[];
};

export const GET_USER_POSITIONS = gql`
  query getUserPositions($address: String!) {
    positions(
      where: {
        user: $address,
      },
    ) {
      id
      executedSwaps
      user
      from {
        address: id
        decimals
        name
        symbol
      }
      to {
        address: id
        decimals
        name
        symbol
      }
      status
      swapInterval {
        interval
      }
      current {
        rate
        remainingSwaps
        remainingLiquidity
        idleSwapped
      }
    }
  }
`;
```

And now from a `BalanceFetcher` we could just send the user address
to the `requestGraph` function inside the `variables` property.

```ts
import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { BalanceFetcher } from '~balance/balance-fetcher.interface';
import { Network } from '~types/network.interface';

import { getUserPositions, MeanFinancePosition } from '../graphql/getUserPositions';
import { MEAN_FINANCE_DEFINITION } from '../mean-finance.definition';

const network = Network.POLYGON_MAINNET;

@Register.BalanceFetcher(MEAN_FINANCE_DEFINITION.id, network)
export class PolygonMeanFinanceBalanceFetcher implements BalanceFetcher {
  constructor(@Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit) { }

  async getUserPositions(address: string) {
    const graphHelper = this.appToolkit.helpers.theGraphHelper;
    const data = graphHelper.requestGraph<MeanFinancePositions>({
      endpoint: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-polygon',
      query: getPositions,
      variables: { address },
    })
    return data.positions;
  }

  async getBalances(address: string) {
    const positions = await this.getUserPositions(address);
  }
}
```

## Fetch an entire collection that is paginated
Graphql allows us to fetch any kind of data, but specifically for Zapper
Studio we are mostly going to be fetching collections of data.
TheGraph sets a maximum limit of 1000 items per query,
this means that we need to go through the list of items with multiple queries
in case there is more than 1000 items that you need to fetch.

For this you can use the `gqlFetchAll` utility from `TheGraphHelper`
it takes the same inputs as `requestGraph` but it does require an additional
property `dataToSearch`. `dataToSearch` refers to the name (in your query)
of the collection name.

It is _required_ for your query to have defined `first` and `lastId`
parameters for the query so the helper can actually go through
the paginated list. You will need to add a `where` clause into the collection
that you are fetching, setting `id_gt: $lastId`

Modifying the example before the new query would look like

```ts
import { gql } from 'graphql-request';

type MeanFinancePosition = {
  positions: {
    id: string;
    executedSwaps: string;
    user: string;
    from: {
      address: string;
      decimals: string;
      name: string;
      symbol: string;
    };
    to: {
      address: string;
      decimals: string;
      name: string;
      symbol: string;
    };
    status: string;
    swapInterval: {
      id: string;
      interval: string;
    };
    current: {
      id: string;
      rate: string;
      remainingSwaps: string;
      remainingLiquidity: string;
      idleSwapped: string;
    };
  }[];
};

export const GET_USER_POSITIONS = gql`
  query getUserPositions($address: String!, $first: Int, $lastId: String) {
    positions(
      where: {
        user: $address,
        id_gt: $lastId,
      },
      first: $first,
    ) {
      id
      executedSwaps
      user
      from {
        address: id
        decimals
        name
        symbol
      }
      to {
        address: id
        decimals
        name
        symbol
      }
      status
      swapInterval {
        interval
      }
      current {
        rate
        remainingSwaps
        remainingLiquidity
        idleSwapped
      }
    }
  }
`;
```

And now from a `BalanceFetcher` we can query the full
list of positions using `gqlFetchAll` instead of `requestGraph`
passing `positions` as the `dataToSearch.

```ts
import { Inject } from '@nestjs/common';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { Register } from '~app-toolkit/decorators';
import { BalanceFetcher } from '~balance/balance-fetcher.interface';
import { Network } from '~types/network.interface';

import { getUserPositions, MeanFinancePosition } from '../graphql/getUserPositions';
import { MEAN_FINANCE_DEFINITION } from '../mean-finance.definition';

const network = Network.POLYGON_MAINNET;

@Register.BalanceFetcher(MEAN_FINANCE_DEFINITION.id, network)
export class PolygonMeanFinanceBalanceFetcher implements BalanceFetcher {
  constructor(@Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit) { }

  async getUserPositions(address: string) {
    const graphHelper = this.appToolkit.helpers.theGraphHelper;
    const data = graphHelper.gqlFetchAll<MeanFinancePositions>({
      endpoint: 'https://api.thegraph.com/subgraphs/name/mean-finance/dca-v2-polygon',
      query: getPositions,
      variables: { address },
      dataToSearch: 'positions',
    })
    return data.positions;
  }

  async getBalances(address: string) {
    const positions = await this.getUserPositions(address);
  }
}
```
