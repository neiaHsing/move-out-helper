import type { Room, Bin, Item, InsertRoom, InsertBin, InsertItem } from "@shared/schema";
import { insforge } from "./insforge";

type DbRoom = { id: string; name: string; description: string; color: string };
type DbBin = { id: string; name: string; description: string; room_id: string };
type DbItem = { id: string; name: string; description: string; quantity: number; value: number | string; photo_url: string | null; bin_id: string };

function required<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  if (data === null) throw new Error("没有找到这条记录");
  return data;
}

const roomFromDb = (row: DbRoom): Room => row;
const binFromDb = (row: DbBin): Bin => ({ id: row.id, name: row.name, description: row.description, roomId: row.room_id });
const itemFromDb = (row: DbItem): Item => ({ id: row.id, name: row.name, description: row.description, quantity: row.quantity, value: Number(row.value), photoUrl: row.photo_url, binId: row.bin_id });
const binToDb = ({ roomId, ...rest }: Partial<InsertBin>) => ({ ...rest, ...(roomId !== undefined ? { room_id: roomId } : {}) });
const itemToDb = ({ binId, photoUrl, ...rest }: Partial<InsertItem>) => ({
  ...rest,
  ...(binId !== undefined ? { bin_id: binId } : {}),
  ...(photoUrl !== undefined ? { photo_url: photoUrl } : {}),
});

export const roomsApi = {
  getAll: async (): Promise<Room[]> => {
    const { data, error } = await insforge.database.from("rooms").select("id,name,description,color").order("created_at");
    return required(data, error).map(roomFromDb);
  },
  getById: async (id: string): Promise<Room> => {
    const { data, error } = await insforge.database.from("rooms").select("id,name,description,color").eq("id", id).single();
    return roomFromDb(required(data, error));
  },
  create: async (room: InsertRoom): Promise<Room> => {
    const { data, error } = await insforge.database.from("rooms").insert([room]).select("id,name,description,color").single();
    return roomFromDb(required(data, error));
  },
  update: async (id: string, room: Partial<InsertRoom>): Promise<Room> => {
    const { data, error } = await insforge.database.from("rooms").update(room).eq("id", id).select("id,name,description,color").single();
    return roomFromDb(required(data, error));
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await insforge.database.from("rooms").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export const binsApi = {
  getAll: async (roomId?: string): Promise<Bin[]> => {
    let query = insforge.database.from("bins").select("id,name,description,room_id").order("created_at");
    if (roomId) query = query.eq("room_id", roomId);
    const { data, error } = await query;
    return required(data, error).map(binFromDb);
  },
  getById: async (id: string): Promise<Bin> => {
    const { data, error } = await insforge.database.from("bins").select("id,name,description,room_id").eq("id", id).single();
    return binFromDb(required(data, error));
  },
  create: async (bin: InsertBin): Promise<Bin> => {
    const { data, error } = await insforge.database.from("bins").insert([binToDb(bin)]).select("id,name,description,room_id").single();
    return binFromDb(required(data, error));
  },
  update: async (id: string, bin: Partial<InsertBin>): Promise<Bin> => {
    const { data, error } = await insforge.database.from("bins").update(binToDb(bin)).eq("id", id).select("id,name,description,room_id").single();
    return binFromDb(required(data, error));
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await insforge.database.from("bins").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export const itemsApi = {
  getAll: async (binId?: string): Promise<Item[]> => {
    let query = insforge.database.from("items").select("id,name,description,quantity,value,photo_url,bin_id").order("created_at");
    if (binId) query = query.eq("bin_id", binId);
    const { data, error } = await query;
    return required(data, error).map(itemFromDb);
  },
  getById: async (id: string): Promise<Item> => {
    const { data, error } = await insforge.database.from("items").select("id,name,description,quantity,value,photo_url,bin_id").eq("id", id).single();
    return itemFromDb(required(data, error));
  },
  create: async (item: InsertItem): Promise<Item> => {
    const { data, error } = await insforge.database.from("items").insert([itemToDb(item)]).select("id,name,description,quantity,value,photo_url,bin_id").single();
    return itemFromDb(required(data, error));
  },
  update: async (id: string, item: Partial<InsertItem>): Promise<Item> => {
    const { data, error } = await insforge.database.from("items").update(itemToDb(item)).eq("id", id).select("id,name,description,quantity,value,photo_url,bin_id").single();
    return itemFromDb(required(data, error));
  },
  delete: async (id: string): Promise<void> => {
    const { error } = await insforge.database.from("items").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
