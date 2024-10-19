export const Header = () => {
  return (
    <header className="bg-gray-900 text-white p-4">
      <nav>
        <ul className="flex justify-around">
          <li className="hover:bg-gray-700 p-2 rounded">
            <a href="#chat">Chat</a>
          </li>
          <li className="hover:bg-gray-700 p-2 rounded">
            <a href="#vc">VC</a>
          </li>
          <li className="hover:bg-gray-700 p-2 rounded">
            <a href="#music">Music</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}; 
export default Header;
