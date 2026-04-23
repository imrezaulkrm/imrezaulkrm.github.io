# Portfolio Setup Guide

This document provides setup instructions for the new **Passion** and **Contact** sections added to your portfolio.

---

## 📸 PASSION SECTION: Photo Wall Gallery

### What It Includes
- A personal expression section with calm, human tone
- Dynamic masonry photo wall with natural, non-grid layout
- Fade-in sequential animations
- Slight rotation variations for natural feel
- Responsive design

### How to Add Your Photos

#### Option 1: Using Local Images (Recommended)

1. **Create a `photos` folder** in your portfolio root (already created)
   ```
   /portfolio
   ├── photos/
   │   ├── photo-1.jpg
   │   ├── photo-2.jpg
   │   └── ...
   ```

2. **Update the JavaScript** in `infra.js` to load from your folder:

   Replace this section in the `initPhotoWall()` function:
   ```javascript
   const photoUrls = [
       // ... unsplash URLs ...
   ];
   ```

   With your local paths:
   ```javascript
   const photoUrls = [
       'photos/photo-1.jpg',
       'photos/photo-2.jpg',
       'photos/photo-3.jpg',
       // ... add all your photos
   ];
   ```

#### Option 2: Using External URLs

You can use URLs from:
- **Unsplash**: Free high-quality images
- **Pexels**: Free stock photos
- **Your own CDN**: If hosting elsewhere

3. **Add 8-10 photos** for optimal gallery layout
4. **Image recommendations**:
   - Aspect ratio: Square (1:1) works best, but any ratio works
   - File size: Keep under 200KB per image for performance
   - Format: JPG, PNG, WebP

### How It Works

- **Shuffled Display**: Photos are randomly shuffled on each page load using Fisher-Yates algorithm
- **No Duplicates**: Each photo appears only once per render cycle
- **Masonry Layout**: A mix of single, double-width, and double-height images creates natural variety
- **Subtle Rotations**: Each image has a slight rotation (-1.5° to 1.2°) for a real photo wall feel
- **Lazy Loading**: Images load as needed for better performance

---

## 📧 CONTACT SECTION: Form & Communication

### What It Includes
- Clean contact information (name, location, email)
- Social media links (GitHub, LinkedIn, Twitter)
- Contact form (Name, Email, Message)
- Embedded Google Map
- Professional footer with back-to-top button

### Form Handling Setup

#### Option 1: Simple EmailJS Integration (Recommended)

EmailJS allows you to send form data directly to your email without a backend.

1. **Sign up** at [emailjs.com](https://www.emailjs.com)
2. **Create an email service** and get your Service ID
3. **Create an email template** and get your Template ID
4. **Get your Public Key** from account settings
5. **Update the form handler** in `infra.js`:

   Replace this section in `initContactForm()`:
   ```javascript
   try {
       // In production, send to backend/email service
       await new Promise(resolve => setTimeout(resolve, 1000));
       // ...
   ```

   With:
   ```javascript
   try {
       // Initialize EmailJS (add this at the top of the function)
       emailjs.init('YOUR_PUBLIC_KEY');
       
       // Send email
       await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', {
           from_name: formData.name,
           from_email: formData.email,
           message: formData.message,
           to_email: 'rezaulkarim@example.com'
       });
       // ...
   ```

6. **Add EmailJS script** to `index.html` before the closing `</body>` tag:
   ```html
   <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/index.min.js"></script>
   ```

#### Option 2: Backend API

If you have a backend server:

1. **Create an endpoint** (e.g., `POST /api/contact`)
2. **Update the form handler**:
   ```javascript
   try {
       const response = await fetch('/api/contact', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(formData)
       });
       
       if (!response.ok) throw new Error('Failed to send');
       // ...
   ```

#### Option 3: Third-Party Services

- **Formspree**: [formspree.io](https://formspree.io) - Zero code needed
- **Basin**: [usebasin.com](https://usebasin.com) - Simple form backend
- **Netlify Forms**: If hosting on Netlify

### Contact Information

Update the contact details in `index.html`:

```html
<div class="info-item">
    <label class="info-label">Email</label>
    <a href="mailto:YOUR_EMAIL@example.com" class="info-link">
        YOUR_EMAIL@example.com
    </a>
</div>
```

### Map Customization

The embedded Google Map can be customized:

1. **Get your Google Maps Embed API key** from [Google Cloud Console](https://console.cloud.google.com)
2. **Replace the iframe source** in `index.html`:
   ```html
   <iframe src="https://www.google.com/maps/embed?pb=YOUR_EMBED_CODE"
       width="100%" height="400" style="border:0;" allowfullscreen="" loading="lazy">
   </iframe>
   ```

3. **Generate embed code**: Use Google Maps > Share > Embed a map

### Social Links

Update social media URLs in the contact info section:

```html
<a href="https://github.com/YOUR_USERNAME" target="_blank">GitHub</a>
<a href="https://linkedin.com/in/YOUR_PROFILE" target="_blank">LinkedIn</a>
<a href="https://twitter.com/YOUR_HANDLE" target="_blank">Twitter</a>
```

---

## 🎨 Customization Tips

### Passion Section
- **Text**: Update the paragraph in the `.passion-text` div to reflect your perspective
- **Colors**: The section uses the existing color scheme (dark theme with cyan accents)
- **Layout**: Adjust grid columns in CSS if you want fewer/more columns on mobile

### Contact Section
- **Form validation**: Currently checks for empty fields and valid email format
- **Success message**: Customize the "Message sent!" text
- **Styling**: All colors match your dark theme

---

## 🚀 Performance Tips

1. **Optimize images**: Use tools like TinyPNG or ImageOptim
2. **Lazy load photos**: Currently enabled with `loading="lazy"`
3. **Use WebP format**: For better compression
4. **Minimize requests**: Combine images or use a CDN

---

## 🐛 Troubleshooting

### Photos not showing?
- Check file paths in the `photoUrls` array
- Ensure images exist in the `photos/` folder
- Check browser console for error messages
- Verify CORS is not blocking images from external sources

### Form not sending?
- If using EmailJS, verify your Service ID and Template ID
- Check browser console for JavaScript errors
- Ensure email service is properly configured
- Test with different email addresses

### Map not displaying?
- Verify Google Maps Embed API key is correct
- Check that the iframe URL is formatted correctly
- Ensure the embedding domain is whitelisted in Google Cloud

---

## 📝 Best Practices

1. **Photography Selection**: Choose 8-10 meaningful images that represent different aspects of your interests
2. **Consistency**: Maintain similar lighting and color tones for a cohesive gallery
3. **Form Privacy**: Don't expose personal email addresses in client-side code; use a service instead
4. **Accessibility**: All form inputs have proper labels; the back-to-top button is keyboard accessible
5. **Performance**: Monitor with Lighthouse for optimal loading times

---

## 💡 Future Enhancements

Consider adding:
- Photo filters or hover effects
- Gallery lightbox for full-size viewing
- Additional form fields (phone, subject, etc.)
- Auto-reply emails
- Form submission analytics
- Loading states and error handling

---

For questions or issues, refer to the codebase comments or consult the respective service documentation.
