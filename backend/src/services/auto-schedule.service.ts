/**
 * Auto Schedule Service
 * 
 * Automatically generates AI schedules for all managers
 * - Runs daily and checks each manager's deadline_day setting
 * - Generates schedule for next week based on manager's preference
 * - Can be triggered manually via API
 */

import cron, { ScheduledTask } from 'node-cron';
import { supabase } from '../config/supabase.config';
import { scheduleService } from './schedule.service';

interface Manager {
  id: string;
  email: string;
  store_name: string;
  deadline_day: number; // 1-7 (1=Monday, 7=Sunday)
}

export class AutoScheduleService {
  private cronJob: ScheduledTask | null = null;
  private isEnabled: boolean = false;

  /**
   * Initialize auto-schedule service
   * Runs every day at 23:00 and checks which managers need schedule generation
   */
  initialize() {
    // Run every day at 23:00
    // Cron format: minute hour day-of-month month day-of-week
    // '0 23 * * *' = 23:00 every day
    this.cronJob = cron.schedule('0 23 * * *', async () => {
      console.log('[AUTO-SCHEDULE] Cron job triggered at', new Date().toISOString());
      await this.checkAndGenerateSchedules();
    }, {
      timezone: 'Europe/Istanbul' // Turkey timezone
    });

    this.isEnabled = true;
    console.log('[AUTO-SCHEDULE] Service initialized (not started yet)');
  }

  /**
   * Start the auto-schedule cron job
   */
  start() {
    if (!this.cronJob) {
      throw new Error('Auto-schedule service not initialized');
    }

    if (!this.isEnabled) {
      this.cronJob.start();
      this.isEnabled = true;
      console.log('[AUTO-SCHEDULE] Cron job started - will run every Sunday at 23:00');
    } else {
      console.log('[AUTO-SCHEDULE] Cron job already running');
    }
  }

  /**
   * Stop the auto-schedule cron job
   */
  stop() {
    if (this.cronJob && this.isEnabled) {
      this.cronJob.stop();
      this.isEnabled = false;
      console.log('[AUTO-SCHEDULE] Cron job stopped');
    }
  }

