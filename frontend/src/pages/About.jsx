import React from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-image">
          <img
            src="/assets/images/hero.jpeg"
            alt="Meridian chronograph watch on a dark surface"
            className="hero-bg"
          />
        </div>
        <div className="about-hero-overlay"></div>
        <div className="container about-hero-content">
          <span className="about-eyebrow">THE ETERNAL MENS STORY</span>
          <h1>
            Style That<br />
            Stands The Test Of Time.
          </h1>
          <p>
            Refined essentials for men who believe
            that true style is never temporary.
          </p>
        </div>
      </section>

      <section className="section about-intro">
        <div className="container about-intro-grid">
          <div className="about-intro-heading">
            <span className="about-label">WHO WE ARE</span>
            <h2>
              Built around<br />
              timeless style.
            </h2>
          </div>
          <div className="about-intro-text">
            <p className="about-lead">
              ETERNAL MENS was created with a simple idea:
              great style doesn't need to be loud.
            </p>
            <p>
              We believe the right watch or accessory can
              completely change the way a man carries himself.
              That's why we focus on pieces that balance
              clean design, everyday functionality and
              timeless character.
            </p>
            <p>
              From your first watch to the finishing detail
              of an outfit, ETERNAL MENS is designed to be
              part of the moments that matter.
            </p>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="about-story-image">
          <img src="/assets/images/about.jpeg" alt="Watch worn with refined men's style" loading="lazy" />
        </div>
        <div className="about-story-content">
          <span className="about-label">OUR PHILOSOPHY</span>
          <h2>
            Less noise.<br />
            More character.
          </h2>
          <p>
            Modern men's style is about knowing what to
            leave out. We choose clean silhouettes,
            considered details and versatile pieces that
            work beyond a single season.
          </p>
          <p>
            Every collection is selected with the same
            question in mind:
          </p>
          <blockquote>
            "Would we want to wear this ourselves?"
          </blockquote>
          <p>
            If the answer isn't an immediate yes,
            it doesn't belong in ETERNAL MENS.
          </p>
        </div>
      </section>

      <section className="section about-values">
        <div className="container">
          <div className="about-section-heading">
            <span className="about-label">WHAT WE STAND FOR</span>
            <h2>The ETERNAL standard.</h2>
            <p>
              Three principles guide everything we bring
              to the ETERNAL MENS collection.
            </p>
          </div>
          <div className="values-grid">
            <article className="value-card">
              <span className="value-number">01</span>
              <h3>Timeless Design</h3>
              <p>
                We look beyond passing trends and focus
                on designs that remain relevant season
                after season.
              </p>
            </article>
            <article className="value-card">
              <span className="value-number">02</span>
              <h3>Quality First</h3>
              <p>
                Every piece should feel considered,
                dependable and worthy of becoming part
                of your everyday rotation.
              </p>
            </article>
            <article className="value-card">
              <span className="value-number">03</span>
              <h3>Made For Men</h3>
              <p>
                From understated classics to stronger
                statement pieces, our collections are
                selected around modern men's lifestyles.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-editorial">
        <div className="container about-editorial-grid">
          <div className="editorial-text">
            <span className="about-label">DETAILS MATTER</span>
            <h2>
              The finishing touch
              makes the difference.
            </h2>
            <p>
              A watch on the wrist. A refined accessory.
              A detail that nobody notices immediately,
              but somehow makes the entire look feel right.
            </p>
          </div>
        </div>
      </section>

      <section className="about-statement">
        <div className="container">
          <span className="about-eyebrow">ETERNAL MENS</span>
          <h2>
            Designed for today.<br />
            Made to remain.
          </h2>
          <Link to="/collection?section=watches">Discover Watches →</Link>
        </div>
      </section>
    </>
  )
}
