import * as React from "react";
import "./App.scss";
import Notes from "./components/note/Notes";
import { Board } from "./components/board/Board";
import { Modal } from "./components/modal/Modal";
import { Console } from "./components/console/Console";
import { Cards } from "./components/Card/Cards";
import { ApiClient } from "./ApiClient";
import { Suspect } from "./components/console/Suspect";

interface AppProps {}

interface AppState {
  disable: boolean;
  player: string;
  character: string;
  isPlaying: boolean;
  currentPlayerHeader: string;
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      disable: true,
      player: "",
      character: "",
      isPlaying: false,
      currentPlayerHeader: ""
    };
    this.socket = this.io.connect("http://localhost:3001", { reconnect: true });
  }

  componentDidMount() {
    this.setIsPlaying();

    this.socket.on("start", async msg => {
      const response = await ApiClient.get("/player/" + this.state.player);
      console.log(msg);
      this.setPlayerDeck(response);
      this.enableGame();
    });

    this.socket.on("current-player", async msg => {
      this.setState({
        currentPlayerHeader: msg
      });
    });
  }

  private socket;
  private io = require("socket.io-client");

  playerCards = new Map();

  enableGame = () => this.setState({ disable: false });

  setPlayerName = (player, character) => {
    this.setState({ player: player, character: character });
    this.socket.emit("channel-new-player", player);
  };

  setIsPlaying = async () => {
    const flag = await ApiClient.get("/start");
    this.setState({ isPlaying: flag.isPlaying });
  };

  handleStartButton = async () => {
    const { player } = this.state;
    const response = await ApiClient.post("/start");
    const current_player = response["current_player"];
    const current_character = response[current_player].character_name;
    this.socket.emit("channel-start", player);
    this.socket.emit(
      "channel-current-player",
      current_player,
      current_character,
      Suspect[current_character]
    );
  };

  handleDisapproval = async card => {
    alert(this.playerCards.get(card));
  };

  setPlayerDeck = response => {
    response.cards.map((c: string) =>
      this.playerCards.set(require("./assets/" + c + ".jpg"), c)
    );
  };

  render() {
    const {
      disable,
      player,
      character,
      isPlaying,
      currentPlayerHeader
    } = this.state;
    if (!isPlaying) {
      return (
        <>
          <Modal handleCallback={this.setPlayerName} />
          {disable && (
            <button className="start-game" onClick={this.handleStartButton}>
              START!
            </button>
          )}
          {!disable && (
            <button className="current-player">
              {currentPlayerHeader} Turn
            </button>
          )}
          <div className={`app ${disable && "disable"}`}>
            <Board socket={this.socket} player={player} character={character} />
            <div className="section">
              <Cards
                set={Array.from(this.playerCards.keys())}
                socket={this.socket}
                player={player}
                cardClick={this.handleDisapproval}
              />
              <div className="section-child">
                <Console
                  player={player}
                  character={character}
                  socket={this.socket}
                  io={this.io}
                />
                <Notes />
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <p className="already-playing">
          THE GAME IS ALREADY PLAYING! PLEASE WAIT FOR THE NEXT GAME.
        </p>
      );
    }
  }
}
