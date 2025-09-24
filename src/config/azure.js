// Azure Storage Configuration
export const AZURE_CONFIG = {
  // Your actual Azure Storage account details
  STORAGE_ACCOUNT_NAME: 'musicapplication',
  BLOB_ENDPOINT: 'https://musicapplication.blob.core.windows.net',

  // Containers per your setup
  IMAGE_CONTAINER: 'images',
  SONGS_CONTAINER: 'songs',

  // Helper function to build full Azure Storage URLs for images
  getImageUrl: (imageName) => {
    return `${AZURE_CONFIG.BLOB_ENDPOINT}/${AZURE_CONFIG.IMAGE_CONTAINER}/${encodeURIComponent(imageName)}`;
  },

  // Helper function to build full Azure Storage URLs for audio
  getAudioUrl: (audioName) => {
    return `${AZURE_CONFIG.BLOB_ENDPOINT}/${AZURE_CONFIG.SONGS_CONTAINER}/${encodeURIComponent(audioName)}`;
  },

  // Artist images live in the images container
  getArtistImageUrl: (artistImageName) => {
    return `${AZURE_CONFIG.BLOB_ENDPOINT}/${AZURE_CONFIG.IMAGE_CONTAINER}/${encodeURIComponent(artistImageName)}`;
  }
};

// Example usage:
// AZURE_CONFIG.getImageUrl('all_hail.jpeg') 
// Returns: https://musicapplication.blob.core.windows.net/images/all_hail.jpeg
