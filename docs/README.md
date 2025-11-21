---
layout: home
permalink: index.html

# Please update this with your repository name and title
repository-name: eYY-XXX-project-template
title:
---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template"

# Heat Map System For Real Time Crowd Flow Monitoring-Group 06

---

<!-- 
This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/)

![Sample Image](./images/sample.png)
 -->

## Team
-  E/21/024, Amaranga S.G.I., [e21024@eng.pdn.ac.lk](mailto:e21024@eng.pdn.ac.lk)
-  E/21/269, Nirmal A.P.S., [e21269@eng.pdn.ac.lk](mailto:e21269@eng.pdn.ac.lk)
-  E/21/049, Bandara G.L.D., [e21049@eng.pdn.ac.lk](mailto:e21049@eng.pdn.ac.lk)
-  E/21/325, Rashmika W.B.R., [e21325@eng.pdn.ac.lk](mailto:e21325@eng.pdn.ac.lk)

## Table of Contents
1. [Introduction](#introduction)
2. [Other Sub Topics](#other-sub-topics)
3. [Links](#links)

---

## Introduction

# problem

Faculty exhibitions attract over 1000 visitors, causing lab congestion, safety hazards, and inefficient manual crowd counting.
Security teams often receive crowd updates too late to act before overcrowding occurs.

# Solution

Our micro-service delivers  real-time crowd density data  to campus kiosks. It fetches live counts, computes capacity ratios, assigns intuitive traffic-light colors, and caches results. A single REST endpoint, /map-data, provides JSON for interactive heatmap rendering. 

Our project focuses on developing a real-time campus crowd monitoring system designed to enhance safety, optimize resource allocation, and improve user experience.

By collecting and visualizing crowd data through a custom Heatmap API, the system provides live occupancy information for each building on campus.

To achieve this, we implemented mechanisms to gather crowd counts from CCTV video feeds and QR code scanning points, ensuring accurate, continuous, and scalable data collection.

# Tech Stack
 1. Frontend – React.js
 2. Backend – Flask,Express.js,Node.js
 3. People detection –OPEN CV / YOLO version 5
 4. Data base - PostgreSQL





## Other Sub Topics

.....

## Links

- [Project Repository](https://github.com/cepdnaclk/{{ page.repository-name }}){:target="_blank"}
- [Project Page](https://cepdnaclk.github.io/{{ page.repository-name}}){:target="_blank"}
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)


[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
