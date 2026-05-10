import { z } from "zod";

// ==========================================
// Agent A: Semantic Architect Schemas
// ==========================================

export const pageConceptSchema = z.object({
  concept_id: z
    .string()
    .describe(
      "A unique identifier for the concept (e.g., 'concept-osi-layers')"
    ),
  title: z.string(),
  definition: z.string(),
  complexity_level: z.enum(["foundational", "intermediate", "advanced"]),
  requires_visual: z.boolean(),
  margin_mnemonic: z
    .string()
    .optional()
    .describe("A memorable mnemonic string, if applicable"),
  related_concepts: z
    .array(z.string())
    .describe("Array of related concept_ids"),
});

export const activeRecallQuestionSchema = z.object({
  question_id: z.string(),
  page_number: z.number(),
  question_text: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  expected_answer_summary: z.string(),
  concept_ids_tested: z.array(z.string()),
});

export const agentAResponseSchema = z.object({
  page_concepts: z
    .array(pageConceptSchema)
    .max(10, "Maximum 10 concepts per page to avoid clutter"),
  active_recall_questions: z
    .array(activeRecallQuestionSchema)
    .max(5, "Maximum 5 questions per page"),
});

// ==========================================
// Agent B: Visual Strategist Schemas
// ==========================================

export const pageLayoutSchema = z.object({
  main_content_width: z
    .number()
    .min(50)
    .max(80)
    .describe("Percentage of page width (e.g., 60)"),
  gutter_left_width: z.number().max(25),
  gutter_right_width: z.number().max(25),
  footer_height: z
    .number()
    .min(15)
    .max(20)
    .describe("Percentage allocated to Active Recall Zone"),
});

export const visualElementSchema = z.object({
  element_id: z.string(),
  type: z.enum(["mnemonic", "doodle", "connector", "diagram", "analogy"]),
  position: z.object({
    anchor_to: z
      .string()
      .describe("Target concept_id, line_number, or formula_index"),
    side: z.enum(["left", "right"]),
    vertical_offset: z
      .number()
      .describe("Vertical offset in pixels or percentage to align visually"),
  }),
  content: z.object({
    icon_suggestion: z
      .string()
      .nullable()
      .catch("")
      .describe("Emoji or general shape description for Rough.js"),
    label: z.string().optional(),
    connector_target: z
      .string()
      .nullable()
      .describe("Target ID if drawing a line to another element"),
  }),
});

export const codeBlockDirectiveSchema = z.object({
  code_block_id: z.string(),
  prism_language: z.string(),
  highlight_lines: z.array(z.number()),
  connector_annotations: z
    .array(
      z.object({
        line_number: z.number(),
        explanation_anchor: z.string(),
        annotation_text: z.string(),
      })
    )
    .optional(),
});

export const diagramRequirementSchema = z.object({
  diagram_id: z.string(),
  concept_id: z.string(),
  type: z.enum(["flowchart", "hierarchy", "comparison", "state_machine"]),
  position: z.enum(["gutter_left", "gutter_right", "inline"]),
  rough_style: z.enum(["rough", "sketchy", "hand_drawn"]),
});

export const agentBResponseSchema = z.object({
  page_layout: pageLayoutSchema,
  visual_elements: z.array(visualElementSchema),
  code_block_directives: z.array(codeBlockDirectiveSchema).optional(),
  diagram_requirements: z.array(diagramRequirementSchema).optional(),
});

// Type exports for use in components and API routes
export type AgentAResponse = z.infer<typeof agentAResponseSchema>;
export type AgentBResponse = z.infer<typeof agentBResponseSchema>;
