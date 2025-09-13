
import type { FileUploadResponse } from '~/app/types/domain'

export class FileUploadService {
  private static instance: FileUploadService
  private readonly uploadUrl = 'https://api.escuelajs.co/api/v1/files/upload'

  static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService()
    }
    return FileUploadService.instance
  }

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
      }

      const result: FileUploadResponse = await response.json()
      
      return {
        url: result.location,
        filename: result.filename
      }
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to upload file')
    }
  }

  validateFile(file: File): { isValid: boolean; error?: string } {
    // check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must not exceed 5MB' }
    }

    // check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, and PDF files are allowed' }
    }

    return { isValid: true }
  }
}

export const fileUploadService = FileUploadService.getInstance()
