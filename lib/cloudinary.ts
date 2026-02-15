import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (matching video tutorial setup)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload a PDF to Cloudinary
 * Based on Cloudinary video tutorial for PDF uploads
 * @param filePath - Path to the PDF file to upload
 * @param folder - Cloudinary folder name
 * @param fileName - Original file name (used as public_id)
 * @returns Cloudinary upload response
 */
export async function uploadToCloudinary(
  filePath: string,
  folder: string = 'syncscript_pdfs',
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'raw',
  fileName?: string
) {
  try {
    // Upload with PUBLIC access mode for unrestricted delivery
    const uploadOptions: any = {
      folder,
      resource_type: 'auto',  // Auto-detect file type
      type: 'upload',         // Standard upload (NOT authenticated)
      access_mode: 'public',  // CRITICAL: Enable public delivery
    };

    if (fileName) {
      uploadOptions.public_id = fileName.replace(/\.[^/.]+$/, '');
      uploadOptions.use_filename = true;
      uploadOptions.unique_filename = false;
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload a PDF to Cloudinary from a Buffer (works on serverless)
 * @param buffer - Buffer containing the PDF data
 * @param folder - Cloudinary folder name
 * @param fileName - Original file name (used as public_id)
 * @returns Cloudinary upload response
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string = 'syncscript_pdfs',
  fileName?: string
): Promise<{ success: boolean; url?: string; publicId?: string; error?: string }> {
  return new Promise((resolve) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'auto',
      type: 'upload',
      access_mode: 'public',
    };

    if (fileName) {
      uploadOptions.public_id = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_');
      uploadOptions.use_filename = true;
      uploadOptions.unique_filename = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          resolve({
            success: false,
            error: error.message || 'Upload failed',
          });
        } else if (result) {
          resolve({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          resolve({
            success: false,
            error: 'No result from Cloudinary',
          });
        }
      }
    );

    // Write buffer to stream
    uploadStream.end(buffer);
  });
}

/**
 * Generate a Cloudinary URL for a PDF with optional transformations
 * Based on video tutorial: cloudinary.url() method
 * @param publicId - The public ID of the PDF (includes folder)
 * @param transformations - Array of transformation objects
 * @returns Transformed Cloudinary URL
 */
export function generatePdfUrl(
  publicId: string,
  transformations?: Array<{ page?: number; [key: string]: any }>
) {
  try {
    // Use Cloudinary SDK's url() method as shown in video
    const url = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      transformation: transformations,
      secure: true,
    });

    return url;
  } catch (error) {
    console.error('Error generating PDF URL:', error);
    return null;
  }
}

/**
 * Generate a download URL for a PDF
 * Uses fl_attachment transformation to force download
 * @param publicId - The public ID of the PDF
 * @param fileName - Optional filename for download
 * @returns Download URL
 */
export function generatePdfDownloadUrl(
  publicId: string,
  fileName?: string
) {
  try {
    const url = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      flags: 'attachment' + (fileName ? `:${fileName}` : ''),
      secure: true,
    });

    return url;
  } catch (error) {
    console.error('Error generating PDF download URL:', error);
    return null;
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @param resourceType - Type of resource (PDFs uploaded with 'auto' appear as 'image')
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image' // New PDFs use 'auto' which becomes 'image'
) {
  try {
    // Try deleting with specified resource type
    let result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    // If not found and we tried 'image', fallback to 'raw' for older files
    if (result.result !== 'ok' && resourceType === 'image') {
      console.log('Image delete failed, trying raw resource type...');
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
      });
    }

    return {
      success: result.result === 'ok',
      result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

