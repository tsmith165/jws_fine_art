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
        this.setState({ analyticsData: response });
    }

    renderAnalyticsData() {
        if (this.state.analyticsData == null) {
            return <p>Loading...</p>;
        }

        const rows = this.state.analyticsData[0].rows;

        rows.sort((a, b) => {
            const dateA = a.dimensionValues[0].value;
            const dateB = b.dimensionValues[0].value;
            if (dateA > dateB) {
                return -1;
            } else if (dateA < dateB) {
                return 1;
            } else {
                return 0;
            }
        });

        console.log(`Rendering analytics data rows`);
        console.log(rows);

        return (
            <table className={styles.analytics_table}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Sessions</th>
                        <th>Events</th>
                        <th>New Users</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => {
                        const date = row.dimensionValues[0].value.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3');

                        return (
                            <tr key={index}>
                                <td>{date}</td>
                                <td>{row.metricValues[0].value}</td>
                                <td>{row.metricValues[1].value}</td>
                                <td>{row.metricValues[2].value}</td>
                            </tr>
                        );
                    })}
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
                        <div className={styles.backup_panel}>
                            <div className={styles.panel_header}>Data Backup</div>
                            <div className={styles.panel_body}>
                                <button className={styles.export_button} onClick={this.exportPiecesAsXLSX}>
                                    Export Pieces as XLSX
                                </button>
                            </div>
                        </div>
                        <div className={styles.analytics_panel}>
                            <div className={styles.panel_header}>Analytics Data</div>
                            <div className={styles.panel_body}>
                                {this.renderAnalyticsData()} {/* Render the analytics data */}
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
