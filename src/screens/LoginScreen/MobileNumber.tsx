import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export const MobileNumber = () => {
  return (
    <View>
      <Text>Mobile Number</Text>
      <TextInput
        placeholder="Enter your mobile number"
        keyboardType="numeric"
        maxLength={10}
      />
      <Button
        title="Continue"
        onPress={() => {
          console.log('Continue');
        }}
      />
    </View>
  );
};