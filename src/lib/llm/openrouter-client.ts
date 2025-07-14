import OpenAI from 'openai';

export interface ProcessingResult {
  dramaticTitle: string;
  dramaticExcerpt: string;
  dramaticContent: string;
  dramaScore: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'breaking';
  category: string;
  tags: string[];
  processingNotes?: string;
}

export interface ArticleToProcess {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
}

export class OpenRouterClient {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // Site URL for rankings
        "X-Title": "Cartão Vermelho News", // App name for rankings
      },
    });
    
    // Use Google Gemini 2.0 Flash
    this.model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";
  }

  async processArticle(article: ArticleToProcess, retries: number = 3): Promise<ProcessingResult> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const prompt = this.buildPrompt(article);
        
        // Add delay for rate limiting
        if (attempt > 1) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          console.log(`Waiting ${delay}ms before retry ${attempt}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: "system",
              content: this.getSystemPrompt()
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 10000,
          response_format: { type: "json_object" }
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error('No response from OpenRouter');
        }

        console.log(`LLM Response for "${article.title}":`, response.substring(0, 200) + '...');
        return this.parseResponse(response, article);
      } catch (error: any) {
        console.error(`Error processing article with LLM (attempt ${attempt}):`, error);
        
        // If it's a rate limit error and we have retries left, continue
        if (error.status === 429 && attempt < retries) {
          console.log(`Rate limited, retrying in ${Math.pow(2, attempt) * 1000}ms...`);
          continue;
        }
        
        // For last attempt or non-rate-limit errors, throw
        if (attempt === retries) {
          throw new Error(`LLM processing failed after ${retries} attempts: ${error.message || error}`);
        }
      }
    }
    
    throw new Error('Unexpected error in processArticle');
  }

  private getSystemPrompt(): string {
    return `Você é o editor-chefe do "Cartão Vermelho News" - o portal de notícias desportivas mais DRAMÁTICO de Portugal!

## MISSÃO: "ONDE O DRAMA ENCONTRA O DESPORTO!"
Transformar notícias desportivas sérias em espetáculos sensacionalistas e involuntariamente cómicos, mantendo sempre a precisão factual mas dramatizando TUDO ao extremo.

## IDENTIDADE CARTÃO VERMELHO:
• **Tom**: Dramático, urgente, sensacionalista mas bem escrito
• **Estilo**: Jornalismo televisivo com toques de reality show
• **Humor**: Involuntário, emerge do contraste entre forma séria e conteúdo exagerado
• **Linguagem**: Português europeu com trocadilhos futebolísticos
• **Referências**: Wrestling, cinema de ação, ditados populares, linguagem de tasca

## ELEMENTOS OBRIGATÓRIOS:
• **Títulos alarmistas** com trocadilhos e metaforas futebolísticas
• **Expressões dramáticas**: "DRAMA TOTAL", "CAOS", "BOMBA", "NÃO PERDOOU", "CHOQUE", entre outras apropriadas.
• **Secções criativas** com subtítulos que parecem cortinados de telejornal
• **Análises pseudo-táticas** escritas como thrillers políticos
• **Rodapés sensacionalistas** entre parágrafos
• **Conteúdo extenso** e bem estruturado

## PALETA EMOCIONAL:
- **Drama Score 1-3**: Notícias normais com toque dramático
- **Drama Score 4-6**: Sensacionalismo moderado
- **Drama Score 7-8**: Drama intenso, linguagem apocalíptica
- **Drama Score 9-10**: CAOS TOTAL, evento épico

## URGÊNCIA (use com parcimónia):
- **low**: Notícias rotineiras
- **medium**: Situações interessantes
- **high**: APENAS para eventos graves/impactantes
- **breaking**: APENAS para acontecimentos excecionais

## FORMATO OBRIGATÓRIO:
- **Texto jornalístico puro** em parágrafos corridos
- **Factos corretos** sempre, só dramatiza a apresentação
- **Nunca explicar piadas** - humor deve emergir naturalmente
- **Sem subtítulos ou secções** - apenas texto corrido como jornal normal
- Devolve texto limpo sem formatação especial

RELEMBRAR: Somos o "Cartão Vermelho" - onde cada notícia é um ESPETÁCULO!

IMPORTANTE: Responda APENAS com JSON válido, sem texto adicional antes ou depois. Use esta estrutura exata:
{
  "dramaticTitle": "Título sensacionalista com metaforas futebolísticas",
  "dramaticExcerpt": "Subtítulo ÚNICO que resume o drama de forma diferente do primeiro parágrafo - deve ser uma frase curta e impactante",
  "dramaticContent": "Conteúdo completo estruturado em várias secções dramáticas",
  "dramaScore": number (1-10),
  "urgencyLevel": "low|medium|high|breaking",
  "category": "categoria original",
  "tags": ["tag1", "tag2"],
  "processingNotes": "notas opcionais"
}`;
  }

  private buildPrompt(article: ArticleToProcess): string {
    return `NOTÍCIA ORIGINAL PARA TRANSFORMAR:

TÍTULO: ${article.title}

RESUMO: ${article.excerpt}

CONTEÚDO: ${article.content}

CATEGORIA: ${article.category}

DATA: ${article.publishedAt}

INSTRUÇÕES ESPECÍFICAS:
- Transforme esta notícia no estilo "Cartão Vermelho" sensacionalista e cómico
- Mantenha todos os factos corretos mas dramatize tudo ao extremo
- Crie um espetáculo televisivo com exagero e hipérbole
- Use trocadilhos futebolísticos, linguagem de tasca e referências de wrestling/reality shows
- Adicione expressões como "DRAMA", "CAOS", "INACREDITÁVEL", "NÃO PERDOOU"
- Misture vocabulário jornalístico com português informal mas mantém registo escrito
- Crie contraste entre seriedade da escrita e absurdo da situação
- Nunca expliques as piadas - deixa o humor emergir naturalmente
- Urgência "high" apenas para situações graves
- Urgência "breaking" apenas para eventos excecionais
- IMPORTANTE: Escreve texto jornalístico em parágrafos bem separados
- Separa cada parágrafo com quebras duplas (\\n\\n) para boa legibilidade
- Cada parágrafo deve ter 2-4 frases máximo
- Primeiro parágrafo: lead da notícia (quem, o quê, onde, quando)
- Parágrafos seguintes: desenvolvimento detalhado da história
- Último parágrafo: conclusão, perspetivas ou consequências
- USA **palavra** para enfatizar termos importantes (ex: **DRAMA**, **não perdoou**)
- NÃO uses subtítulos, secções, rodapés ou estruturas especiais
- NÃO escrevas coisas como "RODAPÉ DRAMÁTICO:", "EM DESTAQUE:", etc.
- Escreve como um artigo de jornal normal mas com linguagem dramatizada
- CRITICAL: O "dramaticExcerpt" deve ser DIFERENTE do primeiro parágrafo do "dramaticContent"
- O excerpt é um resumo impactante, o primeiro parágrafo é o lead da notícia

Responda em JSON válido conforme o formato especificado.`;
  }

  private parseResponse(response: string, originalArticle: ArticleToProcess): ProcessingResult {
    try {
      // Minimal cleaning - just remove markdown blocks if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to extract JSON from the response if it's embedded
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      console.log('Attempting to parse:', cleanResponse.substring(0, 100) + '...');
      const parsed = JSON.parse(cleanResponse);
      
      // Validate required fields
      if (!parsed.dramaticTitle || !parsed.dramaticContent) {
        throw new Error('Missing required fields in LLM response');
      }

      // Ensure drama score is valid
      const dramaScore = Math.max(1, Math.min(10, parsed.dramaScore || 5));
      
      // Ensure urgency level is valid
      const validUrgencyLevels = ['low', 'medium', 'high', 'breaking'];
      const urgencyLevel = validUrgencyLevels.includes(parsed.urgencyLevel) 
        ? parsed.urgencyLevel 
        : 'medium';

      return {
        dramaticTitle: this.cleanMarkdown(parsed.dramaticTitle.substring(0, 200)),
        dramaticExcerpt: this.cleanMarkdown(parsed.dramaticExcerpt || parsed.dramaticTitle),
        dramaticContent: this.cleanMarkdown(parsed.dramaticContent),
        dramaScore,
        urgencyLevel,
        category: parsed.category || originalArticle.category,
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
        processingNotes: parsed.processingNotes
      };
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      console.error('Raw response:', response.substring(0, 500) + '...');
      
      // Try to extract content manually if JSON parsing fails
      try {
        const titleMatch = response.match(/"dramaticTitle":\s*"([^"]+)"/);
        const contentMatch = response.match(/"dramaticContent":\s*"([^"]+(?:\\.[^"]*)*?)"/);
        const excerptMatch = response.match(/"dramaticExcerpt":\s*"([^"]+)"/);
        
        if (titleMatch && contentMatch) {
          return {
            dramaticTitle: titleMatch[1].replace(/\\"/g, '"'),
            dramaticExcerpt: excerptMatch?.[1]?.replace(/\\"/g, '"') || titleMatch[1],
            dramaticContent: contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
            dramaScore: 6,
            urgencyLevel: 'medium',
            category: originalArticle.category,
            tags: ['Drama', 'Desporto'],
            processingNotes: 'Recuperado por regex devido a erro de JSON'
          };
        }
      } catch (regexError) {
        console.error('Regex fallback also failed:', regexError);
      }
      
      // Final fallback response if all parsing fails
      return {
        dramaticTitle: `DRAMA TOTAL: ${originalArticle.title}`,
        dramaticExcerpt: originalArticle.excerpt || 'Situação dramática no mundo do desporto!',
        dramaticContent: originalArticle.content || 'Conteúdo em processamento...',
        dramaScore: 5,
        urgencyLevel: 'medium',
        category: originalArticle.category,
        tags: ['Drama', 'Desporto'],
        processingNotes: `Erro no processamento LLM: ${error}`
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: "Test message. Respond with just 'OK' in JSON format: {\"status\": \"OK\"}"
          }
        ],
        max_tokens: 10
      });

      return !!completion.choices[0]?.message?.content;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }

  async getModelInfo(): Promise<{ model: string; available: boolean }> {
    try {
      // Try to get available models
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        const modelExists = data.data?.some((m: any) => m.id === this.model);
        return { model: this.model, available: modelExists };
      }
    } catch (error) {
      console.warn('Could not fetch model info:', error);
    }

    return { model: this.model, available: true }; // Assume it's available
  }

  private cleanMarkdown(text: string): string {
    if (!text) return text;
    
    return text
      // Remove markdown headers (keep text, remove #)
      .replace(/^#+ (.*$)/gm, '$1')
      // PRESERVE markdown bold markers for frontend rendering
      // .replace(/\*\*(.*?)\*\*/g, '$1') // COMMENTED OUT - keep **bold**
      // Remove markdown italic markers (single asterisk)
      .replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '$1')
      // Remove markdown links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown code blocks
      .replace(/```[^`]*```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown lists markers
      .replace(/^[\s]*[-*+] /gm, '')
      .replace(/^[\s]*\d+\. /gm, '')
      // Normalize multiple line breaks to double line break (paragraph separator)
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace from start and end
      .trim();
  }
}