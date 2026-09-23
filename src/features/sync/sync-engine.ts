"use client";

import { db } from "@/lib/offline/database";
// A real app would use the Supabase JS client here to push data
// import { createClient } from "@/lib/supabase/client"; 

export class SyncEngine {
  private isOnline: boolean = true;
  private isSyncing: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  private handleOnline() {
    this.isOnline = true;
    this.processSyncQueue();
  }

  private handleOffline() {
    this.isOnline = false;
  }

  public async addToQueue(operation: 'INSERT' | 'UPDATE' | 'DELETE', entity: 'STUDENTS' | 'GRADES', entity_id: string, payload: any) {
    await db.sync_queue.add({
      operation,
      entity,
      entity_id,
      payload,
      status: 'PENDING',
      created_at: new Date().toISOString()
    });

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  public async processSyncQueue() {
    if (!this.isOnline || this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pendingOperations = await db.sync_queue.where('status').equals('PENDING').toArray();
      
      for (const op of pendingOperations) {
        // Mark as syncing
        await db.sync_queue.update(op.id!, { status: 'SYNCING' });

        try {
          // In a real app, this would be:
          // const supabase = createClient();
          // await supabase.from(op.entity.toLowerCase()).insert(op.payload);
          // or update, etc. based on op.operation

          // Simulate network request
          await new Promise(resolve => setTimeout(resolve, 500));

          // On success, remove from queue
          await db.sync_queue.delete(op.id!);
        } catch (error: any) {
          // On failure, mark as failed
          await db.sync_queue.update(op.id!, { 
            status: 'FAILED', 
            error_message: error.message || 'Unknown error' 
          });
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  public async getPendingCount() {
    return await db.sync_queue.where('status').equals('PENDING').count();
  }
}

// Singleton instance
let syncEngineInstance: SyncEngine | null = null;
export const getSyncEngine = () => {
  if (!syncEngineInstance) {
    syncEngineInstance = new SyncEngine();
  }
  return syncEngineInstance;
};
