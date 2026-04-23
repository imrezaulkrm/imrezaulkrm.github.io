# Profile Image Folder

This folder contains profile images that are loaded dynamically by the portfolio.

## How to Add Images

1. **Add images to this folder**:
   - Supported formats: JPG, PNG, WebP
   - Recommended size: 800x800px or square aspect ratio
   - File size: Keep under 300KB per image

2. **Update `infra.js`** to include your images in the `profileImages` array:

```javascript
const profileImages = [
    'https://github.com/imrezaulkrm/imrezaulkrm.github.io/raw/main/img/convocation.jpg',
    'assets/profile/photo-1.jpg',
    'assets/profile/photo-2.jpg',
    'assets/profile/professional-headshot.jpg',
    // Add more images...
];
```

## Image Naming Convention

Use descriptive names:
- `professional-headshot.jpg`
- `casual-photo.jpg`
- `conference-photo.jpg`
- `workspace-photo.jpg`

## Features

- **Automatic Shuffling**: Images are randomly shuffled using Fisher-Yates algorithm
- **No Duplicates**: Each image appears only once per cycle
- **Smooth Transitions**: Fade in/out effects between images
- **Lazy Loading**: Images load efficiently with proper caching

## Optional: Auto-Rotation

To enable periodic image rotation (change image every 15 seconds), uncomment in `infra.js`:

```javascript
// Optional: Change image periodically (disabled by default - uncomment to enable)
const imageChangeInterval = 15000; // Change every 15 seconds
setInterval(() => {
    const nextImage = getRandomImage();
    if (nextImage) {
        loadImageWithTransition(nextImage);
    }
}, imageChangeInterval);
```

## Server-Side Folder Scanning (Optional)

For production, implement a backend API to auto-discover images:

```javascript
// Fetch image list from server API
fetch('/api/profile-images')
    .then(res => res.json())
    .then(data => {
        profileImages = data.images;
        // Update image display
    });
```

Backend endpoint example (Node.js/Express):

```javascript
app.get('/api/profile-images', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const dir = 'assets/profile';
    
    fs.readdir(dir, (err, files) => {
        if (err) return res.status(500).json({ error: err });
        
        const images = files
            .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
            .map(f => path.join(dir, f));
        
        res.json({ images });
    });
});
```

## Best Practices

1. **Consistency**: Use photos with similar lighting and tone
2. **Quality**: High-resolution images scale better
3. **Privacy**: Use professional or appropriate photos only
4. **Compression**: Optimize images with tools like TinyPNG or ImageOptim
5. **Naming**: Keep filenames simple and descriptive

---

Images will fade in smoothly with a 0.8s animation when loaded.
