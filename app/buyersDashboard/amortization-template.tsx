import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica', backgroundColor: '#111111', color: '#ffffff' },
  header: { fontSize: 18, marginBottom: 20, textAlign: 'center', fontWeight: 'bold', color: '#f8ed1a', textTransform: 'uppercase' },
  table: { display: 'flex', flexDirection: 'column', width: '100%' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#333', paddingVertical: 8 },
  tableHeader: { fontWeight: 'bold', backgroundColor: '#1a1a1a', color: '#529e14' },
  colDate: { width: '15%', textAlign: 'left' },
  colNum: { width: '17%', textAlign: 'right' },
  colStatus: { width: '17%', textAlign: 'right', textTransform: 'uppercase' }
});

const formatMoney = (amount: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export default function AmortizationTemplate({ data }: { data: any[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Amortization Schedule</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colDate}>Date</Text>
            <Text style={styles.colNum}>Payment</Text>
            <Text style={styles.colNum}>Principal</Text>
            <Text style={styles.colNum}>Interest</Text>
            <Text style={styles.colNum}>Balance</Text>
            <Text style={styles.colStatus}>Status</Text>
          </View>
          {data.map((row, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDate}>
                {new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
              </Text>
              <Text style={styles.colNum}>{formatMoney(row.payment)}</Text>
              <Text style={styles.colNum}>{formatMoney(row.principal)}</Text>
              <Text style={styles.colNum}>{formatMoney(row.interest)}</Text>
              <Text style={styles.colNum}>{formatMoney(row.balance)}</Text>
              <Text style={styles.colStatus}>{row.status}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}