# ♟️ Satranç

Basit, oda tabanlı, iki kişilik gerçek zamanlı satranç uygulaması. Bir oda kur, kodu rakibine gönder, oyna.

**Canlı demo:** https://client-olive-kappa.vercel.app

> Not: Backend ücretsiz Render planında barındığı için bir süre kullanılmazsa uykuya geçer; ilk istek 30-60 saniye gecikebilir.

## Özellikler

- Oda kur / oda koduyla katıl (her oda tam 2 kişilik)
- Gerçek zamanlı hamle senkronizasyonu (Socket.io)
- Hamle kuralları [chess.js](https://github.com/jhlywa/chess.js) ile hem client hem server tarafında doğrulanır (server otoriter kaynaktır — hile/senkron sorunlarına karşı)
- Şah mat / pat / berabere durumları algılanır

## Tech Stack

- **Server**: Node.js, Express, Socket.io
- **Client**: React (Vite), [react-chessboard](https://github.com/Clariity/react-chessboard), socket.io-client

## Kurulum

```bash
# server
cd server
cp .env.example .env
npm install
npm run dev      # http://localhost:3001

# client (ayrı terminalde)
cd client
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

## Proje yapısı

```
client/   React + Vite frontend
server/   Express + Socket.io backend (oda yönetimi, hamle doğrulama)
```

Mimari detayları, socket event sözleşmesi ve deploy notları için [CLAUDE.md](./CLAUDE.md) dosyasına bakabilirsin.
