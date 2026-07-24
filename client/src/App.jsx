import { useState } from 'react';
import Home from './components/Home';
import Game from './components/Game';
import { socket } from './socket';
import './App.css';

function App() {
  const [session, setSession] = useState(null);

  const handleLeave = () => {
    socket.disconnect();
    socket.connect();
    setSession(null);
  };

  return (
    <div className="app">
      {session ? (
        <Game
          roomId={session.roomId}
          color={session.color}
          fen={session.fen}
          opponentConnected={session.opponentConnected}
          onLeave={handleLeave}
        />
      ) : (
        <Home onJoined={setSession} />
      )}
    </div>
  );
}

export default App;
