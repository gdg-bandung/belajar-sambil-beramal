import { db } from "@/db/index.server";
import { submissions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const submissionService = {
  // Create a new submission
  async createSubmission(data: typeof submissions.$inferInsert) {
    return await db.insert(submissions).values(data).returning();
  },

  // Get all submissions (for Admin)
  async getAllSubmissions() {
    return await db.select().from(submissions).orderBy(desc(submissions.createdAt));
  },

  // Get submissions for a specific speaker (by email for now, assuming email is stable)
  async getSpeakerSubmissions(email: string) {
    return await db.select().from(submissions).where(eq(submissions.email, email)).orderBy(desc(submissions.createdAt));
  },

  // Get approved submissions (for Landing Page)
  async getApprovedSubmissions() {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.status, "approved"))
      .orderBy(desc(submissions.eventDate));
  },

  // Get booked slots (date and time of approved submissions)
  async getBookedSlots() {
    const approved = await db
      .select({
        eventDate: submissions.eventDate,
        eventTime: submissions.eventTime,
      })
      .from(submissions)
      .where(eq(submissions.status, "approved"));
    
    return approved;
  },

  // Check if a specific slot is available
  async isSlotAvailable(eventDate: string, eventTime: string) {
    const existing = await db
      .select()
      .from(submissions)
      .where(
        and(
          eq(submissions.status, "approved"),
          eq(submissions.eventDate, eventDate), // Drizzle handles date string comparison usually, but ensuring format matches
          eq(submissions.eventTime, eventTime)
        )
      );
    
    return existing.length === 0;
  },

  // Update submission status
  async updateSubmissionStatus(id: string, status: "approved" | "rejected", rejectionReason?: string) {
    return await db
      .update(submissions)
      .set({ 
        status, 
        rejectionReason: status === "rejected" ? rejectionReason : null,
        updatedAt: new Date()
      })
      .where(eq(submissions.id, id))
      .returning();
  }
};
