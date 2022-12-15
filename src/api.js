const API_KEY =
  "20ec8e96925186e23c6a7468ca612470ad6ba7ca1b5e6ae3fa7e85e065a1bd46";
const WS_BASE_URL = "wss://streamer.cryptocompare.com/v2";
const AGGREGATE_INDEX = "5";
const tickersHandler = new Map();

const socket = new WebSocket(`${WS_BASE_URL}?api_key=${API_KEY}`);

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handler = tickersHandler.get(currency) ?? [];
  handler.forEach((fn) => fn(newPrice));
});

function sendToWebSocket(message) {
  const strinfigiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(strinfigiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(message);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeFormTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandler.get(ticker) || [];
  tickersHandler.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandler.delete(ticker);
  unsubscribeFormTickerOnWs(ticker);
};
