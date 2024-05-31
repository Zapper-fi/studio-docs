// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Build on Zapper",
  plugins: [
    "docusaurus-plugin-sass",
    [
      "docusaurus-plugin-remote-content",
      {
        // options here
        name: "studio-changelog",
        sourceBaseUrl:
          "https://raw.githubusercontent.com/Zapper-fi/studio/main/",
        outDir: "docs", // the base directory to output to.
        documents: ["CHANGELOG.md"], // the file names to download
      },
    ],
  ],
  tagline:
    " We're opening up integrations to the community. No more waiting on us. Integrate your App with Zapper today.",
  url: "https://studio.zapper.xyz",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "Zapper-fi",
  projectName: "studio-docs",
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/Zapper-fi/studio-docs/tree/main/",
        },
        theme: {
          customCss: require.resolve("./src/scss/custom.scss"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Zapper Studio",
        logo: {
          alt: "Zapper Logo",
          src: "img/logo.png",
        },
        items: [
          {
            position: "left",
            label: "Event Interpretation",
            to: "docs/event-interpretation",
            activeBaseRegex: "docs/event-interpretation",
          },
          {
            to: "docs/apis/getting-started",
            position: "left",
            label: "API Documentation",
            activeBaseRegex: "docs/apis/",
          },
          {
            to: "documentation",
            position: "left",
            label: "API Spec",
          },
          {
            to: "docs/support/index",
            position: "left",
            label: "Support Docs",
            activeBaseRegex: "docs/support"
          },
          {
            href: "https://github.com/Zapper-fi/studio",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "API Documentation",
                to: "/docs/apis/getting-started",
              },
              {
                label: "Brand Assets",
                to: "/docs/brand-assets",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Twitter",
                href: "https://twitter.com/zapper_fi",
              },
              {
                label: "Discord",
                href: "https://zapper.xyz/discord",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/Zapper-fi/studio",
              },
            ],
          },
        ],
        copyright: `Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
