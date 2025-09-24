// Azure Storage Configuration
export const AZURE_CONFIG = {
  // Your actual Azure Storage account details
  STORAGE_ACCOUNT_NAME: 'musicapplication', // Your Azure Storage account name
  CONTAINER_NAME: 'music-files', // Your container name for music files
  BLOB_ENDPOINT: 'https://musicapplication.blob.core.windows.net', // Your blob endpoint
  
  // Helper function to build full Azure Storage URLs
  getBlobUrl: (fileName) => {
    return `${AZURE_CONFIG.BLOB_ENDPOINT}/${AZURE_CONFIG.CONTAINER_NAME}/${fileName}`;
  },
  
  // Helper function to get image URL
  getImageUrl: (imageName) => {
    return `${AZURE_CONFIG.BLOB_ENDPOINT}/images/${imageName}`;
  },
  
  // Helper function to get audio URL
  getAudioUrl: (audioName) => {
    return `${AZURE_CONFIG.BLOB_ENDPOINT}/songs/${audioName}`;
  },
  
  // Helper function to get artist image URL
  getArtistImageUrl: (artistImageName) => {
    return `${AZURE_CONFIG.BLOB_ENDPOINT}/images/${artistImageName}`;
  }
};

// Example usage:
// AZURE_CONFIG.getImageUrl('all_hail.jpeg') 
// Returns: https://yourstorageaccount.blob.core.windows.net/music-files/images/all_hail.jpeg
