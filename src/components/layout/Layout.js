import Navbar from './Navbar'

const Layout = (props) => {
    return (
        <>
            <Navbar most_recent_page_id={props.most_recent_page_id}/>
            {props.children}
        </>
    )
}

export default Layout;