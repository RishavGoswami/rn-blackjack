import React from 'react';
import PropTypes from 'prop-types'; // ES6
import {View, Text, StyleSheet, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const shadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.22,
  shadowRadius: 2.22,

  elevation: 3,
};
const styles = StyleSheet.create({
  card: {
    height: 150,
    width: width * 0.22,
    backgroundColor: '#fff',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
    ...shadow,
  },
  black: {
    color: 'black',
  },
  red: {
    color: 'red',
  },
  suitTop: {fontSize: 22, position: 'absolute', top: 5, left: 5},
  suitBottom: {fontSize: 22, position: 'absolute', bottom: 5, right: 5},
});
const Card = ({number, suit}) => {
  Card.propTypes = {
    number: PropTypes.number.isRequired,
    suit: PropTypes.string.isRequired,
  };

  const combo = number ? `${number} ${suit}` : null;
  const color = suit === '♦' || suit === '♥' ? styles.red : styles.black;

  return (
    combo && (
      <View style={styles.card}>
        <Text style={[color, styles.suitTop]}>{combo}</Text>
        <Text style={[color, styles.suitBottom]}>{combo}</Text>
      </View>
    )
  );
};

Card.defaultProps = {
  number: 2,
  suit: '♥',
};

export default Card;
