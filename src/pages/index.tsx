import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./index.module.scss";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className={styles.title}>{siteConfig.title}</h1>
        <h3 className={styles.subtitle}>{siteConfig.tagline}</h3>
        <div className={styles.buttons}>
          <Link className={styles.button} to="/docs/intro">
            Learn More
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Zapper Studio documentation."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <div
          className="container"
          style={{
            padding: "16px 0",
            borderTop: "2px solid var(--ifm-footer-background-color)",
          }}
        >
          <h6 style={{ margin: 0 }}>
            Looking to request for an integration instead?{" "}
            <a
              href="https://zapper.canny.io/"
              className="text-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Head to Canny to upvote
            </a>
          </h6>
        </div>
      </main>
    </Layout>
  );
}
