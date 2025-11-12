import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { FaSearch } from "react-icons/fa";
import FormControl from "react-bootstrap/FormControl";
import { IoNotifications, IoCartOutline } from "react-icons/io5";
import "../home/fonts.css";

function BrandBookVerse() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar
      fixed="top"
      expand="md"
      expanded={expanded}
      onToggle={setExpanded}
      style={{
        backgroundColor: "#ede5dd",
        boxShadow: "none",
        marginBottom: 0,
      }}
    >
      <Container fluid style={{ paddingLeft: "100px", paddingRight: "100px" }}>
        {/* Brand */}
        <Navbar.Brand
          href="#home"
          style={{
            fontFamily: "LovelyHome",
            fontSize: "30px",
            color: "#8B6B4C",
            fontWeight: "1000",
          }}
          className="d-flex align-items-center"
        >
          {/* <img
            src={bookLogo}
            width="30"
            height="30"
            className="me-2"
            alt="BookVerse logo"
          /> */}
          BookVerse
        </Navbar.Brand>

        {/* Toggle button for mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {/* Navigation Links */}
          <Nav className="me-auto">
            <Nav.Link href="#books" className="mx-3 nav-link-custom">
              Books
            </Nav.Link>
            <Nav.Link href="#series" className="mx-3 nav-link-custom">
              Series
            </Nav.Link>
            <NavDropdown
              title="Categories"
              id="navbarScrollingDropdown"
              className="mx-3 nav-dropdown-custom"
            >
              <NavDropdown.Item href="#action1">Action 1</NavDropdown.Item>
              <NavDropdown.Item href="#action2">Action 2</NavDropdown.Item>
              <NavDropdown.Item href="#action3">Action 3</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          {/* Right side controls */}
          <div className="d-flex align-items-center gap-3">
            {/* Search - Hidden on small screens, shown as icon only on medium */}
            <div
              className="position-relative d-none d-md-block"
              style={{ width: "280px" }}
            >
              <FormControl
                type="search"
                placeholder="Search book..."
                aria-label="Search"
                className="search-input"
                style={{
                  height: "38px",
                  width: "280px",
                  border: "none",
                  borderBottom: "1.5px solid #8B6B4C",
                  borderRadius: "0",
                  backgroundColor: "transparent",
                  paddingRight: "40px",
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "#8B6B4C")}
                // onBlur={(e) => (e.target.style.borderBottomColor = "#ddd")}
              />
              <FaSearch
                className="position-absolute"
                style={{
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#8B6B4C",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Search icon only for small/medium screens */}
            <button
              className="btn d-md-none p-2"
              style={{
                border: "1px solid #8B6B4C",
                color: "#8B6B4C",
                backgroundColor: "transparent",
                height: "38px",
                width: "38px",
                borderRadius: "6px",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#8B6B4C";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#8B6B4C";
              }}
            >
              <FaSearch size={16} />
            </button>

            {/* Notification Icon */}
            <button
              className="btn p-0"
              style={{
                border: "none",
                color: "#8B6B4C",
                height: "38px",
                width: "38px",
                borderRadius: "6px",
              }}
            >
              <IoNotifications size={24} />
            </button>

            {/* Cart Icon */}
            <button
              className="btn p-0"
              style={{
                border: "none",
                color: "#8B6B4C",
                height: "38px",
                width: "38px",
                borderRadius: "6px",
              }}
            >
              <IoCartOutline size={24} />
            </button>

            {/* Sign up Button */}
            <button
              className="btn"
              style={{
                height: "38px",
                minWidth: "80px",
                border: "1px solid #8B6B4C",
                color: "#8B6B4C",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              Sign up
            </button>

            {/* Login Button */}
            <button
              className="btn"
              style={{
                height: "38px",
                minWidth: "80px",
                backgroundColor: "#8B6B4C",
                color: "white",
                border: "1px solid #8B6B4C",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              Login
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
      <style jsx>{`
        .nav-link-custom {
          color: #333 !important;
          font-weight: 500 !important;
          text-decoration: none !important;
          position: relative !important;
          transition: all 0.3s ease !important;
        }

        .nav-link-custom:hover {
          color: #8b6b4c !important;
        }

        .nav-link-custom:hover::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #8b6b4c;
          animation: underlineSlide 0.3s ease-in-out;
        }

        .nav-dropdown-custom {
          position: relative; /* cần cho underline position absolute */
          display: inline-block;
        }

        .nav-dropdown-custom .dropdown-toggle {
          color: #333 !important;
          font-weight: 500 !important;
          text-decoration: none !important;
          position: relative !important;
          transition: all 0.3s ease !important;
          z-index: 2; /* đảm bảo caret và text luôn trên underline */
        }

        .nav-dropdown-custom .dropdown-toggle:hover {
          color: #8b6b4c !important;
        }

        /* underline được vẽ bởi wrapper (không ghi đè ::after của bootstrap) */
        .nav-dropdown-custom::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          height: 2px; /* bề dày bằng với Books/Series */
          width: 0;
          background-color: #8b6b4c;
          transition: width 0.3s ease;
          transform-origin: left;
          pointer-events: none;
        }

        /* khi hover toàn bộ wrapper thì mở underline */
        .nav-dropdown-custom:hover::after {
          width: 100%;
        }

        /* khi dropdown được mở (.show) ẩn underline */
        .nav-dropdown-custom.show::after {
          width: 0;
        }

        @keyframes underlineSlide {
          from {
            width: 0;
            left: 50%;
          }
          to {
            width: 100%;
            left: 0;
          }
        }

        .search-input:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        .dropdown-menu {
          border-color: #8b6b4c;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
          color: #8b6b4c;
        }
      `}</style>
    </Navbar>
  );
}

export default BrandBookVerse;
