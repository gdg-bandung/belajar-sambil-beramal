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
  const [approvedSubmissionsResp, donationResp, gdgEventsResp] = await Promise.allSettled([
    submissionService.getApprovedSubmissions(),
    donationService.getDonation(),
    fetch("https://gdg.community.dev/api/event_slim/for_chapter/710/?page_size=6&status=Live&include_cohosted_events=true&visible_on_parent_chapter_only=true&order=start_date&fields=title,start_date,event_type_title,cropped_picture_url,cropped_banner_url,url,cohost_registration_url,description,description_short")
      .then(res => res.json())
      .catch(error => {
        console.error("Failed to fetch GDG events:", error);
        return { results: [] };
      })
  ]);

  const approvedSubmissions = approvedSubmissionsResp.status === "fulfilled" ? approvedSubmissionsResp.value : [];
  const donation = donationResp.status === "fulfilled" ? donationResp.value : 0;
  const gdgEventsData = gdgEventsResp.status === "fulfilled" ? gdgEventsResp.value : { results: [] };

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
      role: sub.role || "Speaker",
      source: "submission"
    };
  });

  const transformedGdgEvents = gdgEventsData.results.map((gdgEvent: any) => {
    const eventDate = new Date(gdgEvent.start_date);
    const timeDisplay = `${eventDate.getHours().toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')} WIB`;

    return {
      id: gdgEvent.url, // Using URL as a unique ID
      topicTitle: gdgEvent.title,
      description: gdgEvent.description_short || gdgEvent.description || "",
      date: eventDate.toISOString(),
      time: timeDisplay,
      fullName: "GDG Indonesia", // Placeholder
      institution: "GDG Indonesia", // Placeholder
      role: "Organizer", // Placeholder
      topicCategory: gdgEvent.event_type_title || "Komunitas",
      status: "", // Will be derived by UpcomingEvents component
      photo: gdgEvent.cropped_picture_url || gdgEvent.cropped_banner_url || undefined,
      source: "gdg"
    };
  });

  const allEvents = [...serializedEvents, ...transformedGdgEvents].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return { events: allEvents, donation };
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