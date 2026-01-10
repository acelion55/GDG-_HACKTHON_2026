import Link from "next/link";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
  const navItems = [
    { name: "HOME", href: "/" },
    { name: "SHOP", href: "/shop" },
    { name: "TEAM", href: "/team" },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
      
        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={styles.navItem}>
             
              <span className={styles.navText}>{item.name}</span>
            </Link>
          ))}
        </div>

        
      </div>
    </nav>
  );
};

export default Navbar;
