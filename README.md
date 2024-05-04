# Jill Weeks Smith Fine Art Gallery

This is a Next.js 14 project for Jill Weeks Smith, an artist showcasing and selling her artwork through a full-featured online gallery and sales platform.

![Jill Weeks Smith Artwork GIF](public/jws_pieces.gif)

## Features

-   Full gallery displaying Jill Weeks Smith's artwork
-   Artwork sales platform with integrated payments
-   Admin panel for managing artwork, sales, and site content
-   Responsive design for optimal viewing on various devices

## Tech Stack

-   **Next.js 14**: The project is built using Next.js 14, leveraging its powerful features and performance optimizations. The site extensively utilizes server components for efficient rendering and data fetching.
-   **TypeScript**: The codebase is written in TypeScript, providing static typing and enhanced developer experience.
-   **Tailwind CSS**: Styling is done using Tailwind CSS, a utility-first CSS framework that allows for rapid development and easy customization.
-   **Clerk**: User authentication and management are handled by Clerk, ensuring secure access to the admin panel and user-specific features.
-   **Uploadthing**: Uploadthing is used for efficient and secure file uploads, allowing the artist to easily add new artwork to the gallery.
-   **Google Maps API**: The site integrates with the Google Maps API to display the location of the artist's studio or gallery.
-   **Stripe**: Payments for artwork purchases are processed securely through Stripe, providing a seamless and reliable payment experience for customers.
-   **Prisma**: The project uses Prisma as the ORM (Object-Relational Mapping) tool for database management, simplifying database queries and interactions.
-   **PostgreSQL**: PostgreSQL is used as the database system to store artwork information, user details, and sales data.
-   **Zustand**: Zustand is utilized for state management, providing a simple and efficient way to manage application state.
-   **AWS S3**: Artwork images and other static assets are stored and served from Amazon S3 (Simple Storage Service) for scalable and reliable file storage.
-   **Vercel**: The site is deployed and hosted on Vercel, ensuring fast and efficient delivery of the application to users worldwide.

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/your-repo.git`
2. Install dependencies: `npm install`
3. Set up environment variables for required services (e.g., Clerk, Stripe, Google Maps API)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The project is deployed on Vercel. To deploy your own instance, you can follow the Vercel deployment documentation and connect your repository.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
