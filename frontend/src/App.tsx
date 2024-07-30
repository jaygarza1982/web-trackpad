import React, { useState, useCallback, useEffect } from 'react';
import './App.css';

interface Position {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [startTouch, setStartTouch] = useState<Position | null>(null);

  const [ws, setWs] = useState<WebSocket | null>(null);

  function getWebSocketUrl() : string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(getWebSocketUrl());

    socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(socket);

    // Clean up WebSocket connection on unmount
    return () => {
      socket.close();
    };
  }, []);

  const sendMoveMouseCommand = async (x: number, y: number) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        action: 'movemouse',
        x,
        y
      });
      ws.send(message);
    }
  };

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    console.log('Started touch at', touch.clientX, touch.clientY);

    setStartTouch({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (startTouch) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - startTouch.x;
      const deltaY = touch.clientY - startTouch.y;

      setPosition(prevPosition => {
        // Last part of equation is a multiplier for faster movement
        let x = Math.abs(prevPosition.x + deltaX) + (deltaX * 1);
        let y = Math.abs(prevPosition.y + deltaY) + (deltaY * 1);

        // Keep within bounds of screen. This does not work completely but helps with some bugs
        // We also round since it does not make sense to move the mouse to a fraction
        x = Math.round(Math.min(1920, x));
        y = Math.round(Math.min(1080, y));

        const newPosition = { x, y };

        sendMoveMouseCommand(newPosition.x, newPosition.y);

        return newPosition;
      });

      setStartTouch({ x: touch.clientX, y: touch.clientY });
    }
  }, [startTouch]);

  const handleTouchEnd = useCallback(() => {
    setStartTouch(null);
  }, []);

  return (
    <div 
      className="trackpad" 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
    </div>
  );
}

export default App;
