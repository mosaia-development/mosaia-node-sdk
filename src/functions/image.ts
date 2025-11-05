import { BaseFunctions } from './base-functions';

/**
 * Image functions class for managing image-related operations
 * 
 * This class provides functionality for image operations, including access to
 * image completions. It extends BaseFunctions to inherit standard CRUD operations
 * while adding image-specific functionality.
 * 
 * @example
 * ```typescript
 * // Create a image instance
 * const image = new Image('/image/123');
 * 
 * // Access completions
 * const completions = image.completions;
 * 
 * // Create a chat completion
 * const response = await image.create({
 *   file: 'image.png'
 * });
 * ```
 * 
 * @category Functions
 */
export class Image extends BaseFunctions {
  protected url: string;
  /**
   * Creates a new Image instance
   * 
   * @param uri - Base URI for the image endpoint (e.g., '/image/123')
   * 
   * @example
   * ```typescript
   * // For agent chat
   * const agentImage = new Image('/image/image-id');
   * 
   * // For model chat
   * const modelImage = new Image('/image/image-id');
   * 
   * // For agent group chat
   * const groupImage = new Image('/image/image-id');
   * ```
   */
  constructor(uri: string = "", image_url: string = "") {
    super(`${uri}/image`); // Pass the image endpoint URI to the base class    
    this.url = image_url || '';
  }

  /**
   * Upload an image
   * 
   * Uploads an image file to be associated with the resource for branding
   * and identification purposes.
   * 
   * @template T - The return type (e.g., Agent, App, Tool, etc.)
   * @template Payload - The payload type for the response (e.g., GetAgentPayload, GetAppPayload)
   * @param file - Image file to upload (supports common image formats)
   * @returns Promise that resolves to the updated resource instance
   * @throws {Error} When upload fails or network errors occur
   * 
   * @example
   * ```typescript
   * // Upload an agent avatar
   * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
   * const file = fileInput.files[0];
   * 
   * try {
   *   const updatedAgent = await agentImage.upload<Agent, GetAgentPayload>(file);
   *   console.log('Agent image uploaded successfully');
   * } catch (error) {
   *   console.error('Upload failed:', error.message);
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Upload an app image
   * const updatedApp = await appImage.upload<App, GetAppPayload>(file);
   * ```
   */
  async upload<T = any, Payload = any>(file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await this.apiClient.POST<Payload>(`${this.uri}/upload`, formData);
        const data = (response as any).data || response;
        
        return data as T;
    } catch (error) {
        if ((error as any).message) {
            throw new Error((error as any).message);
        }
        throw new Error('Unknown error occurred');
    }
  }
} 