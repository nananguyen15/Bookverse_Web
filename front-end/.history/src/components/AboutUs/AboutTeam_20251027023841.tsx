export function AboutTeam() {
  const teamMembers = [
    { name: "Shelby Shashi", role: "Chief Scientific Officer" },
    { name: "Jiang Mai", role: "Chief Finance Officer" },
    { name: "Krisjanis Fabienne", role: "Chief Security Officer" },
    { name: "Danielle Harpreet", role: "Chief Operating Officer" },
    { name: "Carlito Federici", role: "Chief Marketing Officer" },
  ];

  return (
    <section className="px-16 py-24 ">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="mb-4 text-4xl font-bold font-heading text-[var(--color-darkest)]">
          Meet The Team
        </h2>
        <p className="mb-12 text-lg text-[var(--color-mid-dark)]">
          We are a group of book lovers and professionals working together to
          bring the best stories to you.
        </p>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center">
              <div className="w-40 h-40 mb-4 overflow-hidden rounded-full bg-[var(--color-light-mid)]">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`}
                  alt={member.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="font-semibold text-[var(--color-darkest)]">
                {member.name}
              </h3>
              <p className="text-sm text-[var(--color-mid-dark)]">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
