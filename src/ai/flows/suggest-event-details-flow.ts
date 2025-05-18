
'use server';
/**
 * @fileOverview Um agente AI para sugerir detalhes extras para eventos.
 *
 * - suggestEventDetails - Uma função que lida com a sugestão de detalhes do evento.
 * - SuggestEventDetailsInput - O tipo de entrada para a função suggestEventDetails.
 * - SuggestEventDetailsOutput - O tipo de retorno para a função suggestEventDetails.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEventDetailsInputSchema = z.object({
  packageName: z.string().describe('O nome do pacote contratado para o evento.'),
  coupleName: z.string().describe('O nome do casal (ou cliente principal) do evento.'),
});
export type SuggestEventDetailsInput = z.infer<typeof SuggestEventDetailsInputSchema>;

const SuggestEventDetailsOutputSchema = z.object({
  suggestions: z.array(z.string().describe("Uma sugestão de detalhe extra para o evento.")).describe('Uma lista de sugestões de detalhes extras.'),
});
export type SuggestEventDetailsOutput = z.infer<typeof SuggestEventDetailsOutputSchema>;

export async function suggestEventDetails(input: SuggestEventDetailsInput): Promise<SuggestEventDetailsOutput> {
  return suggestEventDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEventDetailsPrompt',
  input: {schema: SuggestEventDetailsInputSchema},
  output: {schema: SuggestEventDetailsOutputSchema},
  prompt: `Você é um planejador de eventos especialista e criativo.
Baseado no pacote chamado '{{packageName}}' escolhido pelo cliente '{{coupleName}}', sugira de 3 a 4 detalhes ou serviços extras relevantes e encantadores que eles poderiam adicionar ao evento.
Concentre-se em sugestões que agreguem valor e personalização.
Se o nome do pacote ou do cliente não for muito informativo, forneça sugestões gerais populares e atraentes para eventos sociais ou casamentos.
Forneça as sugestões como uma lista de frases curtas e acionáveis.
Retorne apenas a lista de sugestões.`,
});

const suggestEventDetailsFlow = ai.defineFlow(
  {
    name: 'suggestEventDetailsFlow',
    inputSchema: SuggestEventDetailsInputSchema,
    outputSchema: SuggestEventDetailsOutputSchema,
  },
  async (input) => {
    // Validar entrada para evitar chamadas vazias que podem confundir o modelo
    if (!input.packageName && !input.coupleName) {
        return { suggestions: ["Música ao vivo", "Cabine de fotos divertida", "Lembrancinhas personalizadas", "Decoração temática especial"] };
    }
    if (!input.packageName) input.packageName = "Não especificado";
    if (!input.coupleName) input.coupleName = "Cliente";


    const {output} = await prompt(input);
    if (!output || !output.suggestions || output.suggestions.length === 0) {
      // Fallback caso a IA não retorne sugestões
      return { suggestions: ["Considerar iluminação ambiente", "Opções de menu diferenciadas", "Coquetel de boas-vindas", "Espaço kids monitorado"] };
    }
    return output;
  }
);
