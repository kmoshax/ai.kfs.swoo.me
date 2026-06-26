export const DEFAULT_CREDIT_HOURS = 3;

export const CREDIT_HOURS: Record<string, number> = {
  "mathematics 0": 0,
  "computer fundamentals": 3,
  "introduction to linear algebra": 3,
  "english language": 2,
  "electric circuits": 3,
  "structured programming": 3,
  "mathematics 1": 2,
  "probability statistics 1": 2,
  "concepts in artificial intelligence": 2,
  "introduction to programming with python": 3,
  "probability statistics 2": 2,
  "scientific thinking": 3,
  "societal issues": 3,
  "logic design": 2,
  "numerical analysis": 3,
  "discrete mathematics": 3,
  "introduction to machine learning": 3,
  "introduction to computer vision and robotics": 2,
  "object oriented programming": 3,
  "computer architecture": 3,
  "computer networks": 2,
  "scientific writing": 3,
  bioinformatics: 2,
  "information retrieval and web search": 2,
  databases: 3,
  "fundamentals of computational intelligence": 2,
  "introduction to data structures": 2,
  "introduction to natural language processing": 2,
  "operating systems": 2,
  "introduction to multi agent systems design": 2,
  "computer security": 2,
  "fundamentals of computer graphics": 2,
  "fundamental science of nanotechnology": 2,
  "computational vision": 3,
  "fundamentals of deep learning": 3,
  "parallel and distributed computing": 3,
  "introduction to algorithms": 3,
  "software development for mobile devices": 3,
  "signal processing": 3,
  "data analysis": 3,
  "fundamentals of cognitive interaction with robots": 3,
  "marketing and presentation skills": 3,
  "data mining and big data analysis": 3,
  "cloud computing": 3,
  "software design patterns": 3,
  "mixed and augmented reality": 3,
  "knowledge representation": 3,
  "internet of things": 3,
  "system design for artificial intelligence": 2,
  "intelligent decision support systems": 2,
  "artificial vision and pattern recognition": 2,
  "cognitive psychology": 2,
  "intelligent system project a": 3,
  "geographical information systems": 2,
  "the computing technology inside your smartphone": 2,
  "reasoning and agents": 2,
  "intelligent system project b": 3,
  "professional practice in artificial systems": 3,
  "software testing": 3,
  "genetic algorithms": 3,
  "deep learning for self driving cars": 2,
  "fundamentals of ai in smart cities": 2,
  "nanotechnology and artificial intelligence": 2,
};

export function normalizeCourse(name: string): string {
  return name
    .replace(/&amp;/g, "&")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function creditHoursFor(name: string): {
  hours: number;
  known: boolean;
} {
  const key = normalizeCourse(name);
  if (key in CREDIT_HOURS) return { hours: CREDIT_HOURS[key], known: true };
  return { hours: DEFAULT_CREDIT_HOURS, known: false };
}
