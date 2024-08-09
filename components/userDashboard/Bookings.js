import axios from "axios";
import { set } from "js-cookie";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import TabsWithTable from "../../components/basic/TabsWithTable";
import Loader from "../../components/UI/Loader";

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("Pending");

  const tabs = ["Pending", "Completed"];
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);

  const fetchSession = async () => {
    try {
      setError("");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard/get/bookings`,
        {
          withCredentials: true,
        },
      );
      setSessions(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const formatDate = (isoDate) => {
    if (!isoDate) return "...";
    const date = new Date(isoDate);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const filterFunction = (session, activeTab) => {
    return (
      (activeTab.toLowerCase() === "pending" && session.isbooked) ||
      (activeTab.toLowerCase() === "completed" && !session.isbooked)
    );
  };

  const sessionData = sessions.map((session) => [
    session.sessionName,
    session.mentorName,
    session.sessionDate,
    session.sessionTime,
  ]);

  return (
    <div className="tw-p-3 md:tw-p-8 tw-w-full">
      <h1 className="tw-text-2xl sm:tw-text-3xl lg:tw-text-4xl tw-font-semibold tw-mb-4 lg:tw-mb-8">
        Your sessions
      </h1>

      <div className="tw-flex tw-items-center tw-gap-4 tw-mb-8">
        <p className="tw-text-base-500 tw-font-semibold">Find mentors</p>
        <Link href="/mentorList">
          {!loader ? (
            <button
              onClick={() => setLoader(true)}
              className="tw-bg-primary-100 tw-text-white tw-p-2 tw-rounded-md tw-font-semibold hover:tw-bg-primary-200 tw-duration-150 tw-ease-in-out"
            >
              here
            </button>
          ) : (
            <Loader width="25px" />
          )}
        </Link>
      </div>

      {
        <TabsWithTable
          tabs={tabs}
          headers={["Topic", "Mentor", "Date", "Time"]}
          data={sessionData}
          filterFunction={filterFunction}
          formatDate={formatDate}
        />
      }

      {error && (
        <p className="tw-text-red-500 tw-text-center tw-mt-8">{error}</p>
      )}
    </div>
  );
};

export default Bookings;
