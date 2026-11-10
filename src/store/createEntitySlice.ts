import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { request } from '@/services/api';
import { uid } from '@/utils/format';

export interface EntityState<T> {
  items: T[];
  status: 'idle' | 'loading' | 'ready' | 'failed';
  error: string | null;
  saving: boolean;
}

/**
 * Generates a slice plus async thunks (fetch / create / update / remove) for any entity.
 * Data is persisted in localStorage so the demo survives refreshes; replace with real API calls later.
 */
export function createEntitySlice<T extends { id: string }>(name: string, prefix: string, seed: T[]) {
  const key = `crm_user_v2_${name}`;
  const read = (): T[] => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : seed;
    } catch {
      return seed;
    }
  };
  const write = (items: T[]) => localStorage.setItem(key, JSON.stringify(items));

  const fetchAll = createAsyncThunk(`${name}/fetchAll`, async () => request(read, 600));

  const create = createAsyncThunk(`${name}/create`, async (data: Omit<T, 'id'>) =>
    request(() => {
      const item = { ...data, id: uid(prefix) } as T;
      write([item, ...read()]);
      return item;
    }),
  );

  const update = createAsyncThunk(`${name}/update`, async (data: Partial<T> & { id: string }) =>
    request(() => {
      const items = read();
      const idx = items.findIndex((i) => i.id === data.id);
      if (idx < 0) throw new Error('This record no longer exists');
      const next = { ...items[idx], ...data } as T;
      items[idx] = next;
      write(items);
      return next;
    }, 250),
  );

  const remove = createAsyncThunk(`${name}/remove`, async (id: string) =>
    request(() => {
      write(read().filter((i) => i.id !== id));
      return id;
    }, 300),
  );

  const initial: EntityState<T> = { items: [], status: 'idle', error: null, saving: false };

  const slice = createSlice({
    name,
    initialState: initial,
    reducers: {
      replaceAll(state, action: PayloadAction<T[]>) {
        state.items = action.payload as never;
        write(action.payload);
      },
    },
    extraReducers: (b) => {
      b.addCase(fetchAll.pending, (s) => { s.status = 'loading'; s.error = null; });
      b.addCase(fetchAll.fulfilled, (s, a) => { s.status = 'ready'; s.items = a.payload as never; });
      b.addCase(fetchAll.rejected, (s, a) => { s.status = 'failed'; s.error = a.error.message ?? 'Failed to load data'; });
      b.addCase(create.pending, (s) => { s.saving = true; });
      b.addCase(create.fulfilled, (s, a) => { s.saving = false; s.items.unshift(a.payload as never); });
      b.addCase(create.rejected, (s) => { s.saving = false; });
      b.addCase(update.pending, (s) => { s.saving = true; });
      b.addCase(update.fulfilled, (s, a) => {
        s.saving = false;
        const i = s.items.findIndex((x) => x.id === a.payload.id);
        if (i >= 0) s.items[i] = a.payload as never;
      });
      b.addCase(update.rejected, (s) => { s.saving = false; });
      b.addCase(remove.fulfilled, (s, a) => { s.items = s.items.filter((x) => x.id !== a.payload) as never; });
    },
  });

  return { slice, thunks: { fetchAll, create, update, remove } };
}
