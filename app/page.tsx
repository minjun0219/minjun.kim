import type { NextPage } from "next";
import React from "react";

import Logo from "@/components/Logo";
import SocialLink from "@/components/SocialLink";

import styles from "./page.module.css";

const IndexPage: NextPage = () => {
  return (
    <>
      <Logo className={styles.logo} />
      <SocialLink className={styles.social} />
    </>
  );
};

export default IndexPage;
