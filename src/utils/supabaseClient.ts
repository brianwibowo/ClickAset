import { createClient } from "@supabase/supabase-js";

// Check if Supabase keys exist in env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isMockMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project-id");

// Print status
if (isMockMode) {
  console.warn("CLICKASET: Supabase credentials not found or placeholder. Running in Offline Mock Mode (LocalStorage Sync).");
} else {
  console.log("CLICKASET: Connected to real Supabase database instance.");
}

// ----------------------------------------------------
// MOCK DATABASE ENGINE (LocalStorage & Event Broadcasting)
// ----------------------------------------------------
class MockSupabaseBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;

  constructor(tableName: string) {
    // Map table names to key names in localStorage
    this.tableName = `clickaset_db_${tableName}`;
  }

  private getData(): any[] {
    // Check if it's the users table and link it with existing clickaset_registered_users
    if (this.tableName === "clickaset_db_users") {
      const legacy = localStorage.getItem("clickaset_registered_users");
      return legacy ? JSON.parse(legacy) : [];
    }
    const val = localStorage.getItem(this.tableName);
    return val ? JSON.parse(val) : [];
  }

  private saveData(data: any[]) {
    if (this.tableName === "clickaset_db_users") {
      localStorage.setItem("clickaset_registered_users", JSON.stringify(data));
    } else {
      localStorage.setItem(this.tableName, JSON.stringify(data));
    }
    // Broadcast changes locally
    window.dispatchEvent(new CustomEvent("clickaset_supabase_realtime", {
      detail: { table: this.tableName.replace("clickaset_db_", "") }
    }));
  }

  select(_columns = "*") {
    // Chainable select
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => {
      if (item[column] === undefined) return false;
      return String(item[column]).toLowerCase() === String(value).toLowerCase();
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderCol = column;
    this.orderAsc = ascending;
    return this;
  }

  async insert(newData: any | any[]) {
    const data = this.getData();
    const rowsToAdd = Array.isArray(newData) ? newData : [newData];
    
    const processed = rowsToAdd.map(row => ({
      id: row.id || "mock-" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      ...row
    }));

    const updated = [...data, ...processed];
    this.saveData(updated);

    return { data: Array.isArray(newData) ? processed : processed[0], error: null };
  }

  async update(updateData: any) {
    const data = this.getData();
    let updatedCount = 0;

    const updated = data.map(item => {
      // Check if item matches all active filters
      const matches = this.filters.every(f => f(item));
      if (matches) {
        updatedCount++;
        return { ...item, ...updateData };
      }
      return item;
    });

    this.saveData(updated);
    return { data: updated, count: updatedCount, error: null };
  }

  async delete() {
    const data = this.getData();
    
    // Keep items that DO NOT match filters
    const updated = data.filter(item => {
      const matches = this.filters.every(f => f(item));
      return !matches;
    });

    this.saveData(updated);
    return { data: updated, error: null };
  }

  // Promise resolution support for await builder
  async then(onfulfilled?: (value: any) => any) {
    let result = this.getData();

    // Apply filters
    if (this.filters.length > 0) {
      result = result.filter(item => this.filters.every(f => f(item)));
    }

    // Apply sorting
    if (this.orderCol) {
      result.sort((a, b) => {
        const valA = a[this.orderCol!];
        const valB = b[this.orderCol!];
        if (valA < valB) return this.orderAsc ? -1 : 1;
        if (valA > valB) return this.orderAsc ? 1 : -1;
        return 0;
      });
    }

    const response = { data: result, error: null };
    return onfulfilled ? onfulfilled(response) : response;
  }

  // Single record resolver helper
  async single() {
    const { data } = await this.then();
    return { data: data && data.length > 0 ? data[0] : null, error: data && data.length > 0 ? null : new Error("Not Found") };
  }
}

// Mock Realtime Channel
class MockRealtimeChannel {
  private listeners: Array<{ event: string; filter: any; callback: (payload: any) => void }> = [];

  constructor(_channelName: string) {
  }

  on(event: string, filter: any, callback: (payload: any) => void) {
    this.listeners.push({ event, filter, callback });
    return this;
  }

  subscribe(statusCallback?: (status: string) => void) {
    // Connect listener to window database updates
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // Trigger callback to re-fetch
      this.listeners.forEach(l => {
        if (l.event === "postgres_changes") {
          l.callback({ new: {}, old: {}, table: detail.table });
        }
      });
    };

    window.addEventListener("clickaset_supabase_realtime", handleUpdate);
    
    if (statusCallback) {
      setTimeout(() => statusCallback("SUBSCRIBED"), 50);
    }

    // Return unsubscribe helper
    return {
      unsubscribe: () => {
        window.removeEventListener("clickaset_supabase_realtime", handleUpdate);
      }
    };
  }
}

// Setup storage listener to sync between multiple browser tabs
if (isMockMode) {
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.startsWith("clickaset_db_")) {
      const table = e.key.replace("clickaset_db_", "");
      window.dispatchEvent(new CustomEvent("clickaset_supabase_realtime", {
        detail: { table }
      }));
    }
  });
}

// ----------------------------------------------------
// DUAL CLIENT ROUTER EXPORT
// ----------------------------------------------------
export const supabase = !isMockMode 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: (tableName: string) => new MockSupabaseBuilder(tableName),
      channel: (channelName: string) => new MockRealtimeChannel(channelName),
      removeChannel: () => {}
    } as any;
