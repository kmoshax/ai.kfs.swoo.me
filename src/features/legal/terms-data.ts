export const TERMS_UPDATED = "June 2026";

export const TERMS: { heading: string; body: string }[] = [
  {
    heading: "What this is",
    body: "An unofficial, community-built tool that retrieves a Kafr El-Sheikh Faculty of Artificial Intelligence student's published result and computes an estimated GPA. It is not affiliated with, operated by, or endorsed by the university. Official results are issued only by the faculty's student affairs.",
  },
  {
    heading: "Authorized use and consent",
    body: "Only look up a national ID that is your own, or one whose owner has given you explicit permission. Accessing another person's result without their consent may breach their privacy and applicable law. You are solely responsible for how you use this tool.",
  },
  {
    heading: "Effect on the university system",
    body: "The university limits how many times each student's result may be viewed. The first lookup of a student here consumes one of those official view attempts; afterwards the result is cached and the university system is not contacted again for that student. If a student's attempts are already used up, the lookup may fail.",
  },
  {
    heading: "Data we handle",
    body: "To fetch a result, the national ID is submitted to the university system, which returns the student's name, code, login credential, and university email. That record and the computed result are stored on our server so repeat lookups are served from cache rather than re-querying the university. No data is sold or shared with third parties.",
  },
  {
    heading: "Accuracy",
    body: "GPA, credit hours, and standing are computed from the published 2024 bylaw and are unofficial estimates. Some elective and credit-hour values may be approximate and can differ from your official record. Always confirm figures with the faculty.",
  },
  {
    heading: "No warranty",
    body: "The service is provided “as is”, without any warranty of accuracy, availability, or fitness for a purpose. You use it at your own risk, and we are not liable for any loss arising from its use.",
  },
  {
    heading: "Open source",
    body: "This project is open source and licensed under AGPL-3.0-or-later.",
  },
  {
    heading: "Changes",
    body: "These terms may be updated over time. Continued use of the tool means you accept the current version.",
  },
];
