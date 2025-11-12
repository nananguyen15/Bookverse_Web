export function SignIn() {
  return (
    <div className="bg-beige-100">
      <div className="m-32">
        <div className="grid-cols-2">
          <form action="">
            <label>
              Email:
              <input type="email" name="email" />
            </label>
            <label>
              Password:
              <input type="password" name="password" />
            </label>
            <button type="submit">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}
