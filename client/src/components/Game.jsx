import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { socket } from '../socket';
import { ERROR_MESSAGES } from '../errorMessages';

export default function Game({ roomId, color, fen: initialFen, opponentConnected: initialOpponentConnected, onLeave }) {
  const chessRef = useRef(new Chess(initialFen));
  const [fen, setFen] = useState(initialFen);
  const [opponentConnected, setOpponentConnected] = useState(initialOpponentConnected);
  const [gameOverText, setGameOverText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    function handleOpponentJoined() {
      setOpponentConnected(true);
      setMessage('');
    }
    function handleOpponentLeft() {
      setOpponentConnected(false);
      setMessage('Rakip odadan ayrıldı.');
    }
    function handleMove({ fen: newFen, status }) {
      chessRef.current.load(newFen);
      setFen(newFen);
      if (status.isGameOver) {
        if (status.isCheckmate) {
          const winner = status.turn === 'w' ? 'Siyah' : 'Beyaz';
          setGameOverText(`Şah mat! ${winner} kazandı.`);
        } else if (status.isStalemate) {
          setGameOverText('Pat! Berabere.');
        } else if (status.isDraw) {
          setGameOverText('Berabere.');
        }
      }
    }

    socket.on('room:opponent-joined', handleOpponentJoined);
    socket.on('room:opponent-left', handleOpponentLeft);
    socket.on('game:move', handleMove);

    return () => {
      socket.off('room:opponent-joined', handleOpponentJoined);
      socket.off('room:opponent-left', handleOpponentLeft);
      socket.off('game:move', handleMove);
    };
  }, []);

  const chessboardOptions = useMemo(
    () => ({
      position: fen,
      boardOrientation: color === 'w' ? 'white' : 'black',
      id: roomId,
      canDragPiece: ({ piece }) => {
        if (gameOverText || !opponentConnected) return false;
        const pieceColor = piece.pieceType[0];
        return pieceColor === color && chessRef.current.turn() === color;
      },
      onPieceDrop: ({ sourceSquare, targetSquare }) => {
        if (!targetSquare) return false;

        const localMove = chessRef.current.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q',
        });
        if (!localMove) return false;

        setFen(chessRef.current.fen());

        socket.emit(
          'game:move',
          { roomId, from: sourceSquare, to: targetSquare, promotion: 'q' },
          (res) => {
            if (res?.error) {
              chessRef.current.undo();
              setFen(chessRef.current.fen());
              setMessage(ERROR_MESSAGES[res.error] || res.error);
            }
          },
        );
        return true;
      },
    }),
    [fen, color, roomId, opponentConnected, gameOverText],
  );

  const turnText = chessRef.current.turn() === color ? 'Sıra sizde' : 'Rakibin sırası';

  return (
    <div className="game">
      <div className="game-header">
        <span>
          Oda: <strong>{roomId}</strong>
        </span>
        <span>
          Renk: <strong>{color === 'w' ? 'Beyaz' : 'Siyah'}</strong>
        </span>
        <button onClick={onLeave}>Odadan Ayrıl</button>
      </div>
      {!opponentConnected && !gameOverText && (
        <p className="status">Rakip bekleniyor... Oda kodunu paylaşın.</p>
      )}
      {opponentConnected && !gameOverText && <p className="status">{turnText}</p>}
      {message && <p className="error">{message}</p>}
      {gameOverText && <p className="status game-over">{gameOverText}</p>}
      <div className="board-wrapper">
        <Chessboard options={chessboardOptions} />
      </div>
    </div>
  );
}
