export function SignIn() {
  return (
    <div className="w-full bg-beige-100">
      <div className="shadow-2xl m-72 bg-beige-300">
        <div className="grid-cols-2">
          <div className="grid-span-1">
            <h1 className="text-3xl font-bold text-beige-700">Sign in</h1>
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-beige-700"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border rounded-lg border-beige-300 focus:outline-none focus:ring-2 focus:ring-beige-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
          </div>
          <div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
