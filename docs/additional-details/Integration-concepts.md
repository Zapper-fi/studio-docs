---
sidebar_position: 1
---

# Zapper app integration concepts for you to be aware of

As the DeFi and dApp ecosystem are nascent, we at Zapper often found ourselves
developing our own terminology to refer to various pieces of app integrations.
This page is meant to capture a lot of those ideas in one place, for you to
reference as needed when coding your integration.

## What is an app?

"App" is the term we use to refer to a decentralized protocol. This is
synonymous with the term dApp, protocol and defi app.

## What is What is a base token, app token, and a contract position and how are they related?

These 3 terms refer to the various types of defi positions a user can own.

- _Base Token_: these are the tokens that run defi, and all other positions are
  comprised of them. Examples would be the AAVE governance token, CRV for Curve
  or USDC stable coin. A user retains possession of these tokens to represent
  ownership, and base tokens generally have liquid trading markets.
- _App token_: these are tokens that represent more complex positions with a
  given app, such as a liquidity pool's LP tokens, or a token that represents a
  staked position, such as xSUSHI. The user retains posession of these tokens to
  represent their position, but the tokens generally have an _illiquid_ trading
  market.
- _Contract Position_: these are investments where, when the user enters the
  position, they relingquish ownership of the app token or base token,
  depositing them into a smart contract. A ledger or registry (usually on-chain)
  then tracks their ownership. The most common example are farms, vaults or
  staked balances, where the user deposits their tokens into a contract, and
  must withdraw their tokens in the future. Contract positions are usually
  non-transferrable

## Other commonly used terms relating to Zapper integrations

- _Token Fetcher_: Builds a group of tokens belonging to an app
- _Contract Position Fetcher_: Builds a group of contract positions belonging to
  an app
