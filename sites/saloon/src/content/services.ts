export type Service = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
};

export const services: Service[] = [
  {
    id: "manichiura",
    title: "Manichiură",
    subtitle: "Clasică & semipermanentă",
    description:
      "Manichiură îngrijită cu lac semipermanent rezistent până la 3 săptămâni.",
    price: "de la 80 lei",
  },
  {
    id: "unghii-gel",
    title: "Unghii cu gel",
    subtitle: "Construcție & gel",
    description:
      "Construcție pe tipsuri sau șablon, pentru unghii rezistente și un aspect impecabil.",
    price: "de la 150 lei",
  },
  {
    id: "nail-art",
    title: "Nail Art",
    subtitle: "Design-uri personalizate",
    description:
      "French, babyboomer, ombre, pictură manuală: design-uri unice, adaptate stilului tău.",
    price: "de la 20 lei / unghie",
  },
];
