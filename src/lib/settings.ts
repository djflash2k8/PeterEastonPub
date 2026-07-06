import { queryCollectionFromFirebase } from './firebase'

export interface InstagramSettings {
  accessToken: string
  businessAccountId: string
  defaultHashtag: string
}

export interface AutoCreationSettings {
  enabled: boolean
  autoApprove: boolean
  defaultStartTime: string
  defaultEndTime: string
  markAsRecurring: boolean
  markAsArchived: boolean
}

export interface SyncSettings {
  lastSyncDate: string | null
  syncFrequency: 'manual' | 'daily' | 'weekly'
}

export interface AppSettings {
  id: string
  instagram: InstagramSettings
  autoCreation: AutoCreationSettings
  sync: SyncSettings
  updatedAt?: any
}

/**
 * Get Instagram credentials from settings (server-side only)
 * This function should only be called from API routes or server-side code
 */
export async function getInstagramCredentials(): Promise<InstagramSettings | null> {
  try {
    const settings = await queryCollectionFromFirebase('settings')
    
    if (settings.length === 0) {
      return null
    }

    const instagramSettings = settings[0].instagram
    
    // Validate that required fields are present
    if (!instagramSettings?.accessToken || !instagramSettings?.businessAccountId) {
      return null
    }

    return instagramSettings
  } catch (error) {
    console.error('Error retrieving Instagram credentials:', error)
    return null
  }
}

/**
 * Get all settings from Firestore
 */
export async function getAllSettings(): Promise<AppSettings | null> {
  try {
    const settings = await queryCollectionFromFirebase('settings')
    
    if (settings.length === 0) {
      return null
    }

    return settings[0]
  } catch (error) {
    console.error('Error retrieving settings:', error)
    return null
  }
}

/**
 * Get auto-creation settings
 */
export async function getAutoCreationSettings(): Promise<AutoCreationSettings | null> {
  try {
    const settings = await getAllSettings()
    return settings?.autoCreation || null
  } catch (error) {
    console.error('Error retrieving auto-creation settings:', error)
    return null
  }
}

/**
 * Get default hashtag from settings
 */
export async function getDefaultHashtag(): Promise<string> {
  try {
    const settings = await getAllSettings()
    return settings?.instagram?.defaultHashtag || 'petereastonpub'
  } catch (error) {
    console.error('Error retrieving default hashtag:', error)
    return 'petereastonpub'
  }
}
