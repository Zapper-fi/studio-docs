---
sidebar_position: 2
---

# Inspect the generated code

In this section, we'll inspect and build upon the generated **App Definition**.

## Inspect the generated code

After following the previous section, you should now have a skeleton folder
structure for our **Pickle Finance** application integration.

![Create App Folder Structure](../../static/img/tutorial/create-app-folder-structure.png)

## What are groups?

In Zapper, we define a **group** as a _set of similar investment opportunities
within an app_. We distinguish two types of groups: **tokenized** groups and
**non-tokenized** groups. Elements of a tokenized group are referred to as **App
Tokens**, and elements of a non-tokenized group are referred to as **Contract
Positions**. Let's take a look at a few examples!

### Tokens

Tokens are investment positions that are represented by a token standard like
`ERC20`. These are transferrable and fungible positions that may be considered as
a _receipt_ for an investment transaction. These _receipts_ may be used to
represent:

- Liquidity pool positions in a decentralized exchange like **Uniswap**,
  **SushiSwap**, or **Curve**
- Autocompounding "vaults" like in a yield aggregator like **Pickle** or
  **Yearn**
- Supply and borrow positions in a lending app like **Aave**
- Or even more obscure primitives like options in **Opyn** or prize savings
  accounts in **PoolTogether**

### Contract Positions

Contract Positions are investment positions that are _not_ represented by a
token standard. It is often these positions that are more difficult to track by
simple wallet applications, and this is especially where Zapper shines, decoding
these positions from blockchain data and showing it to the user in a
straightforward manner in their portfolio. These positions may be used to
represent:

- Farming pool token positions in **SushiSwap** Master Chef staking contracts
- Bonds in **Olympus** or other apps that aim to own their liquidity
- Leveraged positions in isolated markets like **Abracadabra** cauldrons or
  **Alchemix** alchemists
- Claimable airdrops across the Web3 ecosystem!

As a little rule of thumb, you likely won't be able to manually add these
positions to your Metamask wallet because they are _not_ tokenized! For example,
once you deposit a token into a SushiSwap Master Chef farm, your wallet will
likely not be able to display this position.

## Add groups to your app

In this guide, we will integrate Pickle **Jars** and **Farms**.

Jar deposits are represented by an ERC20 token that _wraps_ the underlying token
being deposited. Farms, however, are _not_ represented by a token.

Our CLI allows us to quickly add groups to an existing app. Run
`pnpm studio create-group pickle`, and follow the prompts. For Jar tokens, we'll
configure the ID to `jar`, the label to `Jars`, and the type to `token`. For
farms, we'll configure the ID to `farm`, the label to `Farms`, and the type to
`contract-position`.

(NB: In reality, Pickle has a few more group types. Don't be alarmed! Apps
evolve over time and we'll need to update their integrations as they do so)

Voila! Our definition file is now more complete, and we can start defining our
position fetchers.
