import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, ScrollView, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const BillPage = () => {
  const params = useLocalSearchParams();
  const [form, setForm] = useState({
    serviceType: '',
    serviceBoyName: '',
    customerName: '',
    address: '',
    contactNumber: '',
    serviceCharge: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashGiven, setCashGiven] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [gstRate] = useState(0.25); // 25% GST

  useEffect(() => {
    if (params.serviceData) {
      try {
        const serviceData = JSON.parse(params.serviceData as string);
        setForm({
          serviceType: serviceData.serviceType || '',
          serviceBoyName: serviceData.serviceBoyName || '',
          customerName: serviceData.customerName || '',
          address: serviceData.address || '',
          contactNumber: serviceData.contactNumber || '',
          serviceCharge: serviceData.serviceCharge || '',
        });
        setIsFormVisible(true);
      } catch (error) {
        console.error('Error parsing service data:', error);
      }
    }
  }, [params.serviceData]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const calculateGST = () => {
    const charge = parseFloat(form.serviceCharge) || 0;
    return (charge * gstRate).toFixed(2);
  };

  const calculateTotal = () => {
    const charge = parseFloat(form.serviceCharge) || 0;
    const gst = parseFloat(calculateGST()) || 0;
    return (charge + gst).toFixed(2);
  };

  const calculateChange = () => {
    const total = parseFloat(calculateTotal()) || 0;
    const given = parseFloat(cashGiven) || 0;
    return given > total ? (given - total).toFixed(2) : '0.00';
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Bill Summary</Text>

        {isFormVisible ? (
          <>
            {/* Service Details Section */}
            <Text style={styles.sectionTitle}>Service Details</Text>
            {Object.entries(form).map(([key, value]) => (
              <TextInput
                key={key}
                placeholder={key.replace(/([A-Z])/g, ' $1')}
                style={styles.input}
                keyboardType={key === 'contactNumber' || key === 'serviceCharge' ? 'numeric' : 'default'}
                value={value}
                onChangeText={(text) => handleChange(key, text)}
              />
            ))}

            {/* Charges Breakdown */}
            <View style={styles.chargesContainer}>
              <View style={styles.chargeRow}>
                <Text style={styles.chargeLabel}>Service Charge:</Text>
                <Text style={styles.chargeValue}>₹{form.serviceCharge || '0.00'}</Text>
              </View>
              <View style={styles.chargeRow}>
                <Text style={styles.chargeLabel}>Tax (25%):</Text>
                <Text style={styles.chargeValue}>₹{calculateGST()}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentMethod('cash')}>
                <View style={[styles.radioCircle, paymentMethod === 'cash' && styles.selected]} />
                <Text style={styles.radioText}>Cash</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentMethod('upi')}>
                <View style={[styles.radioCircle, paymentMethod === 'upi' && styles.selected]} />
                <Text style={styles.radioText}>UPI</Text>
              </TouchableOpacity>
            </View>


            {/* Payment Details */}
            {paymentMethod === 'cash' && (
              <View style={styles.cashContainer}>
                <Text style={styles.sectionTitle}>Cash Payment</Text>
                <TextInput
                  placeholder="Amount Given by Customer"
                  style={styles.input}
                  keyboardType="numeric"
                  value={cashGiven}
                  onChangeText={setCashGiven}
                />
                <View style={styles.changeContainer}>
                  <Text style={styles.changeLabel}>Change to Return:</Text>
                  <Text style={styles.changeValue}>₹{calculateChange()}</Text>
                </View>
              </View>
            )}

            {paymentMethod === 'upi' && (
              <View style={styles.upiContainer}>
                <Text style={styles.sectionTitle}>Scan UPI QR Code</Text>
                <Image
                  source={require('../assets/images/payment.jpg')}
                  style={styles.qrCode}
                />
                <Text style={styles.upiId}>UPI ID: yourupi@bank</Text>
              </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={() => {
              console.log("Bill Details:", {
                ...form,
                paymentMethod,
                gst: calculateGST(),
                total: calculateTotal(),
                cashGiven: paymentMethod === 'cash' ? cashGiven : null,
                change: paymentMethod === 'cash' ? calculateChange() : null
              });
              setIsFormVisible(false);
            }}>
              <Text style={styles.submitText}>Submit Bill</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No bills created yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create a new bill</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={toggleFormVisibility}>
        <Ionicons name={isFormVisible ? 'close' : 'add'} size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f4f4f4',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 15,
    color: '#2c3e50',
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007bff',
    marginRight: 8,
  },
  selected: {
    backgroundColor: '#007bff',
  },
  radioText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  chargesContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  chargeLabel: {
    fontSize: 16,
    color: '#555',
  },
  chargeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
  },
  cashContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  changeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  changeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'green',
  },
  upiContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  qrCode: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 10,
    marginVertical: 10,
  },
  upiId: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007bff',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default BillPage;