'use client'

import logger from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import styles from '@/styles/pages/Admin.module.scss';
import { fetch_pieces, get_analytics_data } from '@/lib/api_calls';

function Admin(props) {
    const { isLoaded, isSignedIn, user } = useUser();

    const router = useRouter();
    const page_title = 'Admin Dashboard';
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await get_analytics_data();
            logger.debug(`Reporting API response: ${JSON.stringify(response)}`);
            setAnalyticsData(response);
        };

        if (!isLoaded) {
            return;
        }
        if (!isSignedIn) {
            return;
        }
        if (!user) {
            return;
        }
        if (!user.publicMetadata) {
            return;
        }
        if (!user.publicMetadata.role) {
            return;
        }
        if (user.publicMetadata.role.toLowerCase() != 'admin') {
            console.error('User is not an admin.  Redirecting to home page...')
            router.push('/');
        }

        fetchData();

    }, [isLoaded, isSignedIn, user]);

    const renderAnalyticsData = () => {
        if (analyticsData == null) {
            return <p>Loading...</p>;
        }

        const rows = analyticsData[0].rows;

        rows.sort((a, b) => {
            const dateA = a.dimensionValues[0].value;
            const dateB = b.dimensionValues[0].value;
            return dateA > dateB ? -1 : dateA < dateB ? 1 : 0;
        });

        logger.debug(`Rendering analytics data rows`);
        logger.debug(rows);

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
    };

    const exportPiecesAsXLSX = async () => {
        try {
            const response = await fetch_pieces('None', 'xlsx');

            if (response) {
                logger.info('Successfully exported pieces as XLSX');
            } else {
                logger.error('Failed to export pieces:', response.statusText);
            }
        } catch (error) {
            logger.error('Failed to export pieces:', error);
        }
    };

    console.log(`isLoaded: ${isLoaded} isSignedIn: ${isSignedIn} user: ${user}`)

    if (!isLoaded) {
        return <div>Loading...</div>
    }
    if (!isSignedIn) {
        console.log('User is not signed in.  Redirecting to signin page...')
        return router.push('/signin')
    } 
    if (!user || user.publicMetadata?.role?.toLowerCase() != 'admin') {
        console.log(`Current user is not admin - Role: ${user.publicMetadata?.role?.toLowerCase() || 'none'}`)
        return router.push('/signin')
    }

    return (
        <div className={styles.main_container}>
            <div className={styles.main_body}>
                <div className={styles.backup_panel}>
                    <div className={styles.panel_header}>Data Backup</div>
                    <div className={styles.panel_body}>
                        <button className={styles.export_button} onClick={exportPiecesAsXLSX}>
                            Export Pieces as XLSX
                        </button>
                    </div>
                </div>
                <div className={styles.analytics_panel}>
                    <div className={styles.panel_header}>Analytics Data</div>
                    <div className={styles.panel_body}>
                        {renderAnalyticsData()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Admin;
