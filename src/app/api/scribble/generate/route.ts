import { NextResponse } from "next/server";

import { Client } from "@upstash/qstash";

import { createClient } from "@/lib/supabase/server";

// Initialize QStash client
const qstashClient = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate User
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate Input
    const body = await req.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 }
      );
    }

    // 3. Create a Pending Job Record
    const { data: job, error: dbError } = await supabase
      .from("scribble_jobs")
      .insert({
        user_id: user.id,
        source_document_id: documentId,
        status: "pending",
      })
      .select("id")
      .single();

    if (dbError || !job) {
      console.error("[Scribble] DB Error creating job:", dbError);
      return NextResponse.json(
        { error: "Failed to initialize job" },
        { status: 500 }
      );
    }

    // 4. Enqueue the Background Worker via QStash
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const workerUrl = `${appUrl}/api/scribble/worker`;

    await qstashClient.publishJSON({
      url: workerUrl,
      body: {
        jobId: job.id,
        documentId,
        userId: user.id,
      },
      // Optional: Add a 1-second delay to ensure DB replication is caught up
      delay: "1s",
    });

    // 5. Return the Job ID immediately to the frontend
    // The frontend will use this ID to poll for status updates
    return NextResponse.json(
      { jobId: job.id, status: "pending" },
      { status: 202 }
    );
  } catch (error) {
    console.error("[Scribble] Generation trigger error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
