import React from "react";
import "../../styles/ownerExplore.css";

const mockListings = [
  {
    name: "Studio Glow",
    city: "Austin",
    metric: "Top 5 ranking",
    trend: "+12% profile visits",
  },
  {
    name: "Urban Retreat Salon",
    city: "Austin",
    metric: "Featured in Premium map",
    trend: "+8% bookings",
  },
  {
    name: "Luxe Luxe",
    city: "Dallas",
    metric: "Trending in city",
    trend: "+20% engagement",
  },
];

const ExploreOwner = () => (
  <section className="owner-explore">
    <header className="owner-explore__header">
      <div>
        <p className="eyebrow">Owner Explore</p>
        <h1>Marketplace insights</h1>
      </div>
      <p className="owner-explore__hint">
        See how your salon ranking compares to trending businesses in nearby cities.
      </p>
    </header>
    <div className="owner-explore__grid">
      {mockListings.map((listing) => (
        <article key={listing.name} className="owner-explore__card">
          <h3>{listing.name}</h3>
          <p className="owner-explore__city">{listing.city}</p>
          <p className="owner-explore__metric">{listing.metric}</p>
          <p className="owner-explore__trend">{listing.trend}</p>
        </article>
      ))}
    </div>
  </section>
);

export default ExploreOwner;
