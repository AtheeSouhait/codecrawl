import type { ConfigMerged } from '../../config/configSchema.js';
import type { CrawlProgressCallback } from '../../types.js';
import type { ProcessedFile } from '../file/fileTypes.js';
import { calculateAllFileMetrics } from './calculateAllFileMetrics.js';
import { calculateOutputMetrics } from './calculateOutputMetrics.js';

export interface CalculateMetricsResult {
  totalFiles: number;
  totalCharacters: number;
  totalTokens: number;
  fileCharCounts: Record<string, number>;
  fileTokenCounts: Record<string, number>;
}

export const calculateMetrics = async (
  processedFiles: ProcessedFile[],
  output: string,
  progressCallback: CrawlProgressCallback,
  config: ConfigMerged,
  deps = {
    calculateAllFileMetrics,
    calculateOutputMetrics,
  },
): Promise<CalculateMetricsResult> => {
  progressCallback('Calculating metrics...');

  const [fileMetrics, totalTokens] = await Promise.all([
    deps.calculateAllFileMetrics(
      processedFiles,
      config.tokenCount.encoding,
      progressCallback,
    ),
    deps.calculateOutputMetrics(
      output,
      config.tokenCount.encoding,
      config.output.filePath,
    ),
  ]);

  const totalFiles = processedFiles.length;
  const totalCharacters = output.length;

  const fileCharCounts: Record<string, number> = {};
  const fileTokenCounts: Record<string, number> = {};
  for (const file of fileMetrics) {
    fileCharCounts[file.path] = file.charCount;
    fileTokenCounts[file.path] = file.tokenCount;
  }

  return {
    totalFiles,
    totalCharacters,
    totalTokens,
    fileCharCounts,
    fileTokenCounts,
  };
};
