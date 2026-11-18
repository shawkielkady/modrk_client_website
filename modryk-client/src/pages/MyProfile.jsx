import PageTitle from "../shared components/PageTitle";
import ProfileSection from "../components/profile/ProfileSection";
import { useSelector } from "react-redux";
import { selectAuthUser } from "../data/auth/authSlice";
import { UserStorage } from "../data/auth/authModels";

function MyProfilePage() {
  const reduxUser = useSelector(selectAuthUser);
  const user = reduxUser || UserStorage.get() || {};

  return (
    <main className="app-container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <PageTitle> حسابي </PageTitle>
      <ProfileSection user={user} />
    </main>
  );
}

export default MyProfilePage;
