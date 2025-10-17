
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white shadow-inner mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-500">
          &copy; {currentYear} QuickBill. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;