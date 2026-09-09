# panoramanu

Hey, I'm Manuel Verduzco, a Mexican living in the UK. Photography is my hobby and a way to pay closer attention to the places and people around me. This is where I'm bringing those photographs together.

I shoot film with a Kodak Ektar H35 and Kodak UltraMax 400. I especially love photographs with people in them; their presence makes every frame feel unique. The collection follows the camera through streets, stations, parks, and the places I visit along the way.

You can also find my photographs on [Instagram, @panoramanu_](https://instagram.com/panoramanu_).

## What I'm building

panoramanu is a personal photo archive that you can explore through both a gallery and a map. I want each photograph to keep its connection to the place where it was taken. You can browse the images, see where they belong on the map, or start with a place and explore the photographs from there.

I'm keeping the design quiet: warm, dark surfaces, room for the photographs, and just enough detail to give them context. There's a slideshow for spending more time with the images, an About page for the person and camera behind them, and a private admin area where I can add photographs and their stories.

I'm building this a little at a time, as the collection grows. The aim is to make a home for my photography that feels personal and is easy to wander through.

## Under the hood

The site uses Next.js, React, TypeScript, and Tailwind CSS. Leaflet connects the photographs to the map, while Supabase stores the photo details and uploaded images.

## Running it locally

Install the dependencies:

```bash
npm install
```

The gallery needs a Supabase project. Run the SQL in [`supabase/photos.sql`](supabase/photos.sql) to create the photos table, then create a `.env.local` file with your project's values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
SUPABASE_SECRET_KEY=your-supabase-secret-key
```

To use the private admin area and upload images, create a public Supabase Storage bucket and add:

```dotenv
SUPABASE_STORAGE_BUCKET=your-photo-bucket
ADMIN_ACCESS_KEY=your-private-login-key
ADMIN_SESSION_SECRET=your-long-random-session-secret
```

Keep `.env.local` out of version control. The Supabase secret key is used only on the server.

Start the site:

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000) for the gallery, or [localhost:3000/admin](http://localhost:3000/admin) to manage photographs.
