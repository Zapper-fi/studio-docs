---
sidebar_position: 4
---

# Balance aggregation and SSE

When fetching _all_ the balances for a given address, we recommend using the
balance streamer endpoint
[`/v2/balances`](https://api.zapper.fi/api/static/index.html#/Balances/BalanceController_getBalances).

This endpoint allows the client to receive balance events as they are calculated
on the backend, streaming each protocol balance back to the client for handling.
This endpoint uses
[server-sent events](<https://en.wikipedia.org/wiki/Server-sent_events#:~:text=Server%2DSent%20Events%20(SSE),client%20connection%20has%20been%20established.>)
as a method of sending data.

Consumption of this endpoint is different than a typical RESTful endpoint. Your
application must establish a connection to the endpoint, handle balnace data
being streamed, and close the connection.

> **NOTE**: Always ensure that **you close the connection** once the server has
> sent the `end` event.

## What's in an event?

All events sent from the server implement the following structure:

```
event: ${event_name as STRING}
data: ${payload as JSON | 'end'}
```

When the server sends an event, an associated data payload is sent. The event is
_always_ a string. The data is either a stringified JSON payload, or the string
`'end'`.

The data payload `'end'` is exclusive to the end event. For all intents and
purposes, it can be ignored.

When a connection is established and the server will begin to stream balance
data. When all data has been streamed, the server will send the following:

```
event: end
data: end
```

This also signals that a client _must_ close the connection.

## What should my client do with the information?

Concretely, an API client has 4 primary concerns to handle with this endpoint:

1. Open a connection
2. Close a connection
3. Aggregate the balances
4. Calculate totals

Opening the connection is accomplished by making a request to the `/v2/balances`
endpoint. Closing the connection should be done once the `end` event has been
received.

> **NOTE**: Please use the `useNewBalancesFormat` query parameter described in
> the Swagger specification. The legacy format of balances being returned the
> user is **deprecated**!

Aggregating the data consist in mostly two actions:

1. On `balance`event, your client should store the result in a local state.
2. The client should aggregate the results to display totals.

## Token types and breakdown

The server can potentially send back _3 types of tokens_.

The server attempts to standardize the overall shape of a token breakdown, but
it may not be possible.

In order to accurately reflect on the client what to render, each position has a
corresponding `type` which helps the client to determine what fields are and are
not available.

```typescript
// Common types found in each TokenBreakdowns
type MetaType =
  | "wallet"
  | "supplied"
  | "borrowed"
  | "claimable"
  | "vesting"
  | "nft"
  | null;

type DisplayItem = {
  type: string;
  value: string | number;
};

type TokenBreakdown = {
  type: "token";
  appId: string | null;
  metaType: MetaType;
  address: string;
  balanceUSD: number;
  network: string;
  contractType: string;
  breakdown: Array<
    PositionBreakdown | NonFungibleTokenBreakdown | TokenBreakdown
  >;
  context: {
    balance: number;
    balanceRaw: string;
    symbol: string;
    price: number;
    decimals: number;
  };
  displayProps: {
    label: string;
    secondaryLabel: DisplayItem | null;
    tertiaryLabel: DisplayItem | null;
    images: string[];
    stats: Array<{ label: DisplayItem; value: DisplayItem }>;
    info: Array<{ label: DisplayItem; value: DisplayItem }>;
    balanceDisplayMode: string;
  };
};

type NonFungibleTokenBreakdown = {
  type: "nft";
  appId: string | null;
  metaType: MetaType;
  address: string;
  balanceUSD: number;
  network: string;
  contractType: string;
  breakdown: Array<
    PositionBreakdown | NonFungibleTokenBreakdown | TokenBreakdown
  >;
  assets: Array<{
    assetImg: string;
    assetName: string;
    balance: number;
    balanceUSD: number;
    tokenId: string;
  }>;
  context: {
    amountHeld: number;
    floorPrice: number;
    holdersCount: number;
    incomplete: boolean;
    openseaId: string;
  };
  displayProps: {
    label: string;
    secondaryLabel: DisplayItem | null;
    tertiaryLabel: DisplayItem | null;
    profileBanner: string;
    profileImage: string;
    featuredImage: string;
    featuredImg: string;
    images: Array<string>;
    stats: Array<{ label: DisplayItem; value: DisplayItem }>;
    info: Array<{ label: DisplayItem; value: DisplayItem }>;
    collectionImages: Array<string>;
    balanceDisplayMode: string;
  };
};

type PositionBreakdown = {
  type: "position";
  appId: string | null;
  metaType: MetaType;
  address: string;
  balanceUSD: number;
  network: string;
  contractType: string;
  breakdown: Array<
    PositionBreakdown | NonFungibleTokenBreakdown | TokenBreakdown
  >;
  displayProps: {
    label: string;
    secondaryLabel: DisplayItem | null;
    tertiaryLabel: DisplayItem | null;
    images: Array<string>;
    stats: Array<{ label: DisplayItem; value: DisplayItem }>;
    info: Array<{ label: DisplayItem; value: DisplayItem }>;
    balanceDisplayMode: string;
  };
};
```

## What is a displayProp

A `displayProp` is a common field accross all `TokenBreakdowns` objects.

The `displayProps` value has a consistent shape within `TokenBreakdown` and will
_always_ contain a label, a secondary label, images, stats and info.

As a rule of thumb, render data on your UI with the the `displayProps` before
trying to infer data from other fields present in a `TokenBreakdown`.

## Events and Payloads

### end

Signals that the server has sent all balances to the client and will no longer
send any events. The data payload can be safely ignored.

**Important**: Please close the connection on reception of the 'end' event.

### balance

Represents a balance result for some subset of user balances. In particular,
these subsets are:

1. The balances for wallet tokens held by a user on a given network
2. The balances on a given application (like **Aave V2** or **Uniswap V2**) for
   a given network.
3. The balances for all NFTs held by a user.

The response contains _4 fields_ that should be looked into:

#### The **balance** field

The **balance** field will contain a map of categories.

Each category (`category_name`) consists of tokens that can be accumulated in
that category group on the client. The category tokens are keyed by a unique key
(`token_key`). This allows the client to identify collisions, and aggregate
these token balances.

The payload sent is `BalancePayload`.

```typescript
type CategoryNames =
  | "claimable"
  | "debt"
  | "deposits"
  | "locked"
  | "nft"
  | "vesting"
  | "wallet";

type BalancePayload = {
  [category_name in CategoryNames]:
    | {
        [token_key: string]:
          | PositionBreakdown
          | NonFungibleTokenBreakdown
          | TokenBreakdown;
      }
    | {};
};
```

#### The **totals** field

The **totals** field will contain the total in USD for this given balance event.
This value can be useful if you are looking to build a total net worth of all
balances for a given address or bundle.

Each total are identified by a key, so that they can be uniquely identified when
adding them together.

The sent payload is `TotalsPayload`.

```typescript
type PartialTotal = {
  key: string;
  type: "app-token" | "non-fungible-token";
  network: string;
  balanceUSD: number;
};

type TotalsPayload = PartialTotal[];
```

#### The **app** field

The **app** field is optionally present, and represents the app that corresponds
to this set of balances.

The sent payload is `AppPayload`.

```typescript
type AppPayload = {
  appId: string;
  network: string;
  data: Array<PositionBreakdown | NonFungibleTokenBreakdown | TokenBreakdown>;
  displayProps: {
    appName: string;
    images: Array<string>;
  };
  meta: {
    total: number;
  };
};
```

#### The **errors** field

The **errors** field is a list of errors that occurred when retrieving this
balance. If there are errors present, the balance amounts are either zero, or
incomplete in `bundled` mode.

The sent payload is `ErrorItem[]`. You can use the `url` in the error payload to
attempt to retrieve this resource again as a retry mechanism.

```typescript
type ErrorItem = {
  message: string;
  url: string;
};
```

#### Putting it all together

Finally the resulting full payload received on a `balance` event will a
`PresentedBalancePayload`.

```typescript
type PresentedBalancePayload = {
  appId: "tokens" | "nft" | string;
  network: string;
  addresses: string[];
  balance: BalancePayload;
  totals: TotalsPayload;
  app?: AppPayload;
};
```

Since balances are sent individually, an aggregated result can be built client
side, by doing the following:

All balanceUSD can be added together per-categories to build a category total.

Example:

```typescript
const walletTotal = Object.values(balances.wallet).reduce(
  (total, { balanceUSD }) => (total += balanceUSD),
  0
);
```

The net worth can be built by aggregating all partial totals together. The total
can be built for a specific network, or type of token (App vs NFT) by filtering
on other fields present in the `PartialTotal` payload.

Example:

```typescript
const netWorth = balances.totals.reduce(
  (total, { balanceUSD }) => (total += balanceUSD),
  0
);

const netWorthWithoutNFT = balances.totals
  .filter(({ type }) => type !== "non-fungible-token")
  .reduce((total, { balanceUSD }) => (total += balanceUSD), 0);
```
