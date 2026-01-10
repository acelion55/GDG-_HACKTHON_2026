import React from "react";
import Link from "next/link";
import styles from "../styles/Navbar.module.css" 

const createpost = () => {
  return (
    <>
      <Link href="/upload" className={styles.plusLink}>
        <div className={styles.plusButton}>
          <span className={styles.plusText}>POST</span>
        </div>
      </Link>
    </>
  );
};
export default createpost;
