import { useState } from 'react';
import { socket } from '../socket';
import { ERROR_MESSAGES } from '../errorMessages';

export default function Home({ onJoined }) {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    setError('');
    socket.emit('room:create', {}, (res) => {
      setLoading(false);
      if (res?.error) {
        setError(ERROR_MESSAGES[res.error] || res.error);
        return;
      }
      onJoined(res);
    });
  };

  const handleJoin = () => {
    if (!roomCode.trim()) {
      setError('Oda kodu girin');
      return;
    }
    setLoading(true);
    setError('');
    socket.emit('room:join', { roomId: roomCode.trim().toUpperCase() }, (res) => {
      setLoading(false);
      if (res?.error) {
        setError(ERROR_MESSAGES[res.error] || res.error);
        return;
      }
      onJoined(res);
    });
  };

  return (
    <div className="home">
      <h1>♟️ Satranç</h1>
      <button onClick={handleCreate} disabled={loading}>
        Yeni Oda Kur
      </button>
      <div className="divider">veya</div>
      <div className="join-row">
        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Oda kodu"
          maxLength={5}
        />
        <button onClick={handleJoin} disabled={loading}>
          Odaya Katıl
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
