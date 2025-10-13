import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { setToken } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setToken(null);
    }
  };

  return (
    <main>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
          <div className="text-center py-12 border-dashed border-2 border-gray-200 rounded-lg">
            <p className="text-gray-500">
              Editing profile, tax settings, and password will be available here soon.
            </p>
          </div>
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleLogout}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;