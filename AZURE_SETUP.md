# Azure Storage Setup Guide

This guide will help you set up Azure Storage for your music streaming application to make files accessible globally.

## Prerequisites

1. An Azure account (free tier available)
2. Azure Storage account created

## Step 1: Create Azure Storage Account

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Storage" → "Storage account"
3. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource group**: Create new or use existing
   - **Storage account name**: `musicapplication` (or choose a unique name)
   - **Region**: Choose closest to your users
   - **Performance**: Standard
   - **Redundancy**: LRS (Locally-redundant storage) for cost efficiency
4. Click "Review + create" → "Create"

## Step 2: Create Container

1. Go to your storage account
2. In the left menu, click "Containers"
3. Click "+ Container"
4. Name: `music-files`
5. Public access level: **Blob (anonymous read access for blobs only)**
6. Click "Create"

## Step 3: Upload Files

### Folder Structure in Azure Storage:
```
Root Container/
├── songs/
│   ├── [iSongs.info] 01 - All Hail The Tiger.mp3
│   ├── [iSongs.info] 01 - Ola Olaala Ala.mp3
│   ├── [iSongs.info] 01 - Ye Mera Jaha.mp3
│   ├── [iSongs.info] 02 - Ammaye Sannaga.mp3
│   ├── [iSongs.info] 02 - Chilipiga.mp3
│   ├── [iSongs.info] 03 - Cheliya Cheliya.mp3
│   ├── [iSongs.info] 03 - Cheppave Chirugali.mp3
│   ├── [iSongs.info] 04 - Premante.mp3
│   ├── [iSongs.info] 05 - Holi Holi.mp3
│   ├── Aaru Sethulunnaa.mp3
│   └── Vinaraa.mp3
└── images/
    ├── all_hail1.jpg
    ├── jersey1.jpeg
    ├── kushi.jpg
    ├── og1.webp
    ├── Okkadu.jpg
    ├── orange.jpg
    ├── salaar3.jpeg
    ├── vibe-guru-logo.png
    ├── vibe-guru-removebg-preview.png
    ├── vibe-guru.png
    ├── KK.jpg
    ├── harish jayaraj.jpg
    ├── mani sharma.jpg
    ├── Pawan Kalyan Smile Images.jpeg
    ├── ravi basrur.jpeg
    └── rolex.jpg
```

### Upload Methods:

#### Option 1: Azure Portal
1. Go to your container
2. Click "Upload" → "Upload files" or "Upload folder"
3. Upload files to appropriate folders

#### Option 2: Azure Storage Explorer
1. Download [Azure Storage Explorer](https://azure.microsoft.com/en-us/features/storage-explorer/)
2. Connect to your storage account
3. Navigate to your container and upload files

#### Option 3: Azure CLI
```bash
# Install Azure CLI first
az storage blob upload-batch \
  --account-name yourstorageaccount \
  --source ./public \
  --destination music-files \
  --destination-path images
```

## Step 4: Update Configuration

Update the `src/config/azure.js` file with your actual Azure Storage details:

```javascript
export const AZURE_CONFIG = {
  STORAGE_ACCOUNT_NAME: 'musicapplication', // Your actual account name
  CONTAINER_NAME: 'music-files',
  BLOB_ENDPOINT: 'https://musicapplication.blob.core.windows.net', // Your actual endpoint
  
  // ... rest of the configuration
};
```

**Note**: The configuration is already updated with your actual Azure Storage account details!

## Step 5: Test Your Setup

1. Start your development server: `npm run dev`
2. Check if images and audio files load correctly
3. Test from different devices/locations to ensure global accessibility

## Security Considerations

1. **Public Access**: Your container is set to public read access for blobs
2. **CORS**: Configure CORS if needed for web applications
3. **Access Keys**: Keep your storage account keys secure
4. **CDN**: Consider using Azure CDN for better performance

## Cost Optimization

1. **Storage Tier**: Use Cool or Archive tier for older files
2. **Lifecycle Management**: Set up automatic deletion of old files
3. **Compression**: Compress audio files to reduce storage costs
4. **Monitoring**: Use Azure Cost Management to monitor usage

## Troubleshooting

### Common Issues:

1. **403 Forbidden**: Check container public access settings
2. **404 Not Found**: Verify file paths and names
3. **CORS Errors**: Configure CORS in storage account settings
4. **Slow Loading**: Consider using Azure CDN

### CORS Configuration:
```json
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposedHeaders": ["*"],
  "MaxAgeInSeconds": 3600
}
```

## Next Steps

1. Set up Azure CDN for better performance
2. Implement authentication if needed
3. Add monitoring and analytics
4. Consider using Azure Functions for dynamic content

## Support

- [Azure Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/)
- [Azure Storage Pricing](https://azure.microsoft.com/en-us/pricing/details/storage/)
- [Azure Support](https://azure.microsoft.com/en-us/support/)
