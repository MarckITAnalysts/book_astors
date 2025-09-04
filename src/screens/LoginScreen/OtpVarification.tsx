import React from 'react';
import { View, Text, Button, TextInput } from 'react-native';

export const OtpVarification = () => {
  return (
    <View>
      <Text>Otp Varification</Text>
      <TextInput
        placeholder="Enter your otp"
        keyboardType="numeric"
        maxLength={6}
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