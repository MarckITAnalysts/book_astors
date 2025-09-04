import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Dashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Text style={styles.greeting}>Good Morning, Rahul!</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search salons, services..."
            placeholderTextColor="black"
          />
        </View>


        {/* Nearby Salons Section */}
        <View style={styles.salonsSection}>
          <Text style={styles.sectionTitle}>NEARBY SALONS</Text>
          {/* Salon Cards */}
          <View style={styles.salonCard}>
            <View style={styles.salonIcon}>
              <Text>💇</Text>
            </View>
            <View style={styles.salonInfo}>
              <Text style={styles.salonName}>Beauty Salon</Text>
              <Text style={styles.salonLocation}>Ahmedabad</Text>
              <Text style={styles.salonRating}>4.8 (120 reviews)</Text>
              <Text style={styles.salonDistance}>2.5 km away</Text>
              <Text style={styles.salonServices}>Hair • Nails • Spa</Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.salonCard}>
            <View style={[styles.salonIcon, { backgroundColor: '#7BDFD3' }]}>
              <Text>✨</Text>
            </View>
            <View style={styles.salonInfo}>
              <Text style={styles.salonName}>Glamour Studio</Text>
              <Text style={styles.salonLocation}>Ahmedabad</Text>
              <Text style={styles.salonRating}>4.6 (89 reviews)</Text>
              <Text style={styles.salonDistance}>3.2 km away</Text>
              <Text style={styles.salonServices}>Hair • Makeup • Facial</Text>
            </View>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  offersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  offersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  offerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: '30%',
  },
  offerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  salonsSection: {
    marginBottom: 24,
  },
  salonCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salonIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#7B90FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  salonLocation: {
    color: '#666',
    marginBottom: 4,
  },
  salonRating: {
    color: '#333',
    marginBottom: 4,
  },
  salonDistance: {
    color: '#666',
    marginBottom: 4,
  },
  salonServices: {
    color: '#666',
  },
  viewButton: {
    backgroundColor: '#7B90FF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#7B90FF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default Dashboard;