import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCol: {
    flex: 1,
  },
  tableColHeader: {
    fontWeight: 'bold',
  },
  total: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    fontSize: 9,
    color: '#666',
  },
  statusBadge: {
    padding: 5,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});

interface InvoicePDFProps {
  data: {
    invoiceNumber: string;
    issueDate: string;
    dueDate?: string;
    paidDate?: string;
    status: string;
    company: {
      name: string;
      email: string;
    };
    influencer: {
      name: string;
      email: string;
    };
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    amount: number;
    platformFee: number;
    influencerAmount: number;
    currency: string;
    description?: string;
    billingAddress?: any;
  };
}

// PDF Document Component
const InvoicePDFDocument: React.FC<InvoicePDFProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>
          <View style={styles.statusBadge}>
            <Text>{data.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text style={styles.value}>{formatDate(data.issueDate)}</Text>
          </View>
          {data.dueDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{formatDate(data.dueDate)}</Text>
            </View>
          )}
          {data.paidDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Paid Date:</Text>
              <Text style={styles.value}>{formatDate(data.paidDate)}</Text>
            </View>
          )}
        </View>

        {/* Bill To / From */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Bill To:</Text>
              <Text>{data.company.name}</Text>
              <Text style={{ color: '#666' }}>{data.company.email}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Service Provider:</Text>
              <Text>{data.influencer.name}</Text>
              <Text style={{ color: '#666' }}>{data.influencer.email}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {data.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description:</Text>
            <Text>{data.description}</Text>
          </View>
        )}

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.tableCol, { flex: 3 }]}>
              <Text style={styles.tableColHeader}>Description</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableColHeader, { textAlign: 'right' }]}>Qty</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableColHeader, { textAlign: 'right' }]}>
                Unit Price
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableColHeader, { textAlign: 'right' }]}>
                Total
              </Text>
            </View>
          </View>

          {data.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { flex: 3 }]}>
                <Text>{item.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={{ textAlign: 'right' }}>{item.quantity}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={{ textAlign: 'right' }}>
                  {formatCurrency(item.unitPrice)}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={{ textAlign: 'right' }}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.total}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(data.amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Platform Fee:</Text>
            <Text>{formatCurrency(data.platformFee)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Influencer Receives:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(data.influencerAmount)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text style={{ marginTop: 5 }}>
            This invoice was generated automatically. For questions, please contact
            support.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Download Button Component
export const InvoicePDFDownload: React.FC<InvoicePDFProps> = ({ data }) => {
  return (
    <PDFDownloadLink
      document={<InvoicePDFDocument data={data} />}
      fileName={`invoice-${data.invoiceNumber}.pdf`}
      className="btn btn-primary"
    >
      {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
    </PDFDownloadLink>
  );
};

export default InvoicePDFDocument;
