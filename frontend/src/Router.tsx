import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'; // Import Outlet
import { HomePage } from './pages/Home.page';
import { CreateExperience } from './pages/CreateExperience.page';
import { NoDataPullExperienceView } from './pages/NoDataPullExperienceView';
import { ExperienceListPaginated } from './pages/ExperienceListPaginated';
import { LandingPage } from './pages/Landing.page';
import { NavigationBar } from './components/NavigationBar/NavigationBar';
import { FooterSimple } from './components/Footer/FooterSimple';
import { SignIn } from './pages/SignIn.page';
import { SignUp } from './pages/SignUp.page';
import { SingleExperiencePage } from './pages/SingleExperiencePage';
import { AccountSettings } from './pages/AccountSettings';
import { AccountSettingsHost } from './pages/AccountSettingsHost';
import { ViewHostProfile } from './pages/ViewHostProfile';
import { ViewUserProfile } from './pages/VIewUserProfile'; // Fix the casing of the import statement
import { ExperienceRegistration } from './pages/ExperienceRegistration.page';
import { MessagesPage } from './pages/MessagesPage';


// Restructure your createBrowserRouter object to include NavbarWrapper and Outlet
const router = createBrowserRouter([
  {
    path: '/', 
    element: <NavbarWrapper/>, // NavbarWrapper as the element
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/create-experience', element: <CreateExperience /> },
      { path: '/experience-view-example', element: <NoDataPullExperienceView /> },
      { path: '/experience-view-list', element: <ExperienceListPaginated /> },
      { path: '/sign-in', element: <SignIn /> },
      { path: '/sign-up', element: <SignUp /> },
      { path: '/landing', element: <LandingPage /> },
      { path: '/experience/:id', element: <SingleExperiencePage /> },
      { path: '/account-settings', element: <AccountSettings /> },
      { path: '/account-settings-host', element: <AccountSettingsHost /> },
      { path: '/view-host-profile', element: <ViewHostProfile /> },
      { path: '/traveler-experience-registration', element: <ExperienceRegistration />},
      {path: '/view-user-profile', element: <ViewUserProfile/>},
      {path: '/messages', element: <MessagesPage/>}
    ]
  }
]);

// NavbarWrapper component to render NavigationBar and Outlet
function NavbarWrapper() {
  return (
    <div>
      <NavigationBar />
      <Outlet /> {/* Outlet for nested routes */}
      <FooterSimple />
    </div>
  );
}

// Export Router component
export function Router() {
  return (
    <RouterProvider router={router} />
  );
}


