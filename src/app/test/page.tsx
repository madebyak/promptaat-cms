export default function TestPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black  mb-4">
          Test Page
        </h1>
        <p className="text-lg text-black  mb-8">
          This is a test page to verify the layout works correctly
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-gray-200  rounded-lg">
          <h3 className="text-lg font-semibold text-black  mb-2">
            Test Card 1
          </h3>
          <p className="text-gray-600 ">
            This card should display properly without any black background issues.
          </p>
        </div>
        
        <div className="p-6 border border-gray-200  rounded-lg">
          <h3 className="text-lg font-semibold text-black  mb-2">
            Test Card 2
          </h3>
          <p className="text-gray-600 ">
            The background should be white in light mode and black in dark mode, matching the home page.
          </p>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100  rounded-lg">
        <p className="text-sm text-gray-600 ">
          If you can see this content clearly without any black overlay, the fix is working!
        </p>
      </div>
    </div>
  );
}