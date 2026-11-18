const EXPIRES_IN_SECONDS = [5, 8];

export function getCartItems() {
  return EXPIRES_IN_SECONDS.map((seconds, i) => ({
    id: i + 1,
    number: "1234567890",
    date: "2022-01-01",
    type: "حري",
    quantity: "ربع ذبيحة",
    price: 450,
    expiresAt: Date.now() + seconds * 1000,
  }));
}
