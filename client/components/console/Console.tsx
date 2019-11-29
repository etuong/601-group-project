import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./Console.scss";
import { Weapon } from "./Weapon";
import { Suspect } from "./Suspect";
import { Room } from "./Room";

export const Console = props => {
  const [player, setPlayer] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [weapon, setWeapon] = useState<string>("");
  const [room] = useState<string>(Room.Study);
  const [suspect, setSuspect] = useState<string>("");

  let outputMessage = "";

  useEffect(() => {
    setPlayer(props.player);
  });

  useEffect(() => {
    setPlayer(props.player);

    props.socket.on("message", function(msg) {
      updateOutputMessage(msg);
    });

    props.socket.on("new-player", function(newPlayer) {
      updateOutputMessage(newPlayer);
    });
  }, []);

  const updateOutputMessage = (msg: string) => {
    console.log("message: " + msg);
    outputMessage = outputMessage.concat(msg) + "\r\n\r\n";
    setOutput(outputMessage);
    var textarea = document.getElementById("console_output");
    textarea!.scrollTop = textarea!.scrollHeight;
  };

  const handleSuspectChange = selectedOption => {
    setSuspect(selectedOption.label);
  };

  const handleWeaponChange = selectedOption => {
    setWeapon(selectedOption.label);
  };

  const accuse = () => {
    const message =
      suspect + " is the murderer in the " + room + " room using a " + weapon;
    props.socket.emit("channel-message", player, "Accusation", message);
  };

  const suggest = () => {
    const message =
      suspect + " is the murderer in the " + room + " room using a " + weapon;
    props.socket.emit("channel-message", player, "Suggestion", message);
  };

  const weapons = Object.keys(Weapon).filter(item => {
    return isNaN(Number(item));
  });

  const suspects = Object.keys(Suspect).filter(item => {
    return isNaN(Number(item));
  });

  const rooms = Object.keys(Room).filter(item => {
    return isNaN(Number(item));
  });

  const customStyle = {
    container: styles => ({ ...styles, width: "40%" })
  };

  return (
    <div className="console-container">
      <p className="title">Console</p>
      <div className="block">
        <label>Suspects:</label>
        <Select
          placeholder="Select a suspect.."
          styles={customStyle}
          options={suspects.map(v => ({
            label: Suspect[v],
            value: v
          }))}
          onChange={handleSuspectChange}
        />
      </div>
      <div className="block">
        <label>Rooms:</label>
        <Select
          placeholder={room}
          isDisabled={true}
          styles={customStyle}
          options={rooms.map(v => ({
            label: Room[v]
          }))}
        />
      </div>
      <div className="block">
        <label>Weapons:</label>
        <Select
          placeholder="Select a weapon.."
          styles={customStyle}
          options={weapons.map(v => ({
            label: Weapon[v],
            value: v
          }))}
          onChange={handleWeaponChange}
        />
      </div>
      <div className="announce">
        <button className="suggest" onClick={suggest}>
          Suggest
        </button>
        <button className="accuse" onClick={accuse}>
          Accuse
        </button>
      </div>
      <div className="output">
        <label>Output</label>
        <textarea id="console_output" value={output} readOnly />
      </div>
    </div>
  );
};
