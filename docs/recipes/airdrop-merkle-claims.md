---
sidebar_position: 6
---

# Airdrops (Merkle Claims)

**Airdrops** are a common form of rewarding users with claimable tokens, either
for early participation or simply as a reward mechanism for a protocol.

Airdrops are often distributed via
[a Merkle Tree smart contract](https://medium.com/mochilab/merkle-airdrop-one-of-the-best-airdrop-solution-for-token-issues-e2279df1c5c1).
The solution is quite simple:

1. The protocol takes a "snapshot" of the recipients for an airdrop and their
   claimable amounts.
2. Rather than storing the entire snapshot on chain (expensive), run the Merkle
   Tree algorithm against the snapshot data, and store the root in the airdrop
   contract.
3. To claim, a user must provide the proof that their address and amount are
   part of the Merkle Tree.

The snapshot itself is stored off-chain, usually in a JSON file on a public
server.

In this recipe, we'll see how to pull and cache the off-chain data and combine
it with on-chain calls to render a user's airdrop balance in Zapper.

## Using the `MerkleCache` abstract class to cache the off-chain Merkle Tree data

The `MerkleCache` abstract class can be used to retrieve and cache the Merkle
Tree snapshot JSON in an efficient way. Extend the class, and implement the
`resolveMerkleData` method. You should return an object like:

```ts
{
  [rewardTokenAddress: string]: {
    [walletAddress: string]: T
  }
}
```

...where `T` is any type that includes the `amount` that can be claimed, and the
`index` and `proof` that can be used in a method call the smart contract to
determine if a user's claimable amount has been claimed or not.

Let's see what this might look like, using **Llama Airforce** airdrops as an
example. Let's assume you've already created the app in
`src/apps/llama-airforce`, so now, we'll create the `MerkleCache` class in
`src/apps/llama-airforce/ethereum/llama-airforce.merkle-cache.ts`:

```ts
import { Injectable } from "@nestjs/common";
import Axios from "axios";

import { MerkleCache } from "~app-toolkit/helpers/merkle/merkle.cache";
import { Network } from "~types/network.interface";

import { LLAMA_AIRFORCE_DEFINITION } from "../llama-airforce.definition";

type LlamaAirforceMerkleClaim = {
  index: number;
  amount: string;
  proof: string[];
};

type LlamaAirforceMerkleData = {
  merkleRoot: string;
  tokenTotal: string;
  claims: Record<string, LlamaAirforceMerkleClaim>;
};

@Injectable()
export class EthereumLlamaAirforceMerkleCache extends MerkleCache<LlamaAirforceMerkleClaim> {
  appId = LLAMA_AIRFORCE_DEFINITION.id;
  groupId = LLAMA_AIRFORCE_DEFINITION.groups.airdrop.id;
  network = Network.ETHEREUM_MAINNET;

  async resolveMerkleData() {
    const [{ data: uCrvData }, { data: uFxsData }] = await Promise.all([
      Axios.get<LlamaAirforceMerkleData>(
        "https://raw.githubusercontent.com/0xAlunara/Llama-Airforce-Airdrops/master/ucrv/latest.json"
      ),
      Axios.get<LlamaAirforceMerkleData>(
        "https://raw.githubusercontent.com/0xAlunara/Llama-Airforce-Airdrops/master/ufxs/latest.json"
      ),
    ]);

    const uCrvTokenAddress = "0x83507cc8c8b67ed48badd1f59f684d5d02884c81";
    const uFxsTokenAddress = "0xf964b0e3ffdea659c44a5a52bc0b82a24b89ce0e";

    return {
      [uCrvTokenAddress]: uCrvData.claims,
      [uFxsTokenAddress]: uFxsData.claims,
    };
  }
}
```

There are two claimable tokens here: `uCRV` and `uFXS`. The snapshots are stored
in two different static JSON files hosted on **GitHub**, so we retrieve the
contents for both, and build the expected output object. These snapshots are
pulled and cached every **15m**.

For reference, the claims are cached by the key
`<app_id>:<group_id>:<network>:<claimable_token_address>:<wallet_address>`.

You may now inject this class and retrieve the claim from cache via
`getClaim(rewardTokenAddress, walletAddress)`. We'll see how this is used in an
upcoming section.

## Using the `MerkleContractPositionHelper` helper class to build `ContractPosition` objects

We'll use the `MerkleContractPositionHelper` helper class to build the
`ContractPosition` objects that will represent our claimable amounts. Once
again, we'll look at **Llama Airforce**, which has two claimable airdropped
tokens for voting rewards: `uCRV` and `uFXS`.

Let's open
`src/apps/llama-airforce/ethereum/llama-airforce.airdrop.contract-position-fetcher.ts`
and write some code to build our positions:

```ts
import { Inject } from "@nestjs/common";

import { IAppToolkit, APP_TOOLKIT } from "~app-toolkit/app-toolkit.interface";
import { Register } from "~app-toolkit/decorators";
import { PositionFetcher } from "~position/position-fetcher.interface";
import { ContractPosition } from "~position/position.interface";
import { Network } from "~types/network.interface";

import { LLAMA_AIRFORCE_DEFINITION } from "../llama-airforce.definition";

const appId = LLAMA_AIRFORCE_DEFINITION.id;
const groupId = LLAMA_AIRFORCE_DEFINITION.groups.airdrop.id;
const network = Network.ETHEREUM_MAINNET;

@Register.ContractPositionFetcher({ appId, groupId, network })
export class EthereumLlamaAirforceAirdropContractPositionFetcher
  implements PositionFetcher<ContractPosition>
{
  constructor(@Inject(APP_TOOLKIT) private readonly appToolkit: IAppToolkit) {}

  async getPositions() {
    return this.appToolkit.helpers.merkleContractPositionHelper.getContractPositions(
      {
        address: "0xa83043df401346a67eddeb074679b4570b956183", // Merkle Claim
        appId,
        groupId,
        network,
        dependencies: [
          {
            appId,
            groupIds: [LLAMA_AIRFORCE_DEFINITION.groups.vault.id],
            network,
          },
        ],
        rewardTokenAddresses: [
          "0x83507cc8c8b67ed48badd1f59f684d5d02884c81", // uCRV
          "0xf964b0e3ffdea659c44a5a52bc0b82a24b89ce0e", // uFXS
        ],
      }
    );
  }
}
```

In this case, the helper class will produce two `ContractPosition` objects, one
for `Claimable uCRV` and one for `Claimable uFXS`.

## Retrieving claimable balances

We'll now register a `ContractPositionBalanceFetcher` to use the claimable
contract position objects and the cached Merkle Tree data to determine a user's
claimable balances.

For each position, the logic will be as follows:

1. Check the cached merkle tree to see if that wallet address has any claimable
   amount for that reward token.
2. If not, zero the balance. Otherwise, use the `index` to call the contract and
   determine if the amount has been claimed.
3. If the amount has been claimed, zero the balance. Otherwise, return the full
   claimable amount.

Let's create `llama-airforce.airdrop.contract-position-balance-fetcher.ts` in
`src/apps/llama-airforce/ethereum` and put this logic in code:

```ts
import { Inject } from "@nestjs/common";
import BigNumber from "bignumber.js";

import { APP_TOOLKIT, IAppToolkit } from "~app-toolkit/app-toolkit.interface";
import { Register } from "~app-toolkit/decorators";
import { drillBalance } from "~app-toolkit/helpers/balance/token-balance.helper";
import { PositionBalanceFetcher } from "~position/position-balance-fetcher.interface";
import { ContractPositionBalance } from "~position/position-balance.interface";
import { isClaimable } from "~position/position.utils";
import { Network } from "~types/network.interface";

import { LlamaAirforceContractFactory } from "../contracts";
import { LLAMA_AIRFORCE_DEFINITION } from "../llama-airforce.definition";

import { EthereumLlamaAirforceMerkleCache } from "./llama-airforce.merkle-cache";

@Register.ContractPositionBalanceFetcher({
  appId: LLAMA_AIRFORCE_DEFINITION.id,
  groupId: LLAMA_AIRFORCE_DEFINITION.groups.airdrop.id,
  network: Network.ETHEREUM_MAINNET,
})
export class EthereumLlamaAirforceAirdropContractPositionBalanceFetcher
  implements PositionBalanceFetcher<ContractPositionBalance>
{
  constructor(
    @Inject(APP_TOOLKIT)
    private readonly appToolkit: IAppToolkit,
    @Inject(EthereumLlamaAirforceMerkleCache)
    private readonly merkleCache: EthereumLlamaAirforceMerkleCache,
    @Inject(LlamaAirforceContractFactory)
    private readonly contractFactory: LlamaAirforceContractFactory
  ) {}

  async getBalances(address: string) {
    return this.appToolkit.helpers.contractPositionBalanceHelper.getContractPositionBalances(
      {
        address,
        appId: LLAMA_AIRFORCE_DEFINITION.id,
        groupId: LLAMA_AIRFORCE_DEFINITION.groups.airdrop.id,
        network: Network.ETHEREUM_MAINNET,
        resolveBalances: async ({ contractPosition, multicall }) => {
          const contract =
            this.contractFactory.llamaAirforceMerkleDistributor(
              contractPosition
            );

          const rewardToken = contractPosition.tokens.find(isClaimable)!;
          const rewardsData = await this.merkleCache.getClaim(
            rewardToken.address,
            address
          );
          if (!rewardsData) return [drillBalance(rewardToken, "0")];

          const { index, amount } = rewardsData;
          const isClaimed = await multicall.wrap(contract).isClaimed(index);

          const balanceRaw = new BigNumber(isClaimed ? "0" : amount);
          return [drillBalance(rewardToken, balanceRaw.toFixed(0))];
        },
      }
    );
  }
}
```

We're done! Wire up your new classes in the `llama-airforce.module.ts`, then
confirm the balances work as expected by calling
`http://localhost:5001/apps/llama-airforce/balances?addresses[]=<ADDRESS>`.
