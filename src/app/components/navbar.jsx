import Link from 'next/link';
import styles from '../styles/Navbar.module.css'; // Import CSS Module

const Navbar = () => {
  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'REPORT', href: '/report' }, 
    { name: 'SHOP', href: '/shop' },
    { name: 'TEAM', href: '/team' },
    { name: 'ACCOUNT', href: '/account' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        
        {/* Main Navigation Links */}
        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={styles.navItem}>
                {/* Icons are removed as per your request, focusing only on text */}
                <span className={styles.navText}>{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Floating PLUS Icon (Main Action: Create Post) */}
        <Link href="/upload" className={styles.plusLink}>
            <div className={styles.plusButton}>
                 <span className={styles.plusText}>+ POST</span> 
                {/* <PlusCircle size={32} className={styles.plusIcon} /> */}
            </div>
        </Link>
        
      </div>
    </nav>
  );
};

export default Navbar;