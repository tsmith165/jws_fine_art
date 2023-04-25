import React from 'react';
import { withRouter } from 'next/router';

import PageLayout from '@/components/layout/PageLayout';
import styles from '@/styles/pages/Admin.module.scss';

import { fetch_pieces, get_analytics_data } from '@/lib/api_calls';

class Admin extends React.Component {
    constructor(props) {
        super(props);

        this.page_title = 'Admin Dashboard';

        // Add a state property to store the analytics data
        this.state = {
            analyticsData: null,
        };
    }

    async componentDidMount() {
        // Fetch the analytics data and store it in the component's state
        const response = await get_analytics_data();
        console.log(`Reporting API response: ${JSON.stringify(response)}`);
        this.setState({ response });
    }

    renderAnalyticsData() {
        const { analyticsData } = this.state;
        if (!analyticsData) {
            return <p>Loading...</p>;
        }

        return (
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Sessions</th>
                        <th>Pageviews</th>
                        <th>Users</th>
                    </tr>
                </thead>
                <tbody>
                    {analyticsData.map((row, index) => (
                        <tr key={index}>
                            <td>{row.dimensions[0]}</td>
                            <td>{row.metrics[0].values[0]}</td>
                            <td>{row.metrics[0].values[1]}</td>
                            <td>{row.metrics[0].values[2]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    render() {
        if (!this.props.isLoaded) {
            return <></>;
        }
        if (!this.props.isSignedIn) {
            this.props.router.push('/');
        }
        if (this.props.user == null) {
            this.props.router.push('/');
        }

        const role = this.props.user.publicMetadata.role !== undefined ? this.props.user.publicMetadata.role : null;
        console.log(`USER ROLE: ${role}`);

        if (role !== 'ADMIN') {
            this.props.router.push('/');
        }

        return (
            <PageLayout page_title={this.page_title}>
                <div className={styles.main_container}>
                    <div className={styles.main_body}>
                        <div className={styles.panel}>
                            <div className={styles.panel_header}>Analytics Data</div>
                            <div className={styles.panel_body}>
                                {this.renderAnalyticsData()} {/* Render the analytics data */}
                            </div>
                        </div>
                        <div className={styles.panel}>
                            <div className={styles.panel_header}>Data Backup</div>
                            <div className={styles.panel_body}>
                                <button className={styles.export_button} onClick={this.exportPiecesAsXLSX}>
                                    Export Pieces as XLSX
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        );
    }

    exportPiecesAsXLSX = async () => {
        try {
            const response = await fetch_pieces('None', 'xlsx');

            if (response == true) {
                console.log('Successfully exported pieces as XLSX');
            } else {
                console.error('Failed to export pieces:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to export pieces:', error);
        }
    };
}

export default withRouter(Admin);
