import React from "react";
import Popup from "./Popup";

interface ResultPopupProps {
  message: string;
  onClose: () => void;
}

const ResultPopup: React.FC<ResultPopupProps> = ({ message, onClose }) => {
  return (
    <Popup title="Result" onClose={onClose}>
      <p>{message}</p>
    </Popup>
  );
};

export default ResultPopup;