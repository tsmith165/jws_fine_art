import Navbar from './Navbar'

const Layout = (props) => {
    console.log(`Loading layout with most recent page: ${props.most_recent_page_id}`)
    return (
        <>
            <Navbar most_recent_page_id={props.most_recent_page_id}/>
            {props.children}
        </>
    )
}

export default Layout;