  /**
   * Get status of auto-schedule service
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      nextRun: this.isEnabled ? 'Every day at 23:00' : 'Not scheduled',
      description: 'Automatically generates schedules based on each manager\'s deadline_day setting',
    };
  }

  /**
   * Check current day and generate schedules for managers whose deadline_day matches
   * Called by cron job daily at 23:00
   */
  async checkAndGenerateSchedules(): Promise<{
    success: number;
    failed: number;
    skipped: number;
    details: Array<{ 
      managerId: string; 
      email: string; 
      status: 'success' | 'failed' | 'skipped'; 
      error?: string;
      reason?: string;
    }>;
  }> {
    console.log('[AUTO-SCHEDULE] Checking which managers need schedule generation...');

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Convert to our format (1=Monday, 7=Sunday)
    const currentDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    console.log(`[AUTO-SCHEDULE] Current day: ${currentDay} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]})`);

    try {
      // Get all managers
      const { data: managers, error } = await supabase
        .from('managers')
        .select('id, email, store_name, deadline_day');

      if (error) {
        console.error('[AUTO-SCHEDULE] Failed to fetch managers:', error);
        throw new Error('Failed to fetch managers');
      }

      if (!managers || managers.length === 0) {
        console.log('[AUTO-SCHEDULE] No managers found');
        return { success: 0, failed: 0, skipped: 0, details: [] };
      }

      console.log(`[AUTO-SCHEDULE] Found ${managers.length} managers`);

      // Filter managers whose deadline_day matches current day
      const managersToProcess = managers.filter((m: Manager) => m.deadline_day === currentDay);
      
      console.log(`[AUTO-SCHEDULE] ${managersToProcess.length} managers have deadline_day=${currentDay}`);

      if (managersToProcess.length === 0) {
        return { success: 0, failed: 0, skipped: managers.length, details: [] };
      }

      const nextWeekMonday = this.getNextWeekMonday();
      console.log(`[AUTO-SCHEDULE] Generating schedules for week starting: ${nextWeekMonday}`);

      // Generate schedule for each matching manager
      const results = await Promise.allSettled(
        managersToProcess.map(async (manager: Manager) => {
          try {
            console.log(`[AUTO-SCHEDULE] Generating schedule for manager: ${manager.email}`);
            
            await scheduleService.generateSchedule(
              manager.id,
              nextWeekMonday
            );

            console.log(`[AUTO-SCHEDULE] ✅ Schedule generated for ${manager.email}`);
            
            return {
              managerId: manager.id,
              email: manager.email,
              status: 'success' as const,
            };
          } catch (error) {
            console.error(`[AUTO-SCHEDULE] ❌ Failed for ${manager.email}:`, error);
            
            return {
              managerId: manager.id,
              email: manager.email,
              status: 'failed' as const,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      // Count results
      let successCount = 0;
      let failedCount = 0;
      const details: Array<{ 
        managerId: string; 
        email: string; 
        status: 'success' | 'failed' | 'skipped'; 
        error?: string;
        reason?: string;
      }> = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.status === 'success') {
            successCount++;
          } else {
            failedCount++;
          }
          details.push(result.value);
        } else {
          failedCount++;
        }
      });

      // Add skipped managers to details
      const skippedManagers = managers.filter((m: Manager) => m.deadline_day !== currentDay);
      skippedManagers.forEach((m: Manager) => {
        details.push({
          managerId: m.id,
          email: m.email,
          status: 'skipped',
          reason: `deadline_day=${m.deadline_day}, current_day=${currentDay}`,
        });
      });

      console.log(`[AUTO-SCHEDULE] Completed: ${successCount} success, ${failedCount} failed, ${skippedManagers.length} skipped`);

      return {
        success: successCount,
        failed: failedCount,
        skipped: skippedManagers.length,
        details,
      };
    } catch (error) {
      console.error('[AUTO-SCHEDULE] Critical error:', error);
      throw error;
    }
  }

  /**
   * Get next week's Monday date (YYYY-MM-DD format)
   */
  private getNextWeekMonday(): string {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate days until next Monday
    // If today is Sunday (0), next Monday is 1 day away
    // If today is Monday (1), next Monday is 7 days away
    // If today is Saturday (6), next Monday is 2 days away
    let daysUntilNextMonday = (8 - dayOfWeek) % 7;
    if (daysUntilNextMonday === 0) {
      daysUntilNextMonday = 7; // If today is Monday, get next Monday
    }

    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);

    // Format as YYYY-MM-DD
    const year = nextMonday.getFullYear();
    const month = String(nextMonday.getMonth() + 1).padStart(2, '0');
    const day = String(nextMonday.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Generate schedules for all managers (DEPRECATED - use checkAndGenerateSchedules)
   * Called manually via API
   */
  async generateSchedulesForAllManagers(): Promise<{
    success: number;
    failed: number;
    details: Array<{ managerId: string; email: string; status: 'success' | 'failed'; error?: string }>;
  }> {
    console.log('[AUTO-SCHEDULE] Starting automatic schedule generation...');

    const nextWeekMonday = this.getNextWeekMonday();
    console.log('[AUTO-SCHEDULE] Generating schedules for week starting:', nextWeekMonday);

    try {
      // Get all managers from database
      const { data: managers, error } = await supabase
        .from('managers')
        .select('id, email, store_name, deadline_day');

      if (error) {
        console.error('[AUTO-SCHEDULE] Failed to fetch managers:', error);
        throw new Error('Failed to fetch managers');
      }

      if (!managers || managers.length === 0) {
        console.log('[AUTO-SCHEDULE] No managers found');
        return { success: 0, failed: 0, details: [] };
      }

      console.log(`[AUTO-SCHEDULE] Found ${managers.length} managers`);

      // Generate schedule for each manager
      const results = await Promise.allSettled(
        managers.map(async (manager: Manager) => {
          try {
            console.log(`[AUTO-SCHEDULE] Generating schedule for manager: ${manager.email}`);
            
            await scheduleService.generateSchedule(
              manager.id,
              nextWeekMonday
            );

            console.log(`[AUTO-SCHEDULE] ✅ Schedule generated for ${manager.email}`);
            
            return {
              managerId: manager.id,
              email: manager.email,
              status: 'success' as const,
            };
          } catch (error) {
            console.error(`[AUTO-SCHEDULE] ❌ Failed for ${manager.email}:`, error);
            
            return {
              managerId: manager.id,
              email: manager.email,
              status: 'failed' as const,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      // Count successes and failures
      let successCount = 0;
      let failedCount = 0;
      const details: Array<{ managerId: string; email: string; status: 'success' | 'failed'; error?: string }> = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.status === 'success') {
            successCount++;
          } else {
            failedCount++;
          }
          details.push(result.value);
        } else {
          failedCount++;
        }
      });

      console.log(`[AUTO-SCHEDULE] Completed: ${successCount} success, ${failedCount} failed`);

      return {
        success: successCount,
        failed: failedCount,
        details,
      };
    } catch (error) {
      console.error('[AUTO-SCHEDULE] Critical error:', error);
      throw error;
    }
  }

  /**
   * Generate schedule for specific manager (manual trigger)
   */
  async generateScheduleForManager(managerId: string): Promise<any> {
    const nextWeekMonday = this.getNextWeekMonday();
    console.log(`[AUTO-SCHEDULE] Manual generation for manager ${managerId}, week: ${nextWeekMonday}`);
    
    return await scheduleService.generateSchedule(managerId, nextWeekMonday);
  }
}

// Export singleton instance
export const autoScheduleService = new AutoScheduleService();
