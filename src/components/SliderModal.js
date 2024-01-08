import React, { useRef } from 'react';
import { Animated, Modal, PanResponder, TouchableOpacity, View } from 'react-native';
import styles from './SliderModalStyles';

const SliderModal = ({ dropdownVisible, setDropdownVisible, children }) => {
  const modalY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      const newY = Math.max(-5, gestureState.dy);
      modalY.setValue(newY);
    },
    onPanResponderRelease: (e, { dy }) => {
      if (dy > 50) {
        setDropdownVisible(false);
      } else {
        Animated.spring(modalY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  })).current;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={dropdownVisible}
      onRequestClose={() => setDropdownVisible(false)}
    >
      <TouchableOpacity
        style={styles.fullScreenButton}
        activeOpacity={1}
        onPressOut={() => setDropdownVisible(false)}
      >
        <Animated.View
          style={[styles.sliderContainer, { transform: [{ translateY: modalY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.sliderHandle} />
          {children}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SliderModal;
