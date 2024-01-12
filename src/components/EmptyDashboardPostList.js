import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './EmptyDashboardPostListStyles';

const EmptyDashboardPostList = ({ message = "No posts to show" }) => {
  return (
    <View style={styles.emptyContainer}>
      <Icon name="images-outline" size={50} color="#ccc" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

export default EmptyDashboardPostList;
