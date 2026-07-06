// Cloudinary configuration
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dci3a6zp4',
  api_key: process.env.CLOUDINARY_API_KEY || '671863912971299',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'X4uZ6cm5F2I-GtRxomRatmP8_Uo',
  secure: true
}

// Helper function to upload image to Cloudinary using REST API
export async function uploadImageToCloudinary(file: File, folder: string = 'events') {
  try {
    const buffer = await file.arrayBuffer()
    const base64String = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64String}`
    
    // Create form data for Cloudinary upload
    const formData = new FormData()
    formData.append('file', dataUrl)
    formData.append('folder', folder)
    formData.append('upload_preset', 'ml_default')
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    console.log('Image uploaded to Cloudinary:', result.secure_url)
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
