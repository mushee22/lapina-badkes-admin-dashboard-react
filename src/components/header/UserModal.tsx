import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/authContext";
import { CloseIcon } from "../../icons";

export default function UserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function handleSignOut() {
    signOut();
    closeModal();
    navigate("/signin");
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Display name (fallback to email or "User")
  const displayName = user?.name || user?.email || "User";
  // Display email (fallback to empty)
  const displayEmail = user?.email || "";
  // Display roles (fallback to "Admin")
  const displayRoles = user?.roles || ["Admin"];

  return (
    <>
      {/* User Button */}
      <button
        onClick={openModal}
        className="flex items-center text-white hover:text-gray-200"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11 bg-white/20 flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {getUserInitials()}
          </span>
        </span>
        <span className="block mr-1 font-medium text-sm">
          {user?.name ? user.name.split(" ")[0] : "User"}
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000] flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Profile
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* User Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-blue-800 dark:text-blue-200 text-xl font-bold">
                  {getUserInitials()}
                </span>
              </div>
            </div>

            {/* User Information */}
            <div className="text-center space-y-3 mb-6">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                {displayName}
              </h4>
              
              {displayEmail && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {displayEmail}
                </p>
              )}
              
              <div className="flex flex-wrap justify-center gap-2">
                {displayRoles.map((role, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
                  fill="currentColor"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}