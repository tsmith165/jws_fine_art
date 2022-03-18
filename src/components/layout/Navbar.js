import Link from 'next/link'
import styles from "../../../styles/Navbar.module.scss"

const Navbar = ({}) => {
    return (
        <div className={styles.topnav}>
            <Link href="/">Home</Link>
            <Link href="/details/1">Details</Link>
            <Link href="/about">About</Link>
        </div>
    )
}

export default Navbar;