import { img } from "./images";

export type GalleryImage = {
  src: string;
  alt: string;
};

export const gallery: GalleryImage[] = [
  { src: img("gallery-01"), alt: "Manichiură semipermanentă nude" },
  { src: img("gallery-02"), alt: "Unghii cu gel french clasic" },
  { src: img("gallery-03"), alt: "Nail art floral pe fundal blush" },
  { src: img("gallery-04"), alt: "Babyboomer cu accent gold" },
  { src: img("gallery-05"), alt: "Ombre roz pal cu sclipici" },
  { src: img("gallery-06"), alt: "Manichiură roșie clasică" },
];
