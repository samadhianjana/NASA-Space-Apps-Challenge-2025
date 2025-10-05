# NASA-Space-Apps-Challenge-2025

## What This Project Is About

We’re building a fast, simple tool that looks at light curves from NASA’s Kepler mission and estimates how likely a dip in starlight was caused by a transiting exoplanet. It helps scientists and citizen astronomers triage thousands of signals so scarce follow-up time goes to the most promising targets.

## The Problem We’re Trying to Solve

Space telescopes record years of brightness data for hundreds of thousands of stars. Planet transits create tiny, repeating dips—but so do eclipsing binaries, starspots, and instrument noise. Manually sorting real planets from look-alikes is slow and inconsistent. We want to speed up and standardize that first pass.

## Our Approach (Plain English)

Two independent AI checks

A model that reads summary transit stats (e.g., period, depth, duration).

A model that inspects the shape of the light-curve itself to learn what a planet-like dip looks like.

Independent opinions, clear outputs
Each model gives its own probability and short rationale—kept separate to reduce bias and make reasoning easy to review.

Lightweight and fast
Designed to run quickly on modest hardware so results appear in seconds.

## What the App Shows

Planet probability: A 0–1 score for how “planet-like” the signal is.

Model rationales: Short notes explaining the score (e.g., clean U-shaped dip, consistent period, no strong secondary).

Simple workflow: Upload a light-curve image or enter basic transit stats to get an instant assessment.

## Who This Helps

Astronomers: Rapid triage before deeper vetting or telescope time requests.

Citizen scientists & students: A clear, learn-by-doing introduction to exoplanet vetting.

Educators & hackathon teams: A clean, explainable demo using real NASA data.

## Why It Matters

Exoplanet hunting is a needle-in-a-haystack problem. Combining human judgment with fast, explainable AI reduces false positives, surfaces better candidates sooner, and opens the process to more people.

## Data at a Glance

Primary source: Public Kepler light curves and vetted catalogs.

Signals of interest: Period, depth, duration, and the flux-vs-time shape around the suspected transit.

## What Success Looks Like

Reviewers can sort a batch of candidates and quickly spot high-value targets.

Scores align with known planets and catch subtle cases that are easy to miss.

The interface is clear enough that newcomers understand the reasoning without a textbook.