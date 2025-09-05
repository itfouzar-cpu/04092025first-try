
'use server';
/**
 * @fileOverview An AI flow for automatically determining the optimal placement and scale of a 3D object in an AR scene.
 *
 * - autoScaleArPlacement - A function that analyzes a room image and suggests placement for an object.
 * - AutoScaleArPlacementInput - The input type for the autoScaleArPlacement function.
 * - AutoScaleArPlacementOutput - The return type for the autoScaleArPlacement function.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';


export const AutoScaleArPlacementInputSchema = z.object({
  sceneImage: z.string().describe(
    "A snapshot of the user's room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  objectType: z.string().describe(
    'The type of object to be placed (e.g., "chair", "table", "bookshelf").'
  ),
  objectDimensions: z.object({
    width: z.number().describe('Width of the object in meters.'),
    height: z.number().describe('Height of the object in meters.'),
    depth: z.number().describe('Depth of the object in meters.'),
  }),
});
export type AutoScaleArPlacementInput = z.infer<
  typeof AutoScaleArPlacementInputSchema
>;

export const AutoScaleArPlacementOutputSchema = z.object({
  placement: z.object({
    position: z.object({
      x: z.number().describe('The X coordinate for the object placement in meters.'),
      y: z.number().describe('The Y coordinate for the object placement in meters.'),
      z: z.number().describe('The Z coordinate for the object placement in meters.'),
    }),
    rotation: z.number().describe('The Y-axis rotation in radians.'),
    confidence: z.number().min(0).max(1).describe('The confidence score of the placement from 0 to 1.'),
  }),
  scale: z.number().describe('A recommended scale factor for the object.'),
  reasoning: z.string().describe('A brief explanation for the suggested placement and scale.'),
});
export type AutoScaleArPlacementOutput = z.infer<
  typeof AutoScaleArPlacementOutputSchema
>;

const placementPrompt = ai.definePrompt({
    name: 'arPlacementPrompt',
    input: { schema: AutoScaleArPlacementInputSchema },
    output: { schema: AutoScaleArPlacementOutputSchema },
    prompt: `You are an expert interior designer and spatial computing assistant. Your task is to analyze an image of a room and determine the best position, rotation, and scale to place a virtual 3D object.

    Analyze the provided scene image to understand the room's layout, existing furniture, floor, and walls.
    
    The user wants to place a '{{objectType}}' with dimensions (WxHxD): {{objectDimensions.width}}m x {{objectDimensions.height}}m x {{objectDimensions.depth}}m.
    
    Based on your analysis, provide the optimal 3D coordinates (position), rotation, and a scale factor. The origin (0,0,0) is at the camera's initial position.
    
    - The position should be on a logical surface (e.g., floor for a table, wall for a shelf).
    - The rotation should make the object face a natural direction (e.g., a chair facing a desk).
    - The scale should be 1.0 unless the room context strongly suggests the object appears too large or small, in which case you can adjust it slightly.
    - Provide a high confidence score if you can clearly identify a suitable location.
    - Briefly explain your reasoning.
    
    Scene Image:
    {{media url=sceneImage}}
    `,
});

const autoScaleArPlacementFlow = ai.defineFlow(
  {
    name: 'autoScaleArPlacementFlow',
    inputSchema: AutoScaleArPlacementInputSchema,
    outputSchema: AutoScaleArPlacementOutputSchema,
  },
  async (input) => {
    const { output } = await placementPrompt(input);
    return output!;
  }
);

// Wrapper function to be called from the client
export async function autoScaleArPlacement(
  input: AutoScaleArPlacementInput
): Promise<AutoScaleArPlacementOutput> {
  return await autoScaleArPlacementFlow(input);
}
