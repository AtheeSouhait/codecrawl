import axios, {
  AxiosError,
  type AxiosRequestHeaders,
  type AxiosResponse,
} from 'axios';

/**
 * Configuration interface for CodecrawlApp.
 * @param apiKey - Optional API key for authentication.
 * @param apiUrl - Optional base URL of the API; defaults to 'https://api.irere.dev'.
 */
export interface CodecrawlAppConfig {
  apiKey?: string | null;
  apiUrl?: string | null;
}

export type OutputStyle = 'markdown' | 'xml' | 'plain';

/**
 * Parameters for scraping operations.
 * Defines the options and configurations available for scraping web content.
 */
export interface CrawlOptions {
  // Output Options
  output?: string;
  style?: OutputStyle;
  parsableStyle?: boolean;
  compress?: boolean;
  outputShowLineNumbers?: boolean;
  copy?: boolean;
  fileSummary?: boolean;
  directoryStructure?: boolean;
  removeComments?: boolean;
  removeEmptyLines?: boolean;
  headerText?: string;
  instructionFilePath?: string;
  includeEmptyDirectories?: boolean;
  gitSortByChanges?: boolean;

  // Filter Options
  include?: string;
  ignore?: string;
  gitignore?: boolean;
  defaultPatterns?: boolean;

  // Remote Repository Options
  remote?: string;
  remoteBranch?: string;

  // Configuration Options
  config?: string;
  init?: boolean;
  global?: boolean;

  // Security Options
  securityCheck?: boolean;

  // Token Count Options
  tokenCountEncoding?: string;

  // Other Options
  topFilesLen?: number;
  verbose?: boolean;
  quiet?: boolean;
}

/**
 * Parameters for generate llmstxt operations.
 * Defines the options and configurations available for generating LLMs.txt.
 */
export interface GenerateLLMsTextParams extends CrawlOptions {
  url: string;
  maxUrls: number;
  showFullText: boolean;
}

/**
 * Error response interface for generate llmstxt operations.
 * Defines the structure of the error response received after initiating a crawl.
 */
export interface ErrorResponse {
  success: boolean;
  error: string;
}

/**
 * Response interface for generate llmstxt operations.
 * Defines the structure of the response received after initiating a crawl.
 */
export interface GenerateLLMsTextResponse {
  success: boolean;
  id: string;
}

/**
 * Response interface for job status checks.
 * Provides detailed status of a generate llmstxt job including progress and results.
 */
export interface GenerateLLMsTextStatusResponse {
  success: boolean;
  data: {
    llmstxt: string;
    llmsfulltxt?: string;
  };
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  expiresAt: string;
}

/**
 * Custom error class for Codecrawl.
 * Extends the built-in Error class to include a status code.
 */
export class CodecrawlError extends Error {
  statusCode: number;
  details?: any;
  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Main class for interacting with the Codecrawl API.
 * Provides methods for llmstxt generation, searching, indexing, and more.
 */
export default class CodecrawlApp {
  private apiKey: string;
  private apiUrl: string;

  private isCloudService(url: string): boolean {
    return url.includes('api.irere.dev');
  }

  /**
   * Initializes a new instance of the CodecrawlApp class.
   * @param config - Configuration options for the CodecrawlApp instance.
   */
  constructor({ apiKey = null, apiUrl = null }: CodecrawlAppConfig) {
    const baseUrl = apiUrl || 'https://api.irere.dev';

    if (this.isCloudService(baseUrl) && typeof apiKey !== 'string') {
      throw new CodecrawlError('No API key provided', 401);
    }

    this.apiKey = apiKey || '';
    this.apiUrl = apiUrl || baseUrl;
  }

