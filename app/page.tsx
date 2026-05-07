import React from "react";
import type { Metadata, NextPage } from "next";

import Logo from "@/components/Logo";
import SocialLink from "@/components/SocialLink";

import styles from "./page.module.css";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const IndexPage: NextPage = () => {
  return (
    <>
      <Logo className={styles.logo} />
      <SocialLink className={styles.social} />
    </>
  );
};

export default IndexPage;
