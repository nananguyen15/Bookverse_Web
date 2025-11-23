import { useState, useEffect } from "react";
import { usersApi } from "../../api";
import { transformImageUrl, FALLBACK_IMAGES } from "../../utils/imageHelpers";
import type { User } from "../../types";

export function AboutTeam() {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // List of team member usernames to display
  const teamUsernames = [
    "nhantce181298",
    "thinhhtce191706",
    "nhungpttce190544",
    "tuyenntnce190631",
    "datnhce180797",
  ];

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setLoading(true);
        const allUsers = await usersApi.getAll();

        // Filter users by username
        const members = allUsers.filter((user) =>
          teamUsernames.includes(user.username)
        );

        // Sort by the order in teamUsernames array
        const sortedMembers = teamUsernames
          .map((username) => members.find((m) => m.username === username))
          .filter((m): m is User => m !== undefined);

        setTeamMembers(sortedMembers);
      } catch (error) {
        console.error("Failed to load team members:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <section className="px-16 py-24 bg-linear-to-b from-beige-500 to-beige-700">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="mb-4 text-6xl font-bold font-heading text-beige-50">
            Meet The Team
          </h2>
          <p className="mb-12 text-2xl text-beige-200">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-16 py-24 bg-linear-to-b from-beige-500 to-beige-700">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="mb-4 text-6xl font-bold font-heading text-beige-50">
          Meet The Team
        </h2>
        <p className="mb-12 text-2xl text-beige-200">
          We are a group of book lovers and professionals working together to
          bring the best stories to you.
        </p>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {teamMembers.map((member) => (
            <div key={member.username} className="flex flex-col items-center">
              <div className="w-40 h-40 mb-4 overflow-hidden rounded-full bg-beige-700 border-4 border-beige-300">
                <img
                  src={transformImageUrl(member.image) || FALLBACK_IMAGES.user}
                  alt={member.name || member.username}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGES.user;
                  }}
                />
              </div>
              <h3 className="font-semibold text-beige-50">
                {member.name || member.username}
              </h3>
              <p className="text-sm text-beige-200 break-all">
                {member.email}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
