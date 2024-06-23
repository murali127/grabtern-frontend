import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import EventLogin from "../../components/eventLogin/EventLogin";
import Visibillity from "../../public/assets/Visibillity";
import VisibillityOff from "../../public/assets/VisibillityOff";
import Header from "../../components/layout/Header";
import styles from "../../styles/userRegistration.module.css";
import jwt_decode from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import Button from "../../components/UI/Button/Button";
import Loader from "../../components/UI/Loader";

function useRedirectIfAuthenticated() {
  const router = useRouter();
  const {
    isMentorLoggedIn,
    setIsMentorLoggedIn,
    isUserLoggedIn,
    setIsUserLoggedIn,
  } = useAuth();

  useEffect(() => {
    const handleCallBackResponse = async (response) => {
      if (isMentorLoggedIn || isUserLoggedIn) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectURL = urlParams.get("redirectURL");
        router.replace(redirectURL || "/");
      }

      const userObject = jwt_decode(response.credential);
      const userData = {
        user_name: userObject.name,
        user_image: userObject.picture,
        user_email: userObject.email,
      };

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/gsignup`;
      try {
        const res = await axios.post(url, {
          userData,
        });

        localStorage.setItem("userData", JSON.stringify(userData));
        setIsUserLoggedIn(true);
        const redirectUrl = new URLSearchParams(window.location.search).get(
          "redirectUrl",
        );
        setTimeout(() => {
          router.push(redirectUrl || "/");
        }, 2000);
      } catch (error) {
        if (error.response && error.response.status >= 400) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to sign up. Please try again later.");
        }
        if (error.response && error.response.status === 202) {
          toast.warning(
            "Registration successful, but there was an issue sending the verification email. Please contact support.",
          );
        }
      }
    };

    const initGoogleSignUp = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCallBackResponse,
          context: "signup",
        });
        window.google.accounts.id.renderButton(
          document.getElementById("signUpDiv"),
          {
            theme: "outline",
            size: "large",
            text: "signup_with",
            shape: "pill",
            "data-use_fedcm_for_prompt": "true",
          },
        );
        window.google.accounts.id.prompt();
      }
    };

    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogleSignUp;
      script.onerror = () => {
        toast.error("Failed to load Google sign-up script.");
        console.error("Failed to load Google sign-up script.");
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    };

    loadGoogleScript();
  }, [router, isMentorLoggedIn, isUserLoggedIn, setIsUserLoggedIn]);
}

function Register() {
  useRedirectIfAuthenticated();

  const router = useRouter();
  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isValidValues, setIsValidValues] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConPasswordVisible, setIsConPasswordVisible] = useState(false);
  const [loader, setLoader] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  const toggleConPasswordVisibility = () => {
    setIsConPasswordVisible((prevState) => !prevState);
  };

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  useEffect(() => {
    if (data.fullName && data.email && data.password && data.confirmPassword) {
      setIsValidValues(true);
    } else {
      setIsValidValues(false);
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !data.fullName ||
      !data.email ||
      !data.password ||
      !data.confirmPassword
    ) {
      return toast.error("Please fill all the fields!");
    }

    if (data.password !== data.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      setLoader(true);
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/userRegister`;
      await axios.post(url, data);
      setLoader(false);
      toast.success(
        "Registration successful! An email has been sent to your email address. Please check your inbox to verify your account.",
      );
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (error) {
      setLoader(false);
      if (error.response && error.response.status >= 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          "An error occurred during registration. Please try again later.",
        );
      }
      if (error.response && error.response.status === 202) {
        toast.warning(
          "Registration successful, but there was an issue sending the verification email. Please contact support.",
        );
      }
    }
  };

  return (
    <>
      <Header navbarBackground={true} />
      <div className={styles.Registerform}>
        <form className="form-default" onSubmit={handleSubmit}>
          <div className={styles.heading}>
            <img
              src="/Grabtern2.png"
              className="small-image dark:tw-invert"
            ></img>
            <h2>Hey, hello 👋</h2>
          </div>
          <div className={styles.forminput}>
            <label htmlFor="name">Full name</label>
            <div className={styles.Input}>
              <input
                type="text"
                name="fullName"
                required
                placeholder="Full name"
                onChange={handleChange}
                value={data.fullName}
              />
            </div>
          </div>

          <div className={styles.forminput}>
            <label htmlFor="email">Email</label>
            <div className={styles.Input}>
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                onChange={handleChange}
                value={data.email}
              />
            </div>
          </div>

          <div className={styles.forminput}>
            <label htmlFor="password">Password</label>
            <div className={styles.Input}>
              <input
                type={isPasswordVisible ? "text" : "password"}
                name="password"
                required
                placeholder="Password"
                onChange={handleChange}
                value={data.password}
                className="tw-px-2 tw-border-b-[1px] tw-border-b-black tw-py-3 tw-pr-16"
              />
              <div
                className="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-px-4 tw-text-gray-600 tw-top-10"
                onClick={togglePasswordVisibility}
              >
                {isPasswordVisible ? <Visibillity /> : <VisibillityOff />}
              </div>
            </div>
          </div>

          <div className={styles.forminput}>
            <label htmlFor="password">Confirm Password</label>
            <div className={styles.Input}>
              <input
                type={isConPasswordVisible ? "text" : "password"}
                name="confirmPassword"
                required
                placeholder="Password"
                onChange={handleChange}
                value={data.confirmPassword}
                className="tw-px-2 tw-border-b-[1px] tw-border-b-black tw-py-3 tw-pr-16"
              />
              <div
                className="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-px-4 tw-text-gray-600 tw-top-10"
                onClick={toggleConPasswordVisibility}
              >
                {isConPasswordVisible ? <Visibillity /> : <VisibillityOff />}
              </div>
            </div>
          </div>
          <ToastContainer />
          <div>
            <ToastContainer />
            <div>
              {!loader ? (
                <div className="tw-flex tw-justify-center tw-h-11">
                  <Button
                    className="tw-w-[400px] tw-font-semibold"
                    onClick={handleSubmit}
                    text="Register"
                  />
                </div>
              ) : (
                <Loader />
              )}
            </div>
          </div>
          <div className={styles.linkdiv}>
            Already have an account?
            <Link
              href="/auth/login?entityType=user"
              className="tw-ml-0 md:tw-ml-2 tw-mt-[1px] hover:tw-text-gray-400 tw-text-blue-700"
              style={{ textDecoration: "none" }}
            >
              Login
            </Link>
          </div>
          <div className={styles.google}>
            <h3 style={{ color: "var(--base-500)", alignSelf: "center" }}>
              Or
            </h3>
          </div>
          <div
            id="signUpDiv"
            style={{ alignSelf: "center" }}
            className={styles.googlelogin}
          ></div>
        </form>
      </div>
    </>
  );
}

export default Register;
