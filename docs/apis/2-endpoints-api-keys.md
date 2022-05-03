---
sidebar_position: 2
---

# API Keys

The Zapper API uses [API keys](https://swagger.io/docs/specification/authentication/api-keys/) to authenticate requests. Zapper has made available for public use the following API key: 

`96e0cc51-a62e-42ca-acee-910ea7d2a241`

:::caution
As of March 2022, Zapper began rate limiting query volume on the **public API key**. See below for how to get a **private API key** if you are hitting the rate limit on the public key. 
:::

## Getting a Private API key to get a higher rate limit

If you are hitting the rate limit on the Public Key, you should request a private API key via Zapper's [ZenDesk ticket](https://zapperfi.zendesk.com/hc/en-us/requests/new) system. You will be issued a private API key in 24-48 hours. 

These private API keys still have a rate limit of 30RPM on the *balances* endpoints and 1,000RPM on ALL endpoints collectively, which is significantly higher than the public API key's rate limit. 

If these rate limits are not sufficient, you may also request a higher rate limit for your private API key by via the same ZenDesk ticket link, through replying to it in your email.

### Testing endpoints using the API key on Swagger

You can test the available endpoints on Swagger by entering an API key (public or private) **into the Authorize section in Swagger**. This will then allow you to see the responses for various endpoints based on parameters you specify.

![Enter API key into the authorize section](../../static/img/assets/swagger-auth.png)

:::info
For any API related inquiries, please reach out in the [#build-on-zapper channel](https://discord.com/channels/647279669388771329/650654989202489354) in the [Zapper Discord](https://zapper.fi/discord).
:::