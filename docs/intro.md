---
sidebar_position: 1
---

# How to get your app integrated on Zapper

In April 2022, Zapper moved to open source all of the integrations we had done interally over the prior 2 years. We did this for 2 reasons:
- There are so many apps launching, we could not keep up with integrations, particularly the smaller protocols. We were turning into a bottleneck
- Developers were offering to integrate their apps on our behalf. Some were giving us such precise instructions, that they could clearly do the integration themselves. We just didn't have a way to allow them to do so
- We wanted to allow the Zapper community to contribute to the Zapper experience

<!--TODO link to right thing-->
To that end, we've moved all of our code for integration apps into an [open-source repository on GitHub][https://xxx], and began allowing anyone to submit a pull request to add an integration.

To that end, if you want to integrate your app / protocol, **see our step by step guide below**.

## Getting Started with a new integration

The basic flow of getting your app listed on Zapper is the follow steps:
1. Fork the Adapters repo (button towards the top right of the repo page).
2. Add a new folder with the same name as the project to projects/.
3. Write an integration for your app, using Zapper’s provided tooling adapters
<!--TODO link to right thing-->
4. Make a Pull Request with the changes on your fork, to the[main Zapper repo][https:repo], with a brief explanation of what you changed.
5. Wait for someone to either comment on or merge your Pull Request. There is no need to ask for someone to check your PR as they are monitored regularly.


### What you'll need to write an integration
<!--TODO add relevant links-->
- Basic knowledge of git
- Basic knowledge of typescript
- Knowledge of Ethers
- Nest.js knowledge
