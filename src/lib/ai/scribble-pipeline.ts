import { groq as aiGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { Groq } from "groq-sdk";

import {
  type AgentAResponse,
  agentAResponseSchema,
  type AgentBResponse,
  agentBResponseSchema,
} from "@/lib/schemas/scribble";

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

async function executeAgentA(chunk: DocumentChunk): Promise<AgentAResponse> {
  const response = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are an expert CS student creating a high-retention cheatsheet. 
        You MUST return ONLY valid JSON matching this exact structure:
        {
          "page_concepts": [
            {
              "concept_id": "string",
              "title": "string",
              "definition": "string",
              "example": {
                "type": "text" | "code" | "math",
                "content": "string (the actual example, snippet, or equation)",
                "language": "string (e.g., 'javascript', 'python', or '')"
              },
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
        content: `Analyze the following document chunk for Page ${chunk.pageNumber}. Extract core concepts. Provide at least one concrete example (code snippet, math logic, or text) per concept to help a CS student understand it. Create short margin mnemonics, and generate active recall questions.\n\nSource Text:\n${chunk.content}`,
      },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || "{}");
  return agentAResponseSchema.parse(rawJson);
}
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
                "icon_suggestion": "string (use empty string '' if none)",
                "label": "string", 
                "connector_target": "string" 
              }
            }
          ],
          "diagram_requirements": [
            {
              "diagram_id": "string",
              "concept_id": "string",
              "type": "flowchart" | "hierarchy" | "comparison" | "state_machine",
              "position": "inline",
              "rough_style": "sketchy",
              "mermaid_syntax": "string"
            }
          ]
        }
        
        CRITICAL RULES:
        1. For Mermaid syntax, use ONLY standard flowchart syntax. Example: graph TD; A[Name] -->|Action| B[Result]; Do NOT use invalid arrows like -->|Text|>.
        2. You MUST include at least 1 or 2 "doodle" elements placed on the "right" side to visually balance the page. Set their "icon_suggestion" to basic keywords like "table", "arrow", "math", or "circle".`,
      },
      {
        role: "user",
        content: `Design the layout for Page ${chunk.pageNumber} based on the concepts. 
        Place text mnemonics on the left. You MUST place at least one Rough.js doodle on the right side.
        Generate valid Mermaid.js syntax for complex concepts.\n\nConcepts to Map:\n${JSON.stringify(agentAData.page_concepts, null, 2)}`,
      },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const rawJson = JSON.parse(response.choices[0]?.message?.content || "{}");
  return agentBResponseSchema.parse(rawJson);
}

async function executeAgentC(
  conceptTitle: string,
  definition: string
): Promise<string> {
  const { text } = await generateText({
    model: RESEARCH_MODEL,
    prompt: `Explain the concept of "${conceptTitle}" using a highly accessible, real-world analogy suitable for a margin note on a cheat sheet. Keep it under 3 sentences.\n\nTechnical definition: ${definition}`,
  });
  return text;
}

export async function runScribblePipeline(
  documentChunks: DocumentChunk[]
): Promise<OrchestrationResult[]> {
  const results: OrchestrationResult[] = [];

  for (const chunk of documentChunks) {
    try {
      const semanticData = await executeAgentA(chunk);
      const visualData = await executeAgentB(chunk, semanticData);

      const advancedConcepts = semanticData.page_concepts.filter(
        (c) => c.complexity_level === "advanced"
      );

      const researchEnhancements: Record<string, string> = {};

      if (advancedConcepts.length > 0) {
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
