import React from "react";
import clsx from "clsx";
import styles from "./styles.module.scss";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Keep Your Users Happy",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
    <>
      Over 1,000,0000 users manage their portfolio with Zapper each month, 
      and they want to see all their balances in one place. By integrating your app, users will be able to monitor and update their portfolio in Zapper
    </>
    ),
  },
  {
    title: "Get More Users",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
         Zapper drives discovery, through our investment discovery pages, app discovery, 
         looking at other users’ portfolios and through apps using Zapper’s balance data via API
      </>
    ),
  },
  {
    title: "Rapid Scaffolding, Recipes and Helpers",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Studio includes scaffolding helpers so you can quickly integrate relevant 
        app information directly into Zapper, and has extensive recipes (this site!) to help you get it done quickly
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
