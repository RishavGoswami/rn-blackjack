import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Card from './components/Card';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b1b1b',
    paddingHorizontal: 40,
    justifyContent: 'center',
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  inputWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  input: {
    flex: 0.8,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    color: 'white',
    paddingTop: 15,
  },
  placeBet: {
    fontSize: 16,
    color: 'white',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: 'white',
    padding: 10,
  },
  wallet: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    color: 'white',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: 'white',
  },
  handCount: {marginVertical: 10, fontSize: 18, color: 'white'},
});

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deck: [],
      dealer: null,
      player: null,
      wallet: 0,
      inputValue: '',
      currentBet: null,
      gameOver: false,
      message: null,
    };
  }

  componentWillMount() {
    this.startNewGame();
  }

  generateDeck() {
    const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
    const suits = ['♦', '♣', '♥', '♠'];
    const deck = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = 0; j < suits.length; j++) {
        deck.push({number: cards[i], suit: suits[j]});
      }
    }
    return deck;
  }

  getDealCards(deck) {
    const playerCard1 = this.getRandomCard(deck);
    const dealerCard = this.getRandomCard(playerCard1.updatedDeck);
    const playerCard2 = this.getRandomCard(dealerCard.updatedDeck);
    const playerStartingHand = [playerCard1.randomCard, playerCard2.randomCard];
    const dealerStartingHand = [dealerCard.randomCard, {}];

    const player = {
      cards: playerStartingHand,
      count: this.getCount(playerStartingHand),
    };
    const dealer = {
      cards: dealerStartingHand,
      count: this.getCount(dealerStartingHand),
    };

    return {updatedDeck: playerCard2.updatedDeck, player, dealer};
  }

  startNewGame(type) {
    if (type === 'continue') {
      if (this.state.wallet > 0) {
        const deck =
          this.state.deck.length < 10 ? this.generateDeck() : this.state.deck;
        const {updatedDeck, player, dealer} = this.getDealCards(deck);

        this.setState({
          deck: updatedDeck,
          dealer,
          player,
          currentBet: null,
          gameOver: false,
          message: null,
        });
      } else {
        this.setState({
          message: 'Game over! You are broke! Please start a new game.',
        });
      }
    } else {
      const deck = this.generateDeck();
      const {updatedDeck, player, dealer} = this.getDealCards(deck);

      this.setState({
        deck: updatedDeck,
        dealer,
        player,
        wallet: 100,
        inputValue: '',
        currentBet: null,
        gameOver: false,
        message: null,
      });
    }
  }

  getRandomCard(deck) {
    const updatedDeck = deck;
    const randomIndex = Math.floor(Math.random() * updatedDeck.length);
    const randomCard = updatedDeck[randomIndex];
    updatedDeck.splice(randomIndex, 1);
    return {randomCard, updatedDeck};
  }

  placeBet = () => {
    const currentBet = this.state.inputValue;
    if (currentBet > this.state.wallet) {
      this.setState({message: 'Insufficient funds to bet that amount.'});
    } else if (currentBet % 1 !== 0) {
      this.setState({message: 'Please bet whole numbers only.'});
    } else {
      const wallet = this.state.wallet - currentBet;
      this.setState({wallet, inputValue: '', currentBet});
    }
  };

  hit() {
    if (!this.state.gameOver) {
      if (this.state.currentBet) {
        const {randomCard, updatedDeck} = this.getRandomCard(this.state.deck);
        const player = this.state.player;
        player.cards.push(randomCard);
        player.count = this.getCount(player.cards);

        if (player.count > 21) {
          this.setState({player, gameOver: true, message: 'BUST!'});
        } else {
          this.setState({deck: updatedDeck, player});
        }
      } else {
        this.setState({message: 'Please place bet.'});
      }
    } else {
      this.setState({message: 'Game over! Please start a new game.'});
    }
  }

  dealerDraw(dealer, deck) {
    const {randomCard, updatedDeck} = this.getRandomCard(deck);
    dealer.cards.push(randomCard);
    dealer.count = this.getCount(dealer.cards);
    return {dealer, updatedDeck};
  }

  getCount(cards) {
    const rearranged = [];
    cards.forEach((card) => {
      if (card.number === 'A') {
        rearranged.push(card);
      } else if (card.number) {
        rearranged.unshift(card);
      }
    });

    return rearranged.reduce((total, card) => {
      if (card.number === 'J' || card.number === 'Q' || card.number === 'K')
        return total + 10;
      if (card.number === 'A') return total + 11 <= 21 ? total + 11 : total + 1;
      return total + card.number;
    }, 0);
  }

  stand() {
    if (!this.state.gameOver) {
      // Show dealer's 2nd card
      const randomCard = this.getRandomCard(this.state.deck);
      let deck = randomCard.updatedDeck;
      let dealer = this.state.dealer;
      dealer.cards.pop();
      dealer.cards.push(randomCard.randomCard);
      dealer.count = this.getCount(dealer.cards);

      // Keep drawing cards until count is 17 or more
      while (dealer.count < 17) {
        const draw = this.dealerDraw(dealer, deck);
        dealer = draw.dealer;
        deck = draw.updatedDeck;
      }

      if (dealer.count > 21) {
        this.setState({
          deck,
          dealer,
          wallet: this.state.wallet + this.state.currentBet * 2,
          gameOver: true,
          message: 'Dealer bust! You win!',
        });
      } else {
        const winner = this.getWinner(dealer, this.state.player);
        let wallet = this.state.wallet;
        let message;

        if (winner === 'dealer') {
          message = 'Dealer wins...';
        } else if (winner === 'player') {
          wallet += this.state.currentBet * 2;
          message = 'You win!';
        } else {
          wallet += this.state.currentBet;
          message = 'Push.';
        }

        this.setState({
          deck,
          dealer,
          wallet,
          gameOver: true,
          message,
        });
      }
    } else {
      this.setState({message: 'Game over! Please start a new game.'});
    }
  }

  getWinner(dealer, player) {
    if (dealer.count > player.count) return 'dealer';
    if (dealer.count < player.count) return 'player';
    return 'push';
  }

  handleOnChange = (inputValue) => this.setState({inputValue});

  render() {
    const {
      dealer,
      wallet,
      currentBet,
      inputValue,
      gameOver,
      player,
      message,
    } = this.state;
    let dealerCount;
    const card1 = dealer.cards[0].number;
    const card2 = dealer.cards[1].number;
    if (card2) {
      dealerCount = dealer.count;
    } else {
      if (card1 === 'J' || card1 === 'Q' || card1 === 'K') {
        dealerCount = 10;
      } else if (card1 === 'A') {
        dealerCount = 11;
      } else {
        dealerCount = card1;
      }
    }
    return (
      <ScrollView
        style={{
          backgroundColor: '#1b1b1b',
        }}
        contentContainerStyle={{
          flex: 1,
          backgroundColor: '#1b1b1b',
        }}>
        <View style={styles.container}>
          <Text
            style={{
              fontSize: 28,
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: 24,
              color: 'white',
            }}>
            BLACKJACK
          </Text>
          <View>
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => {
                  this.startNewGame();
                }}
                style={styles.button}>
                <Text style={{color: 'white', fontSize: 18}}>New Game</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.hit();
                }}
                style={styles.button}>
                <Text style={{color: 'white', fontSize: 18}}>Hit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.stand();
                }}
                style={styles.button}>
                <Text style={{color: 'white', fontSize: 18}}>Stand</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.wallet}>Wallet: ${wallet}</Text>
            {!currentBet ? (
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your bet here"
                  placeholderTextColor="white"
                  value={inputValue}
                  onChangeText={this.handleOnChange}
                  keyboardType="number-pad"
                />
                <TouchableOpacity onPress={this.placeBet}>
                  <Text style={styles.placeBet}> Place Bet</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {gameOver ? (
              <View style={styles.buttons}>
                <TouchableOpacity
                  onPress={() => {
                    this.startNewGame('continue');
                  }}>
                  <Text> Continue</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <Text style={styles.handCount}>Your Hand ( {player.count} )</Text>
            <ScrollView horizontal contentContainerStyle={{padding: 5}}>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                {player.cards.map((card, i) => {
                  return <Card key={i} number={card.number} suit={card.suit} />;
                })}
              </View>
            </ScrollView>

            <Text style={styles.handCount}>
              Dealer's Hand ( {dealer.count} )
            </Text>
            <ScrollView horizontal contentContainerStyle={{padding: 5}}>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                {dealer.cards.map((card, i) => {
                  return <Card key={i} number={card.number} suit={card.suit} />;
                })}
              </View>
            </ScrollView>

            <Text
              style={{
                marginVertical: 10,
                fontSize: 20,
                fontWeight: '600',
                color: 'white',
              }}>
              {message}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
