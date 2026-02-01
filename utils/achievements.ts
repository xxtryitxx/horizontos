/**
 * Achievements & Badges Logic
 */

export const BADGE_REQUIREMENTS = {
  superstar: { points: 100, icon: "⭐" },
  legend: { points: 200, icon: "👑" },
  helper: { points: 50, icon: "🤝" },
  gamer: { games: 5, icon: "🎮" },
  mentor: { mentees: 3, icon: "👨‍🏫" },
  champion: { points: 500, icon: "🏆" },
};

export function getBadgesForUser(userScore: number, userStats?: any): string[] {
  const badges: string[] = [];

  if (userScore >= 500) badges.push("champion");
  if (userScore >= 200) badges.push("legend");
  if (userScore >= 100) badges.push("superstar");
  if (userScore >= 50) badges.push("helper");
  if (userStats?.gamesPlayed >= 5) badges.push("gamer");
  if (userStats?.mentees >= 3) badges.push("mentor");

  return badges;
}

export function getBadgeIcon(badge: string): string {
  return (BADGE_REQUIREMENTS as any)[badge]?.icon || "🏅";
}

export function getBadgeDescription(badge: string): string {
  const descriptions: { [key: string]: string } = {
    superstar: "100+ Punkte erreicht",
    legend: "200+ Punkte erreicht",
    champion: "500+ Punkte erreicht",
    helper: "50+ Punkte erreicht",
    gamer: "5+ Spiele gespielt",
    mentor: "3+ Mentees unterstützt",
  };
  return descriptions[badge] || "Geheimes Badge";
}