  /**
   * Prepares the headers for an API request.
   * @param idempotencyKey - Optional idempotency key for the request.
   * @returns Headers object for the request.
   */
  prepareHeaders(idempotencyKey?: string): AxiosRequestHeaders {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {}),
    } as AxiosRequestHeaders & { 'x-idempotency-key'?: string };
  }

  /**
   * Sends a POST request to the specified URL.
   * @param url - The URL to send the request to.
   * @param data - The data to send in the request body.
   * @param headers - Optional headers for the request.
   * @returns The response from the request.
   */
  async postRequest(
    url: string,
    data: any,
    headers: AxiosRequestHeaders,
  ): Promise<AxiosResponse> {
    return await axios.post(url, data, {
      headers,
      timeout: data?.timeout ? data.timeout + 5000 : undefined,
    });
  }

  /**
   * Sends a GET request to the specified URL.
   * @param url - The URL to send the request to.
   * @param headers - Optional headers for the request.
   * @returns The response from the request.
   */
  async getRequest(
    url: string,
    headers: AxiosRequestHeaders,
  ): Promise<AxiosResponse> {
    try {
      return await axios.get(url, { headers });
    } catch (error) {
      if (error instanceof AxiosError) {
        return error.response as AxiosResponse;
      } else {
        throw error;
      }
    }
  }

  /**
   * Sends a DELETE request to the specified URL.
   * @param url - The URL to send the request to.
   * @param headers - Optional headers for the request.
   * @returns The response from the request.
   */
  async deleteRequest(
    url: string,
    headers: AxiosRequestHeaders,
  ): Promise<AxiosResponse> {
    try {
      return await axios.delete(url, { headers });
    } catch (error) {
      if (error instanceof AxiosError) {
        return error.response as AxiosResponse;
      } else {
        throw error;
      }
    }
  }

  /**
   * Handles errors from API responses.
   * @param {AxiosResponse} response - The response from the API.
   * @param {string} action - The action that was being performed when the error occurred.
   */
  handleError(response: AxiosResponse, action: string): void {
    if ([400, 402, 402, 408, 409, 500].includes(response.status)) {
      const errorMessage: string =
        response.data.error || 'unknown error occured';
      const details: any = response.data.details
        ? `- ${JSON.stringify(response.data.details)}`
        : '';
      throw new CodecrawlError(
        `Failed to ${action}. Status code: ${response.status}. Error: ${errorMessage}${details}`,
        response.status,
        response?.data?.details,
      );
    } else {
      throw new CodecrawlError(
        `Unexpected error occurred while ${action}. Status code: ${response.status}.`,
        response.status,
      );
    }
  }

  /**
   * Generate LLMs.txt for a given repository URL and polls until completion
   * @param {string} url - The URL of the repository to generate LLMs.txt for.
   * @param params - Parameters for the LLMs.txt generation.
   * @returns The final generation results.
   */
  async generateLLMsTxt(
    url: string,
    params?: GenerateLLMsTextParams,
  ): Promise<GenerateLLMsTextStatusResponse | ErrorResponse> {
    try {
      const response = await this.asyncGenerateLLMsText(url, params);

      if (response.success || 'error' in response) {
        return {
          success: false,
          error: 'error' in response ? response.error : 'unknown error',
        };
      }

      if (!response.id) {
        throw new CodecrawlError(
          'Failed to start LLMs.txt generation. No job ID returned',
          500,
        );
      }

      const jobId = response.id;
      let generationStatus: any;

      while (true) {
        generationStatus = await this.checkGenerateLLMsTextStatus(jobId);

        if ('error' in generationStatus && !generationStatus.success) {
          return generationStatus;
        }

        if (generationStatus.status === 'completed') {
          return generationStatus;
        }

        if (generationStatus.status === 'failed') {
          throw new CodecrawlError(
            `LLMs.txt generation failed. Status code: ${generationStatus.status}. Error: ${generationStatus.error}`,
            generationStatus.statusCode,
          );
        }

        if (generationStatus.status !== 'processing') {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      return {
        success: false,
        error: `LLMs.txt generation ended with unexpected status: ${generationStatus?.status ?? 'unknown'}`,
      };
    } catch (error: any) {
      throw new CodecrawlError(
        error.message,
        500,
        error.response?.data?.details,
      );
    }
  }

  /**
   * Initiates a LLMs.txt generation operation without polling.
   * @param url - The Repository URL to generate LLMs.txt from.
   * @param params - Parameters for the LLMs.txt generation operation.
   * @returns The response containing the generation job ID.
   */
  async asyncGenerateLLMsText(
    url: string,
    params?: GenerateLLMsTextParams,
  ): Promise<GenerateLLMsTextResponse | ErrorResponse> {
    const headers = this.prepareHeaders();

    try {
      const response = await this.postRequest(
        `${this.apiUrl}/v1/llmstxt`,
        { ...params, url },
        headers,
      );

      if (response.status === 200) {
        return response.data;
      } else {
        this.handleError(response, 'start LLMs.txt generation');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new CodecrawlError(
          `Failed to start LLMs.txt generation. Status code: ${error.response.status}. Error: ${error.response.data.error}`,
          error.response.status,
        );
      } else {
        throw new CodecrawlError(
          `Unexpected error occurred while starting LLMs.txt generation. Status code: ${error.response.status}.`,
          error.response.status,
        );
      }
    }

    return { success: false, error: 'Internal Server Error' };
  }

  /**
   * Checks the status of a LLMs.txt generation operation.
   * @param id - The ID of the LLMs.txt generation operation.
   * @returns The current status and results of the generation operation.
   */
  async checkGenerateLLMsTextStatus(
    id: string,
  ): Promise<GenerateLLMsTextStatusResponse | ErrorResponse> {
    const headers = this.prepareHeaders();
    try {
      const response: AxiosResponse = await this.getRequest(
        `${this.apiUrl}/v1/llmstxt/${id}`,
        headers,
      );

      if (response.status === 200) {
        return response.data;
      } else if (response.status === 404) {
        throw new CodecrawlError('LLMs.txt generation job not found', 404);
      } else {
        this.handleError(response, 'check LLMs.txt generation status');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new CodecrawlError(
          `Request failed with status code ${error.response.status}. Error: ${error.response.data.error} ${error.response.data.details ? ` - ${JSON.stringify(error.response.data.details)}` : ''}`,
          error.response.status,
        );
      } else {
        throw new CodecrawlError(error.message, 500);
      }
    }
    return { success: false, error: 'Internal server error.' };
  }
}
