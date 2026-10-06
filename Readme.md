# AquaSentinel

## Project context
AquaSentinel is an Agentic AI-based decision-support system designed to assist municipal authorities in responding to dynamic urban waterlogging conditions.

## Core Functions of AquaSentinel
- Collect and integrate relevant data from environmental, geographic, infrastructure, incident, and resource sources.
- Monitor changing conditions such as rainfall, water levels, affected population, and resource availability.
- Investigate affected incidents using specialized tools to retrieve relevant location, infrastructure, and resource information.
- Assess incident severity and impact based on current conditions and available contextual data.
- Prioritize incidents based on factors such as severity, affected population, critical infrastructure, and resource requirements.
- Recommend deployment and allocation of resources, including pumps and response teams.
- Generate an explainable response plan containing recommended actions and the reasoning behind them.
- Present recommendations for human approval, allowing the authority to approve, modify, or reject the proposed plan.
- Reassess active incidents when conditions change and generate an updated response plan when required.

## AquaSentinel Development Environment

### Backend & API

* **Language:** Python
* **Framework:** FastAPI

### AI Agent

* **Local LLM Runtime:** Ollama
* **Model:** Qwen3:4B
* **Purpose:** Local development and agent/tool-calling testing

### Database & GIS

* **Database:** PostgreSQL 18.x
* **Spatial Extension:** PostGIS 18

### Frontend

* **Framework:** React.js
* **Language:** JavaScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Routing:** React Router
* **Maps:** Leaflet + React-Leaflet
* **Map Data:** Synthetic GIS data for a fictional city
* **Charts:** Recharts
* **Icons:** Lucide React
* **API Communication:** Fetch API

### Development & Version Control

* **Version Control:** Git
* **Repository:** GitHub

