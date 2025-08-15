import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add meta tags for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Fukimori High - An AI-powered Japanese high school visual novel with dynamic storytelling, character generation, and immersive gameplay';
document.head.appendChild(metaDescription);

// Add Open Graph tags
const ogTitle = document.createElement('meta');
ogTitle.setAttribute('property', 'og:title');
ogTitle.setAttribute('content', 'Fukimori High - Interactive Visual Novel');
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.setAttribute('property', 'og:description');
ogDescription.setAttribute('content', 'Experience life as a student at Fukimori High School in this AI-powered visual novel. Build relationships, attend classes, and shape your own story.');
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.setAttribute('property', 'og:type');
ogType.setAttribute('content', 'website');
document.head.appendChild(ogType);

// Set title
document.title = 'Fukimori High - Visual Novel';

createRoot(document.getElementById("root")!).render(<App />);
