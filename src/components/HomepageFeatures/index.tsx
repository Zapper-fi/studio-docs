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
    title: "Fully TypeScript",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: <>Enjoy a full codebase written completely in TypeScript.</>,
  },
  {
    title: "Rapid Scaffolding",
    Svg: require("@site/static/img/undraw_docusaurus_tree.svg").default,
    description: (
      <>
        Studio includes scaffolding helpers so you can quickly integrate
        relevant dApp information directly into Zapper.
      </>
    ),
  },
  {
    title: "Recipes and Helpers",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Studio has an extensive recipe book (this site!) and helpers so you can
        spend less time integrating and more time building your product.
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
