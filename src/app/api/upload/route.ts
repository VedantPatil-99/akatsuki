import { NextRequest, NextResponse } from "next/server";

import { Client } from "@upstash/qstash";

import { supabaseAdmin } from "@/lib/supabase/admin";

// Initialize QStash Client
const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
  baseUrl: process.env.QSTASH_URL,
});

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const isPremium = formData.get("isPremium") === "true";

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const filePath = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

    // 1. Upload the physical file to Supabase Storage
    const { data: storageData, error: storageError } =
      await supabaseAdmin.storage
        .from("documents")
        .upload(filePath, Buffer.from(fileBuffer), {
          contentType: file.type,
          upsert: false,
        });

    if (storageError) throw storageError;

    // 2. Create the tracking row in the database
    const { data: docRecord, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: userId,
        filename: file.name,
        file_path: storageData.path,
        status: "processing",
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    // Generate a temporary 1-hour signed URL for LlamaParse to read
    const { data: signedUrlData } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUrl(storageData.path, 3600);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const extractorUrl =
      process.env.EXTRACTOR_SERVICE_URL || "http://127.0.0.1:8000/api/extract";

    // 3a. Publish the heavy text processing job (LlamaParse)
    const parseJob = qstash.publishJSON({
      url: `${appUrl}/api/process`,
      body: {
        documentId: docRecord.id,
        userId,
        fileUrl: signedUrlData?.signedUrl,
        isPremium,
      },
      delay: "1s",
    });

    // 3b. Publish the parallel asset extraction job (Python Microservice)
    const extractJob = qstash.publishJSON({
      url: extractorUrl,
      body: {
        documentId: docRecord.id,
        userId,
        fileUrl: signedUrlData?.signedUrl,
        isPremium,
      },
      delay: "1s",
    });

    await Promise.all([parseJob, extractJob]);

    // 4. Return instantly to the frontend!
    return NextResponse.json({ documentId: docRecord.id }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Upload Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
