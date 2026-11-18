import { useSelector } from "react-redux";
import PageTitle from "../shared components/PageTitle";

function TermsPage() {
  const terms = useSelector(
    (state) => state.general.settings.terms_and_conditions,
  );

  return (
    <main className="app-container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <PageTitle> الشروط والأحكام </PageTitle>
      <section className="my-2 text-xl text-primary font-extrabold text-center p-5">
        <p dangerouslySetInnerHTML={{ __html: terms }}></p>
      </section>
    </main>
  );
}

export default TermsPage;
