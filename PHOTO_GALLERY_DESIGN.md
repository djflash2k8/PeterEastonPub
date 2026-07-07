# Photo Gallery Feature Design

This document outlines the data structure and API endpoints for the new Photo Gallery feature.

## 1. Data Structure

We will use a new Firestore collection named `galleries` to store each photo gallery. Each document in this collection will represent a single gallery and will have the following structure:

### `Gallery` Document Structure

```typescript
interface Gallery {
  id: string;             // Unique ID for the gallery (Firestore document ID)
  title: string;          // Title of the gallery (e.g., "Summer Nights 2026")
  description: string;    // A brief description of the gallery
  slug: string;           // URL-friendly slug for the gallery page (e.g., "summer-nights-2026")
  createdAt: Timestamp;   // Firestore timestamp of when the gallery was created
  updatedAt: Timestamp;   // Firestore timestamp of when the gallery was last updated
  published: boolean;     // Whether the gallery is visible on the frontend
  autoScroll: boolean;    // Whether images in this gallery should auto-scroll on the frontend
  images: GalleryImage[]; // Array of images within this gallery
}

interface GalleryImage {
  id: string;             // Unique ID for the image (e.g., UUID)
  url: string;            // URL of the image (e.g., Cloudinary URL)
  thumbnailUrl: string;   // URL of a smaller thumbnail version of the image
  altText: string;        // Alt text for accessibility and SEO
  caption?: string;       // Optional caption for the image
  order: number;          // Display order of the image within the gallery
}
```

**Notes on Data Structure:**
*   **`id`**: Will be the Firestore document ID, ensuring uniqueness.
*   **`slug`**: Will be generated from the title and used for clean URLs (e.g., `/photo-gallery/summer-nights-2026`).
*   **`images`**: Stored as a sub-array within the `Gallery` document for simplicity and to keep related data together. This avoids extra Firestore reads for each image.
*   **`thumbnailUrl`**: Crucial for performance on the frontend, especially for galleries with many images.

## 2. API Endpoints

We will create a new API route `src/app/api/galleries` to handle CRUD operations for the `Gallery` collection. All endpoints will require JWT authentication for admin access.

### `GET /api/galleries`
*   **Purpose**: Retrieve a list of all galleries (for admin) or published galleries (for frontend).
*   **Authentication**: Optional (for frontend, returns only `published: true` galleries). Required for admin (returns all galleries).
*   **Query Parameters**:
    *   `published=true` (optional): Filters for published galleries only.
*   **Response**: `Gallery[]` (array of gallery objects).

### `GET /api/galleries/[id]`
*   **Purpose**: Retrieve a single gallery by its ID or slug.
*   **Authentication**: Optional (for frontend, returns only if `published: true`). Required for admin.
*   **Path Parameters**:
    *   `id` (string): The ID or slug of the gallery.
*   **Response**: `Gallery` object.

### `POST /api/galleries`
*   **Purpose**: Create a new gallery.
*   **Authentication**: Required (admin).
*   **Request Body**: `Gallery` object (excluding `id`, `createdAt`, `updatedAt`).
*   **Response**: `Gallery` object of the newly created gallery.

### `PUT /api/galleries/[id]`
*   **Purpose**: Update an existing gallery.
*   **Authentication**: Required (admin).
*   **Path Parameters**:
    *   `id` (string): The ID of the gallery to update.
*   **Request Body**: Partial `Gallery` object with fields to update.
*   **Response**: `Gallery` object of the updated gallery.

### `DELETE /api/galleries/[id]`
*   **Purpose**: Delete a gallery.
*   **Authentication**: Required (admin).
*   **Path Parameters**:
    *   `id` (string): The ID of the gallery to delete.
*   **Response**: `{ success: true, message: string }`.

## 3. Image Uploads

Image uploads will leverage the existing Cloudinary integration. The admin interface will allow selecting multiple images, which will then be uploaded to Cloudinary, and their URLs/thumbnails stored in the `images` array of the `Gallery` document.

This design provides a flexible and scalable foundation for the Photo Gallery feature.
