PRO2001: INTERACTIVE FRONTEND PROJECT EXAM
Wilde Frames – Animal Poster Framing Shop

A React + TypeScript web application developed as part of the PRO2001 – Interactive Frontend exam project.
The application simulates an anonym e-commerce experience where users can browse animal photography, select compatible frames and materials, and add framed posters to a shopping cart.

✨ Features

Animal Gallery
	•	Fetches animal data from a REST API
	•	Category-based filtering
	•	Responsive grid layout
	•	Animal thumbnails loaded from local static assets

Animal Detail Page
	•	Dynamic routing based on animal ID
	•	Displays animal information and description
	•	Frame compatibility logic based on aspect ratios

	•	Support for:
	•	Portrait / Landscape orientation
	•	With / Without mat
	•	Frame material selection with pricing multipliers
	•	Visual frame preview using CSS and API-provided styles

Frame Logic & Pricing
	•	Compatible frames are filtered based on image and frame aspect ratios
	•	Pricing calculated using backend data:

basePrice × materialMultiplier × (1.2 if mat is selected)


	•	Pricing is validated server-side to prevent manipulation

Shopping Cart
	•	Add framed posters to cart
	•	View cart contents and total price
	•	Update quantity, remove items, or empty cart
	•	Cart state is fetched from the backend API

Internationalization
	•	Supports English, Norwegian, and Swedish
	•	Language-aware API endpoints for animals, frames, and materials


🛠️ Tech Stack
	•	React (with Hooks)
	•	TypeScript
	•	Vite
	•	React Router
	•	REST API integration
	•	CSS-in-JS (inline styles)
	•	Git & GitHub


🚀 Getting Started

Prerequisites
	•	Node.js (v18+ recommended)
	•	npm

Installation

git clone https://github.com/mariamajalloh0507-hue/wilde-frames.git
cd wilde-frames
npm install

Run locally

npm run dev

The app will be available at:

http://localhost:5173


📁 Project Structure 

src/
 ├─ api/              # API helper functions
 ├─ pages/            # Gallery, Animal Detail, Cart pages
 ├─ components/       # Reusable UI components
 ├─ App.tsx           # Routes and layout
 └─ main.tsx          # Entry point

public/
 └─ animal-images/    # Static animal images (.webp)


♿ Accessibility Considerations
	•	Semantic HTML elements
	•	Alt text for images
	•	Clear button labels
	•	Keyboard-friendly form controls

⚠️ Known Limitations
	•	Frame preview is a simplified visual representation
	•	No user authentication (anonymous shopping only)
	•	Currency conversion is not fully implemented
	•	Limited automated test coverage


🔮 Possible Improvements
	•	Enhanced frame visualization using exact dimensions
	•	Improved accessibility (ARIA attributes, focus states)
	•	Search functionality in the gallery
	•	Persistent cart using local storage or sessions
	•	More comprehensive test coverage


🧠 Reflection

This project demonstrates practical use of React, TypeScript, and REST APIs in a real-world e-commerce scenario.
Key learning outcomes include managing asynchronous data, applying business logic to UI decisions, and iterating through refactoring and debugging to achieve a stable, maintainable solution.


👤 Author

Mariama Jalloh
PRO2001 – Interactive Frontend
Oslo Nye Fagsskole



