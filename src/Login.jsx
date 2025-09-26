import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './contexts/LanguageContext';
import { LibraryContext } from './LibraryContext';
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useLanguage();
  const { setUser, clearUser } = useContext(LibraryContext);

  const toggleForm = () => {
    setIsSignup(!isSignup);
    document.getElementById("dummy").innerText = "";
    clearBorders();
  };

  const releaseMusicIcons = (musicIconId, count = 1) => {
    const musicIcon = document.getElementById(musicIconId);
    if (!musicIcon) return;

    for (let i = 0; i < count; i++) {
      const icon = musicIcon.cloneNode(true);
      icon.classList.add("music-clone");
      icon.style.left = `${Math.random() * 100}%`;
      musicIcon.parentElement.appendChild(icon);
      setTimeout(() => icon.remove(), 1000);
    }
  };

  const clearBorders = () => {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => input.classList.remove("error"));
  };

  const userRegistration = () => {
    const fullName = document.getElementById("signup-username");
    const email = document.getElementById("signup-user-email");
    const password = document.getElementById("signup-password");
    const confirmPassword = document.getElementById("confirm-signup-password");
    const dummy = document.getElementById("dummy");

    dummy.style.color = "red";
    clearBorders();

    if (
      fullName.value === "" ||
      email.value === "" ||
      password.value === "" ||
      confirmPassword.value === ""
    ) {
      dummy.innerText = "Please fill out all fields.";

      if (fullName.value === "") {
        fullName.focus();
        fullName.classList.add("error");
      } else if (email.value === "") {
        email.focus();
        email.classList.add("error");
      } else if (password.value === "") {
        password.focus();
        password.classList.add("error");
      } else if (confirmPassword.value === "") {
        confirmPassword.focus();
        confirmPassword.classList.add("error");
      }

      return;
    }

    if (password.value !== confirmPassword.value) {
      dummy.innerText = "Passwords do not match!";
      password.focus();
      password.classList.add("error");
      confirmPassword.classList.add("error");
      return;
    }

    const data = JSON.stringify({
      fullname: fullName.value,
      email: email.value,
      password: password.value,
    });

    fetch("http://localhost:8080/users/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    })
      .then((response) => response.text())
      .then((res) => {
        if (res === "User registered successfully") {
          dummy.style.color = "green";
          dummy.innerText = "Registration successful! Please login.";
          setTimeout(() => {
            setIsSignup(false);
            clearBorders();
            dummy.innerText = "";
          }, 2000);
        } else {
          dummy.innerText = res;
        }
      })
      .catch((error) => {
        dummy.innerText = "An error occurred. Please try again.";
        console.error("Error:", error);
      });
  };

  const logout = () => {
    clearUser();
    document.cookie = 'csrid=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.replace('/login');
  };

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      setUser(userEmail);
    }
  }, [setUser]);

  const signIn = () => {
    const username = document.getElementById("logininput");
    const password = document.getElementById("loginPass");
    const dummy = document.getElementById("dummy");

    dummy.style.color = "red";
    clearBorders();

    if (username.value === "" || password.value === "") {
      dummy.innerText = "Please enter both email and password.";

      if (username.value === "") {
        username.focus();
        username.classList.add("error");
      } else {
        password.focus();
        password.classList.add("error");
      }

      return;
    }

    const data = JSON.stringify({
      email: username.value,
      password: password.value,
    });

    fetch("http://localhost:8080/users/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    })
      .then((response) => response.text())
      .then((res) => {
        const resdata = res.split("::");
        if (resdata[0] === "200") {
          fetch(`http://localhost:8080/users/details/${username.value}`)
            .then(response => response.json())
            .then(userData => {
              document.cookie = `csrid=${resdata[1]}; path=/; max-age=86400`;
              localStorage.setItem("userEmail", username.value);
              localStorage.setItem("username", userData.fullname || username.value.split('@')[0]);
              
              setUser(username.value);
              
              window.location.replace("/music");
            })
            .catch(error => {
              console.error("Error fetching user details:", error);
              document.cookie = `csrid=${resdata[1]}; path=/; max-age=86400`;
              localStorage.setItem("userEmail", username.value);
              localStorage.setItem("username", username.value.split('@')[0]);
              
              setUser(username.value);
              
              window.location.replace("/");
            });
        } else {
          dummy.innerText = resdata[1];
        }
      })
      .catch((error) => {
        dummy.innerText = "An error occurred during login.";
        console.error("Error:", error);
      });
  };

  const handleInputChange = (e) => {
    if (e.target.value !== "") {
      e.target.classList.remove("error");
    }
  };

  useEffect(() => {
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) =>
      input.addEventListener("input", handleInputChange)
    );

    return () => {
      inputs.forEach((input) =>
        input.removeEventListener("input", handleInputChange)
      );
    };
  }, [isSignup]);

  const validateForm = () => {
    if (!email || !password) {
      setError(t('login.errorRequiredFields'));
      return false;
    }
    if (!isSignup && password !== confirmPassword) {
      setError(t('login.errorPasswordMatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      const endpoint = isSignup ? 'register' : 'login';
      const response = await fetch(`http://localhost:8080/users/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
        credentials: 'include',
      });

      const data = await response.text();

      if (response.ok) {
        if (isSignup) {
          setSuccess(t('login.successRegister'));
          setIsSignup(true);
          setUsername('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        } else {
          const [status, sessionId, userData] = data.split('::');
          if (status === '200') {
            localStorage.setItem('username', userData);
            localStorage.setItem('email', email);
            navigate('/');
          }
        }
      } else {
        setError(data || t('login.errorGeneric'));
      }
    } catch (err) {
      setError(t('login.errorServer'));
    }
  };

  return (
    <div className="app-container">
      <video autoPlay muted loop id="video-background">
        <source src="your-video.mp4" type="video/mp4" />
      </video>
      <div id="video-overlay"></div>
      <h1>Vibe Guru</h1>
      <div className="container">
        <div id="music-icon" onClick={() => releaseMusicIcons("music-icon", 3)}>
          &#9836;
        </div>
        <h2>{isSignup ? "Sign Up" : "Login"}</h2>
        {isSignup ? (
          <SignupForm releaseMusicIcons={releaseMusicIcons} userRegistration={userRegistration} />
        ) : (
          <LoginForm releaseMusicIcons={releaseMusicIcons} signIn={signIn} />
        )}
        <a
          href="#"
          className="signup-link"
          onClick={(e) => {
            e.preventDefault();
            toggleForm();
          }}
        >
          {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </a>
        <div id="dummy" style={{ marginTop: "10px" }}></div>
      </div>
    </div>
  );
};

const LoginForm = ({ releaseMusicIcons, signIn }) => {
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address (e.g., abc@gmail.com)');
    } else {
      setEmailError('');
    }
    releaseMusicIcons("music-icon", 2);
  };

  return (
    <div className="form-content">
      <div className="input-group">
        <input 
          type="text" 
          id="logininput" 
          placeholder=" " 
          required 
          onFocus={() => releaseMusicIcons("music-icon", 2)}
          onChange={handleEmailChange}
        />
        <label htmlFor="logininput">Email</label>
        {emailError && <span className="error-message">{emailError}</span>}
      </div>
      <div className="input-group">
        <input type="password" id="loginPass" placeholder=" " required onFocus={() => releaseMusicIcons("music-icon", 2)} />
        <label htmlFor="loginPass">Password</label>
      </div>
      <button 
        type="submit" 
        onClick={() => { 
          const email = document.getElementById("logininput").value;
          if (!emailError && validateEmail(email)) {
            releaseMusicIcons("music-icon", 10); 
            signIn();
          } else {
            setEmailError('Please enter a valid email address (e.g., abc@gmail.com)');
          }
        }}
      >
        Login
      </button>
    </div>
  );
};

const SignupForm = ({ releaseMusicIcons, userRegistration }) => {
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address (e.g., abc@gmail.com)');
    } else {
      setEmailError('');
    }
    releaseMusicIcons("music-icon", 2);
  };

  return (
    <div className="form-content">
      <div className="input-group">
        <input type="text" id="signup-username" placeholder=" " required onFocus={() => releaseMusicIcons("music-icon", 2)} />
        <label htmlFor="signup-username">Username</label>
      </div>
      <div className="input-group">
        <input 
          type="text" 
          id="signup-user-email" 
          placeholder=" " 
          required 
          onFocus={() => releaseMusicIcons("music-icon", 2)}
          onChange={handleEmailChange}
        />
        <label htmlFor="signup-user-email">User Email</label>
        {emailError && <span className="error-message">{emailError}</span>}
      </div>
      <div className="input-group">
        <input type="password" id="signup-password" placeholder=" " required onFocus={() => releaseMusicIcons("music-icon", 2)} />
        <label htmlFor="signup-password">Password</label>
      </div>
      <div className="input-group">
        <input type="password" id="confirm-signup-password" placeholder=" " required onFocus={() => releaseMusicIcons("music-icon", 2)} />
        <label htmlFor="confirm-signup-password">Confirm Password</label>
      </div>
      <button 
        type="submit" 
        onClick={() => { 
          const email = document.getElementById("signup-user-email").value;
          if (!emailError && validateEmail(email)) {
            releaseMusicIcons("music-icon", 10); 
            userRegistration();
          } else {
            setEmailError('Please enter a valid email address (e.g., abc@gmail.com)');
          }
        }}
      >
        Sign Up
      </button>
    </div>
  );
};

export default Login;
