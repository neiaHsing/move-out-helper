// Shared frontend types. The cloud database schema is defined in migrations/.
export type Room = {
  id: string;
  name: string;
  description: string;
  color: string;
};

export type Bin = {
  id: string;
  name: string;
  description: string;
  roomId: string;
};

export type Item = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  value: number;
  photoUrl: string | null;
  binId: string;
};

export type InsertRoom = Omit<Room, "id">;
export type InsertBin = Omit<Bin, "id">;
export type InsertItem = Omit<Item, "id">;
