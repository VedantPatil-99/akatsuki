import { groq as aiGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { Groq } from "groq-sdk";

import {
  type AgentAResponse,
  agentAResponseSchema,
  type AgentBResponse,
  agentBResponseSchema,
} from "@/lib/schemas/scribble";

// 1. Native Groq Client for strict JSON tasks (Bypasses AI SDK formatting limits)
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 2. AI SDK for standard text tasks (Analogy Research)
const RESEARCH_MODEL = aiGroq("qwen/qwen3-32b");

export interface DocumentChunk {
  pageNumber: number;
  content: string;
}

export interface OrchestrationResult {
  pageNumber: number;
  semanticData: AgentAResponse;
  visualData: AgentBResponse;
  researchEnhancements: Record<string, string>;
}

/**
 * Agent A: The Semantic Architect (Using Native Groq SDK)
 */
async function executeAgentA(chunk: DocumentChunk): Promise<AgentAResponse> {
  const response = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert student creating a high-retention cheatsheet. 
        You MUST return ONLY valid JSON matching this exact structure:
        {
          "page_concepts": [
            {
              "concept_id": "string",
              "title": "string",
              "definition": "string",
              "complexity_level": "foundational" | "intermediate" | "advanced",
              "requires_visual": boolean,
              "margin_mnemonic": "string",
              "related_concepts": ["string"]
            }
          ],
          "active_recall_questions": [
            {
              "question_id": "string",
              "page_number": ${chunk.pageNumber},
              "question_text": "string",
              "difficulty": "easy" | "medium" | "hard",
              "expected_answer_summary": "string",
              "concept_ids_tested": ["string"]
            }
          ]
        }`,
      },
      {
        role: "user",
        content: `Analyze the following document chunk for Page ${chunk.pageNumber}. Extract core concepts, flag if they need visuals, create short margin mnemonics, and generate 3-5 active recall questions to test understanding.\n\nSource Text:\n${chunk.content}`,
      },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }, // The magic fix!
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || "{}");
  return agentAResponseSchema.parse(rawJson); // Enforce Zod validation
}

/**
 * Agent B: The Visual Strategist (Using Native Groq SDK)
 */
async function executeAgentB(
  chunk: DocumentChunk,
  agentAData: AgentAResponse
): Promise<AgentBResponse> {
  const response = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert visual designer laying out a handwritten cheat sheet. 
        You MUST return ONLY valid JSON matching this exact structure:
        {
          "page_layout": {
            "main_content_width": 60,
            "gutter_left_width": 20,
            "gutter_right_width": 20,
            "footer_height": 20
          },
          "visual_elements": [
            {
              "element_id": "string",
              "type": "mnemonic" | "doodle" | "connector" | "diagram" | "analogy",
              "position": { "anchor_to": "string", "side": "left" | "right", "vertical_offset": 0 },
              "content": { 
                "icon_suggestion": "string (use empty string '' if none, NEVER null)", // <-- Update this line!
                "label": "string", 
                "connector_target": "string" 
                }
              }
          ]
        }`,
      },
      {
        role: "user",
        content: `Design the layout for Page ${chunk.pageNumber} based on the extracted concepts. Allocate space for the Active Recall Zone, place mnemonics in the margins, and suggest Rough.js sketches.\n\nConcepts to Map:\n${JSON.stringify(agentAData.page_concepts, null, 2)}\n\nOriginal Text Length context: ${chunk.content.length} characters.`,
      },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }, // The magic fix!
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || "{}");
  return agentBResponseSchema.parse(rawJson); // Enforce Zod validation
}

/**
 * Agent C: The Researcher (Conditional - Using Vercel AI SDK)
 */
async function executeAgentC(
  conceptTitle: string,
  definition: string
): Promise<string> {
  const { text } = await generateText({
    model: RESEARCH_MODEL,
    prompt: `
      Explain the concept of "${conceptTitle}" using a highly accessible, 
      real-world analogy suitable for a margin note on a cheat sheet. 
      Keep it under 3 sentences.
      
      Technical definition: ${definition}
    `,
  });

  return text;
}

/**
 * Main Pipeline Orchestrator
 */
// export async function runScribblePipeline(
//   documentChunks: DocumentChunk[]
// ): Promise<OrchestrationResult[]> {
//   const pipelinePromises = documentChunks.map(async (chunk) => {
//     try {
//       const semanticData = await executeAgentA(chunk);
//       const visualData = await executeAgentB(chunk, semanticData);

//       const advancedConcepts = semanticData.page_concepts.filter(
//         (c) => c.complexity_level === "advanced"
//       );

//       const researchEnhancements: Record<string, string> = {};

//       if (advancedConcepts.length > 0) {
//         const researchPromises = advancedConcepts.map(async (concept) => {
//           const analogy = await executeAgentC(
//             concept.title,
//             concept.definition
//           );
//           return { id: concept.concept_id, analogy };
//         });

//         const researchResults = await Promise.all(researchPromises);
//         for (const res of researchResults) {
//           researchEnhancements[res.id] = res.analogy;
//         }
//       }

//       return {
//         pageNumber: chunk.pageNumber,
//         semanticData,
//         visualData,
//         researchEnhancements,
//       };
//     } catch (error) {
//       console.error(`Pipeline failure on page ${chunk.pageNumber}:`, error);
//       throw new Error(
//         `Agent Orchestration failed for page ${chunk.pageNumber}`
//       );
//     }
//   });

//   return await Promise.all(pipelinePromises);
// }
export async function runScribblePipeline(
  documentChunks: DocumentChunk[]
): Promise<OrchestrationResult[]> {
  const results: OrchestrationResult[] = [];

  // Use a for...of loop instead of .map() to process pages one by one
  for (const chunk of documentChunks) {
    try {
      const semanticData = await executeAgentA(chunk);
      const visualData = await executeAgentB(chunk, semanticData);

      const advancedConcepts = semanticData.page_concepts.filter(
        (c) => c.complexity_level === "advanced"
      );

      const researchEnhancements: Record<string, string> = {};

      if (advancedConcepts.length > 0) {
        // We can keep Agent C parallel because it uses a different model bucket
        const researchPromises = advancedConcepts.map(async (concept) => {
          const analogy = await executeAgentC(
            concept.title,
            concept.definition
          );
          return { id: concept.concept_id, analogy };
        });

        const researchResults = await Promise.all(researchPromises);
        for (const res of researchResults) {
          researchEnhancements[res.id] = res.analogy;
        }
      }

      results.push({
        pageNumber: chunk.pageNumber,
        semanticData,
        visualData,
        researchEnhancements,
      });

      // Optional: Add a 1-second delay between pages to let Groq's token bucket refill
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Pipeline failure on page ${chunk.pageNumber}:`, error);
      throw new Error(
        `Agent Orchestration failed for page ${chunk.pageNumber}`
      );
    }
  }

  return results;
}
