import styles from '../../styles/Button.module.scss'

const Button = ({link=false, content=""}) => {
    if (link) {
        return <button className={styles.linkButton} type="button">{content}</button>
    } else {
        return <button className={styles.simpleButton} type="button">{content}</button>
    }
}

export default Button;