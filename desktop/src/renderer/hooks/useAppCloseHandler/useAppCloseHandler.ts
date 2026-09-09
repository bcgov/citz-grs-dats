import { useEffect, useRef, useState } from "react";
import { useNavigate } from "../useNavigate";

export const useAppCloseHandler = () => {
  const [api] = useState(window.api);
  const [showClosePrompt, setShowClosePrompt] = useState(false);

  const { canLoseProgress } = useNavigate();

  const canLoseProgressRef = useRef(canLoseProgress);
  canLoseProgressRef.current = canLoseProgress;

  useEffect(() => {
    api.onAppCloseRequested(() => {
      if (canLoseProgressRef.current) {
        setShowClosePrompt(true);
      } else {
        api.forceQuitApp();
      }
    });
  }, [api]);

  const confirmClose = () => {
    api.forceQuitApp();
  };

  return {
    showClosePrompt,
    confirmClose,
    cancelClose: () => setShowClosePrompt(false),
  };
};
