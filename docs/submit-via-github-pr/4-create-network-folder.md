---
sidebar_position: 4
---

# Creating network-specific folders
Next, we will create a folder for the network we want to integrate our app on. For now, we will write our integration for the Polygon network. To add support for additional networks, just create a new folder per network.

For a list of networks Zapper support, check out [this link] [xxxx]. <!--TODO add link -->

First, lets create a folder called **Polygon** in our main folder.

We will be defining 3 different fetchers (aka adapters) in this folder
1. *tokenFetcher*: gets all relevant app tokens for our app, such as vault tokens or pool tokens
2. *contractPositionFetcher*: gets relevant non-tokenized positions, such as farm contracts
3. *balanceFetcher*: grabs the balances for users for tokenized positions and non-tokenized positions

Lets go through each of these!