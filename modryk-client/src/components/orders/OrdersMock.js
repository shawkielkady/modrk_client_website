export const ORDERS = Array.from({ length: 3 }, (_, i) => ({
  id: i + 1,
  number: `123456789${i}`,
  date: "2022-01-01",
  status: "delivered",
}));
