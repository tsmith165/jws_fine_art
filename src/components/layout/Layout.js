import Navbar from './Navbar'

const Layout = (props) => {
    console.log(`Loading layout with most recent page: ${props.most_recent_page_id}`)
    return (
        <>
            <Navbar most_recent_page_id={props.most_recent_page_id} app_state={props.app_state} app_set_state={props.app_set_state}/>
            {props.children}
        </>
    )
}

export default Layout;