import { useEffect, useState } from "react";

export const useAppCloseHandler = () => {
  const [api] = useState(window.api);
  const [showClosePrompt, setShowClosePrompt] = useState(false);

  useEffect(() => {
    api.onAppCloseRequested(() => {
      setShowClosePrompt(true);
    });
  }, []);

  const confirmClose = () => {
    api.forceQuitApp();
  };

  return {
    showClosePrompt,
    confirmClose,
    cancelClose: () => setShowClosePrompt(false),
  };
};
