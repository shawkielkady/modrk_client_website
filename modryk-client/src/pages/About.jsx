import { useSelector } from "react-redux";
import PageTitle from "../shared components/PageTitle";

function About() {
  const abpit = useSelector((state) => state.general.settings.about_us);
  return (
    <main className="app-container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <PageTitle> عن الشركة </PageTitle>
      <section className="my-2 text-xl text-primary font-extrabold text-center p-5">
        <p dangerouslySetInnerHTML={{ __html: abpit }}></p>
      </section>
    </main>
  );
}

export default About;
