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
data: ${payload as JSON | 'start' | 'end'}
```

When the server sends an event, an associated data payload is sent.
The event is ALWAYS a string. The data varies between JSON, 'start' and 'end'

The data payload 'start' and 'end' are exclusive to the start and end event. For
all intents and purposes, they can be ignored.

When a connection is established and the server will begin
to stream information the following payload is sent:

```
event: start
data: start
```

When all data has been streamed, the server will send the following:

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
3. Squash information
4. Push information

Open/Close a connection are exlusive to the start and end event.

Squash and Push varies based on the event (detailed in the "Events and Payloads" section).

When doing a Squash, we expect the client to take the data payload and replace as is the corresponding
locally saved state.

When doing a Push, we expect the client to take the data payload and append it to some locally saved state.

## Token types and breakdown

Due to the varied nature of tokens and their potential breakdowns, the server can potentially send back
3 types of tokens.

The server attempts to standardize the overall shape of a token breakdown, but it may not be possible.

In order to accurately reflect on the client what to render, each position has a corresponding `type` which
helps the client to determine what fields are and are not available.

```typescript
// Common types found in each TokenBreakdowns
type MetaType = 'wallet' | 'supplied' | 'borrowed' | 'claimable' | 'vesting' | 'nft' | null;
type DisplayItem = {
  type: string;
  value: string | number;
};

type TokenBreakdown = {
  type: 'token';
  appId: string | null;
  metaType: MetaType;
  address: string;
  balanceUSD: number;
  network: string;
  contractType: string;
  breakdown: Array<PositionBreakdown | NonFungibleTokenBreakdown | TokenBreakdown>;
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
  type: 'nft';
  appId: string | null;
  metaType: MetaType;
  address: string;
  balanceUSD: number;
  network: string;
  contractType: string;
  breakdown: Array<PositionBreakdown | NonFungibleTokenBreakdown | TokenBreakdown>;
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
  type: 'position';
  appId: string | null;
  metaType: MetaType;
  address: string;
  balanceUSD: number;
  network: string;
  contractType: string;
  breakdown: Array<PositionBreakdown | NonFungibleTokenBreakdown | TokenBreakdown>;
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

### start

Signals that the server is ready and will start sending data down the wire.
The data payload can be safely ignored.

### end

Signals that the server has done all the needed work and will no longer send any events.
The data payload can be safely ignored.

**Important**: Please close the connection on reception of the 'end' event.

### totals

Signifies a calculated balance total of a given address.

This event expects the client to SQUASH local state as it computes all that is needed and
should be updated as a whole.

Totals will always contain the final calculation of all possible balances as well
as some minor statistics.

The sent payload is `TotalsPayload`.

```typescript
type TotalsPayload = {
  categoriesTotal: {
    claimable: number;
    debt: number;
    deposits: number;
    vesting: number;
    nft: number;
    wallet: number;
    locked: number;
  };
  netTotal: number;
  netTotalWithNfts: number;
  assetTotal: number;
  debtTotal: number;
  networkTotals: {
    // NOTE: the key value pair will ONLY appear if a balance is found
    [network_name: string]: number;
  };
  claimablePerNetwork: {
    // NOTE: the key value pair will ONLY appear if a balance is found
    [network_name: string]: number;
  };
  stats: {
    topHoldings: Array<{
      appId: string;
      label: string;
      balanceUSD: number;
      key: string;
      pctHolding: number;
    }>;
    topHoldingsWithNfts: Array<{
      appId: string;
      label: string;
      balanceUSD: number;
      key: string;
      pctHolding: number;
    }>
  };
};
```

### category

Represents a new/updated category.

This event expects the client to SQUASH a specific part local state.

Each categories (category_name) have a corresponding token to be squashed. To help us identify
which token from which category needs to be squashed, we provide a unique key (token_key) to quickly
identify what element has been updated.

The sent payload is `CategoryPayload`.

```typescript
type CategoryNames = 
  | 'claimable'
  | 'debt'
  | 'deposits'
  | 'locked'
  | 'nft'
  | 'vesting'
  | 'wallet';

type CategoryPayload = {
  [category_name in CategoryNames]:
    | {
        [token_key: string]: PositionBreakdown | NonFungibleTokenBreakdown | TokenBreakdown;
      }
    | {};
};
```

### protocol

Represents a new protocol that a user has balances of.

This event expects the client to PUSH to a specific part local state.

The sent payload is `ProtocolPayload`.

```typescript
type ProtocolPayload = {
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
