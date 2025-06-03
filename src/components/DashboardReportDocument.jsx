import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register Noto Sans fonts
Font.register({
    family: 'Noto Sans',
    src: '/fonts/NotoSans-Regular.ttf'
});

Font.register({
    family: 'Noto Sans Bold',
    src: '/fonts/NotoSans-Bold.ttf'
});

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#F8FAFC', // Slate-50 background
        padding: 30,
        fontFamily: 'Noto Sans', // Use the registered regular font family
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0', // Slate-200 border
    },
    title: {
        fontSize: 20,
        marginLeft: -60,
        fontFamily: 'Noto Sans Bold', // Use the registered bold font family
        color: '#0F172A', // Slate-900 text
    },
    subtitle: {
        fontSize: 12,
        marginLeft: -60,
        color: '#475569', // Slate-600 text
        marginTop: 4,
        fontFamily: 'Noto Sans', // Use the registered regular font family
    },
    reportInfo: {
        fontSize: 10,
        color: '#64748B', // Slate-500 text
        textAlign: 'left',
        fontFamily: 'Noto Sans', // Use the registered regular font family
    },
    section: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#FFFFFF', // White background
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Noto Sans Bold', // Use the registered bold font family
        color: '#0F172A', // Slate-900 text
        marginBottom: 10,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0', // Slate-200 border
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryCard: {
        width: '30%',
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#F1F5F9', // Slate-100 background
    },
    summaryLabel: {
        fontSize: 10,
        color: '#475569', // Slate-600 text
        marginBottom: 4,
        fontFamily: 'Noto Sans', // Use the registered regular font family
    },
    summaryValue: {
        fontSize: 14,
        fontFamily: 'Noto Sans Bold', // Use the registered bold font family
    },
    income: {
        color: '#10B981', // Emerald-500
    },
    expense: {
        color: '#EF4444', // Red-500
    },
    balancePositive: {
        color: '#10B981', // Emerald-500
    },
    balanceNegative: {
        color: '#EF4444', // Red-500
    },
    table: {
        display: 'table',
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    tableHeader: {
        backgroundColor: '#34D399', // Blue-500
        flexDirection: 'row',
        alignItems: 'left',
        paddingTop: 2,
        height: 25,
        fontFamily: 'Noto Sans Bold', // Use the registered bold font family
        color: '#FFFFFF', // White text
        fontSize: 9,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'left',
        minHeight: 24,
        fontSize: 8,
        fontFamily: 'Noto Sans', // Use the registered regular font family
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    // Define specific widths and alignments for each column
    dateCell: {
        width: '15%',
        padding: 4,
        textAlign: 'left',
        fontSize: 8,
        fontFamily: 'Noto Sans',
    },
    descriptionCell: {
        width: '35%',
        padding: 4,
        textAlign: 'left',
        fontSize: 8,
        fontFamily: 'Noto Sans',
    },
    categoryCell: {
        width: '20%',
        padding: 4,
        textAlign: 'left',
        fontSize: 8,
        fontFamily: 'Noto Sans',
    },
    typeCell: {
        width: '15%',
        padding: 4,
        textAlign: 'left',
        fontSize: 8,
        fontFamily: 'Noto Sans',
    },
    amountCell: {
        width: '15%',
        padding: 4,
        textAlign: 'left',
        fontSize: 8,
        fontFamily: 'Noto Sans',
    },
    // Header cell styles (white text for headers)
    headerDateCell: {
        width: '15%',
        padding: 4,
        textAlign: 'left',
        fontSize: 9,
        fontFamily: 'Noto Sans Bold',
        color: '#FFFFFF',
    },
    headerDescriptionCell: {
        width: '35%',
        padding: 4,
        textAlign: 'left',
        fontSize: 9,
        fontFamily: 'Noto Sans Bold',
        color: '#FFFFFF',
    },
    headerCategoryCell: {
        width: '20%',
        padding: 4,
        textAlign: 'left',
        fontSize: 9,
        fontFamily: 'Noto Sans Bold',
        color: '#FFFFFF',
    },
    headerTypeCell: {
        width: '15%',
        padding: 4,
        textAlign: 'left',
        fontSize: 9,
        fontFamily: 'Noto Sans Bold',
        color: '#FFFFFF',
    },
    headerAmountCell: {
        width: '15%',
        padding: 4,
        textAlign: 'left',
        fontSize: 9,
        fontFamily: 'Noto Sans Bold',
        color: '#FFFFFF',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 8,
        color: '#64748B', // Slate-500 text
        fontFamily: 'Noto Sans', // Use the registered regular font family
    },
    boldText: {
        fontFamily: 'Noto Sans Bold', // Use the registered bold font family
    },
    logo: {
        width: 50, 
        height: 50, 
        borderRadius: 25
    },
});

// Create Document Component
const DashboardReportDocument = ({ user, stats, transactions }) => {
    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: user?.currency || 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Image src="/src/assets/logo.png" style={styles.logo} />
                    <View>
                        <Text style={styles.title}>TrackIT Financial Report</Text>
                        <Text style={styles.subtitle}>Personal Finance Manager</Text>
                    </View>
                    <View style={styles.reportInfo}>
                        <Text>Generated: {format(new Date(), 'MMM dd, yyyy HH:mm')}</Text>
                        <Text>Report ID: {Date.now().toString(36).toUpperCase()}</Text>
                    </View>
                </View>

                {/* User Info (Simplified) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Summary</Text>
                    <Text style={{fontSize: 10}}>Account Holder: {user?.name || 'N/A'}</Text>
                    <Text style={{fontSize: 10}}>Email: {user?.email || 'N/A'}</Text>
                    <Text style={{fontSize: 10}}>Currency: {user?.currency || 'INR'}</Text>
                </View>

                {/* Financial Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Financial Overview</Text>
                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Total Income</Text>
                            <Text style={{ ...styles.summaryValue, ...styles.income }}>
                                ₹{stats.totalIncome.toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Total Expenses</Text>
                            <Text style={{ ...styles.summaryValue, ...styles.expense }}>
                                ₹{stats.totalExpense.toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Net Balance</Text>
                            <Text style={{
                                ...styles.summaryValue,
                                ...(stats.balance >= 0 ? styles.balancePositive : styles.balanceNegative),
                            }}>
                                ₹{stats.balance.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Transaction History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Transaction History</Text>
                    <View>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={styles.headerDateCell}>Date</Text>
                            <Text style={styles.headerDescriptionCell}>Description</Text>
                            <Text style={styles.headerCategoryCell}>Category</Text>
                            <Text style={styles.headerTypeCell}>Type</Text>
                            <Text style={styles.headerAmountCell}>Amount(₹)</Text>
                        </View>
                        
                        {/* Table Body */}
                        {transactions.map((transaction, i) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={styles.dateCell}>
                                    {dateFormatter.format(new Date(transaction.date))}
                                </Text>
                                <Text style={styles.descriptionCell}>
                                    {transaction.description}
                                </Text>
                                <Text style={styles.categoryCell}>
                                    {transaction.category}
                                </Text>
                                <Text style={styles.typeCell}>
                                    {transaction.type}
                                </Text>
                                <Text style={styles.amountCell}>
                                    {currencyFormatter.format(transaction.amount)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                    `Page ${pageNumber} of ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};

export default DashboardReportDocument;