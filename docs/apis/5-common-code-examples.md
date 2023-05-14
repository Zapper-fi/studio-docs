---
sidebar_position: 5
---

# Coding examples for common situations

## Getting Zapper to calculate `v2/balances/apps` value

Example of replacing [`v2/balances`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balances) with [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps), by asking Zapper to re-calculate the balance, poll for the job to complete via [`v2/balances-job-status`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesjob-status), and then pull the data once its finished calculating. 

```js
import Axios from "axios";

const apiKey = "_INSERT_API_KEY_";
const address = "_INSERT_ADDRESS_";
const Authorization = `Basic ${Buffer.from(`${apiKey}:`, "binary").toString(
  "base64"
)}`;

//used axios library to make the API calls. Make sure to install it via npm before running the code
async function getBalances() {
  try {
    const { data } = await Axios.post(
      `https://api.zapper.xyz/v2/balances/apps?addresses%5B%5D=${address}`,
      undefined,
      {
        headers: {
          accept: "*/*",
          Authorization,
        },
      }
    );

    const jobId = data.jobId;
    // Poll for the job status to be 'complete'
    let jobStatus;
    do {
      const jobStatusResponse = await Axios.get(
        `https://api.zapper.xyz/v2/balances/job-status?jobId=${jobId}`
      );
      jobStatus = jobStatusResponse.data.status;
      // add delay to avoid overloading the server
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (jobStatus !== "completed");
    // Call the 'GET' endpoint to get the values
    const getResponse = await Axios.get(
      `https://api.zapper.xyz/v2/balances/apps?addresses%5B%5D=${address}`,
      {
        headers: {
          accept: "*/*",
          Authorization,
        },
      }
    );
    return getResponse.data;
  } catch (error) {
    console.error(error);
  }
}
```

## Getting Total Value of All Assets in a Wallet

If you want to get the value of all assets in a wallet, you'd want to call 3 different endpoints to get the following values

- [`v2/balances/apps`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancesapps): returns all value of app-related positions in the wallet
- [`v2/balances/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2balancestokens): returns all value of floating ERC20 "base token" positions in the wallet
- [`v2/nft/balances/net-worth`](https://docs.zapper.xyz/docs/apis/api-syntax#v2nftbalancesnet-worth): returns the estimated value of all NFTs in the wallet

And then add them all up. Note that if the balances in `/apps` and `/tokens` are not available in the cache, you will need to do the POST calls to have Zapper calculate the values. There is no need to do a POST command for the NFT endpoints

```js
import Axios from "axios";

const apiKey = "_INSERT_API_KEY_";
const address = "_INSERT_ADDRESS_";
const Authorization = `Basic ${Buffer.from(`${apiKey}:`, "binary").toString(
  "base64"
)}`;

//used axios library to make the API calls. Make sure to install it via npm before running the code
async function getTotalNetWorth() {
  try {
    // Call the '/apps' endpoint to get the balance in USD for app-related investments
    const appsResponse = await Axios.get(
      `https://api.zapper.xyz/v2/balances/apps?addresses%5B%5D=${address}`,
      {
        headers: {
          accept: "*/*",
          Authorization,
        },
      }
    );
    const apps = appsResponse.data;
    let totalBalanceUSDApp = 0;
    apps.forEach((app: { balanceUSD: number }) => {
      totalBalanceUSDApp += app.balanceUSD;
    });
    // Call the '/tokens' endpoint to get the balance in USD for tokens
    const tokensResponse = await Axios.get(
      `https://api.zapper.xyz/v2/balances/tokens?addresses%5B%5D=${address}`,
      {
        headers: {
          accept: "*/*",
          Authorization,
        },
      }
    );
    const tokens = tokensResponse.data;
    let totalBalanceUsdTokens = 0;
    tokens.forEach((token: { balanceUSD: number }) => {
      totalBalanceUsdTokens += token.balanceUSD;
    });
    // Call the '/net-worth' endpoint to get the net worth in USD for NFTs
    const nftResponse = await Axios.get(
      `https://api.zapper.xyz/v2/nft/balances/net-worth?addresses%5B%5D=${address}`,
      {
        headers: {
          accept: "*/*",
          Authorization,
        },
      }
    );
    const nftUsdNetWorth = nftResponse.data;
    // Sum up the total balance in USD for apps, tokens, and NFTs
    const totalNetWorth =
      totalBalanceUSDApp + totalBalanceUsdTokens + nftUsdNetWorth;
    console.log(totalNetWorth);
  } catch (error) {
    console.error(error);
  }
}
```

## How to paginate through NFT endpoint

If you want to get all the NFTs in a given wallet, you can call the endpoint [`v2/nft/user/tokens`](https://docs.zapper.xyz/docs/apis/api-syntax#v2nftusertokens). However, that endpoint returns a maximum of 100 NFTs per page; if a wallet has more than 100 NFTs in it, you will need to paginate through them to get all the NFTs.

Below is a javascript code snippet on how to paginate through results:

```js
import Axios from "axios";

const apiKey = "_INSERT_API_KEY_";
const address = "_INSERT_ADDRESS_";
const Authorization = `Basic ${Buffer.from(`${apiKey}:`, "binary").toString(
  "base64"
)}`;

//used axios library to make the API calls. Make sure to install it via npm before running the code
async function getAllUserNFTTokens(address: string, limit = 100) {
  let cursor = null;
  let allTokens: any[] = [];
  while (true) {
    try {
      // Send GET request to the API endpoint
      let url = `https://api.zapper.xyz/v2/nft/user/tokens?userAddress=${address}&limit=${limit}`;
      if (cursor) {
        url += `&cursor=${cursor}`;
      }
      const response = await Axios.get(url, {
        headers: {
          accept: "*/*",
          Authorization,
        },
      });
      const tokens = response.data.data;
      allTokens = allTokens.concat(tokens);
      cursor = response.data.cursor;
      if (!cursor) {
        break;
      }
    } catch (error) {
      console.error(error);
    }
  }
  console.log(allTokens);
}
```
