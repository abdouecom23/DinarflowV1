import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../../stores/app.store';
import { useEffect } from 'react';

export default function HomeScreen() {
  const { account, refreshBalance } = useAppStore();

  useEffect(() => {
    refreshBalance();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DinarFlow</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.label}>Available Balance</Text>
        <Text style={styles.balance}>
          {account ? `${(Number(account.balance) / 100).toFixed(2)} DZD` : 'Loading...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  balanceCard: { padding: 20, backgroundColor: '#f0f0f0', borderRadius: 10 },
  label: { fontSize: 14, color: '#666' },
  balance: { fontSize: 28, fontWeight: 'bold', marginTop: 10 },
});
