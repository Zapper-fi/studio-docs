---
sidebar_position: 4
---

# Balance aggregation and SSE

Due to how the information is spread out, we need a clever way of
aggregating balances from various web3 protocols in a relatively simple
manner.

When fetching all the balances for a given address, we recommend using
the balance streamer endpoint `/v2/balances`. This endpoint
uses streaming and server sent events under the hood.

Consumption of this endpoint is different than a typical RESTful endpoint.

Your application must establish a connection to the endpoint, manually
aggregate the final response and close the connection.

The aggregation endpoint is designed to ensure the amount of transformations
a client would need to perform remains minimal. Usually, it'll only involve
pushing new information OR squashing information. There SHOULD NOT be a case
in which a client would need to merge information.

## Important note

When opening a connection always ensure that YOU CLOSE THE CONNECTION once the
server has finished sending the final event.

## What's in an event?

All events sent from the server MUST implement the following structure

```
event: ${event_name as STRING}
data: ${payload as JSON | 'end'}
```

When the server sends an event, an associated data payload is sent.
The event is ALWAYS a string. The data varies between JSON and 'end'

The data payload 'end' is exclusive to the end event. For
all intents and purposes, it can be ignored.

When a connection is established and the server will begin
to stream balance data. Then, when all data has been streamed, the server will send the following:

```
event: end
data: end
```

This also signals that a client MUST close a connection.

## What should my client do with the information?

Unfortunately, what you need to do with a data payload is somewhat obscure.

Concretely, the client has 4 primary concerns to handle

1. Open a connection
2. Close a connection
3. Aggregate the balances
4. Calculate totals

Opening the connection should be done via the client, by making a reques to the `/v2/balances` endpoint.
Closing the connection should be done once the `end` event has been received.

Aggregating the data consist in mostly two actions. When receiving a `balance` event, your client should ensure
it keeps the results in a local state. Then the client should aggregate some of the results together, you wish
to display a total net worth.

## Token types and breakdown

Due to the varied nature of tokens and their potential breakdowns, the server can potentially send back
3 types of tokens.

The server attempts to standardize the overall shape of a token breakdown, but it may not be possible.

In order to accurately reflect on the client what to render, each position has a corresponding `type` which
helps the client to determine what fields are and are not available.

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

A `displayProp` is a common field accross all TokenBreakdowns. `displayProps` has a consistent shape within TokenBreakdowns
and will ALWAYS contain a label, a secondary label, images, stats and info. In general, we always want to rely on
the `displayProps` before inferring data from other fields present in a TokenBreakdown.

## Events and Payloads

### end

Signals that the server has done all the needed work and will no longer send any events.
The data payload can be safely ignored.

**Important**: Please close the connection on reception of the 'end' event.

### balance

Represents a new/updated balance result.
This balance is for a wallet token, an app position or an NFT.

The response contains 3 main parts that should be looked into:

The **balance** field will contain a map of categories. Each categories (category_name) have a
corresponding token to be squashed. To help us identify which token from which category needs
to be squashed, we provide a unique key (token_key) to quickly identify what element has been updated.

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

The **totals** field will contain the total is USD for the given balance. This value can be useful
if you are looking to build a total net worth of all balances for a given address or bundle.

Each totals are identified by a key, so that they can be uniquely identified when adding them together.

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

The **app** field is optionnally present, and represents an app that an address or bundle has balances of.

This event expects the client to PUSH to a specific part local state.

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

Finally the resulting full payload received on a `balance` event will a `PresentedBalancePayload`.

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

Since balances are sent individually, an aggregated result can be built client side, by doing the following:

All balanceUSD can be added together per-categories to build a category total.

Example:

```typescript
const walletTotal = Object.values(balances.wallet).reduce(
  (total, { balanceUSD }) => (total += balanceUSD),
  0
);
```

The net worth can be built by aggregating all partial totals together. The total can be built for a specific network,
or type of token (App vs NFT) by filtering on other fields present in the `PartialTotal` payload.

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
