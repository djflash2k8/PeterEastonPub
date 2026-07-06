import crypto from 'crypto'

// Cloudinary configuration
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dci3a6zp4',
  api_key: process.env.CLOUDINARY_API_KEY || '671863912971299',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'X4uZ6cm5F2I-GtRxomRatmP8_Uo',
  secure: true
}

/**
 * Helper function to upload image to Cloudinary using Signed REST API
 * This is more secure and doesn't rely on an 'upload_preset' being created in the UI.
 */
export async function uploadImageToCloudinary(file: File, folder: string = 'events') {
  try {
    const buffer = await file.arrayBuffer()
    const base64String = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64String}`
    
    const timestamp = Math.round(new Date().getTime() / 1000)
    
    // Create signature for authenticated upload
    // Parameters must be in alphabetical order for signing
    const signatureParams = `folder=${folder}&timestamp=${timestamp}${cloudinaryConfig.api_secret}`
    const signature = crypto
      .createHash('sha1')
      .update(signatureParams)
      .digest('hex')
    
    // Create form data for Cloudinary upload
    const formData = new FormData()
    formData.append('file', dataUrl)
    formData.append('folder', folder)
    formData.append('timestamp', timestamp.toString())
    formData.append('api_key', cloudinaryConfig.api_key)
    formData.append('signature', signature)
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Cloudinary raw error:', errorText)
      throw new Error(`Cloudinary upload failed: ${response.statusText} - ${errorText}`)
    }
    
    const result = await response.json()
    
    console.log('Image uploaded to Cloudinary successfully:', result.secure_url)
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}
