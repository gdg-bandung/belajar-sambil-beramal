import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Objectives from "@/components/Objectives";
import EventDetails from "@/components/EventDetails";
import EventRecap from "@/components/EventRecap";
import UpcomingEvents from "@/components/UpcomingEvents";
import Donation from "@/components/Donation";
import CallForSpeaker from "@/components/CallForSpeaker";
import Footer from "@/components/Footer";
import { submissionService } from "@/server/submission-service.server";
import { useLoaderData } from "react-router";
import { donationService } from "@/server/donation-service.server";

export const loader = async () => {
  const [approvedSubmissionsResp, donationResp] = await Promise.allSettled([
    submissionService.getApprovedSubmissions(),
    donationService.getDonation()
  ]);

  const approvedSubmissions = approvedSubmissionsResp.status === "fulfilled" ? approvedSubmissionsResp.value : [];
  const donation = donationResp.status === "fulfilled" ? donationResp.value : 0;

  const serializedEvents = approvedSubmissions.map(sub => {
    const timeParts = sub.eventTime?.split(":") || ["00", "00"];
    const startHour = parseInt(timeParts[0]);
    const startMinute = timeParts[1] || "00";
    const endHour = startHour + 1;

    const startTimeFormatted = `${startHour.toString().padStart(2, '0')}:${startMinute}`;
    const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${startMinute}`;
    const timeDisplay = `${startTimeFormatted} - ${endTimeFormatted} WIB`;

    return {
      id: sub.id,
      topicTitle: sub.topicTitle,
      description: sub.description || "",
      date: sub.eventDate ? new Date(sub.eventDate).toISOString() : "",
      time: timeDisplay,
      fullName: sub.fullName,
      institution: sub.institution || "",
      topicCategory: sub.topicCategory || "",
      status: sub.status,
      photo: sub.photo || undefined,
      role: sub.role || "Speaker"
    };
  });

  return { events: serializedEvents, donation };
}

export default function Index() {
  const { events, donation } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero donation={donation} />
      <About />
      <Objectives />
      <EventDetails />
      <EventRecap />
      <UpcomingEvents events={events} />
      <CallForSpeaker />
      <Donation />
      <Footer />
    </div>
  );
}